const up = new BABYLON.Vector3(0,1,0);

const heightStanding = 2;
const heightCrouching = 1.2;
const modelDepth = 0.8;
const modelWidth = 0.8;

const speed = 0.028*heightStanding;
const rotationSpeed = 0.0015*heightStanding;
const maxRotationSpeed = 0.15*heightStanding;
const initial_direction = new BABYLON.Vector3(0,0,1);
const initial_rotation = 0;

const jumpHeight = 1.1*heightStanding;
const initialJumpSpeed = 0.15*heightStanding;;
const jumpSpeedMin = 0.015*heightStanding;
const jumpSpeedDecay = 0.012*heightStanding;

const floorHeight = 0;
const initialFallSpeed = 0.042*heightStanding;
const fallSpeedMax = 0.115*heightStanding;
const fallSpeedIncrement = 0.004*heightStanding;     // = "mass" of the model
const heightOffset = 0.01;     // il personaggio fluttua sempre a 0.001 da terra, serve per le collisioni
const maxRotOff = 300;
const minRotOff = 35;

const maxHeigtOff = 4;
const minHeigtOff = 0;

CROUCH_OFFSET = 0.33;

const PICK_DISTANCE = 2.2;
const DROP_DISTANCE = 1.5;

const torchAngleMax = Math.PI/2.3;
const torchAngleMin = -torchAngleMax;

const initialLives = 3;

const FORWARD_KEY = "w";
const BACKWARD_KEY = "s";
const LEFT_KEY = "a";
const RIGHT_KEY = "d";
const CROUCH_KEY = "c";
const JUMP_KEY = " ";
const PEEK_KEY = "v";
const GRAB_KEY = "q";
const KICK_KEY = "k";
const ROT_KEY = "g";
const DROP_KEY = "e";


var mouse = document.getElementsByName("mouse");
var mouse = document.getElementsByName("wheel");


class Player {

    #skeleton;
    #frame;

    constructor(initialPos, scene, camera, model) {

        this.scene = scene;
        this.camera = camera;
        this.speed = speed;
        this.forward_direction = initial_direction;
        // Per ottenere il vettore perpendicolare a forward_dir sul piano x-z, faccio il prodotto
        // vettoriale con il vettore "verticale" (0,1,0)
        this.right_direction = this.forward_direction.cross(new BABYLON.Vector3(0,1,0));
        
        model.scaling = new BABYLON.Vector3(0.35,0.35,-0.35);
        this.model = model;
        this.model.name = "bambina";
        this.children = model.getChildMeshes();
        this.model.rotationQuaternion = null;
        this.model.rotation.y = Math.PI;
        this.model.position = initialPos;
        this.height = heightStanding;
        this.width = modelWidth; 
        this.depth = modelDepth;

        //Objects
        this.ownedObjects = {};

        // To handle running
        this.speedFactor = 1;

        // To handle falling
        this.falling = false;
        this.fallSpeed = initialFallSpeed;

        // To handle jumping
        this.jumpSpeed = initialJumpSpeed;
        this.jumping = false;
        this.jumpStartingHeight = this.getBaseHeight();

        this.peeking = false;
        this.crouching = false;
        this.soundBool = false;

        this.model.material = new BABYLON.StandardMaterial("modelMaterial", scene);
        this.model.material.diffuseColor = new BABYLON.Color3(0,1,0);

        //Setting owned objects
        this.owned = [];
        
        // Per gestire la tastiera
        this.pressedKeys = [];

        // Pointer lock API
        canvas.addEventListener("click", async () => {
            await canvas.requestPointerLock({unadjustedMovement:true});
        });
        document.addEventListener("pointerlockchange", this.lockChangeAlert.bind(this), false);

        // Add controls:
        document.addEventListener("keydown", this.keydownHandler.bind(this), false);
        document.addEventListener("keyup", this.keyupHandler.bind(this), false);
        document.addEventListener("mousemove", this.mousemoveHandler.bind(this), false);
        document.addEventListener("wheel", this.mousewheelHandler.bind(this), false);

        // Torch:
        this.torch = null;
        this.torchAngle = 0;
        this.rotatingObject = false;
        this.torchAlreadyTaken = false;  // serve a mostrare il messaggio solo la prima volta che prendi la torcia

        // Chiave per uscire di casa:
        this.key = null;

        // Per aprire le porte del salotto:
        this.openedDoor1 = false;
        this.openedDoor2 = false;
        this.openedDoor3 = false;

        // Per gestire la funzione step
        this.gamePaused = false;

        // VITE
        this.lives = initialLives;

        //Skeleton
        //Animazione bambina
    
        this.#skeleton = {};
        this.#skeleton["bc"] = scene.getTransformNodeByName("Bacino");
        this.#skeleton["vn"] = scene.getTransformNodeByName("Ventre");
        this.#skeleton["pt"] = scene.getTransformNodeByName("Petto");
        this.#skeleton["cl"] = scene.getTransformNodeByName("Collo");
        this.#skeleton["ts"] = scene.getTransformNodeByName("Testa");
        this.#skeleton["clSx"] = scene.getTransformNodeByName("Clavicola Sx");
        this.#skeleton["clDx"] = scene.getTransformNodeByName("Clavicola Dx");
        this.#skeleton["brSx"] = scene.getTransformNodeByName("Braccio Sx");
        this.#skeleton["brDx"] = scene.getTransformNodeByName("Braccio Dx");
        this.#skeleton["avSx"] = scene.getTransformNodeByName("Avambraccio Sx");
        this.#skeleton["avDx"] = scene.getTransformNodeByName("Avambraccio Dx");
        this.#skeleton["mnSx"] = scene.getTransformNodeByName("Mano Sx");
        this.#skeleton["mnDx"] = scene.getTransformNodeByName("Mano Dx");
        this.#skeleton["csSx"] = scene.getTransformNodeByName("Coscia Sx");
        this.#skeleton["csDx"] = scene.getTransformNodeByName("Coscia Dx");
        this.#skeleton["gmSx"] = scene.getTransformNodeByName("Gamba Sx");
        this.#skeleton["gmDx"] = scene.getTransformNodeByName("Gamba Dx");
        this.#skeleton["tlSx"] = scene.getTransformNodeByName("Tallone Sx");
        this.#skeleton["tlDx"] = scene.getTransformNodeByName("Tallone Dx");
        this.#skeleton["pdSx"] = scene.getTransformNodeByName("Piede Sx");
        this.#skeleton["pdDx"] = scene.getTransformNodeByName("Piede Dx");

        this.#frame = 0;

    }

    start() {
        this.gamePaused = false;
        this.step();
    }

    stop() {
        this.gamePaused = true;
    }

    getChildren(){
        return this.children.slice();
    }
    
    keydownHandler(e) {

        if (!this.gamePaused) {

            // Corri
            if (e.shiftKey) {
                if (this.crouching){
                    this.stand();
                    if (this.torch != null) {
                        this.torch.setRotation(new BABYLON.Vector3(-0.5, -1.25, 0));
                        this.torch.modifyRotation(this.right_direction, this.torchAngle);
                        this.torch.setPosition(new BABYLON.Vector3(-0.7,0.6,0.3));
                    }
                }
            
                if (!this.crouching) {
                    this.running = true;
                    this.setSpeedRunning();
                }

            }
            // Accovacciati
            if (e.key.toLowerCase() == CROUCH_KEY) {
                if (this.crouching) {
                    this.stand();
                }
                else
                    this.crouch();
            }
            // Salta
            if (!this.falling && !this.jumping && e.key == JUMP_KEY) {
                // Controlla se puo' saltare
                var length = this.height + jumpHeight;
                if (!this.checkCollision(new BABYLON.Vector3(0,1,0), this.forward_direction.clone(), length, this.width, this.depth).collisionAll) {
                    if (this.crouching){
                        this.stand();
                        if (this.torch != null) {
                            this.torch.setRotation(new BABYLON.Vector3(-0.5, -1.25, 0));
                            this.torch.modifyRotation(this.right_direction, this.torchAngle);
                            this.torch.setPosition(new BABYLON.Vector3(-0.7,0.6,0.3));
                        }
                    }
                    this.jumping = true;
                    this.jumpStartingHeight = this.getBaseHeight();
                }
            }

            // Sporgiti
            if (e.key.toLowerCase() == PEEK_KEY) {
                if (this.peeking) {
                    this.stopPeeking();
                    hideMessage();
                }
                else {
                    this.peeking = true;
                    showMessageFixed("Move the mouse around to peek.\nPress any key to stop.");
                }
            } else if (this.peeking) {
                this.stopPeeking();
                if (e.key.toLowerCase() != ROT_KEY) hideMessage();
            }

            // Raccogli oggetto più vicino
            if (e.key.toLowerCase() == GRAB_KEY) {
                this.grabObject();
            }

            // Ruota oggetto
            if (e.key.toLowerCase() == ROT_KEY) {
                if (this.rotatingObject) {
                    this.rotatingObject = false;
                    this.selObj = undefined;
                    hideMessage();
                }
                else {
                    this.rotatingObject = true;
                }
            } else if (this.rotatingObject) {
                this.rotatingObject = false;
                this.selObj = undefined;
                if (e.key.toLowerCase() != PEEK_KEY) hideMessage();
            }

            // Calcia torcia
            if (e.key.toLowerCase() == KICK_KEY) {
                this.kickTorch();
            }

            // Droppa torcia
            if (e.key.toLowerCase() == DROP_KEY) {
                this.dropTorch();
            }

            // Aggiungi il tasto all'array pressedKeys
            var index = this.pressedKeys.indexOf(e.key.toLowerCase());
            if (index == -1) {
                this.pressedKeys.push(e.key.toLowerCase());
            }
        }
    }

    keyupHandler(e) {
        if (e.key == "Shift") {
            this.setSpeedWalking();
            this.running = false;
        }
        
        var index = this.pressedKeys.indexOf(e.key.toLowerCase());
        if (index !== -1) {
            this.pressedKeys.splice(index, 1);
        }
    }

    mousemoveHandler(e) {
        if (!this.gamePaused) {

            if (document.getElementById("pointerLocked").innerHTML == "1") {
                if (e.movementX >= 0)   // rotazione a destra
                    var rot = Math.min(maxRotationSpeed, e.movementX*rotationSpeed);
                else                    // rotazione a sinistra
                    var rot = Math.max(-maxRotationSpeed, e.movementX*rotationSpeed);
    
                if (this.peeking) {
                    var rotY
                    if (e.movementY >= 0)   // rotazione in alto
                        rotY = Math.min(maxRotationSpeed, e.movementY*rotationSpeed);
                    else                  // rotazione in basso
                        rotY = Math.min(maxRotationSpeed, e.movementY*rotationSpeed);
    
                    this.camera.heightOffset += rotY;
                    this.camera.heightOffset %= 2*Math.PI;
                    this.camera.rotationOffset  += rot*30;
                    
                    if (this.camera.heightOffset > maxHeigtOff)
                        this.camera.heightOffset = maxHeigtOff;
                    else if (this.camera.heightOffset < minHeigtOff)
                        this.camera.heightOffset = minHeigtOff;
    
                    if (this.camera.rotationOffset > maxRotOff)
                        this.camera.rotationOffset = maxRotOff;
                    else if (this.camera.rotationOffset < minRotOff)
                        this.camera.rotationOffset = minRotOff;
                }
                else {
                    this.yRot = rot;
                    mouse.innerHTML = "true";
                }
            }
        }
    }

    mousewheelHandler(e) {
        if (this.torch != null) {
            var angle = -e.deltaY/1000;
            if (this.torchAngle + angle < torchAngleMax && this.torchAngle + angle > torchAngleMin) {
                wheel.innerHTML = "true";
                this.wAngle = angle;
            }
        }
    }


    lockChangeAlert() {
        if (document.pointerLockElement === canvas) {
            document.getElementById("pointerLocked").innerHTML = "1";

            if (this.gamePaused)
                unpauseGame();
        }
        else {
            document.getElementById("pointerLocked").innerHTML = "0";

            if (!this.gamePaused && this.lives > 0)       // se no si attiva anche dopo che hai perso
                pauseGame();
        }
    }

    checkCollision(forward, up, length, width, height, show=false) {

        var checkDoor = false;

        var origin = this.model.position.clone();
        if(this.crouching){
            origin.y += CROUCH_OFFSET;
        }

        if (height == this.height) {        // cioe' se e' una collisione frontale
            origin.addInPlace(up.scale(height/2));      // perche' altrimenti l'origine e' ad altezza terra
            checkDoor = true;
            // (^ cosi' controllo la collisione con una porta solo se e' una collisione frontale, non verticale)
        }

        var right = (forward.cross(up)).normalize();
        
        var originRight = origin.subtract(right.scale(width/2));
        // Angolo in alto a dx:
        var originTopRight = originRight.add(up.scale(height/2));
        // Angolo in basso a dx:
        var originBottomRight = originRight.subtract(up.scale(height/2));

        var originLeft = origin.add(right.scale(width/2));
        // Angolo in alto a sx:
        var originTopLeft = originLeft.add(up.scale(height/2));
        // Angolo in basso a sx:
        var originBottomLeft = originLeft.subtract(up.scale(height/2));
        
        // Quadrato "interno" di punti:
        var middleTopRight = (origin.add(originTopRight)).scale(0.5);
        var middleBottomRight = (origin.add(originBottomRight)).scale(0.5);
        var middleTopLeft = (origin.add(originTopLeft)).scale(0.5);
        var middleBottomLeft = (origin.add(originBottomLeft)).scale(0.5);

        // Cast rays:

        var collisionTopRight = this.castRay(originTopRight, forward, length, show);
        var collisionBottomRight = this.castRay(originBottomRight, forward, length, show);
        var collisionCenter = this.castRay(origin, forward, length, show, checkDoor);  // checkDoor: controlla collisione porta
        var collisionTopLeft = this.castRay(originTopLeft, forward, length, show);
        var collisionBottomLeft = this.castRay(originBottomLeft, forward, length, show);

        var collisionMiddleTopRight = this.castRay(middleTopRight, forward, length, show);
        var collisionMiddleBottomRight = this.castRay(middleBottomRight, forward, length, show);
        var collisionMiddleTopLeft = this.castRay(middleTopLeft, forward, length, show);
        var collisionMiddleBottomLeft = this.castRay(middleBottomLeft, forward, length, show);

        var collAll = collisionTopRight || collisionBottomRight || collisionCenter || collisionTopLeft || collisionBottomLeft;
        var collInnerSquare = collisionMiddleTopRight || collisionMiddleBottomRight || collisionMiddleTopLeft || collisionMiddleBottomLeft;
        collAll = collAll || collInnerSquare;
        var collLeft = collisionTopLeft || collisionBottomLeft;
        var collRight = collisionTopRight || collisionBottomRight;
        var collTop = collisionTopRight || collisionTopLeft;
        var collBottom = collisionBottomRight || collisionBottomLeft;

        return {"collisionAll":collAll,
                "collisionLeft":collLeft,
                "collisionRight":collRight,
                "collisionTop":collTop,
                "collisionBottom":collBottom,
                "collisionCenter":collisionCenter,
                "collisionInnerSquare":collInnerSquare};
    }


    coordinateObjectBelow(position) {
        var len = 10;
        let ray = new BABYLON.Ray(position, new BABYLON.Vector3(0,-1,0), len);

        var hit = this.scene.multiPickWithRay(ray);
        hit = sortPickedMeshesByDistance(hit, 1);

        if (hit.length <= 1) {
            return floorHeight;
        }

        var closestObject = hit[0];
        for (let i=0; i < hit.length; i++) {
            if (!this.children.includes(hit[i].pickedMesh) && (hit[i].pickedMesh != this.model)) {
                closestObject = hit[i];
                break;
            }
        } 

        var heightIntersection = closestObject.pickedPoint.y;
        return heightIntersection;
    }

    castRay(origin, direction, length, showRay=false, checkDoor=false) {
        // Controlla se stai toccando una porta
        if (checkDoor) {
            let rayDoor = new BABYLON.Ray(origin, direction, 1.4*length);
            var hitDoor = this.scene.multiPickWithRay(rayDoor);

            for (let i=0; i < hitDoor.length; i++) {
                if (hitDoor[i].pickedMesh.name.includes("door")) {
                    this.hitDoor(hitDoor[i].pickedMesh.name);
                    return true;    // = non controllare la collisione, tanto cambi scena
                }
            }
        }
        
        // Raggio normale
	    let ray = new BABYLON.Ray(origin, direction, length);
        if (showRay) {
            let rayHelper = new BABYLON.RayHelper(ray);		
            rayHelper.show(this.scene);		
        }
        var hit = this.scene.multiPickWithRay(ray);
        hit = sortPickedMeshesByDistance(hit, 1);

        for (let i=0; i < hit.length; i++) {
            if (!this.children.includes(hit[i].pickedMesh) && (hit[i].pickedMesh != this.model && !this.owned.includes(hit[i].pickedMesh))) {
                return true;
            }
        }
        return false;
    }

    // CAMBIO SCENA, attivata quando colpisci una porta
    async hitDoor(doorName) {
        switch (doorName) {
            case DOOR_BEDROOM_TO_HALLWAY:
                if (currentScene == BEDROOM_SCENE_ID)
                    await switchScene(HALLWAY_SCENE_ID, playerInitialPosition(doorName), playerInitialRotation(doorName));
                break;
            case DOOR_LIVINGROOM_TO_HALLWAY:
                if (currentScene == LIVINGROOM_SCENE_ID)
                    await switchScene(HALLWAY_SCENE_ID, playerInitialPosition(doorName), playerInitialRotation(doorName));
                break;
            case DOOR_HALLWAY_TO_BEDROOM:
                if (currentScene == HALLWAY_SCENE_ID)
                    await switchScene(BEDROOM_SCENE_ID, playerInitialPosition(doorName), playerInitialRotation(doorName));
                break;
            case DOOR_HALLWAY_TO_LIVINGROOM:
                if (currentScene == HALLWAY_SCENE_ID)
                    await switchScene(LIVINGROOM_SCENE_ID, playerInitialPosition(doorName), playerInitialRotation(doorName));
                break;
            case DOOR_LIVINGROOM_TO_EXIT:
                if (currentScene == LIVINGROOM_SCENE_ID) {
                    if (this.ownKey()) {
                        winGame();
                    }
                    else {
                        showMessage("You need a key to open this door.", 3000);
                    }
                }
                break;
            case DOOR_LOCKED:
                showMessage("This door is locked.", 1800);
                break;
            case DOOR_SLIDING_1:
                if (!this.openedDoor1) {
                    this.openedDoor1 = true;
                    let meshToMove1 = scene.getMeshByName("portaSliding1");
                    let finalPosition1 = meshToMove1.position.clone();
                    finalPosition1.x += 2;
                    let meshToRemove1 = scene.getMeshByName(DOOR_SLIDING_1);
                    openDoor( meshToMove1, finalPosition1, meshToRemove1, obstacleDoor1);
                }
                break;
            case DOOR_SLIDING_2:
                if (!this.openedDoor2) {
                    this.openedDoor2 = true;
                    let meshToMove2 = scene.getMeshByName("portaSliding2");
                    let finalPosition2 = meshToMove2.position.clone();
                    finalPosition2.x += 2;
                    let meshToRemove2 = scene.getMeshByName(DOOR_SLIDING_2);
                    openDoor( meshToMove2, finalPosition2, meshToRemove2, obstacleDoor2);
                }
                break;
            case DOOR_SLIDING_3:
                if (!this.openedDoor3) {
                    this.openedDoor3 = true;
                    let meshToMove3 = scene.getMeshByName("portaSliding3");
                    let finalPosition3 = meshToMove3.position.clone();
                    finalPosition3.x += 2;
                    let meshToRemove3 = scene.getMeshByName(DOOR_SLIDING_3);
                    openDoor( meshToMove3, finalPosition3, meshToRemove3, obstacleDoor3);
                }
                break;
            default:
                break;
        }
    }

    setPosition(vec) {
        this.model.position = vec;
    }
    setRotation(vec) {
        vec.normalize();
        this.forward_direction = vec.clone();
        this.right_direction = this.forward_direction.cross(new BABYLON.Vector3(0,1,0));

        var target = this.model.position.add(vec);
        this.model.lookAt(target);
    }

    stopPeeking() {
        this.peeking = false;
        this.camera.heightOffset = cameraHeightOffset;
        this.camera.rotationOffset = 180;
    }

    crouch() {
        standingPosition = "crouch";
        this.crouching = true;
        this.model.position.y -= CROUCH_OFFSET;
        this.height = heightCrouching;
        this.setSpeedCrouching();
        this.torchAngle = 0;
    }

    stand() {
        this.model.position.y += CROUCH_OFFSET;
        var length = heightStanding;
        if (!this.checkCollision(new BABYLON.Vector3(0,1,0), this.forward_direction.clone(), length, this.width, this.depth).collisionAll) {
            standingPosition = "stand";
            this.crouching = false;
            this.model.position.y += CROUCH_OFFSET;
            this.height = heightStanding;
            this.setSpeedWalking();
            this.torchAngle = 0;
            
        }else{
            this.model.position.y -= CROUCH_OFFSET;
        }
    }

    rotateLeft() {
        var rot = -0.03;
        this.model.rotation.y += rot;
        this.model.rotation.y %= 2*Math.PI;
        var quat = BABYLON.Quaternion.FromEulerAngles(0, rot, 0);
        this.forward_direction.rotateByQuaternionToRef(quat, this.forward_direction);
        this.right_direction = this.forward_direction.cross(new BABYLON.Vector3(0,1,0));
    }
    rotateRight() {
        var rot = 0.03;
        this.model.rotation.y += rot;
        this.model.rotation.y %= 2*Math.PI;
        var quat = BABYLON.Quaternion.FromEulerAngles(0, rot, 0);
        this.forward_direction.rotateByQuaternionToRef(quat, this.forward_direction);
        this.right_direction = this.forward_direction.cross(new BABYLON.Vector3(0,1,0));
    }

    fall() {
        this.model.position.y -= this.fallSpeed;

        // Incrementa velocita' caduta
        this.fallSpeed = Math.min(fallSpeedMax, this.fallSpeed+fallSpeedIncrement);
    }

    jump() {
        this.model.position.y += this.jumpSpeed;

        // Diminuisci velocita' di salto
        this.jumpSpeed = Math.max(jumpSpeedMin, this.jumpSpeed-jumpSpeedDecay);

        // Fine salto
        if (this.getBaseHeight() >= this.jumpStartingHeight + jumpHeight) {
            this.jumping = false;
            this.jumpSpeed = initialJumpSpeed;
        }
    }
    
    soundOn() {
        return this.soundBool;
    }
    
    setSpeedRunning() {
        this.speedFactor = 2.5;
        this.soundBool = true;
    }
    
    setSpeedWalking() {
        this.speedFactor = 1;
        this.soundBool = false;
    }

    setSpeedCrouching() {
        this.speedFactor = 0.7;
        this.soundBool = false;
    }

    getBaseHeight() {
        return this.model.position.y;
    }


    loseOneLife() {
        this.lives -= 1;
        if (this.lives < 1) {
            // LOSE!
            loseGame();
        }
        else {
            this.changeColor();
            showLives(this.lives);
        }
    }
    changeColor() {
        for (let i=0; i < this.children.length; i++) {
            this.children[i].material.unfreeze();
            this.children[i].material.emissiveColor = new BABYLON.Color3(183/255,25/255,25/255).toLinearSpace();;
            this.children[i].material.emissiveIntensity = 0.2;
        }
        setTimeout(function(childrenMaterials) {
            for (let i=0; i < this.children.length; i++) {
                this.children[i].material.emissiveColor = new BABYLON.Color3(0,0,0);
            }
        }.bind(this), 150);
    }


    // STEP FUNCTION: executed at every frame
    step() {

        this.forward_direction.normalize();     // per sicurezza
        this.right_direction.normalize();

        // Jump:
        if (this.jumping && !this.falling) {
            this.jump();
            moveStatus = "jump";
            if (this.getBaseHeight() >= this.jumpStartingHeight + jumpHeight) {
                this.jumping = false;
            }
        }
        
        // Fall:
        if (!this.jumping) {
            
            var coordBelow = this.coordinateObjectBelow(this.model.position);
            var distFromObjectBelow = this.getBaseHeight() - coordBelow;
            
            if (distFromObjectBelow > heightOffset + 0.0001) {
                var length = this.fallSpeed;
                var collisions = this.checkCollision(new BABYLON.Vector3(0,-1,0), this.forward_direction.clone(), length, this.width, this.depth);
                // Cadi normalmente
                if (!collisions.collisionAll) {
                    moveStatus = "jump";
                    this.falling = true;
                    this.fall();
                }
                // Finisci l'ultimo pezzetto di caduta
                else if (this.fallSpeed >= distFromObjectBelow-heightOffset) {
                    this.model.position.y = coordBelow + heightOffset;
                    this.falling = false;
                    this.fallSpeed = initialFallSpeed;
                }
                // Non cadere
                else {
                    this.falling = false;
                    var length = this.speed*this.speedFactor/2 + this.width/2 + 0.1;
    
                    // "Cadi" un po' verso sinista:
                    if (!collisions.collisionInnerSquare && !collisions.collisionRight) {
                        var coll = this.checkCollision(BABYLON.Vector3.Zero().subtract(this.right_direction.clone()), up, length, this.depth, this.height);
                        if (!coll.collisionAll)
                            this.model.position.subtractInPlace(this.right_direction.scale(this.speed*this.speedFactor/2));
                    }
    
                    // "Cadi" un po' verso destra:
                    else if (!collisions.collisionInnerSquare && !collisions.collisionLeft) {
                        var coll = this.checkCollision(this.right_direction.clone(), up, length, this.depth, this.height);
                        if (!coll.collisionAll)
                            this.model.position.addInPlace(this.right_direction.scale(this.speed*this.speedFactor/2));
                    }
    
                    // "Cadi" un po' in avanti:
                    if (!collisions.collisionInnerSquare && !collisions.collisionBottom) {
                        var coll = this.checkCollision(this.forward_direction.clone(), up, length, this.width, this.height);
                        if (!coll.collisionAll)
                            this.model.position.subtractInPlace(this.forward_direction.scale(this.speed*this.speedFactor/2));
                    }
    
                    // "Cadi" un po' indietro:
                    else if (!collisions.collisionInnerSquare && !collisions.collisionTop) {
                        var coll = this.checkCollision(BABYLON.Vector3.Zero().subtract(this.forward_direction.clone()), up, length, this.width, this.height);
                        if (!coll.collisionAll)
                            this.model.position.addInPlace(this.forward_direction.scale(this.speed*this.speedFactor/2));
                    }
                }
            }
            else {
                this.falling = false;
            }
        }

        // Move:
        if (this.pressedKeys.length > 0) {
            var length = this.speed*this.speedFactor + this.width/2 + 0.2;
            var widthDiagonal = 1.17;       // sarebbe l'ipotenusa del triangolo con lati this.width e this.depth
            var lengthDiagonal = this.speed*this.speedFactor + widthDiagonal/2 + 0.05;

            // Diagonale: avanti destra
            if (this.pressedKeys.includes(RIGHT_KEY) && this.pressedKeys.includes(FORWARD_KEY)) {
                document.getElementById("sliding").innerHTML = "true";
                document.getElementById("dirRot").innerHTML = "avDx";
                var forward = (this.right_direction.subtract(this.forward_direction)).normalize();
                var collisions = this.checkCollision(forward, up, lengthDiagonal, widthDiagonal, this.height);
                if (!collisions.collisionAll) {
                    this.model.position.addInPlace(forward.scale(this.speed*this.speedFactor));
                }
                else if (!collisions.collisionLeft && !collisions.collisionCenter) {
                    this.rotateLeft();
                }
                else if (!collisions.collisionRight && !collisions.collisionCenter) {
                    this.rotateRight();
                }
            }
            // Diagonale: avanti sinistra
            else if (this.pressedKeys.includes(LEFT_KEY) && this.pressedKeys.includes(FORWARD_KEY)) {
                document.getElementById("sliding").innerHTML = "true";
                document.getElementById("dirRot").innerHTML = "avSx";
                var forward = (this.right_direction.add(this.forward_direction)).normalize();
                forward = BABYLON.Vector3.Zero().subtract(forward);
                var collisions = this.checkCollision(forward, up, lengthDiagonal, widthDiagonal, this.height);
                if (!collisions.collisionAll) {
                    this.model.position.addInPlace(forward.scale(this.speed*this.speedFactor));
                }
                else if (!collisions.collisionLeft && !collisions.collisionCenter) {
                    this.rotateLeft();
                }
                else if (!collisions.collisionRight && !collisions.collisionCenter) {
                    this.rotateRight();
                }
            }
            // Diagonale: indietro destra
            else if (this.pressedKeys.includes(RIGHT_KEY) && this.pressedKeys.includes(BACKWARD_KEY)) {
                document.getElementById("sliding").innerHTML = "true";
                document.getElementById("dirRot").innerHTML = "dtDx";
                var forward = (this.right_direction.add(this.forward_direction)).normalize();
                var collisions = this.checkCollision(forward, up, lengthDiagonal, widthDiagonal, this.height);
                if (!collisions.collisionAll) {
                    this.model.position.addInPlace(forward.scale(this.speed*this.speedFactor));
                }
                else if (!collisions.collisionLeft && !collisions.collisionCenter) {
                    this.rotateLeft();
                }
                else if (!collisions.collisionRight && !collisions.collisionCenter) {
                    this.rotateRight();
                }
            }
            // Diagonale: indietro sinistra
            else if (this.pressedKeys.includes(LEFT_KEY) && this.pressedKeys.includes(BACKWARD_KEY)) {
                document.getElementById("sliding").innerHTML = "true";
                document.getElementById("dirRot").innerHTML = "dtSx";
                var forward = (this.forward_direction.subtract(this.right_direction)).normalize();
                var collisions = this.checkCollision(forward, up, lengthDiagonal, widthDiagonal, this.height);
                if (!collisions.collisionAll) {
                    this.model.position.addInPlace(forward.scale(this.speed*this.speedFactor));
                }
                else if (!collisions.collisionLeft && !collisions.collisionCenter) {
                    this.rotateLeft();
                }
                else if (!collisions.collisionRight && !collisions.collisionCenter) {
                    this.rotateRight();
                }
            }
            // Destra
            else if (this.pressedKeys.includes(RIGHT_KEY)) {
                document.getElementById("sliding").innerHTML = "true";
                document.getElementById("dirRot").innerHTML = "Dx";
                var collisions = this.checkCollision(this.right_direction.clone(), up, length, this.depth, this.height);
                if (!collisions.collisionAll) {
                    this.model.position.addInPlace(this.right_direction.scale(this.speed*this.speedFactor));
                }
                else if (!collisions.collisionLeft && !collisions.collisionCenter) {
                    this.rotateLeft();
                }
                else if (!collisions.collisionRight && !collisions.collisionCenter) {
                    this.rotateRight();
                }
            }
            // Sinistra
            else if (this.pressedKeys.includes(LEFT_KEY)) {
                document.getElementById("sliding").innerHTML = "true";
                document.getElementById("dirRot").innerHTML = "Sx";
                var collisions = this.checkCollision(BABYLON.Vector3.Zero().subtract(this.right_direction), up, length, this.depth, this.height);
                if (!collisions.collisionAll) {
                    this.model.position.subtractInPlace(this.right_direction.scale(this.speed*this.speedFactor));
                }
                else if (!collisions.collisionLeft && !collisions.collisionCenter) {
                    this.rotateLeft();
                }
                else if (!collisions.collisionRight && !collisions.collisionCenter) {
                    this.rotateRight();
                }
            }
            // Avanti
            else if (this.pressedKeys.includes(FORWARD_KEY)) {
                var collisions = this.checkCollision((BABYLON.Vector3.Zero()).subtract(this.forward_direction), up, length, this.width, this.height);
                if (!collisions.collisionAll) {
                    this.model.position.subtractInPlace(this.forward_direction.scale(this.speed*this.speedFactor));
                }
                else if (!collisions.collisionLeft && !collisions.collisionCenter) {
                    this.rotateLeft();
                }
                else if (!collisions.collisionRight && !collisions.collisionCenter) {
                    this.rotateRight();
                }
            }
            // Indietro
            else if (this.pressedKeys.includes(BACKWARD_KEY)) {
                document.getElementById("sliding").innerHTML = "true";
                document.getElementById("dirRot").innerHTML = "dt";
                var collisions = this.checkCollision(this.forward_direction.clone(), up, length, this.width, this.height);
                if (!collisions.collisionAll) {
                    this.model.position.addInPlace(this.forward_direction.scale(this.speed*this.speedFactor));
                }
                else if (!collisions.collisionLeft && !collisions.collisionCenter) {
                    this.rotateLeft();
                }
                else if (!collisions.collisionRight && !collisions.collisionCenter) {
                    this.rotateRight();
                }
            }

            
            if(moveStatus != "move" && !this.jumping && !this.falling && !this.running){
                this.#frame = 0;
                moveStatus = "move";                
            }else if (this.running && moveStatus != "run" && !this.crouching && !this.jumping && !this.falling){
                this.#frame = 0;
                moveStatus = "run";
            }
        }else{
            if(moveStatus != "rest" && !this.jumping && !this.falling){
                this.#frame = 0;
                moveStatus = "rest";                
            }
        }

        if (mouse.innerHTML == "true"){
                
            //Rotating Player
            if(!this.rotatingObject){
                this.model.rotation.y += this.yRot;
                this.model.rotation.y %= 2*Math.PI;
                var quat = BABYLON.Quaternion.FromEulerAngles(0, this.yRot, 0);
                this.forward_direction.rotateByQuaternionToRef(quat, this.forward_direction);
                this.right_direction = this.forward_direction.cross(new BABYLON.Vector3(0,1,0));
            }
            else{
                //Rotating obj
                this.rotateObject(this.yRot);
            }
            mouse.innerHTML = "false";
        }

        if (this.torch != null){
            this.setTorchAfterStep();
        }

        if (!this.gamePaused) {
            requestAnimationFrame(this.step.bind(this));
        }

    }

    setTorchAfterStep(){
        //Setting torch correctly after step

        var rightDir = this.right_direction.clone();
        if(document.getElementById("sliding").innerHTML == "true"){

            var dirRot = document.getElementById("dirRot").innerHTML;
            switch (dirRot){
                case "avDx": 
                    var quat = BABYLON.Quaternion.FromEulerAngles(0, Math.PI/4, 0);
                    rightDir.rotateByQuaternionToRef(quat, rightDir);
                    break;
                case "dtDx": 
                    var quat = BABYLON.Quaternion.FromEulerAngles(0, -5*Math.PI/4, 0);
                    rightDir.rotateByQuaternionToRef(quat, rightDir);
                    break;
                case "avSx": 
                    var quat = BABYLON.Quaternion.FromEulerAngles(0, -Math.PI/4, 0);
                    rightDir.rotateByQuaternionToRef(quat, rightDir);
                    break;
                case "dtSx": 
                    var quat = BABYLON.Quaternion.FromEulerAngles(0, 5*Math.PI/4, 0);
                    rightDir.rotateByQuaternionToRef(quat, rightDir);
                    break;
                case "Dx": 
                    var quat = BABYLON.Quaternion.FromEulerAngles(0, Math.PI/2, 0);
                    rightDir.rotateByQuaternionToRef(quat, rightDir);
                    break;
                case "Sx": 
                    var quat = BABYLON.Quaternion.FromEulerAngles(0, -Math.PI/2, 0);
                    rightDir.rotateByQuaternionToRef(quat, rightDir);
                    break;
                case "dt": 
                    var quat = BABYLON.Quaternion.FromEulerAngles(0, Math.PI, 0);
                    rightDir.rotateByQuaternionToRef(quat, rightDir);
                    break;
            }
        }
            
        if(moveStatus == "rest"){
            if(standingPosition == "stand"){ 
                this.torch.setRotation(new BABYLON.Vector3(-0.5, -1.25, 0));
                this.torch.modifyRotation(rightDir, this.torchAngle);
                this.torch.setPosition(new BABYLON.Vector3(-0.7,0.6,0.3));
            }else if (standingPosition == "crouch"){
                this.torch.setRotation(new BABYLON.Vector3(-0.9, 1.2, 1.2));
                this.torch.modifyRotation(rightDir, this.torchAngle);
                this.torch.setPosition(new BABYLON.Vector3(0.6,1,0.3));
            }
        }else if (moveStatus == "move"){
            if(standingPosition == "crouch"){ 
                this.torch.setRotation(new BABYLON.Vector3(-1.8, 0.4, 0.4));
                this.torch.modifyRotation(rightDir, this.torchAngle);
                this.torch.setPosition(new BABYLON.Vector3(-0.15,0.8,-0.1));
            }
        }
        
        if(wheel.innerHTML == "true"){
            this.torch.modifyRotation(rightDir, this.wAngle);
            this.torchAngle += this.wAngle;
            wheel.innerHTML = "false";
        }
    }

    

    resetPose() {
        var resetVec = new BABYLON.Vector3(0,0,0);
        for (let k in this.#skeleton){
            this.#skeleton[k].rotation = resetVec;
        }
        this.#frame = 0;
    }

    restAnimation(){
        switch(standingPosition){
            case "stand": this.standAnimation(); break;
            case "crouch": this.crouchStillAnimation(); break;
        }

    }

    crouchStillAnimation(){
        var keyFrames = [];

        if(this.torch == null){
        
            keyFrames[0] = {
                "i" : 0,
                "li" : 384,
                "bc" : new BABYLON.Vector3(-1.61, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.56, -0.02, 0),
                "cl" : new BABYLON.Vector3(0.02, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.42, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.85, -0.03, 1.55),
                "clDx" : new BABYLON.Vector3(-1.45, 0.02, -1.59),
                "brSx" : new BABYLON.Vector3(1.38, 2.95, 0.17),
                "brDx" : new BABYLON.Vector3(1.41, -2.46, -0.17),
                "avSx" : new BABYLON.Vector3(0.66, -2.34, -0.51),
                "avDx" : new BABYLON.Vector3(0.66, 2.39, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(1.31, 0.14, 3.13),
                "csDx" : new BABYLON.Vector3(1.27, -0.09, -3.14),
                "gmSx" : new BABYLON.Vector3(1.38, 0.1, 0.03),
                "gmDx" : new BABYLON.Vector3(1.55, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(0.16, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 192,
                "bc" : new BABYLON.Vector3(-1.61, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.03, -0.02, 0),
                "cl" : new BABYLON.Vector3(0.49, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.42, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.12, -0.03, 1.55),
                "clDx" : new BABYLON.Vector3(-0.66, 0.02, -1.59),
                "brSx" : new BABYLON.Vector3(1.38, 2.95, 0.17),
                "brDx" : new BABYLON.Vector3(1.41, -2.46, -0.17),
                "avSx" : new BABYLON.Vector3(0.66, -2.34, -0.51),
                "avDx" : new BABYLON.Vector3(0.66, 2.39, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(1.31, 0.14, 3.13),
                "csDx" : new BABYLON.Vector3(1.27, -0.09, -3.14),
                "gmSx" : new BABYLON.Vector3(1.38, 0.1, 0.03),
                "gmDx" : new BABYLON.Vector3(1.55, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(0.16, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }else{

            keyFrames[0] = {
                "i" : 0,
                "li" : 384,
                "bc" : new BABYLON.Vector3(-1.61, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.56, -0.02, 0),
                "cl" : new BABYLON.Vector3(0.02, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.42, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.85, -0.03, 1.55),
                "clDx" : new BABYLON.Vector3(-1.45, 0.02, -1.59),
                "brSx" : new BABYLON.Vector3(1.38, 2.95, 0.17),
                "brDx" : new BABYLON.Vector3(1.41, -2.46, -0.17),
                "avSx" : new BABYLON.Vector3(0.66, -2.34, -0.51),
                "avDx" : new BABYLON.Vector3(0.66, 2.39, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(1.31, 0.14, 3.13),
                "csDx" : new BABYLON.Vector3(1.27, -0.09, -3.14),
                "gmSx" : new BABYLON.Vector3(1.38, 0.1, 0.03),
                "gmDx" : new BABYLON.Vector3(1.55, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(0.16, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 192,
                "bc" : new BABYLON.Vector3(-1.61, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.03, -0.02, 0),
                "cl" : new BABYLON.Vector3(0.49, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.42, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.12, -0.03, 1.55),
                "clDx" : new BABYLON.Vector3(-0.66, 0.02, -1.59),
                "brSx" : new BABYLON.Vector3(1.38, 2.95, 0.17),
                "brDx" : new BABYLON.Vector3(1.41, -2.46, -0.17),
                "avSx" : new BABYLON.Vector3(0.66, -2.34, -0.51),
                "avDx" : new BABYLON.Vector3(0.66, 2.39, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(1.31, 0.14, 3.13),
                "csDx" : new BABYLON.Vector3(1.27, -0.09, -3.14),
                "gmSx" : new BABYLON.Vector3(1.38, 0.1, 0.03),
                "gmDx" : new BABYLON.Vector3(1.55, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(0.16, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }

        this.useFrame(keyFrames);
    }

    standAnimation(){
        var keyFrames = [];

        if(this.torch == null){
        
            keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, 0.33, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.33, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0.19, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.01, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.33, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.01, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, -0.33, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, -0.02, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.14, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.28, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }else{

            keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, 0.33, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.33, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0.19, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.01, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.33, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.01, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, -0.33, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.33, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.14, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.28, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }

        this.useFrame(keyFrames);
    }

    moveAnimation(){
        switch(standingPosition){
            case "stand": this.walkAnimation(); break;
            case "crouch": this.crouchMoveAnimation(); break;
        }
    }

    crouchMoveAnimation(){
        var keyFrames = [];

        if(this.torch == null){
        
            keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(-1.61, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.56, -0.02, 0),
                "cl" : new BABYLON.Vector3(0.02, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.42, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.52, -0.03, 1.55),
                "clDx" : new BABYLON.Vector3(-0.47, 0.02, -1.59),
                "brSx" : new BABYLON.Vector3(1.38, 2.95, 0.17),
                "brDx" : new BABYLON.Vector3(1.41, -2.46, -0.17),
                "avSx" : new BABYLON.Vector3(0.66, -2.34, -0.51),
                "avDx" : new BABYLON.Vector3(0.66, 2.39, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0.68, 0.14, 3.13),
                "csDx" : new BABYLON.Vector3(1.27, -0.09, -3.14),
                "gmSx" : new BABYLON.Vector3(0.59, 0.1, 0.03),
                "gmDx" : new BABYLON.Vector3(1.4, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(0.16, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(-1.61, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.56, -0.02, 0),
                "cl" : new BABYLON.Vector3(0.02, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.42, 0, -0.01),
                "clSx" : new BABYLON.Vector3(0.1, -0.03, 1.55),
                "clDx" : new BABYLON.Vector3(-1.25, 0.02, -1.59),
                "brSx" : new BABYLON.Vector3(1.38, 2.95, 0.17),
                "brDx" : new BABYLON.Vector3(1.41, -2.46, -0.17),
                "avSx" : new BABYLON.Vector3(0.66, -2.34, -0.51),
                "avDx" : new BABYLON.Vector3(0.66, 2.39, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(1.27, 0.14, 3.13),
                "csDx" : new BABYLON.Vector3(0.68, -0.09, -3.14),
                "gmSx" : new BABYLON.Vector3(1.4, 0.1, 0.03),
                "gmDx" : new BABYLON.Vector3(0.59, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(0.16, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }else{

            keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(-1.61, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.56, -0.02, 0),
                "cl" : new BABYLON.Vector3(0.02, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.42, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.52, -0.03, 1.55),
                "clDx" : new BABYLON.Vector3(-0.47, 0.02, -1.59),
                "brSx" : new BABYLON.Vector3(1.38, 2.95, 0.17),
                "brDx" : new BABYLON.Vector3(1.41, -2.46, -0.17),
                "avSx" : new BABYLON.Vector3(0.66, -2.34, -0.51),
                "avDx" : new BABYLON.Vector3(0.66, 2.39, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0.68, 0.14, 3.13),
                "csDx" : new BABYLON.Vector3(1.27, -0.09, -3.14),
                "gmSx" : new BABYLON.Vector3(0.59, 0.1, 0.03),
                "gmDx" : new BABYLON.Vector3(1.4, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(0.16, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(-1.61, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.56, -0.02, 0),
                "cl" : new BABYLON.Vector3(0.02, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.42, 0, -0.01),
                "clSx" : new BABYLON.Vector3(0.1, -0.03, 1.55),
                "clDx" : new BABYLON.Vector3(-0.47, 0.02, -1.59),
                "brSx" : new BABYLON.Vector3(1.38, 2.95, 0.17),
                "brDx" : new BABYLON.Vector3(1.41, -2.46, -0.17),
                "avSx" : new BABYLON.Vector3(0.66, -2.34, -0.51),
                "avDx" : new BABYLON.Vector3(0.66, 2.39, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(1.27, 0.14, 3.13),
                "csDx" : new BABYLON.Vector3(0.68, -0.09, -3.14),
                "gmSx" : new BABYLON.Vector3(1.4, 0.1, 0.03),
                "gmDx" : new BABYLON.Vector3(0.59, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(0.16, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }
        this.useFrame(keyFrames);
    }

    walkAnimation(){

        var keyFrames = [];

        if(this.torch == null){
        
            keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, 0.33, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.73, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.82, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0.33, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(-0.17, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.03, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.19, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, -0.75, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, -0.42, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(-0.33, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.28, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.23, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.03, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }else{

            keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, 0.33, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.33, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.82, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0.33, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(-0.17, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.03, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.19, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, -0.75, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.33, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(-0.33, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.28, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.23, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.03, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }
        this.useFrame(keyFrames);
    }

    runAnimation(){

        var keyFrames = [];

        if(this.torch == null){
        
            keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(-0.31, 0, 0),
                "cl" : new BABYLON.Vector3(0.3, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, 0.33, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.73, -1.59),
                "brSx" : new BABYLON.Vector3(-1.22, 2.25, 0.17),
                "brDx" : new BABYLON.Vector3(-0.56, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0.49, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(-0.47, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(-0.02, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.65, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(-0.05, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, -0.99, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, -0.79, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.61, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.9, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.22, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.48, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(-0.49, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.52, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.52, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.01, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)

            };
        }else{

            keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(-0.31, 0, 0),
                "cl" : new BABYLON.Vector3(0.3, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, 0.33, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.2, -1.59),
                "brSx" : new BABYLON.Vector3(-1.22, 2.25, 0.17),
                "brDx" : new BABYLON.Vector3(-0.56, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(0.49, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(-0.47, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(-0.02, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.65, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(-0.05, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.13, -0.99, 1.55),
                "clDx" : new BABYLON.Vector3(-0.12, 0.2, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.61, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.9, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.22, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.48, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(-0.49, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.52, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.52, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.01, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)

            };
        }
        this.useFrame(keyFrames);
    }

    jumpAnimation(){
        
        var keyFrames = [];

        if(this.torch == null){
        
            keyFrames[0] = {
                "i" : 0,
                "li" : 80,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.82, -0.17, 1.55),
                "clDx" : new BABYLON.Vector3(2.04, 0.16, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-0.77, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, -0.16, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(1.1, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(-0.58, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.44, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.54, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            
            keyFrames[1] = {
                "i" : 40,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(1.61, 0.09, 1.55),
                "clDx" : new BABYLON.Vector3(-0.73, 0.16, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -0.26, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(-0.49, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.93, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.52, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.35, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }else{

            keyFrames[0] = {
                "i" : 0,
                "li" : 80,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(-0.82, -0.17, 1.55),
                "clDx" : new BABYLON.Vector3(-0.73, 0.16, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -1.08, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(1.1, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(-0.58, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.44, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.54, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
            
            keyFrames[1] = {
                "i" : 40,
                "bc" : new BABYLON.Vector3(0, -3.14, 0),
                "pt" : new BABYLON.Vector3(0.12, 0, 0),
                "cl" : new BABYLON.Vector3(-0.18, 0, 0.01),
                "ts" : new BABYLON.Vector3(0.06, 0, -0.01),
                "clSx" : new BABYLON.Vector3(1.61, 0.09, 1.55),
                "clDx" : new BABYLON.Vector3(-0.73, 0.16, -1.59),
                "brSx" : new BABYLON.Vector3(-1.27, 1.55, 0.17),
                "brDx" : new BABYLON.Vector3(-1.17, -1.63, -0.17),
                "avSx" : new BABYLON.Vector3(-0.35, -0.26, -0.51),
                "avDx" : new BABYLON.Vector3(-0.35, 1.22, 0.45),
                "mnSx" : new BABYLON.Vector3(0.4, 1.53, 0.05),
                "mnDx" : new BABYLON.Vector3(0.46, -1.47, -0.02),
                "csSx" : new BABYLON.Vector3(-0.49, -0.05, 3.13),
                "csDx" : new BABYLON.Vector3(0.93, 0, -3.14),
                "gmSx" : new BABYLON.Vector3(0.52, 0.02, 0.03),
                "gmDx" : new BABYLON.Vector3(0.35, 0, 0.02),
                "tlSx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "tlDx" : new BABYLON.Vector3(-0.43, 0.01, -0.03),
                "pdSx" : new BABYLON.Vector3(-1.1, 0, 0),
                "pdDx" : new BABYLON.Vector3(-1.1, 0, 0)
            };
        }
        this.useFrame(keyFrames);
    }

    useFrame(keyFrames){
        
        var kf;
        var last;
        var firstKf;
        var secondKf;
        var importance;

        //reset
        if(this.#frame >= keyFrames[0]["li"]){
            this.#frame = 0;
        }
        
        for (var i = 0; i < keyFrames.length; i++){
            if(keyFrames[i+1] == null){
                kf = i;
                last = true;
                break;
            }else{
                if(this.#frame >= keyFrames[i]["i"] && this.#frame < keyFrames[i+1]["i"]){
                    kf = i;
                    last = false;
                    break;
                }
            }
        }

        if(!last){
            firstKf = keyFrames[kf];
            secondKf = keyFrames[kf+1];
            var indexDifference = (firstKf["i"] - secondKf["i"]);
            var inBetweenIndex = this.#frame - firstKf["i"];
        }else{
            firstKf = keyFrames[kf];
            secondKf = keyFrames[0];
            var indexDifference = (firstKf["i"] - secondKf["li"]);
            var inBetweenIndex = this.#frame - firstKf["i"];
        }
        importance = (inBetweenIndex)/indexDifference;
        importance = Math.abs(importance);

        var addRot = 0;
        if(document.getElementById("sliding").innerHTML == "true"){
            var dirRot = document.getElementById("dirRot").innerHTML;
            switch (dirRot){
                case "avDx": addRot = -Math.PI/4; break;
                case "dtDx": addRot = 5*Math.PI/4; break;
                case "avSx": addRot = Math.PI/4; break;
                case "dtSx": addRot = -5*Math.PI/4; break;
                case "Dx": addRot = -Math.PI/2; break;
                case "Sx": addRot = Math.PI/2; break;
                case "dt": addRot = Math.PI; break;
            }
            document.getElementById("sliding").innerHTML = "false";
        }
            
        //interpolate frame
        for (let k in firstKf){
            if(k == "i" || k == "li"){
                continue;
            }else if(k == "bc"){
                this.#skeleton[k].rotation = new BABYLON.Vector3(firstKf[k].x * (1 - importance) + secondKf[k].x * (importance),
                firstKf[k].y * (1 - importance) + secondKf[k].y * (importance) + addRot,
                firstKf[k].z * (1 - importance) + secondKf[k].z * (importance));
            }else{
                this.#skeleton[k].rotation = new BABYLON.Vector3(firstKf[k].x * (1 - importance) + secondKf[k].x * (importance),
                firstKf[k].y * (1 - importance) + secondKf[k].y * (importance),
                firstKf[k].z * (1 - importance) + secondKf[k].z * (importance));
            }
        }
        this.#frame +=1;
    }

    

    addTorch(torch) {
        this.torch = torch;
        this.torch.scale(1/0.3);
        moveStatus = "rest";
        this.setTorchAfterStep();
    }

    kickTorch(){
        if(isInCloseSight(this.model, this.pickableObjects["Torcia"].getMesh(), this.owned.slice(), PICK_DISTANCE)){
            this.pickableObjects["Torcia"].kick(this.forward_direction);
        }
    }

    ownKey(){
        if (this.ownedObjects["Chiave"] !== undefined)
            return true;
        return false;
    }

    rotateObject(rot){
        if(this.selObj !== undefined){
            this.selObj.groundRot(rot);
            showMessageFixed("Move the mouse around to rotate the\nobject. Press any key to stop.");
        }else{
            if(this.torch == null && isInCloseSight(this.model, this.pickableObjects["Torcia"].getMesh(), this.owned.slice(), PICK_DISTANCE)){
                this.selObj = this.pickableObjects["Torcia"];
            }
            else {
                this.rotatingObject = false;
                this.selObj = undefined;
                hideMessage();
            }
        }
    }

    grabObject() {
        for (const key of Object.keys(this.pickableObjects)) {
            if (this.pickableObjects[key] != null) {

                var adjustHeight = null;
                if (standingPosition == "crouch")
                    adjustHeight = 0.5;
                else
                    adjustHeight = 1;

                var ex = this.owned.slice().concat(this.pickableObjects[key].getExcused());
                
                if (isInCloseSight(this.model, this.pickableObjects[key].getMesh(), ex, PICK_DISTANCE, adjustHeight)){
                    
                    this.ownedObjects[key] = this.pickableObjects[key];

                    if (this.ownedObjects[key].getName().includes("torch")) {
                        this.ownedObjects[key].setParent(this.#skeleton["mnDx"]);
                        this.addTorch(this.ownedObjects[key]);
                        showHoldingTorch(true);
                        if (!this.torchAlreadyTaken) {
                            showMessage("Use the mouse wheel to move the torch.", 2500);
                            this.torchAlreadyTaken = true;
                        }
                    }else if (this.ownedObjects[key].getName().includes("chiave")) {
                        this.ownedObjects[key].gotKey();
                        showMessage("You grabbed the key.", 2000);
                        showHoldingKey();
                        // distruggi il modello della chiave
                        this.pickableObjects["Chiave"].getMesh().dispose(false, true);
                    }

                    this.pickableObjects[key] = null;
                    break;
                }
            }
        }

        this.owned = [];
        
        for (const key of Object.keys(this.ownedObjects)) {
            if(this.ownedObjects[key] != null){
                var modeles = this.ownedObjects[key].getMeshes();
                modeles.forEach(e =>{
                    this.owned.push(e);
                })
            }
        }
    }

    dropTorch(){

        if(Object.keys(this.ownedObjects).includes("Torcia") && this.ownedObjects["Torcia"] != null){
            var collisions = this.checkCollision((BABYLON.Vector3.Zero()).subtract(this.forward_direction), new BABYLON.Vector3(0,1,0), 1, this.depth, this.height);
            if(!collisions.collisionAll){
                this.pickableObjects["Torcia"] = this.ownedObjects["Torcia"];
                this.ownedObjects["Torcia"] = null;
    
                this.pickableObjects["Torcia"].setParent(null);
                //Set position
                var nPos = this.model.position.clone();
                nPos = nPos.subtract(this.forward_direction);
                nPos.y = this.coordinateObjectBelow(nPos) + 0.2;
                this.pickableObjects["Torcia"].setPosition(nPos);
                //Set rotation
                var nRot = this.model.rotation.clone();
                nRot.y += Math.PI;
                this.torch.setRotation(nRot);
                this.torch.scale(1);
                this.torch = null;  
                this.torchAngle = 0;
            }
        showHoldingTorch(false);
        }
    }

    addPickableObjects(pickableObjects){
        this.pickableObjects = pickableObjects;
    }

    addPickableObject(key, mesh){
        if(this.pickableObjects != undefined){
            if(this.pickableObjects[key] == undefined){
                this.pickableObjects[key] = mesh;
            }
        }
    }

    getPlayerMovementStatus(){
        switch(moveStatus){
            case "rest": return "silent";
            case "move":
                if(standingPosition == "crouch")
                    return "silent";
                else
                    return "normal";
            default: return "loud";
        }
    }
    isCrouch(){
        return standingPosition=="crouch";
    }
    getTorsoPosition(){
        return this.#skeleton["vn"].absolutePosition;
    }
}
