
const BEDROOM_SCENE_ID = 0;
const HALLWAY_SCENE_ID = 1;
const LIVINGROOM_SCENE_ID = 2;

// Nomi delle porte, usati dentro createBedroom ecc e dal player
const MENU_TO_BEDROOM = new String("door0");    // non e' una vera porta, serve per la posizione iniziale
const DOOR_BEDROOM_TO_HALLWAY = new String("door1");
const DOOR_HALLWAY_TO_BEDROOM = new String("door2");
const DOOR_HALLWAY_TO_LIVINGROOM = new String("door3");
const DOOR_LIVINGROOM_TO_HALLWAY = new String("door4");
const DOOR_LIVINGROOM_TO_EXIT = new String("door5");
const DOOR_SLIDING_1 = new String("door-sliding_1");              // porte del livello 3, che sono a scorrimento
const DOOR_SLIDING_2 = new String("door-sliding_2");
const DOOR_SLIDING_3 = new String("door-sliding_3");
const DOOR_LOCKED = new String("door-locked");               // serve per le porte "finte" in corridoio

const wallWidth = 0.14;
const wallHeight = 4;

const cameraHeightOffset = 1.3;
const cameraRadius = 3.8;

const TORCH_OPENING = Math.PI/10;
const TORCH_EXPONENT = 5;
const TORCH_RANGE = 12;
const TORCH_LENGHT = 1;
const TORCH_FAR = 8;

MONSTER_HEIGHT = -1.05;


var obstacleDoor1;  // ingresso-salotto
var obstacleDoor2;  // salotto-cucina
var obstacleDoor3;  // ingresso-bagno

var mirrorList;

var shadowList;


/**  POSIZIONI E ROTAZIONI DEL PLAYER DOPO CHE PASSA DA UNA PORTA:  **/

let player_y = floorHeight + heightOffset + 0.002;

function playerInitialPosition(doorName) {
    if (doorName == MENU_TO_BEDROOM)                    return new BABYLON.Vector3(-9, 2, 2);
    else if (doorName == DOOR_HALLWAY_TO_BEDROOM)       return new BABYLON.Vector3(6, player_y, -4);
    else if (doorName == DOOR_BEDROOM_TO_HALLWAY)       return new BABYLON.Vector3(-1, player_y, 12.8);
    else if (doorName == DOOR_LIVINGROOM_TO_HALLWAY)    return new BABYLON.Vector3(1.34, player_y, -10.4);
    else if (doorName == DOOR_HALLWAY_TO_LIVINGROOM)    return new BABYLON.Vector3(4.2, player_y, 5.7);
    else {
        //invalid door name
        goBackToStart();
    }
}

function playerInitialRotation(doorName) {
    if (doorName == MENU_TO_BEDROOM)                    return new BABYLON.Vector3(-1,0,0);
    else if (doorName == DOOR_HALLWAY_TO_BEDROOM)       return new BABYLON.Vector3(0,0,-1);
    else if (doorName == DOOR_BEDROOM_TO_HALLWAY)       return new BABYLON.Vector3(-1,0,0.5);
    else if (doorName == DOOR_LIVINGROOM_TO_HALLWAY)    return new BABYLON.Vector3(0,0,-1);
    else if (doorName == DOOR_HALLWAY_TO_LIVINGROOM)    return new BABYLON.Vector3(1,0,5);  // non e' normalizzato ma tanto la funzione setRotation di player lo normalizza
    else {
        //invalid door name
        goBackToStart();
    }
}

// Per gestire i mostri
var monsterModel1;
var monsterModel2;
var monsterModel3;
var monsters = [];

// Per gestire la torcia quando ci si sposta tra le stanze
const torchInitialPosition = new BABYLON.Vector3(-2.4,0.2,1.5);
const torchInitialRotation = new BABYLON.Vector3(0,0,0);
var torchLastPosition = torchInitialPosition.clone();
var torchLastRotation = torchInitialRotation.clone();
var torchSceneId = BEDROOM_SCENE_ID;



/******* EMPTY SCENE con camera, luce e player, va chiamata all'inizio del gioco *******/

async function basicScene(engine) {

    // This creates a basic Babylon Scene object (non-mesh)
    scene = new BABYLON.Scene(engine);
    // Background color
    scene.clearColor = new BABYLON.Color3(4/255, 3/255, 26/255);

    // OTTIMIZZAZIONI: evita che babylon controlla quale mesh e' puntata dal mouse
    scene.skipPointerMovePicking = true;
    scene.autoClear = false;    // non serve perche' c'è la skybox
    scene.blockMaterialDirtyMechanism = true;


    /**** Set camera and light *****/

    camera = new BABYLON.FollowCamera("followcamera", new BABYLON.Vector3(0, 7, -10), scene);
    camera.radius = cameraRadius;
    camera.heightOffset = cameraHeightOffset;
    camera.rotationOffset = 180;
    camera.cameraAcceleration = 0.6;
    camera.maxCameraSpeed = 8;


    // Ambient light
    const ambLight = new BABYLON.HemisphericLight("ambLight", new BABYLON.Vector3(0, 1, 0));
    ambLight.intensity = 0.45;
    ambLight.diffuse = new BABYLON.Color3(0.22, 0.22, 0.89);
	ambLight.specular = new BABYLON.Color3(0.8, 0.8, 1);
	ambLight.groundColor = new BABYLON.Color3(0.1, 0.1, 0);
    
    // Skybox
	var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:70.0}, scene);
	var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
	skyboxMaterial.backFaceCulling = false;
	skyboxMaterial.reflectionTexture = await new BABYLON.CubeTexture("http://127.0.0.1:5501/skybox/", scene);
	skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
	skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
	skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	skybox.material = skyboxMaterial;			
    
    // Glow layer
    const gl = new BABYLON.GlowLayer("glow", scene, { 
        mainTextureFixedSize: 256,
        blurKernelSize: 40
    });
    gl.intensity = 0.45;

    
    //Import player mesh
    var result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "bambina.glb", scene);
    var model = result.meshes[0];

    //Import monster mesh
    result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "monsterM1.glb", scene);
    monsterModel1 = result.meshes[0];
    result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "monsterM2.glb", scene);
    monsterModel2 = result.meshes[0];
    result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "monsterM3.glb", scene);
    monsterModel3 = result.meshes[0];
    
    setVisibilityChildren(monsterModel1, 0);     // resa invisibile, perche' per fare i mostri la cloniamo
    setPickableChildren(monsterModel1, false);
    setVisibilityChildren(monsterModel2, 0);
    setPickableChildren(monsterModel2, false);
    setVisibilityChildren(monsterModel3, 0);
    setPickableChildren(monsterModel3, false);

    // Creazione player
    player = new Player(playerInitialPosition(MENU_TO_BEDROOM), scene, camera, model);
    player.setRotation(playerInitialRotation(MENU_TO_BEDROOM));

    // Per far si' che la camera punti alla testa della bambina invece che ai piedi
    const cameraTarget = new BABYLON.AbstractMesh("cameraTarget", scene);
    cameraTarget.parent = player.model;
    cameraTarget.position.y += 3.5;
    camera.lockedTarget = cameraTarget;


    // Fai sparire gli oggetti tra la camera e il player
    
    var hitMeshes = [];

    scene.registerBeforeRender(function(){
        hitMeshes.forEach(element => {
            const index = hitMeshes.indexOf(element);
            if (index > -1) { // only splice array when item is found
                hitMeshes.splice(index, 1); // 2nd parameter means remove one item only
            }
            if (!element.name.includes("Invisible"))        // se no rende visibili anche i muri sopra
                element.visibility = 1;
        });
    });

    scene.registerBeforeRender(function(){
        let up = new BABYLON.Vector3(0,1,0);

        // Raggio all'altezza dei piedi:
        let pos = player.model.position.clone();
        if (player.crouching)
            pos.addInPlace(up.scale(0.4));        
        var direction = BABYLON.Vector3.Normalize(camera.position.subtract(pos));
        var ray = new BABYLON.Ray(pos, direction, camera.radius);
        var hits = scene.multiPickWithRay(ray);

        // Raggio all'altezza della testa:
        pos.addInPlace(up.scale(player.height*4/5));                  
        var direction = BABYLON.Vector3.Normalize(camera.position.subtract(pos));
        var ray = new BABYLON.Ray(pos, direction, camera.radius);
        hits = hits.concat(scene.multiPickWithRay(ray));

        if (hits) {
            for (var i = 0; i < hits.length; i++){

                var parent = hits[i].pickedMesh;
                while (parent.parent != null)
                    parent = parent.parent;

                if (hits[i].pickedMesh.material != null && parent != player.model && parent != monsterModel1 && parent != monsterModel2 && parent != monsterModel3) {
                    if (hits[i].pickedMesh.name.includes("wall") ) {
                        hits[i].pickedMesh.visibility = 0;
                        let children = hits[i].pickedMesh.getChildMeshes(false);
                            for (let i=0; i<children.length; i++) {
                                children[i].visibility = 0;             // per nascondere anche le finestre, e quadri/foto appese al muro
                                hitMeshes.push(children[i]);
                            }
                    }
                    else {
                        if (hits[i].pickedMesh.material.alpha > 0 && hits[i].pickedMesh.visibility > 0) {

                            let children = parent.getChildMeshes(false);
                            for (let i=0; i<children.length; i++) {
                                children[i].visibility = 0.2;
                                hitMeshes.push(children[i]);
                            }
                            parent.visibility = 0.2;
                            hitMeshes.push(parent);
                        }
                    }
                    hitMeshes.push(hits[i].pickedMesh);
                }
            }
        }
    });

    
    //Animation Manager
    scene.stopAllAnimations();
    var animationManager = function(){
        switch(moveStatus){
            case 0: player.resetPose(); break;
            case "rest": player.restAnimation(); break;
            case "move": player.moveAnimation(); break;
            case "run": player.runAnimation(); break;
            case "jump": player.jumpAnimation(); break;
        }
    };

    scene.registerBeforeRender(animationManager);

    return scene;
}


/******* BEDROOM *******/

async function BedroomScene(showHints=false) {

    var room = await createBedroom(showHints);
    sceneObjects[BEDROOM_SCENE_ID] = room.objects;
    navMeshObjects[BEDROOM_SCENE_ID] = room.navMeshObjects;

    // Navigation mesh
    var staticMesh = BABYLON.Mesh.MergeMeshes(navMeshObjects[BEDROOM_SCENE_ID],false);
    var navmeshParameters = {
        cs: 0.35,
        ch: 0.2,
        walkableSlopeAngle: 0,
        walkableHeight: 0.5,
        walkableClimb: 1,
        walkableRadius: 1,
        maxEdgeLen: 12,
        maxSimplificationError: 1.3,
        minRegionArea: 8,
        mergeRegionArea: 20,
        maxVertsPerPoly: 6,
        detailSampleDist: 6,
        detailSampleMaxError: 1,
        borderSize: 1,
      };

    navigationPlugin.createNavMesh([staticMesh], navmeshParameters);
    scene.removeMesh(staticMesh);

    // Creazione mostri
    monsters[BEDROOM_SCENE_ID] = new Monsters(2, scene, navigationPlugin, player.model,player);
    if (!document.getElementById("monsters").checked) {
        var monsterModelVisible1 = monsterModel1.clone();
        setVisibilityChildren(monsterModelVisible1, 1);
        setPickableChildren(monsterModelVisible1, true);
        monsters[BEDROOM_SCENE_ID].createMonster(new BABYLON.Vector3(7,MONSTER_HEIGHT,4), 1, monsterModelVisible1);
        
        var monsterModelVisible2 = monsterModel2.clone();
        setVisibilityChildren(monsterModelVisible2, 1);
        setPickableChildren(monsterModelVisible2, true);
        monsters[BEDROOM_SCENE_ID].createMonster(new BABYLON.Vector3(4,MONSTER_HEIGHT,-2), 1, monsterModelVisible2);
        
        monsters[BEDROOM_SCENE_ID].activateMonsters();
    }


    // Creazione torcia
    if (torch == null && torchSceneId == BEDROOM_SCENE_ID) {
        //Import torch mesh
        let result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "torcia.glb", scene);
        let torchMesh = result.meshes[0];

        torch = new Torch(0.20,0.20, new BABYLON.StandardMaterial(), new BABYLON.Vector3(0,0,1),TORCH_OPENING,TORCH_RANGE,TORCH_EXPONENT,TORCH_LENGHT,TORCH_FAR, torchMesh, scene);
        torch.setPosition(torchLastPosition);
        torch.setRotation(torchLastRotation);
        player.addPickableObjects({"Torcia":torch});
    }

    if (torch != null) {
        const effect = function (monsterMesh){
            var name = monsterMesh.name;
            var substringToRemove = "MonsterHeart";
            var result = removeSubstring(name, substringToRemove);
            result = parseInt(result);
    
            monsters[BEDROOM_SCENE_ID].torchedMonster(result);
        };
           
        torch.addEffect(scene, monsters[BEDROOM_SCENE_ID].getHearts(), monsters[BEDROOM_SCENE_ID].getExcusedMeshes(), getMirrorList(BEDROOM_SCENE_ID), effect);
    }

    currentScene = BEDROOM_SCENE_ID;

    if (document.getElementById("shadows").checked) {
        torch.resetShadows();
        room.objects.forEach(m => {
            m.receiveShadows = true;
            m.getChildMeshes().forEach(c => {
                c.receiveShadows = true;
            })
        })
        torch.addMeshesToShadow(room.objects);
    }
};


/******* HALLWAY *******/

async function HallwayScene(positionPlayer = false) {

    if (positionPlayer) {       // usato quando vai direttamente al livello 2 dal menu
        player.setPosition(playerInitialPosition(DOOR_BEDROOM_TO_HALLWAY));
        player.setRotation(playerInitialRotation(DOOR_BEDROOM_TO_HALLWAY));

        if (torch == null) {
            //Import torch mesh
            let result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "torcia.glb", scene);
            let torchMesh = result.meshes[0];

            torch = new Torch(0.20,0.20, new BABYLON.StandardMaterial(), new BABYLON.Vector3(0,0,1),TORCH_OPENING,TORCH_RANGE,TORCH_EXPONENT,TORCH_LENGHT,TORCH_FAR, torchMesh, scene);
            player.addPickableObjects({"Torcia":torch});
            torch.setPosition(player.model.position.clone());
            torch.modifyPosition(new BABYLON.Vector3(1,0,-1));
        }
    }

    var room = await createHallway();
    sceneObjects[HALLWAY_SCENE_ID] = room.objects;
    navMeshObjects[HALLWAY_SCENE_ID] = room.navMeshObjects;
    
    // Navigation mesh
    var staticMesh = BABYLON.Mesh.MergeMeshes(navMeshObjects[HALLWAY_SCENE_ID],false);
    var navmeshParameters = {
        cs: 0.3,
        ch: 0.2,
        walkableSlopeAngle: 0,
        walkableHeight: 0.5,
        walkableClimb: 1,
        walkableRadius: 1,
        maxEdgeLen: 12,
        maxSimplificationError: 1.3,
        minRegionArea: 8,
        mergeRegionArea: 20,
        maxVertsPerPoly: 6,
        detailSampleDist: 6,
        detailSampleMaxError: 1,
        borderSize: 1,
      };

    navigationPlugin.createNavMesh([staticMesh], navmeshParameters);
    scene.removeMesh(staticMesh);


    // Creazione mostri
    monsters[HALLWAY_SCENE_ID] = new Monsters(3, scene, navigationPlugin, player.model,player);
    if (!document.getElementById("monsters").checked) {
        var monsterModelVisible1 = monsterModel1.clone();
        setVisibilityChildren(monsterModelVisible1, 1);
        setPickableChildren(monsterModelVisible1, true);
        monsters[HALLWAY_SCENE_ID].createMonster(new BABYLON.Vector3(1.5, MONSTER_HEIGHT, 4.2), 1, monsterModelVisible1);
        var monsterModelVisible2 = monsterModel2.clone();
        setVisibilityChildren(monsterModelVisible2, 1);
        setPickableChildren(monsterModelVisible2, true);
        monsters[HALLWAY_SCENE_ID].createMonster(new BABYLON.Vector3(-1.2, MONSTER_HEIGHT, -5), 1, monsterModelVisible2);
        var monsterModelVisible3 = monsterModel3.clone();
        setVisibilityChildren(monsterModelVisible3, 1);
        setPickableChildren(monsterModelVisible3, true);
        monsters[HALLWAY_SCENE_ID].createMonster(new BABYLON.Vector3(1.2, MONSTER_HEIGHT, -7.1), 1, monsterModelVisible3);
        monsters[HALLWAY_SCENE_ID].activateMonsters();
        monsters[HALLWAY_SCENE_ID].waitMonster(0,4);
        monsters[HALLWAY_SCENE_ID].waitMonster(1,4);
        monsters[HALLWAY_SCENE_ID].waitMonster(2,4);
    }

    // Creazione torcia
    if (torch == null && torchSceneId == HALLWAY_SCENE_ID) {
        let result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "torcia.glb", scene);
        let torchMesh = result.meshes[0];
        torch = new Torch(0.20,0.20, new BABYLON.StandardMaterial(), new BABYLON.Vector3(0,0,1),TORCH_OPENING,TORCH_RANGE,TORCH_EXPONENT,TORCH_LENGHT,TORCH_FAR, torchMesh, scene);
        torch.setPosition(torchLastPosition);
        torch.setRotation(torchLastRotation);

        player.addPickableObjects({"Torcia":torch});
    }

    if (torch != null) {
        const effect = function (monsterMesh){
            var name = monsterMesh.name;
            var substringToRemove = "MonsterHeart";
            var result = removeSubstring(name, substringToRemove);
            result = parseInt(result);
    
            monsters[HALLWAY_SCENE_ID].torchedMonster(result);
        };
           
        torch.addEffect(scene, monsters[HALLWAY_SCENE_ID].getHearts(), monsters[HALLWAY_SCENE_ID].getExcusedMeshes(), getMirrorList(HALLWAY_SCENE_ID), effect);
    }
    
    currentScene = HALLWAY_SCENE_ID;

    

    // SPECCHIO:

    //Create reflecting surface for mirror surface
    var reflector = new BABYLON.Plane.FromPositionAndNormal(new BABYLON.Vector3(-2.36, 1.5, 7.9), new BABYLON.Vector3(-1,0,0));

    //Create the mirror material
    var reflectionTexture = new BABYLON.MirrorTexture("mirror", 1024, scene, true);
    reflectionTexture.level = 10;    // quanto e' luminoso lo specchio
    reflectionTexture.mirrorPlane = reflector;
    
    // Oggetti da riflettere
    let renderList = [];
    for (let i = 0; i < room.mirrorObjects.length; i++) {
        let ch = room.mirrorObjects[i].getChildMeshes();
        renderList = renderList.concat(ch);
    }
    if (!document.getElementById("monsters").checked) {
        renderList = renderList.concat(monsterModelVisible1.getChildMeshes());
        renderList = renderList.concat(monsterModelVisible2.getChildMeshes());
        renderList = renderList.concat(monsterModelVisible3.getChildMeshes());
    }
    renderList = renderList.concat(player.model.getChildMeshes());
    reflectionTexture.renderList = renderList;

    let mat = scene.getMaterialByName("mirrorMaterial");
    mat.unfreeze(); 
    mat.reflectionTexture = reflectionTexture;
    mat.disableLighting = true;     // senza questo lo specchio non riflette

    mirrorLuminance = scene.getMaterialByName("mirrorDirty");
    mirrorLuminance.emissiveColor = new BABYLON.Color3(0, 0, 0);

    if(document.getElementById("shadows").checked){
        torch.resetShadows();
        room.objects.forEach(m => {
            m.receiveShadows = true;
            m.getChildMeshes().forEach(c => {
                c.receiveShadows = true;
            })
        })
        
        torch.addMeshesToShadow(room.objects);
    }
};



/******* LIVING ROOM *******/

async function LivingroomScene(positionPlayer = false) {

    if (positionPlayer) {       // usato quando vai direttamente al livello 3 dal menu

        player.setPosition(playerInitialPosition(DOOR_HALLWAY_TO_LIVINGROOM));
        player.setRotation(playerInitialRotation(DOOR_HALLWAY_TO_LIVINGROOM));

        if (torch == null) {
            //Import torch mesh
            let result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "torcia.glb", scene);
            let torchMesh = result.meshes[0];

            torch = new Torch(0.20,0.20, new BABYLON.StandardMaterial(), new BABYLON.Vector3(0,0,1),TORCH_OPENING,TORCH_RANGE,TORCH_EXPONENT,TORCH_LENGHT, TORCH_FAR, torchMesh, scene);
            torch.setPosition(player.model.position.clone());
            torch.modifyPosition(new BABYLON.Vector3(1,0,-1));
            torch.setRotation(torchLastRotation);
            player.addPickableObjects({"Torcia":torch});
        }
    }

    var room = await createLivingroom();
    sceneObjects[LIVINGROOM_SCENE_ID] = room.objects;
    navMeshObjects[LIVINGROOM_SCENE_ID] = room.navMeshObjects;

    // Navigation mesh
    var staticMesh = BABYLON.Mesh.MergeMeshes(room.navMeshObjects, false);
    var navmeshParameters = {
        cs: 0.3,
        ch: 0.2,
        walkableSlopeAngle: 0,
        walkableHeight: 0.5,
        walkableClimb: 1,
        walkableRadius: 1,
        maxEdgeLen: 12,
        maxSimplificationError: 1.3,
        minRegionArea: 8,
        mergeRegionArea: 20,
        maxVertsPerPoly: 6,
        detailSampleDist: 6,
        detailSampleMaxError: 1,
        borderSize: 1,
        tileSize:8
      };

    navigationPlugin.createNavMesh([staticMesh], navmeshParameters);
    scene.removeMesh(staticMesh);

    // Aggiungi le porte alla navmesh come ostacoli:
    obstacleDoor1 = navigationPlugin.addBoxObstacle(new BABYLON.Vector3(1.5, 1.5, 3), new BABYLON.Vector3(2, 3, 0.6), 0);
    obstacleDoor2 = navigationPlugin.addBoxObstacle(new BABYLON.Vector3(3.6, 1.5, -5.5/2), new BABYLON.Vector3(2, 3, 0.6), Math.PI/2);
    obstacleDoor3 = navigationPlugin.addBoxObstacle(new BABYLON.Vector3(-0.8, 1.5, 5.75), new BABYLON.Vector3(2, 3, 0.6), Math.PI/2);


    // Creazione mostri
    monsters[LIVINGROOM_SCENE_ID] = new Monsters(3, scene, navigationPlugin, player.model,player);
    if (!document.getElementById("monsters").checked) {
        var monsterModelVisible1 = monsterModel1.clone("", null, false);
        setVisibilityChildren(monsterModelVisible1, 1);
        setPickableChildren(monsterModelVisible1, true);
        monsters[LIVINGROOM_SCENE_ID].createMonster(new BABYLON.Vector3(2, MONSTER_HEIGHT+0.1, 0.2), 1, monsterModelVisible1);
        var monsterModelVisible2 = monsterModel2.clone("", null, false);
        setVisibilityChildren(monsterModelVisible2, 1);
        setPickableChildren(monsterModelVisible2, true);
        monsters[LIVINGROOM_SCENE_ID].createMonster(new BABYLON.Vector3(0, MONSTER_HEIGHT+0.1, -6), 1, monsterModelVisible2);
        var monsterModelVisible3 = monsterModel3.clone("", null, false);
        setVisibilityChildren(monsterModelVisible3, 1);
        setPickableChildren(monsterModelVisible3, true);
        monsters[LIVINGROOM_SCENE_ID].createMonster(new BABYLON.Vector3(-7, MONSTER_HEIGHT+0.1, -5), 1, monsterModelVisible3);
        monsters[LIVINGROOM_SCENE_ID].activateMonsters();
        monsters[LIVINGROOM_SCENE_ID].waitMonster(0,4);
        monsters[LIVINGROOM_SCENE_ID].waitMonster(1,4);
        monsters[LIVINGROOM_SCENE_ID].waitMonster(2,4);
    }


    // Creazione torcia
    if (torch == null && torchSceneId == LIVINGROOM_SCENE_ID) {
        //Import torch mesh
        let result = await BABYLON.SceneLoader.ImportMeshAsync("", "http://127.0.0.1:5501/models/", "torcia.glb", scene);
        let torchMesh = result.meshes[0];

        torch = new Torch(0.20,0.20, new BABYLON.StandardMaterial(), new BABYLON.Vector3(0,0,1),TORCH_OPENING,TORCH_RANGE,TORCH_EXPONENT,TORCH_LENGHT, TORCH_FAR, torchMesh, scene);
        torch.setPosition(torchLastPosition);
        torch.setRotation(torchLastRotation);
        player.addPickableObjects({"Torcia":torch});
    }

    if (torch != null) {
        const effect = function (monsterMesh){
            var name = monsterMesh.name;
            var substringToRemove = "MonsterHeart";
            var result = removeSubstring(name, substringToRemove);
            result = parseInt(result);
    
            monsters[LIVINGROOM_SCENE_ID].torchedMonster(result);
        };
        var glasslist = getDoorGlass();
        var ex = monsters[LIVINGROOM_SCENE_ID].getExcusedMeshes().concat(glasslist);
        torch.addEffect(scene, monsters[LIVINGROOM_SCENE_ID].getHearts(), ex, getMirrorList(LIVINGROOM_SCENE_ID), effect);
    }

    // CHIAVE
    if (!player.ownKey()) {
        player.addPickableObject("Chiave", objKey);
    }
    
    currentScene = LIVINGROOM_SCENE_ID;

    if(document.getElementById("shadows").checked){
        torch.resetShadows();
        room.objects.forEach(m => {
            m.receiveShadows = true;
            m.getChildMeshes().forEach(c => {
                c.receiveShadows = true;
            })
        })
        
        torch.addMeshesToShadow(room.objects);
    }
};



/******* PER CAMBIARE SCENA *******/

async function switchScene(sceneId, playerPosition, playerRotation) {
    if (sceneId != currentScene) {

        document.getElementById("loading").removeAttribute("hidden");

        player.stop();
        engine.stopRenderLoop();

        disposeScene(currentScene);

        switch (sceneId) {
            case BEDROOM_SCENE_ID:
                await BedroomScene();
                break;
            case HALLWAY_SCENE_ID:
                await HallwayScene();
                break;
            case LIVINGROOM_SCENE_ID:
                await LivingroomScene();
                break;
            default: break;
        }
        player.model.position.x = playerPosition.x;
        player.model.position.y = Math.max(playerPosition.y, player.model.position.y);  // cosi' se entri saltando viene meglio
        player.model.position.z = playerPosition.z;
        player.jumping = false;
        player.falling = false;
    
        startRenderLoop(engine, canvas);
        player.start();
        document.getElementById("loading").setAttribute("hidden", null);
    }
}

// Per eliminare la scena precedente:
function disposeScene(sceneId) {

    scene.blockfreeActiveMeshesAndRenderingGroups = true;   // OTTIMIZZAZIONE: da fare prima di eliminare tante mesh


    // Dispose objects
    let len = sceneObjects[sceneId].length;
    for (var i=0; i<len; i++) {
        if (sceneObjects[sceneId][i].material) {
            if (sceneObjects[sceneId][i].material.emissiveTexture) {
                sceneObjects[sceneId][i].material.emissiveTexture.dispose();
                sceneObjects[sceneId][i].material.emissiveTexture = null;
            }
            if (sceneObjects[sceneId][i].material.reflectionTexture) {
                sceneObjects[sceneId][i].material.reflectionTexture.dispose();
                sceneObjects[sceneId][i].material.reflectionTexture = null;
            }
            if (sceneObjects[sceneId][i].material.diffuseTexture) {
                sceneObjects[sceneId][i].material.diffuseTexture.dispose();
                sceneObjects[sceneId][i].material.diffuseTexture = null;
            }
            if (sceneObjects[sceneId][i].material.bumpTexture) {
                sceneObjects[sceneId][i].material.bumpTexture.dispose();
                sceneObjects[sceneId][i].material.bumpTexture = null;
            }
            sceneObjects[sceneId][i].material.dispose(true, true);
            sceneObjects[sceneId][i].material = null;
        }
        sceneObjects[sceneId][i].dispose(false,true);
        sceneObjects[sceneId][i] = null;
    }
    sceneObjects[sceneId] = [];
    navMeshObjects[sceneId] = [];

    // Dispose monsters
    if (monsters[sceneId]) {
        monsters[sceneId].disposeMonsters();
    }
    monsters[sceneId] = undefined;
    //navigationPlugin.navMesh = null;

    // Dispose torch, only if the player isn't holding it:
    if (player.torch == null && torch != null) {
        torchLastPosition = torch.getPosition().clone();
        torchLastRotation = torch.getRotation().clone();
        torchSceneId = currentScene;

        torch.getMesh().dispose(false,true);
        torch = null;
    }

    scene.blockfreeActiveMeshesAndRenderingGroups = false;
    scene.freeActiveMeshes();
}




// Funzione che crea muri, utilizzata da createBedroom, createHallway e createLivingroom
function createWall(positionA, positionB, index) {
    var wall = BABYLON.MeshBuilder.CreateBox("wall" + index, { depth: wallWidth, height: wallHeight, width: BABYLON.Vector3.Distance(positionA, positionB) }, scene);
    wall.material = new BABYLON.StandardMaterial();
    wall.material.diffuseColor = new BABYLON.Color3(0.95, 0.92, 0.9);
    if (positionA.x == positionB.x) {
        wall.position.x += positionA.x;
        wall.rotation.y = Math.PI / 2;
        let width = BABYLON.Vector3.Distance(positionA, positionB);
        wall.scaling.x = (width + wallWidth)/width;
    }
    if (positionA.z == positionB.z)
        wall.position.z += positionA.z;

    wall.position.y += wallHeight / 2;

    var battiscopa = BABYLON.MeshBuilder.CreateBox("battiscopa" + index, { depth: 0.1, height: 0.2, width: BABYLON.Vector3.Distance(positionA, positionB) }, scene);
    battiscopa.position = wall.position.clone();
    battiscopa.rotation.y = wall.rotation.y;
    battiscopa.position.y = 0.1;
    if (index == 0)
        battiscopa.position.z += 0.1;
    else if (index == 1)
        battiscopa.position.x -= 0.1;
    else if (index == 2)
        battiscopa.position.z -= 0.1;
    else if (index == 3)
        battiscopa.position.x += 0.1;

    battiscopa.setParent(wall);

    // Creo un altro muro trasparente sopra di questo, serve per evitare che la bambina vada oltre il muro
    var wall2 = BABYLON.MeshBuilder.CreateBox("wallInvisible" + index, { depth: wallWidth, height: wallHeight, width: BABYLON.Vector3.Distance(positionA, positionB) }, scene);
    wall2.material = new BABYLON.StandardMaterial();
    wall2.position.x = wall.position.x;
    wall2.rotation.y = wall.rotation.y;
    wall2.position.z = wall.position.z;
    wall2.position.y = wall.position.y + wallHeight;
    wall2.visibility = 0;       // cosi' le pareti extra non si vedono ma ci sono comunque

    wall.receiveShadows = true;

    return [wall, wall2, battiscopa];
}

function getMirrorList(sceneId) {
    if (mirrorModel === undefined || sceneId != HALLWAY_SCENE_ID){
        mirrorList = null;
    }else{
        mirrorList = [];
        mirrorList = mirrorList.concat(mirrorModel.getChildMeshes());
    }
    return mirrorList;
}
