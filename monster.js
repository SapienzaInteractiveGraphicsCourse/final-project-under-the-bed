const monsterParams = {
    radius: 0.7,
    height: 3,
    maxAcceleration: 3.0,
    maxSpeed: 3.0,
    collisionQueryRange: 2, //evita che i mostri rimbalzino tra di loro 
    pathOptimizationRange: 0.0,
    separationWeight: 100.0
};
const width = 0.20;
const timeTorched = 5;
const eyeHeight =2.8;

const VIEW_ANGLE = 0.4;
const MONSTERT_PATIENCE = 240;


class Monsters {

    monsterList = [];
    heartMaterialsList = [];        // serve per cambiare il colore al materiale del cuore
    modelMonster;
    rayHelper;
    nMonst = 0;

    behaviour = () => {
       
        /*COMPORTAMENTO DEI MOSTRI:
        1) se sono vedono la bambina -> vanno da lei
        2) se sentono la bambina -> si avvicinano a lei -> vanno in una zona vicino a lei
        3) in tutti gli altri casi rimangono fermi e si girano a cercare la bambina
        */
    
        var monsters = this.crowd.getAgents();
        var i;
        for (i = 0; i < monsters.length; i++) {
            var position = this.crowd.getAgentPosition(monsters[i]); //salva la posizione del mostro
            var distance = BABYLON.Vector3.Distance(position, this.bambina.position); // calcola la distanza mostro/bambina
            
            if(this.rayhelper !== undefined){
            this.rayhelper.dispose();
            }

            if (this.monsterList[i].torched <= 0 ) {
                var inSightInfo = isInPossibleSight(this.monsterList[i].hands, this.player.getTorsoPosition(), 
                new BABYLON.Vector3(0,0,1), Math.cos(Math.PI/2), false);
                if(inSightInfo.inSight){
                    var dir = this.player.getTorsoPosition().subtract(this.monsterList[i].hands.absolutePosition);
                    var ray = new BABYLON.Ray(this.monsterList[i].hands.absolutePosition, dir, 1);
                    var hits = scene.multiPickWithRay(ray);
                    
                    if (true){
                        if (rayHelper !== undefined)
                            rayHelper.dispose();
                        rayHelper = new BABYLON.RayHelper(ray);
                        rayHelper.show(scene);
                    }
                    
                    if (hits){
                        hits = sortPickedMeshesByDistance(hits, 0);
                        for (var i = hits.length -1; i >= 0; i--) {
                            if(this.player.model == hits[i].pickedMesh){   
                                if(hits[i].distance < 1)  
                                    this.happyMonster(i);
                                    this.player.loseOneLife();
                            }else if (this.getExcusedMeshes().includes(hits[i].pickedMesh)){
                            }else{
                                break;
                            }
                        }  
                    }
                }
                //Vedo la bambina? -> vado da lei?
                else if (this.canSeeGirl(i)) {
                    this.monsterList[i].behav = "Grabbing";
                    this.monsterList[i].goTo = this.navigationPlugin.getClosestPoint(this.bambina.position);
                    this.crowd.agentGoto(monsters[i], this.monsterList[i].goTo);
                }
                //Sento la bambina? -> vado in una zona vicino a lei
                else if (((distance < 5 && distance > 0.1) && this.player.getPlayerMovementStatus().includes("normal")) 
                        || ((distance < 12 && distance > 0.1) && this.player.getPlayerMovementStatus().includes("loud"))
                        || this.monsterList[i].behav == "Grabbing") {
                    this.monsterList[i].behav = "Searching";

                    this.monsterList[i].girlPos = this.bambina.position.clone();
                  
                    this.monsterList[i].girlPos.x += (0.5 + Math.random()) * (Math.random() > 0.5 ? 1 : -1);
                    this.monsterList[i].girlPos.z += (0.5 + Math.random()) * (Math.random() > 0.5 ? 1 : -1);
                    this.monsterList[i].goTo = this.navigationPlugin.getClosestPoint(this.monsterList[i].girlPos);
                    this.crowd.agentGoto(monsters[i], this.monsterList[i].goTo);
                    this.monsterList[i].patience = MONSTERT_PATIENCE;
                    
                }
                else if (this.monsterList[i].behav == "Searching"){
                    this.monsterList[i].patience -= 1;
                    if(this.monsterList[i].patience == 0){
                        this.monsterList[i].behav = "Roaming";
                    }
                }   
                // Non ho informazioni sulla bambina? mi giro              
                else {
                    this.monsterList[i].behav = "Roaming";
                    
                    var monsterPosition = this.crowd.getAgentPosition(i);
                    monsterPosition.x += (0.5 + Math.random()) * (Math.random() > 0.5 ? 1 : -1);
                    monsterPosition.z += (0.5 + Math.random()) * (Math.random() > 0.5 ? 1 : -1);
                    this.crowd.agentGoto(monsters[i], this.navigationPlugin.getClosestPoint(monsterPosition));
                    
                }
                
            }
            //Rimango fermo
            else {
                this.crowd.agentGoto(monsters[i], this.navigationPlugin.getClosestPoint(this.crowd.getAgentPosition(i)));
            }

        }
    };

    pauseBehaviour = () => {
        // Fai andare ogni mostro nella propria posizione, cosi' stanno fermi
        var monsters = this.crowd.getAgents();
        for (let i = 0; i < monsters.length; i++) {
            var position = this.crowd.getAgentPosition(monsters[i]);
            this.crowd.agentGoto(monsters[i], position);
        }
    };

    constructor(nMaxMonsters, scene, plugin, modelGirl,player) {
        this.scene = scene;
        this.navigationPlugin = plugin;
        this.crowd = this.navigationPlugin.createCrowd(nMaxMonsters, 0.1, scene);
        this.player = player;
        this.bambina = modelGirl;
        this.littleGirl = this.bambina.getChildMeshes().concat(modelGirl);
        setInterval(this.updateTorch.bind(this), 500);
        //AGGIORNA MESH
        
        this.scene.onBeforeRenderObservable.add(() => {
            var monsterCount = this.monsterList.length;
            for (let i = 0; i < monsterCount; i++) {
                var monster = this.monsterList[i];
                this.animateMonster(monster);
                monster.mesh.position = this.crowd.getAgentPosition(monster.monsterIndex);
                this.crowd.getAgentNextTargetPathToRef(monster.monsterIndex, monster.target.position);
                let vel = this.crowd.getAgentVelocity(monster.monsterIndex);
                if (vel.length() > 0.2) {
                    vel.normalize();
                    var desiredRotation = Math.atan2(-vel.x, -vel.z);
                    monster.mesh.rotationQuaternion = null;
                    monster.mesh.rotation.y = monster.mesh.rotation.y + (desiredRotation - monster.mesh.rotation.y) * 0.05;
                }
            }
        });
    }


    //crea un monstro
     createMonster(position, type, model) {
       
        var nMonster = this.crowd.getAgents().length;
        model.scaling = new BABYLON.Vector3(1,1,-1);
        var monster = model;
        position.y += 1;
        var targetCube = BABYLON.MeshBuilder.CreateBox("monster" + nMonster, { size: 0.01, height: 0.01 }, scene);
        var transform = new BABYLON.TransformNode();
        var index = this.crowd.addAgent(position, monsterParams, transform);
        // prendi il cuore e metti il suo materiale nella lista
        var heart = null;
        let ch = model.getChildren(null, false);
        for (let i = 0; i < ch.length; i++) {
            if (ch[i].name.includes("gemma-fuori.heart")) {
                ch[i].name = "MonsterHeart" + nMonster;
                heart = ch[i];
                ch[i].material = ch[i].material.clone();    // se no tutti i cuori sono collegati allo stesso materiale
                ch[i].material.unfreeze();   // avvisa lo shader che il materiale cambia (va fatto solo una volta)
                this.heartMaterialsList.push(ch[i].material);
                break;
            }
        }

        this.nMonst += 1;
        var skeleton = {};
        skeleton["bc"] = scene.getTransformNodeByName("M" + this.nMonst + " Bacino");
        skeleton["pt"] = scene.getTransformNodeByName("M" + this.nMonst + " Petto");
        skeleton["cl"] = scene.getTransformNodeByName("M" + this.nMonst + " Collo");
        skeleton["ts"] = scene.getTransformNodeByName("M" + this.nMonst + " Testa");
        skeleton["clSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Clavicola Sx");
        skeleton["clDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Clavicola Dx");
        skeleton["brSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Braccio Sx");
        skeleton["brDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Braccio Dx");
        skeleton["avSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Avambraccio Sx");
        skeleton["avDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Avambraccio Dx");
        skeleton["mnSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Mano Sx");
        skeleton["mnDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Mano Dx");
        skeleton["anSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Anca Sx");
        skeleton["anDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Anca Dx");
        skeleton["csSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Coscia Sx");
        skeleton["csDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Coscia Dx");
        skeleton["gmSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Gamba Sx");
        skeleton["gmDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Gamba Dx");
        skeleton["tlSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Tallone Sx");
        skeleton["tlDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Tallone Dx");
        skeleton["pdSx"] = scene.getTransformNodeByName("M" + this.nMonst + " Piede Sx");
        skeleton["pdDx"] = scene.getTransformNodeByName("M" + this.nMonst + " Piede Dx");

        var hands = new BABYLON.AbstractMesh("hands" + this.nMonst, scene);
        hands.parent = monster;
        hands.position = new BABYLON.Vector3(0, eyeHeight/2, 1);

        this.monsterList.push({ monsterIndex: index, trf: transform, mesh: monster, heart: heart, torched: 0, skeleton: skeleton, 
            hands: hands, behav: "Roaming", girlPos: null, goTo: null, patience: 0, frame: 0, target: targetCube });
    }

    getMeshes() {
        var nMonster = this.crowd.getAgents();
        var result = [];
        var i;
        for (i = 0; i < nMonster.length; i++) {
            var childrens = this.monsterList[i].mesh.getChildMeshes().concat(this.monsterList[i].mesh)
            result.push(childrens);
        }
        return result;
    }

    getExcusedMeshes() {
        var nMonster = this.crowd.getAgents();
        var result = [];
        var i;
        for (i = 0; i < nMonster.length; i++) {
            var childrens = this.monsterList[i].mesh.getChildMeshes().concat([this.monsterList[i].mesh]);
            result = result.concat(childrens);
            result = result.concat(this.monsterList[i].hands);
        }
        return result;
    }

    getHearts() {
        var nMonster = this.crowd.getAgents();
        var result = [];
        var i;
        for (i = 0; i < nMonster.length; i++) {
            
            result.push(this.monsterList[i].heart);
        }
        return result;
    }

    getMonsterMesh(index) {
        return this.monsterList[index].mesh;
    }

    //VEDO LA BAMBINA?
    canSeeGirl(idAgent) {
        var monsterChild = this.monsterList[idAgent].mesh.getChildMeshes();
        var origin = this.crowd.getAgentPosition(this.monsterList[idAgent]).clone();
        var origin2 = this.crowd.getAgentPosition(this.monsterList[idAgent]).clone();
        origin.z -= 0.27;
        origin.y = eyeHeight;
       
        var initDir = new BABYLON.Vector3(0, 0, 1);
        var forward = vecToLocal(initDir, this.monsterList[idAgent].mesh);

        var direction = forward.subtract(origin2);
        direction = BABYLON.Vector3.Normalize(direction);

        var girlPosition = this.player.getTorsoPosition();
        
        var toGirl = girlPosition.subtract(origin);
        toGirl.normalize();

        //CALCOLO ANGOLO TRA DIREZIONE MOSTRO E BAMBINA

        var ray = new BABYLON.Ray(origin, toGirl, 10);

        if (cosBetween(direction, toGirl) >= VIEW_ANGLE) {
            var hit = scene.multiPickWithRay(ray);
            hit = sortPickedMeshesByDistance(hit, 1);   

            var object = undefined;
            for(var j=0; j < hit.length; j++){
                
                if(hit[j] !== undefined) {
                    if(!(monsterChild.includes(hit[j].pickedMesh)) && !(hit[j].pickedMesh.name.includes("pavimento"))){
                        object = hit[j];
                        break;
                    }
                }
            }

            if (hit && !(typeof object == "undefined") && this.littleGirl.includes(object.pickedMesh)) {
                return 1;
            }
            else if (hit && object != null) {
                
            }
            

        }

        else {
            return 0;
        }
    }

    torchedMonster(indexMonster) {
        this.monsterList[indexMonster].torched = timeTorched;
        this.monsterList[indexMonster].behav = "Stay";
        this.heartMaterialsList[indexMonster].emissiveColor = new BABYLON.Color3(255/255, 255/255, 255/255);
    }

    waitMonster(indexMonster, fraction) {
        this.monsterList[indexMonster].torched = timeTorched/fraction;
        this.monsterList[indexMonster].behav = "Stay";
    }

    happyMonster(indexMonster) {
        this.monsterList[indexMonster].torched = timeTorched;
        this.monsterList[indexMonster].behav = "Happy";
    }
    getPositionMonster(indexMonster) {
        return this.crowd.getAgentPosition(indexMonster);
    }
    getNumberMonsters() {
        return this.crowd.getAgents().length;
    }

    activateMonsters() {
        this.scene.unregisterBeforeRender(this.pauseBehaviour);
        this.scene.registerBeforeRender(this.behaviour);
    }
    deactivateMonsters() {
        this.scene.unregisterBeforeRender(this.pauseBehaviour);
        this.scene.unregisterBeforeRender(this.behaviour);
    }
    disposeMonsters() {
        let len = this.monsterList.length;
        for (let i = 0; i < len; i++) {
            this.monsterList[i].mesh.dispose();
        }
        this.deactivateMonsters();
        this.crowd.dispose();      
    }
    pauseMonsters() {
        this.scene.unregisterBeforeRender(this.behaviour);
        this.scene.registerBeforeRender(this.pauseBehaviour);
    }
    updateTorch() {
        if (player && !player.gamePaused) {
            for (let i = 0; i < this.crowd.getAgents().length; i++) {
                if (this.monsterList[i].torched > 0) {
                    this.monsterList[i].torched -= 0.5;

                    // Cambia colore del cuore
                    if(this.monsterList[i].behav != "Happy"){
                        let col = 255 * (this.monsterList[i].torched / timeTorched);        // cosi' fa una sfumatura
                        this.heartMaterialsList[i].emissiveColor = new BABYLON.Color3(col/255, col/255, col/255);
                    }

                }
            }            
        }
    }

    animateMonster(monster){
        
        switch(monster.behav){
            case "Stay": this.stayAnimation(monster); monster.hands.position.y = eyeHeight/3; break;
            case "Happy": this.happyAnimation(monster); monster.hands.position.y = eyeHeight/3; break;
            case "Roaming": this.moveAnimation(monster); monster.hands.position.y = eyeHeight/3; break;
            case "Searching": this.searchAnimation(monster); monster.hands.position.y = eyeHeight/3; break;
            case "Grabbing": this.grabAnimation(monster); break;
        }
        
    }

    stayAnimation(monster){}

    moveAnimation(monster){
        var keyFrames = [];

        keyFrames[0] = {
                "i" : 0,
                "li" : 192,
                "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
                "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
                "cl" : new BABYLON.Vector3(-1.01, -1.47, -0.06),
                "ts" : new BABYLON.Vector3(0.68, -0.47, -0.3),
                "clSx" : new BABYLON.Vector3(-1.25, -1.92, 1.99),
                "clDx" : new BABYLON.Vector3(-1.15, -0.95, -2.11),
                "brSx" : new BABYLON.Vector3(-1.05, 0.41, -0.46),
                "brDx" : new BABYLON.Vector3(-1.12, 0.08, 0),
                "avSx" : new BABYLON.Vector3(0.56, 1.88, -0.19),
                "avDx" : new BABYLON.Vector3(0.67, -1.8, 0.72),
                "mnSx" : new BABYLON.Vector3(-0.47, -0.62, -0.58),
                "mnDx" : new BABYLON.Vector3(-0.18, -0.78, 0.41),
                "anSx" : new BABYLON.Vector3(-1.1, -1.69, -0.33),
                "anDx" : new BABYLON.Vector3(-1.54, -1.5, -3),
                "csSx" : new BABYLON.Vector3(1.5, -0.4, -3.14),
                "csDx" : new BABYLON.Vector3(1.47, -0.03, 3.14),
                "gmSx" : new BABYLON.Vector3(0.49, 1.12, 0.09),
                "gmDx" : new BABYLON.Vector3(0.12, -1.37, 0),
                "tlSx" : new BABYLON.Vector3(1.18, 2.76, -0.3),
                "tlDx" : new BABYLON.Vector3(1.41, 2.55, -0.64),
                "pdSx" : new BABYLON.Vector3(0.51, 0.02, -0.11),
                "pdDx" : new BABYLON.Vector3(0.2, 0.08, -0.19)
            };
            keyFrames[1] = {
                "i" : 96,
                "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
                "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
                "cl" : new BABYLON.Vector3(-1.01, -1.47, -0.06),
                "ts" : new BABYLON.Vector3(0.68, -0.47, -0.3),
                "clSx" : new BABYLON.Vector3(-1.25, -1.92, 1.99),
                "clDx" : new BABYLON.Vector3(-1.15, -0.95, -2.11),
                "brSx" : new BABYLON.Vector3(-1.05, 0.41, -0.46),
                "brDx" : new BABYLON.Vector3(-1.12, 0.08, 0),
                "avSx" : new BABYLON.Vector3(0.56, 1.88, -0.19),
                "avDx" : new BABYLON.Vector3(0.67, -1.8, 0.72),
                "mnSx" : new BABYLON.Vector3(-0.47, -0.62, -0.58),
                "mnDx" : new BABYLON.Vector3(-0.18, -0.78, 0.41),
                "anSx" : new BABYLON.Vector3(-1.1, -1.69, -0.33),
                "anDx" : new BABYLON.Vector3(-1.54, -1.5, -3),
                "csSx" : new BABYLON.Vector3(1.3, -0.01, -3.14),
                "csDx" : new BABYLON.Vector3(1.5, 0.33, 3.14),
                "gmSx" : new BABYLON.Vector3(0.11, 1.15, 0.09),
                "gmDx" : new BABYLON.Vector3(0.58, -1.37, 0),
                "tlSx" : new BABYLON.Vector3(1.18, 2.76, -0.3),
                "tlDx" : new BABYLON.Vector3(1.41, 2.55, -0.64),
                "pdSx" : new BABYLON.Vector3(0.51, 0.02, -0.11),
                "pdDx" : new BABYLON.Vector3(0.2, 0.08, -0.19)
            };

        this.useMonsterFrame(monster, keyFrames);
    }

    searchAnimation(monster){
        var keyFrames = [];

        keyFrames[0] = {
                "i" : 0,
                "li" : 96,
                "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
                "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
                "cl" : new BABYLON.Vector3(-1.01, -1.47, -0.06),
                "ts" : new BABYLON.Vector3(0.98, 0.49, -0.3),
                "clSx" : new BABYLON.Vector3(-1.25, -1.92, 1.99),
                "clDx" : new BABYLON.Vector3(-1.15, -0.95, -2.11),
                "brSx" : new BABYLON.Vector3(-1.05, 0.41, -0.46),
                "brDx" : new BABYLON.Vector3(-1.12, 0.08, 0),
                "avSx" : new BABYLON.Vector3(0.56, 1.88, -0.19),
                "avDx" : new BABYLON.Vector3(0.67, -1.8, 0.72),
                "mnSx" : new BABYLON.Vector3(-0.47, -0.62, -0.58),
                "mnDx" : new BABYLON.Vector3(-0.18, -0.78, 0.41),
                "anSx" : new BABYLON.Vector3(-1.1, -1.69, -0.33),
                "anDx" : new BABYLON.Vector3(-1.54, -1.5, -3),
                "csSx" : new BABYLON.Vector3(1.54, -0.3, -3.14),
                "csDx" : new BABYLON.Vector3(1.47, -0.03, 3.14),
                "gmSx" : new BABYLON.Vector3(0.54, 0.91, 0.09),
                "gmDx" : new BABYLON.Vector3(0.12, -1.37, 0),
                "tlSx" : new BABYLON.Vector3(1.18, 2.76, -0.3),
                "tlDx" : new BABYLON.Vector3(1.41, 2.55, -0.64),
                "pdSx" : new BABYLON.Vector3(0.51, 0.02, -0.11),
                "pdDx" : new BABYLON.Vector3(0.2, 0.08, -0.19)
            };
            keyFrames[1] = {
                "i" : 48,
                "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
                "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
                "cl" : new BABYLON.Vector3(-1.01, -1.47, -0.06),
                "ts" : new BABYLON.Vector3(0.68, -0.91, -0.3),
                "clSx" : new BABYLON.Vector3(-1.25, -1.92, 1.99),
                "clDx" : new BABYLON.Vector3(-1.15, -0.95, -2.11),
                "brSx" : new BABYLON.Vector3(-1.05, 0.41, -0.46),
                "brDx" : new BABYLON.Vector3(-1.12, 0.08, 0),
                "avSx" : new BABYLON.Vector3(0.56, 1.88, -0.19),
                "avDx" : new BABYLON.Vector3(0.67, -1.8, 0.72),
                "mnSx" : new BABYLON.Vector3(-0.47, -0.62, -0.58),
                "mnDx" : new BABYLON.Vector3(-0.18, -0.78, 0.41),
                "anSx" : new BABYLON.Vector3(-1.1, -1.69, -0.33),
                "anDx" : new BABYLON.Vector3(-1.54, -1.5, -3),
                "csSx" : new BABYLON.Vector3(1.3, -0.01, -3.14),
                "csDx" : new BABYLON.Vector3(1.66, 0.52, 3.14),
                "gmSx" : new BABYLON.Vector3(0.11, 1.15, 0.09),
                "gmDx" : new BABYLON.Vector3(0.7, -1.29, 0),
                "tlSx" : new BABYLON.Vector3(1.18, 2.76, -0.3),
                "tlDx" : new BABYLON.Vector3(1.41, 2.55, -0.64),
                "pdSx" : new BABYLON.Vector3(0.51, 0.02, -0.11),
                "pdDx" : new BABYLON.Vector3(0.2, 0.08, -0.19)
            };

        this.useMonsterFrame(monster, keyFrames);
    }

    grabAnimation(monster){
        var keyFrames = [];

        keyFrames[0] = {
            "i" : 0,
            "li" : 96,
            "anSx" : new BABYLON.Vector3(-1.1, -1.69, -0.33),
            "anDx" : new BABYLON.Vector3(-1.54, -1.5, -3),
            "csSx" : new BABYLON.Vector3(1.34, -0.16, -3.14),
            "csDx" : new BABYLON.Vector3(1.47, -0.03, 3.14),
            "gmSx" : new BABYLON.Vector3(0.11, 1.15, 0.09),
            "gmDx" : new BABYLON.Vector3(0.12, -1.37, 0),
            "tlSx" : new BABYLON.Vector3(1.18, 2.76, -0.3),
            "tlDx" : new BABYLON.Vector3(1.41, 2.55, -0.64),
            "pdSx" : new BABYLON.Vector3(0.51, 0.02, -0.11),
            "pdDx" : new BABYLON.Vector3(0.2, 0.08, -0.19)
        };
        keyFrames[1] = {
            "i" : 48,
            "anSx" : new BABYLON.Vector3(-1.1, -1.69, -0.33),
            "anDx" : new BABYLON.Vector3(-1.54, -1.5, -3),
            "csSx" : new BABYLON.Vector3(1.3, -0.01, -3.14),
            "csDx" : new BABYLON.Vector3(1.62, 0.24, 3.14),
            "gmSx" : new BABYLON.Vector3(0.11, 1.15, 0.09),
            "gmDx" : new BABYLON.Vector3(0.12, -1.37, 0),
            "tlSx" : new BABYLON.Vector3(1.18, 2.76, -0.3),
            "tlDx" : new BABYLON.Vector3(1.41, 2.55, -0.64),
            "pdSx" : new BABYLON.Vector3(0.51, 0.02, -0.11),
            "pdDx" : new BABYLON.Vector3(0.2, 0.08, -0.19)
        };

        var lowFrames = {
            "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
            "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
            "cl" : new BABYLON.Vector3(-1.01, -1.47, -0.06),
            "ts" : new BABYLON.Vector3(0.68, -0.47, -0.3),
            "clSx" : new BABYLON.Vector3(-2.5, -2.51, 1.99),
            "clDx" : new BABYLON.Vector3(-1.68, -0.63, -2.11),
            "brSx" : new BABYLON.Vector3(-1.05, -0.84, -0.46),
            "brDx" : new BABYLON.Vector3(-0.93, 1.12, 0),
            "avSx" : new BABYLON.Vector3(0.05, 2.34, -0.19),
            "avDx" : new BABYLON.Vector3(0.33, -1.47, 0.72),
            "mnSx" : new BABYLON.Vector3(0.17, -1.1, -0.58),
            "mnDx" : new BABYLON.Vector3(-0.18, -0.54, 0.41)
        }

        var mediumFrames = {
            "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
            "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
            "cl" : new BABYLON.Vector3(-1.01, -1.47, -0.06),
            "ts" : new BABYLON.Vector3(0.68, -0.47, -0.3),
            "clSx" : new BABYLON.Vector3(-0.44, -1.92, 1.99),
            "clDx" : new BABYLON.Vector3(-0.23, -0.95, -2.11),
            "brSx" : new BABYLON.Vector3(-1.05, -0.56, -0.46),
            "brDx" : new BABYLON.Vector3(-0.84, 0.98, 0),
            "avSx" : new BABYLON.Vector3(1.26, 1.5, -0.19),
            "avDx" : new BABYLON.Vector3(1.9, -1.8, 0.72),
            "mnSx" : new BABYLON.Vector3(-0.8, -0.79, -0.58),
            "mnDx" : new BABYLON.Vector3(0.89, -0.78, 0.41)
        }

        var highFrames = {
            "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
            "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
            "cl" : new BABYLON.Vector3(-0.19, -1.47, -0.06),
            "ts" : new BABYLON.Vector3(0.68, -0.47, -0.3),
            "clSx" : new BABYLON.Vector3(-1.45, -2.06, 1.99),
            "clDx" : new BABYLON.Vector3(-0.84, -1.15, -2.11),
            "brSx" : new BABYLON.Vector3(-0.84, -1.33, -0.46),
            "brDx" : new BABYLON.Vector3(-1.12, 1.29, 0),
            "avSx" : new BABYLON.Vector3(1.59, 1.62, -0.19),
            "avDx" : new BABYLON.Vector3(1.54, -1.54, 0.72),
            "mnSx" : new BABYLON.Vector3(0.02, 0.51, -0.58),
            "mnDx" : new BABYLON.Vector3(1.06, 0.28, 0.41)
        }

        var importance;
        var yHeight = this.player.getTorsoPosition().y;
        monster.hands.position.y = yHeight + 0.75;

        if (yHeight < 2){
            importance = yHeight/2;

            for (const k of Object.keys(lowFrames)) { 
                var v = new BABYLON.Vector3(lowFrames[k].x * (1 - importance) + mediumFrames[k].x * (importance),
                lowFrames[k].y * (1 - importance) + mediumFrames[k].y * (importance),
                lowFrames[k].z * (1 - importance) + mediumFrames[k].z * (importance));

                keyFrames[0][k] = v;
                keyFrames[1][k] = v;
            }
        } else if (2 > yHeight < 4){
            importance = yHeight/4;

            for (const k of Object.keys(mediumFrames)) { 
                var v = new BABYLON.Vector3(mediumFrames[k].x * (1 - importance) + highFrames[k].x * (importance),
                mediumFrames[k].y * (1 - importance) + highFrames[k].y * (importance),
                mediumFrames[k].z * (1 - importance) + highFrames[k].z * (importance));

                keyFrames[0][k] = v;
                keyFrames[1][k] = v;
            }
        } else {

            for (const k of Object.keys(highFrames)) { 
                keyFrames[0][k] = highFrames[k];
                keyFrames[1][k] = highFrames[k];
            }
        }

        this.useMonsterFrame(monster, keyFrames);
    }

    happyAnimation(monster){
        var keyFrames = [];

        keyFrames[0] = {
            "i" : 0,
            "li" : 96,
            "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
            "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
            "cl" : new BABYLON.Vector3(-1.01, -1.47, -0.06),
            "ts" : new BABYLON.Vector3(0.68, -0.47, -0.3),
            "clSx" : new BABYLON.Vector3(-0.44, -1.92, 1.99),
            "clDx" : new BABYLON.Vector3(-0.23, -0.95, -2.11),
            "brSx" : new BABYLON.Vector3(-1.05, -0.44, -0.46),
            "brDx" : new BABYLON.Vector3(-0.84, 0.7, 0),
            "avSx" : new BABYLON.Vector3(1.26, 1.5, -0.19),
            "avDx" : new BABYLON.Vector3(1.9, -1.8, 0.72),
            "mnSx" : new BABYLON.Vector3(1.54, -0.79, -0.58),
            "mnDx" : new BABYLON.Vector3(-1.12, -0.78, 0.41),
            "anSx" : new BABYLON.Vector3(-1.1, -1.69, -0.33),
            "anDx" : new BABYLON.Vector3(-1.54, -1.5, -3),
            "csSx" : new BABYLON.Vector3(1.34, -0.16, -3.14),
            "csDx" : new BABYLON.Vector3(1.47, -0.03, 3.14),
            "gmSx" : new BABYLON.Vector3(0.11, 1.15, 0.09),
            "gmDx" : new BABYLON.Vector3(0.12, -1.37, 0),
            "tlSx" : new BABYLON.Vector3(1.18, 2.76, -0.3),
            "tlDx" : new BABYLON.Vector3(1.41, 2.55, -0.64),
            "pdSx" : new BABYLON.Vector3(0.51, 0.02, -0.11),
            "pdDx" : new BABYLON.Vector3(0.2, 0.08, -0.19)
        }

        keyFrames[1] = {
            "i" : 48,
            "bc" : new BABYLON.Vector3(0.05, 0.01, 0.14),
            "pt" : new BABYLON.Vector3(-0.06, -1.6, -0.3),
            "cl" : new BABYLON.Vector3(-1.01, -1.47, -0.06),
            "ts" : new BABYLON.Vector3(0.68, -0.47, -0.3),
            "clSx" : new BABYLON.Vector3(-0.44, -1.92, 1.99),
            "clDx" : new BABYLON.Vector3(-0.23, -0.95, -2.11),
            "brSx" : new BABYLON.Vector3(-1.05, -0.56, -0.46),
            "brDx" : new BABYLON.Vector3(-0.84, 0.98, 0),
            "avSx" : new BABYLON.Vector3(1.26, 1.5, -0.19),
            "avDx" : new BABYLON.Vector3(1.9, -1.8, 0.72),
            "mnSx" : new BABYLON.Vector3(-0.8, -0.79, -0.58),
            "mnDx" : new BABYLON.Vector3(0.89, -0.78, 0.41),
            "anSx" : new BABYLON.Vector3(-1.1, -1.69, -0.33),
            "anDx" : new BABYLON.Vector3(-1.54, -1.5, -3),
            "csSx" : new BABYLON.Vector3(1.3, -0.01, -3.14),
            "csDx" : new BABYLON.Vector3(1.62, 0.24, 3.14),
            "gmSx" : new BABYLON.Vector3(0.11, 1.15, 0.09),
            "gmDx" : new BABYLON.Vector3(0.12, -1.37, 0),
            "tlSx" : new BABYLON.Vector3(1.18, 2.76, -0.3),
            "tlDx" : new BABYLON.Vector3(1.41, 2.55, -0.64),
            "pdSx" : new BABYLON.Vector3(0.51, 0.02, -0.11),
            "pdDx" : new BABYLON.Vector3(0.2, 0.08, -0.19)
        }

        this.useMonsterFrame(monster, keyFrames);
    }

    useMonsterFrame(monster, keyFrames){
        
        var kf;
        var last;
        var firstKf;
        var secondKf;
        var importance;
        var heightDiff = 0;

        //reset
        if(monster.frame >= keyFrames[0]["li"]){
            monster.frame = 0;
        }
        
        for (var i = 0; i < keyFrames.length; i++){
            if(keyFrames[i+1] == null){
                kf = i;
                last = true;
                break;
            }else{
                if(monster.frame >= keyFrames[i]["i"] && monster.frame < keyFrames[i+1]["i"]){
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
            var inBetweenIndex = monster.frame - firstKf["i"];
        }else{
            firstKf = keyFrames[kf];
            secondKf = keyFrames[0];
            var indexDifference = (firstKf["i"] - secondKf["li"]);
            var inBetweenIndex = monster.frame - firstKf["i"];
        }
        importance = (inBetweenIndex)/indexDifference;
        importance = Math.abs(importance);
            
        //interpolate frame
        for (let k in firstKf){
            if(k == "i" || k == "li"){
                continue;
            }else{
                monster.skeleton[k].rotation = new BABYLON.Vector3(firstKf[k].x * (1 - importance) + secondKf[k].x * (importance),
                firstKf[k].y * (1 - importance) + secondKf[k].y * (importance),
                firstKf[k].z * (1 - importance) + secondKf[k].z * (importance));
            }
        }
        
        monster.frame +=1;
    }

}

