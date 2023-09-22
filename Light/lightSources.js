const initialkickSpeed = 0.25;
const kickSpeedMin = 0.01;
const kickSpeedDecrement = 1.05;
const initialFallSpeed2 = 0.01;
const fallSpeedMax2 = 0.98;
const fallSpeedIncrement2 = 0.9; 
const heightOffset2 = 0.05;
var something = false;

class Torch {

    #mesh;
    #spotlight;
    #effect;
    #childs;

    constructor(tSize, tHeight, tMaterial, direction, angle, range, exponent, lenght, far, mesh, scene=null){
        this.#mesh = mesh;
        this.#mesh.name = "torchMain";
        this.#mesh.material = tMaterial;
        this.#childs = this.#mesh.getChildMeshes();
        var i = 0;
        this.#childs.forEach(e =>{
            e.name = "torch" + i;
            i++;
        })
        this.far = far;
        this.lenght = lenght;
        this.angle = angle;
        this.direction = direction.clone();
        this.forward_direction = direction.clone();
        this.right_direction = this.forward_direction.cross(new BABYLON.Vector3(0,1,0));
        this.#spotlight = new BedSpotlight(new BABYLON.Vector3(0,0,0), direction, angle, exponent, range);
        this.#spotlight.setParent(this.#mesh);
        this.#effect = false;
        this.scene = scene;
        // To handle falling
        this.falling = false;
        this.fallSpeed = initialFallSpeed2;
    }

    addMeshesToShadow(meshList){
        meshList.forEach(element => {
            this.#spotlight.addMeshToShadow(element);
        })
    }    

    resetShadows(){
        this.#spotlight.resetShadows();
    }

    addEffect(scene = null, objectHitList, excusedList, mirrorList, action){
        var torcEx = this.#childs.concat(this.#mesh);
        excusedList = excusedList.concat(torcEx);

        if(scene == null)
            this.scene = scene;
        this.objectHitList = objectHitList;
        this.excusedList = excusedList;
        this.mirrorList =  mirrorList;
        this.action = action;
        var parent = this.#mesh.parent;
        if(parent == null){
            parent = this.#mesh;
        }
        if(this.#effect){
            this.scene.onBeforeRenderObservable.remove(this.observer);
        }
        
        this.observer = scene.onBeforeRenderObservable.add(function () {
            lightHit(this.#mesh, objectHitList, excusedList, mirrorList,
                this.direction, this.angle, this.lenght, this.far, 6, action, scene)
        }.bind(this));
        this.#effect = true;
    }

    getMesh(){
        return this.#mesh;
    }

    getMeshes(){
        return this.#childs.concat(this.#mesh);
    }

    getExcused(){
        return [];
    }

    getName(){
        return "torch";
    }

    scale(x){
        this.#mesh.scaling = new BABYLON.Vector3(x,x,x);
    }

    setParent(nParent){
        if(nParent != null){
            var tmpPos = nParent.parent.position;
            tmpPos = tmpPos.add(new BABYLON.Vector3(0,-1,0.5));
            this.setPosition(tmpPos);
        }else{
            this.setPosition(new BABYLON.Vector3(-0.25,0.5,0));
        }
        this.#mesh.parent = nParent;
        var parent = nParent;

        if(this.observer !== undefined)
            this.scene.onBeforeRenderObservable.remove(this.observer);

        if(parent == null){
            parent = this.#mesh;
        }

        if(this.action !== undefined){
            this.observer = scene.onBeforeRenderObservable.add(function () {
                lightHit(this.#mesh, this.objectHitList, this.excusedList, this.mirrorList,
                    this.direction, this.angle, this.lenght, this.far, 6, this.action, this.scene)
            }.bind(this));
        }
    }

    setPosition(position){
        this.#mesh.position = position;
    }
    getPosition(){
        return this.#mesh.position;
    }

    modifyPosition(vPosition){
        this.#mesh.position.x += vPosition.x;
        this.#mesh.position.y += vPosition.y;
        this.#mesh.position.z += vPosition.z;
    }

    setRotation(rotation){
        this.#mesh.rotation = rotation;
    }
    getRotation(){
        return this.#mesh.rotation;
    }

    setStandardRotation(){
        this.#mesh.rotation = new BABYLON.Vector3(0,0,0);
    }

    modifyRotation(right_direction, angle){
        this.#mesh.rotate(right_direction, angle, BABYLON.Space.WORLD);
    }

    rotate(axis, angle){
        this.#mesh.rotate(axis, angle, BABYLON.Space.WORLD);
    }
    
    groundRot(rot){
        this.#mesh.rotate(new BABYLON.Vector3(0,1,0), rot, BABYLON.Space.WORLD);
    }

    kick(kickDir){

        var kick_direction = kickDir.clone();
        kick_direction.x *= -1;
        kick_direction.z *= -1;
        this.speed = initialkickSpeed;
        this.rolling = true;
        this.falling = false;
        

        this.kickObserver = scene.onBeforeRenderObservable.add(function () {

            if(this.rolling){
                //Something Forward?
                var ray = new BABYLON.Ray(this.#mesh.position, kick_direction, 1);
                var hits = scene.multiPickWithRay(ray);
                if (hits){
                    hits = sortPickedMeshesByDistance(hits, 0);
                    for (var i = hits.length -1; i >= 0; i--) {
                        
                        if (!(hits[i].pickedMesh == this.#mesh || this.#childs.includes(hits[i].pickedMesh))){
                            this.speed = 0;
                            break;
                        }
                    }
                    
                }

                var vecAdd = new BABYLON.Vector3(this.speed*kick_direction.x, 0, this.speed*kick_direction.z);
                this.#mesh.position = this.#mesh.position.add(vecAdd);
                this.speed = Math.pow(this.speed, kickSpeedDecrement);
                if(this.speed < kickSpeedMin){
                    this.rolling = false;
                }
                
            }

            
            var coordBelow = this.coordinateObjectBelow(this.#mesh.position);
            var distFromObjectBelow = this.#mesh.position.y - 0.1 - coordBelow;
            
            
            if(distFromObjectBelow > 0.1 && !this.falling){
                //Falling?
                    var length = 10;
                    //check underneath
                    var ray = new BABYLON.Ray(this.#mesh.position, new BABYLON.Vector3(0,-1,0), length);
                    var hits = scene.multiPickWithRay(ray);
                    if (hits){
                        hits = sortPickedMeshesByDistance(hits, 1);
                        for (var i = hits.length -1; i >= 0; i--) {
                            
                            if (!(hits[i].pickedMesh == this.#mesh || this.#childs.includes(hits[i].pickedMesh))){
                                this.falling = true;
                                this.fallSpeed = initialFallSpeed2;
                                break;
                            }
                        }
                        
                    }
            }
            // Cadi normalmente
            if (this.falling && this.fallSpeed < distFromObjectBelow-heightOffset2) {
                this.#mesh.position.y -= this.fallSpeed;

                // Incrementa velocita' caduta
                this.fallSpeed = Math.min(fallSpeedMax2, Math.pow(this.fallSpeed,fallSpeedIncrement2));
            }
            // Finisci l'ultimo pezzetto di caduta
            else if (this.falling) {
                this.#mesh.position.y = coordBelow + heightOffset2;
                this.falling = false;
                something = false;
                this.fallSpeed = initialFallSpeed2;
            }
            
            if(!this.falling && !this.rolling){
                this.scene.onBeforeRenderObservable.remove(this.kickObserver);
            }
        }.bind(this));
    }

    coordinateObjectBelow(position) {
        var len = 10;
        let ray = new BABYLON.Ray(position, new BABYLON.Vector3(0,-1,0), len);
    
        var hit = this.scene.multiPickWithRay(ray);
        hit = sortPickedMeshesByDistance(hit, 1);
    
        if (hit.length <= 1)
            return 0;
    
        var closestObject = hit[0];
        for (let i=0; i < hit.length; i++) {
            if (!this.#childs.includes(hit[i].pickedMesh) && (hit[i].pickedMesh != this.#mesh)) {
                closestObject = hit[i];
                break;
            }
        } 
    
        var heightIntersection = closestObject.pickedPoint.y;

        return heightIntersection;
    }

}

var wait = 0;
var rayHelper;
//Function that checks if light hits based on origin
function lightHit(torchMesh, objectHitList, excusedList, mirrorList, forward, angle, lenght, far, timesToHit, action, scene){
    
    wait++;
    if (wait == timesToHit) {

        objectHitList.forEach(element => {
            var inSightInfo = isInPossibleSight(torchMesh, element, forward, Math.cos(angle/2));
            if(inSightInfo.inSight){
                var dir = element.absolutePosition.subtract(torchMesh.absolutePosition);
                castRayTorch(torchMesh, dir, lenght, far, action, objectHitList, excusedList, scene);
            }
            
        });
        
        if(mirrorList != null){
            var inSightInfo = isInPossibleSight(torchMesh, mirrorList[1], forward, Math.cos(angle));
            if(inSightInfo.inSight){
                var dir = mirrorList[1].absolutePosition.subtract(torchMesh.absolutePosition);
                mirrorCastRay(torchMesh, dir, lenght, far, action, objectHitList, excusedList, mirrorList, scene);
            }else{
                mirrorLight.setIntensity(0);
                mirrorLuminance.emissiveColor = new BABYLON.Color3(0, 0, 0);
            }
        }
        wait = 0;
    }
    
}

function castRayTorch(torchMesh, direction, lenght, far, action, objectHitList, excusedList, scene, show = false){
    
    //Ray
    var posModified = torchMesh.absolutePosition.clone();
    var dirModified = direction.clone();
    var ray = new BABYLON.Ray(posModified, dirModified, lenght);
    //Light hit effect
    var hits = scene.multiPickWithRay(ray);
    /*
    if (show){
        if (rayHelper !== undefined)
            rayHelper.dispose();
        rayHelper = new BABYLON.RayHelper(ray);
        rayHelper.show(scene);
    }
    */
    
    if (hits){
        hits = sortPickedMeshesByDistance(hits, 0);
        for (var i = hits.length -1; i >= 0; i--) {
            if(objectHitList.includes(hits[i].pickedMesh)){   
                if(hits[i].distance < far)  
                    action(hits[i].pickedMesh);
            }else if (excusedList.includes(hits[i].pickedMesh)){
            }else{
                break;
            }
        }
        
    }
}

function mirrorCastRay(torchMesh, direction, lenght, far, action, objectHitList, excusedList, mirrorList, scene){
    
    //Ray
    var posModified = torchMesh.absolutePosition.clone();
    var dirModified = direction.clone();
    var ray = new BABYLON.Ray(posModified, dirModified, lenght);
    //Light hit effect
    var hits = scene.multiPickWithRay(ray);

    if (hits){
        hits = sortPickedMeshesByDistance(hits, 0);
        for (var i = hits.length -1; i >= 0; i--) {
            if(mirrorList.includes(hits[i].pickedMesh)){  
                if(hits[i].distance < far)  
                    mirrorReflectLight(mirrorList, dirModified, lenght, far, action, objectHitList, excusedList, scene);
            }else if (excusedList.includes(hits[i].pickedMesh) || objectHitList.includes(hits[i].pickedMesh)){
            }else{
                break;
            }
        }
        
    }
}

function mirrorReflectLight(mirrorList, dirModified, lenght, far, action, objectHitList, excusedList, scene){
    var mirror = mirrorList[1];
    var normal = new BABYLON.Vector3(1,0,0);
    var cos = Math.abs(cosBetween(BABYLON.Vector3.Normalize(dirModified), normal));

    mirrorLight.setIntensity(cos*2);
    mirrorLuminance.emissiveColor = new BABYLON.Color3(cos*2, cos*2, 0.8*cos*2);

    objectHitList.forEach(element => {
        var inSightInfo = isInPossibleSight(mirror, element, normal, Math.cos(Math.PI));
        if(inSightInfo.inSight){
            var dir = element.absolutePosition.subtract(mirror.absolutePosition);

            castRayTorch(mirror, dir, lenght, far, action, objectHitList, excusedList.concat(mirrorList), scene, true);
        }
        
    });
}