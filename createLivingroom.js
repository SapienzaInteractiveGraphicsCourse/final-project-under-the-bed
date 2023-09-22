
async function createLivingroom() {

    var alphaValue = 1;

    var loadModels = true;
    if (loadModels) alphaValue = 0;     // da mettere a 0. Con valori > 0 per vedere dove sono i mobili

    var objects = [];
    var navMeshObjects = [];


    const widthFloor = 17;
    const depthFloor = 17;
    const a = new BABYLON.Vector3(-widthFloor / 2, 0, -depthFloor / 2);
    const b = new BABYLON.Vector3(widthFloor / 2, 0, -depthFloor / 2);
    const c = new BABYLON.Vector3(widthFloor / 2, 0, depthFloor / 2);
    const d = new BABYLON.Vector3(-widthFloor / 2, 0, depthFloor / 2);

    var w = createWall(a, b, 0);
    objects.push(w[0]);
    objects.push(w[1]);
    w = createWall(b, c, 1);
    objects.push(w[0]);
    objects.push(w[1]);
    w = createWall(c, d, 2);
    objects.push(w[0]);
    objects.push(w[1]);
    w = createWall(d, a, 3);
    objects.push(w[0]);
    objects.push(w[1]);


    const doorHeight = 3;
    const doorWidth = 2;

    // Materiale generico, assegnato alle mesh invisibili usate per i mobili
    var genericMaterial = new BABYLON.StandardMaterial("genericMaterial", scene);
    genericMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
    genericMaterial.alpha = alphaValue;

    var result;

    
    // VERSIONE LIGHT
    var lightVersion = document.getElementById("lighter").checked;


    //CHIAVE
    if (!player.ownKey()) {
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "key.glb", scene);
        var key = result.meshes[0];
        key.scaling = new BABYLON.Vector3(3, 3, 3);
        key.position = new BABYLON.Vector3(3.78, 1.88, 1.13);
        key.rotationQuaternion = null;
        key.rotation.y = Math.PI / 2;
        key.rotation.x = Math.PI;
        objects.push(key);
    }



    /******** PARETI e PORTE interne: ********/

    // parete tra l'ingresso e cucina + salotto:
    var wallInternal1 = BABYLON.MeshBuilder.CreateBox("wInternal1", { width: 6, depth: wallWidth, height: wallHeight }, scene);
    wallInternal1.position = new BABYLON.Vector3(widthFloor/2 - 6/2, 2, 3);
    wallInternal1.material = new BABYLON.StandardMaterial("wallInternal1Material", scene);
    wallInternal1.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    objects.push(wallInternal1);
    navMeshObjects.push(wallInternal1);
    var battiscopa1_1 = BABYLON.MeshBuilder.CreateBox("battiscopa1_1", { width: 6, depth: 0.1, height: 0.2}, scene);
    battiscopa1_1.position = wallInternal1.position.clone();
    battiscopa1_1.rotation.y = wallInternal1.rotation.y;
    battiscopa1_1.position.y = 0.1;
    battiscopa1_1.position.z += 0.1;
    objects.push(battiscopa1_1);
    var battiscopa1_2 = battiscopa1_1.clone();
    battiscopa1_2.position.z -= wallWidth + 0.05;
    objects.push(battiscopa1_2);
    var wallInternal2 = BABYLON.MeshBuilder.CreateBox("wInternal2", { width: 9, depth: wallWidth, height: wallHeight }, scene);
    wallInternal2.position = new BABYLON.Vector3(-widthFloor/2 + 9/2, 2, 3);
    wallInternal2.material = wallInternal1.material;
    wallInternal2.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    objects.push(wallInternal2);
    navMeshObjects.push(wallInternal2);
    var battiscopa2_1 = BABYLON.MeshBuilder.CreateBox("battiscopa2_1", { width: 9, depth: 0.1, height: 0.2}, scene);
    battiscopa2_1.position = wallInternal2.position.clone();
    battiscopa2_1.rotation.y = wallInternal2.rotation.y;
    battiscopa2_1.position.y = 0.1;
    battiscopa2_1.position.z += 0.1;
    objects.push(battiscopa2_1);
    var battiscopa2_2 = battiscopa2_1.clone();
    battiscopa2_2.position.z -= wallWidth + 0.05;
    objects.push(battiscopa2_2);
    var wallInternal12 = BABYLON.MeshBuilder.CreateBox("wInternal12", { width: doorWidth, depth: wallWidth, height: wallHeight-doorHeight }, scene);  // pezzetto di muro sopra la porta
    wallInternal12.position = new BABYLON.Vector3(1.5, wallHeight/2 + doorHeight/2, 3);
    wallInternal12.material = wallInternal1.material;
    wallInternal12.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    objects.push(wallInternal12);

    battiscopa1_1.setParent(wallInternal1);
    battiscopa1_2.setParent(wallInternal1);
    battiscopa2_1.setParent(wallInternal1);
    battiscopa2_2.setParent(wallInternal1);
    wallInternal2.setParent(wallInternal1);
    wallInternal12.setParent(wallInternal1);

    // parete invisibile sopra
    var wInternalInv1 = BABYLON.MeshBuilder.CreateBox("wInternalInv1", { width: widthFloor, depth: wallWidth, height: wallHeight }, scene);
    wInternalInv1.position = new BABYLON.Vector3(0, 6, 3);
    wInternalInv1.visibility = 0;
    objects.push(wInternalInv1);


    // parete tra salotto e cucina
    var wallInternal3 = BABYLON.MeshBuilder.CreateBox("wInternal3", { width: 4.75, depth: wallWidth, height: wallHeight }, scene);
    wallInternal3.position = new BABYLON.Vector3(3.6, 2, depthFloor/2 - 5.5 - 4.75/2);
    wallInternal3.material = wallInternal1.material;
    wallInternal3.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    wallInternal3.rotation.y = Math.PI/2;
    objects.push(wallInternal3);
    navMeshObjects.push(wallInternal3);
    var battiscopa3_1 = BABYLON.MeshBuilder.CreateBox("battiscopa3_1", { width: 4.75, depth: 0.1, height: 0.2}, scene);
    battiscopa3_1.position = wallInternal3.position.clone();
    battiscopa3_1.rotation.y = wallInternal3.rotation.y;
    battiscopa3_1.position.y = 0.1;
    battiscopa3_1.position.x += 0.1;
    objects.push(battiscopa3_1);
    var battiscopa3_2 = battiscopa3_1.clone();
    battiscopa3_2.position.x -= wallWidth + 0.05;
    objects.push(battiscopa3_2);
    var wallInternal4 = BABYLON.MeshBuilder.CreateBox("wInternal4", { width: 4.75, depth: wallWidth, height: wallHeight }, scene);
    wallInternal4.position = new BABYLON.Vector3(3.6, 2, -depthFloor/2 + 4.75/2);
    wallInternal4.material = wallInternal1.material;
    wallInternal4.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    wallInternal4.rotation.y = Math.PI/2;
    objects.push(wallInternal4);
    navMeshObjects.push(wallInternal4);
    var battiscopa4_1 = BABYLON.MeshBuilder.CreateBox("battiscopa4_1", { width: 4.75, depth: 0.1, height: 0.2}, scene);
    battiscopa4_1.position = wallInternal4.position.clone();
    battiscopa4_1.rotation.y = wallInternal4.rotation.y;
    battiscopa4_1.position.y = 0.1;
    battiscopa4_1.position.x += 0.1;
    objects.push(battiscopa4_1);
    var battiscopa4_2 = battiscopa4_1.clone();
    battiscopa4_2.position.x -= wallWidth + 0.05;
    objects.push(battiscopa4_2);
    var wallInternal34 = BABYLON.MeshBuilder.CreateBox("wInternal12", { width: doorWidth, depth: wallWidth, height: wallHeight-doorHeight }, scene);  // pezzetto di muro sopra la porta
    wallInternal34.position = new BABYLON.Vector3(3.6, wallHeight/2 + doorHeight/2, -5.5/2);
    wallInternal34.material = wallInternal1.material;
    wallInternal34.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    wallInternal34.rotation.y = Math.PI/2;
    objects.push(wallInternal34);

    battiscopa3_1.setParent(wallInternal3);
    battiscopa3_2.setParent(wallInternal3);
    battiscopa4_1.setParent(wallInternal3);
    battiscopa4_2.setParent(wallInternal3);
    wallInternal4.setParent(wallInternal3);
    wallInternal34.setParent(wallInternal3);

    // parete invisibile sopra
    var wInternalInv2 = BABYLON.MeshBuilder.CreateBox("wInternalInv2", { width: 11.5, depth: wallWidth, height: wallHeight }, scene);
    wInternalInv2.position = new BABYLON.Vector3(3.6, 6, -2.75);
    wInternalInv2.rotation.y = Math.PI/2;
    wInternalInv2.visibility = 0;
    objects.push(wInternalInv2);

    
    // parete tra ingresso e bagno
    var wallInternal5 = BABYLON.MeshBuilder.CreateBox("wInternal5", { width: 1.75, depth: wallWidth, height: wallHeight }, scene);
    wallInternal5.position = new BABYLON.Vector3(-0.8, 2, 3 + 1.75/2);
    wallInternal5.material = wallInternal1.material;
    wallInternal5.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    wallInternal5.rotation.y = Math.PI/2;
    objects.push(wallInternal5);
    navMeshObjects.push(wallInternal5);
    var battiscopa5_1 = BABYLON.MeshBuilder.CreateBox("battiscopa5_1", { width: 1.75, depth: 0.1, height: 0.2}, scene);
    battiscopa5_1.position = wallInternal5.position.clone();
    battiscopa5_1.rotation.y = wallInternal5.rotation.y;
    battiscopa5_1.position.y = 0.1;
    battiscopa5_1.position.x += 0.1;
    objects.push(battiscopa5_1);
    var battiscopa5_2 = battiscopa5_1.clone();
    battiscopa5_2.position.x -= wallWidth + 0.05;
    objects.push(battiscopa5_2);
    var wallInternal6 = BABYLON.MeshBuilder.CreateBox("wInternal6", { width: 1.75, depth: wallWidth, height: wallHeight }, scene);
    wallInternal6.position = new BABYLON.Vector3(-0.8, 2, depthFloor/2 - 1.75/2);
    wallInternal6.material = wallInternal1.material;
    wallInternal6.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    wallInternal6.rotation.y = Math.PI/2;
    objects.push(wallInternal6);
    navMeshObjects.push(wallInternal6);
    var battiscopa6_1 = BABYLON.MeshBuilder.CreateBox("battiscopa6_1", { width: 1.75, depth: 0.1, height: 0.2}, scene);
    battiscopa6_1.position = wallInternal6.position.clone();
    battiscopa6_1.rotation.y = wallInternal6.rotation.y;
    battiscopa6_1.position.y = 0.1;
    battiscopa6_1.position.x += 0.1;
    objects.push(battiscopa6_1);
    var battiscopa6_2 = battiscopa6_1.clone();
    battiscopa6_2.position.x -= wallWidth + 0.05;
    objects.push(battiscopa6_2);
    var wallInternal56 = BABYLON.MeshBuilder.CreateBox("wInternal12", { width: doorWidth, depth: wallWidth, height: wallHeight-doorHeight }, scene);  // pezzetto di muro sopra la porta
    wallInternal56.position = new BABYLON.Vector3(-0.8, wallHeight/2 + doorHeight/2, 5.75);
    wallInternal56.material = wallInternal1.material;
    wallInternal56.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    wallInternal56.rotation.y = Math.PI/2;
    objects.push(wallInternal56);

    battiscopa5_1.setParent(wallInternal5);
    battiscopa5_2.setParent(wallInternal5);
    battiscopa6_1.setParent(wallInternal5);
    battiscopa6_2.setParent(wallInternal5);
    wallInternal6.setParent(wallInternal5);
    wallInternal56.setParent(wallInternal5);

    // parete invisibile sopra
    var wInternalInv3 = BABYLON.MeshBuilder.CreateBox("wInternalInv3", { width: 5.5, depth: wallWidth, height: wallHeight }, scene);
    wInternalInv3.position = new BABYLON.Vector3(-0.8, 6, 5.75);
    wInternalInv3.rotation.y = Math.PI/2;
    wInternalInv3.visibility = 0;
    objects.push(wInternalInv3);



    // Cornici porte
    if (loadModels) {
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "porta-cornice.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "porta-cornice-texture.glb", scene);
        var cornicePorta1 = result.meshes[0];                           // tra ingresso e salotto
        cornicePorta1.scaling = new BABYLON.Vector3(4.3, 3, 4.05);
        cornicePorta1.position = new BABYLON.Vector3(0.45, 0, 3.18);
        cornicePorta1.rotationQuaternion = null;
        objects.push(cornicePorta1);

        var cornicePorta2 = cornicePorta1.clone();                      // tra salotto e cucina
        cornicePorta2.position = new BABYLON.Vector3(3.8, 0, -1.7);
        cornicePorta2.rotation.y = Math.PI / 2;
        objects.push(cornicePorta2);

        var cornicePorta3 = cornicePorta1.clone();                      // tra ingresso e bagno
        cornicePorta3.position = new BABYLON.Vector3(-0.6, 0, 6.8);
        cornicePorta3.rotation.y = Math.PI / 2;
        objects.push(cornicePorta3);

        cornicePorta1.setParent(wallInternal1);
        cornicePorta2.setParent(wallInternal3);
        cornicePorta3.setParent(wallInternal5);
    }


    // Porte a scorrimento (da mettere solo se non sono gia' state aperte):
    if (!player.openedDoor1) {
        var portaIngressoSalotto = BABYLON.MeshBuilder.CreateBox(DOOR_SLIDING_1, { width: doorWidth, depth: wallWidth, height: doorHeight }, scene);
        portaIngressoSalotto.position = new BABYLON.Vector3(1.5, doorHeight/2, 3);
        portaIngressoSalotto.material = new BABYLON.StandardMaterial("portaSlidingMaterial", scene);
        portaIngressoSalotto.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        portaIngressoSalotto.material.alpha = 0;
        objects.push(portaIngressoSalotto);

        if (loadModels) {
            if (lightVersion)
                result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "porta-sliding-vetro.glb", scene);
            else
                result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "porta-sliding-vetro-texture.glb", scene);
            var portaSliding1 = result.meshes[0];                           // tra ingresso e salotto
            portaSliding1.name = "portaSliding1";
            portaSliding1.scaling = new BABYLON.Vector3(-4.4, 3, 4.05);
            portaSliding1.position = new BABYLON.Vector3(1.45, 0, 3);
            portaSliding1.rotationQuaternion = null;
            objects.push(portaSliding1);
            portaSliding1.setParent(wallInternal1);
        }
    }
    if (!player.openedDoor2) {
        var portaSalottoCucina = BABYLON.MeshBuilder.CreateBox(DOOR_SLIDING_2, { width: doorWidth, depth: wallWidth, height: doorHeight }, scene);
        portaSalottoCucina.position = new BABYLON.Vector3(3.6, doorHeight/2, -5.5/2);
        portaSalottoCucina.material = new BABYLON.StandardMaterial("portaSlidingMaterial", scene);
        portaSalottoCucina.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        portaSalottoCucina.material.alpha = 0;
        portaSalottoCucina.rotation.y = Math.PI/2;
        objects.push(portaSalottoCucina);

        if (loadModels) {
            if (lightVersion)
                result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "porta-sliding-vetro.glb", scene);
            else
                result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "porta-sliding-vetro-texture.glb", scene);
            var portaSliding2 = result.meshes[0];
            portaSliding2.name = "portaSliding2";
            portaSliding2.scaling = new BABYLON.Vector3(-4.4, 3, 4.05);
            portaSliding2.position = new BABYLON.Vector3(3.6, 0, -2.7);
            portaSliding2.rotationQuaternion = null;
            portaSliding2.rotation.y = Math.PI / 2;
            objects.push(portaSliding2);
            portaSliding2.setParent(wallInternal3);
        }
    }
    if (!player.openedDoor3) {
        var portaIngressoBagno = BABYLON.MeshBuilder.CreateBox(DOOR_SLIDING_3, { width: doorWidth, depth: wallWidth, height: doorHeight }, scene);
        portaIngressoBagno.position = new BABYLON.Vector3(-0.8, doorHeight/2, 5.75);
        portaIngressoBagno.material = new BABYLON.StandardMaterial("portaSlidingMaterial", scene);
        portaIngressoBagno.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
        portaIngressoBagno.material.alpha = 0;
        portaIngressoBagno.rotation.y = Math.PI/2;
        objects.push(portaIngressoBagno);

        if (loadModels) {
            if (lightVersion)
                result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "porta-sliding.glb", scene);   
            else
                result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "porta-sliding-texture.glb", scene);
            var portaSliding3 = result.meshes[0];                         // tra ingresso e bagno
            portaSliding3.name = "portaSliding3";
            portaSliding3.scaling = new BABYLON.Vector3(-4.4, 3, 4.05);
            portaSliding3.position = new BABYLON.Vector3(-0.8, 0, 5.8);
            portaSliding3.rotationQuaternion = null;
            portaSliding3.rotation.y = Math.PI / 2;
            objects.push(portaSliding3);
            portaSliding3.setParent(wallInternal5);
        }
    }



    /***** CARTELLI con scritte *****/

    if (document.getElementById("hints").checked) {
        // Cartello 5 (press Q to take the key)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/cartelli/", "cartello5.glb", scene);
        var cart5 = result.meshes[0];
        cart5.scaling = new BABYLON.Vector3(-1, 0.9, 0.9);
        cart5.position = new BABYLON.Vector3(3.78, 2, -0.4);
        cart5.rotationQuaternion = null;
        cart5.rotation.y = -Math.PI;
        setPickableChildren(cart5, false);
        objects.push(cart5);
        cart5.setParent(wallInternal3);

        // Cartello 9 (look for the key in the kitchen)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/cartelli/", "cartello9.glb", scene);
        var cart9 = result.meshes[0];
        cart9.scaling = new BABYLON.Vector3(-1.4, 1.2, 1.2);
        cart9.position = new BABYLON.Vector3(-0.3, 1, 3.45);
        cart9.rotationQuaternion = null;
        cart9.rotation.y = Math.PI/2;
        cart9.rotation.y += Math.PI/4;
        setPickableChildren(cart9, false);
        objects.push(cart9);
        cart9.setParent(wallInternal2);


        // Cartello 10 (hit the monsters through the glass)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/cartelli/", "cartello10.glb", scene);
        var cart10 = result.meshes[0];
        cart10.scaling = new BABYLON.Vector3(-1.4, 1.2, 1.2);
        cart10.position = new BABYLON.Vector3(-0.3, 2.1, 3.45);
        cart10.rotationQuaternion = null;
        cart10.rotation.y = Math.PI/2;
        cart10.rotation.y += Math.PI/4;
        setPickableChildren(cart10, false);
        objects.push(cart10);
        cart10.setParent(wallInternal2);
    }



    /******** INGRESSO ********/


    //Scala a chiocciola (verso il corridoio)
    var scala = BABYLON.MeshBuilder.CreateBox("scala", { width: 2, depth: 2.7, height: 4 }, scene);
    scala.position = new BABYLON.Vector3(6.9, 2, 6.1);
    scala.material = genericMaterial;
    scala.rotation.y = -Math.PI / 6;
    objects.push(scala);
    navMeshObjects.push(scala);

    if (loadModels) {
            // Scala (modello)
            if (lightVersion)
                result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "staircase.glb", scene);   
            else
                result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "staircase-texture.glb", scene);
            var scalaModel = result.meshes[0];
            scalaModel.scaling = new BABYLON.Vector3(-4, 4.5, 4);
            scalaModel.position = new BABYLON.Vector3(5.5, 0, 4.3);
            scalaModel.rotationQuaternion = null;
            scalaModel.rotation.y = Math.PI / 3;
            objects.push(scalaModel);
    }

    //Porta 1 (verso il corridoio)
    var porta1 = BABYLON.MeshBuilder.CreateBox(DOOR_LIVINGROOM_TO_HALLWAY, { width: 1.9, depth: 0.3, height: 3 }, scene);
    porta1.position = new BABYLON.Vector3(6.1, 1.5, 5.5);
    porta1.material = genericMaterial;
    porta1.rotation.y = Math.PI / 3;
    objects.push(porta1);
    navMeshObjects.push(porta1);


    if (loadModels) {
        
        if (!lightVersion) {
            //Quadri (modello)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/", "quadri-ingresso.glb", scene);
            var quadriModel = result.meshes[0];
            quadriModel.scaling = new BABYLON.Vector3(1, 0.9, 1);
            quadriModel.position = new BABYLON.Vector3(4.5, 1, 3.3);
            quadriModel.rotationQuaternion = null;
            setPickableChildren(quadriModel, false);
            objects.push(quadriModel);
            quadriModel.setParent(wallInternal1);
        }

        //Piante (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "pianta.glb", scene);
        var piantaModel1 = result.meshes[0];
        piantaModel1.scaling = new BABYLON.Vector3(3.5, 3.5, 3.5);
        piantaModel1.position = new BABYLON.Vector3(7.5, 0, 3.8);
        piantaModel1.rotationQuaternion = null;
        objects.push(piantaModel1);
        var piantaModel2 = piantaModel1.clone();
        piantaModel2.position = new BABYLON.Vector3(5.4, 0, 7.6);
        piantaModel2.rotationQuaternion = null;
        objects.push(piantaModel2);
    }



    /******** BAGNO ********/

    //Gabinetto
    var gabinetto = BABYLON.MeshBuilder.CreateBox("gabinetto", { width: 1.6, depth: 1.2, height: 1 }, scene);
    gabinetto.position = new BABYLON.Vector3(-7.6, 0.5, 7.15);
    gabinetto.material = genericMaterial;
    objects.push(gabinetto);
    navMeshObjects.push(gabinetto);
    
    if (loadModels) {
        //Gabinetto (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/bagno/", "gabinetto.glb", scene);
        var gabinettoModel = result.meshes[0];
        gabinettoModel.scaling = new BABYLON.Vector3(3.5, 4, 3.5);
        gabinettoModel.position = new BABYLON.Vector3(-8.5, 0, 7.7);
        gabinettoModel.rotationQuaternion = null;
        gabinettoModel.rotation.y = Math.PI / 2;
        objects.push(gabinettoModel);
    }

    //Doccia
    var doccia = BABYLON.MeshBuilder.CreateBox("doccia", { width: 2.4, depth: 2.4, height: 6 }, scene);
    doccia.position = new BABYLON.Vector3(-7.2, 3, 4.2);
    doccia.material = genericMaterial;
    objects.push(doccia);
    navMeshObjects.push(doccia);

    if (loadModels) {
        //Doccia (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/bagno/", "doccia.glb", scene);
        var docciaModel = result.meshes[0];
        docciaModel.scaling = new BABYLON.Vector3(4, 3.5, 4);
        docciaModel.position = new BABYLON.Vector3(-6.1, 0, 3.1);
        docciaModel.rotationQuaternion = null;
        docciaModel.rotation.y = Math.PI / 2;
        objects.push(docciaModel);

        docciaModel.setParent(wallInternal2);
    }

    //Lavandino
    var lavandino = BABYLON.MeshBuilder.CreateBox("lavandino", { width: 2, depth: 1.4, height: 2.3 }, scene);
    lavandino.position = new BABYLON.Vector3(-3.55, 1.15, 3.75);
    lavandino.material = genericMaterial;
    objects.push(lavandino);
    navMeshObjects.push(lavandino);

    if (loadModels) {
        //Lavandino (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/bagno/", "lavandino.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/bagno/", "lavandino-texture.glb", scene);
        var lavandinoModel = result.meshes[0];
        lavandinoModel.scaling = new BABYLON.Vector3(4.5, 3.8, 4.3);
        lavandinoModel.position = new BABYLON.Vector3(-4.5, 0, 5);
        lavandinoModel.rotationQuaternion = null;
        objects.push(lavandinoModel);

        lavandinoModel.setParent(wallInternal2);

        //Specchio lavandino (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/bagno/", "specchio-lavandino.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/bagno/", "specchio-lavandino-texture.glb", scene);
        var specchioLavandinoModel = result.meshes[0];
        specchioLavandinoModel.scaling = new BABYLON.Vector3(4.5, 3.7, 4.2);
        specchioLavandinoModel.position = new BABYLON.Vector3(-4.2, 2.1, 3.3);
        specchioLavandinoModel.rotationQuaternion = null;
        objects.push(specchioLavandinoModel);

        specchioLavandinoModel.setParent(wallInternal2);
    }

    //Finestra bagno (modello)
    if (loadModels) {
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "finestra.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "finestra-texture.glb", scene);
        var finestraBagnoModel = result.meshes[0];
        finestraBagnoModel.scaling = new BABYLON.Vector3(4, 3.2, 3);
        finestraBagnoModel.position = new BABYLON.Vector3(-7.5, 0, 8.45);
        finestraBagnoModel.rotationQuaternion = null;
        objects.push(finestraBagnoModel);
    }
    

    
    //Pareti interne del bagno, per metterci la texture delle mattonelle

    var mattonelleMaterial = new BABYLON.StandardMaterial("pavimentoMaterial");
    mattonelleMaterial.diffuseTexture = new BABYLON.Texture("textures/tiles.jpg", scene);
    mattonelleMaterial.bumpTexture = new BABYLON.Texture("textures/tilesBump.png", scene);

    // Parete dietro al lavandino:
    const corners1 = [
        new BABYLON.Vector2(-0.85, 0),   
        new BABYLON.Vector2(-0.85, wallHeight),
        new BABYLON.Vector2(-8.45, wallHeight), 
        new BABYLON.Vector2(-8.45, 0) 
    ];
    var poly = new BABYLON.PolygonMeshBuilder("parete1", corners1, scene);
    var pareteBagno1 = poly.build();
    setPickableChildren(pareteBagno1, false);
    pareteBagno1.rotation.x = Math.PI/2;
    pareteBagno1.position.y = 4;
    pareteBagno1.position.z = 3.07 + 0.005;
    pareteBagno1.material = mattonelleMaterial;
    pareteBagno1.material.diffuseTexture.uScale = 6;
    pareteBagno1.material.diffuseTexture.vScale = 3.3;
    pareteBagno1.material.bumpTexture.uScale = 6;
    pareteBagno1.material.bumpTexture.vScale = 3.3;
    objects.push(pareteBagno1);
    pareteBagno1.setParent(wallInternal2);

    // Parete dietro doccia e gabinetto:
    const corners2 = [
        new BABYLON.Vector2(-3.07, 0),
        new BABYLON.Vector2(-3.07, wallHeight),
        new BABYLON.Vector2(-8.45, wallHeight), 
        new BABYLON.Vector2(-8.45, 0)
    ];
    poly = new BABYLON.PolygonMeshBuilder("parete2", corners2, scene);
    var pareteBagno2 = poly.build();
    setPickableChildren(pareteBagno2, false);
    pareteBagno2.rotation.x = Math.PI/2;
    pareteBagno2.rotation.z = -Math.PI/2;
    pareteBagno2.position.y = 4;
    pareteBagno2.position.x = -widthFloor/2 + wallWidth/2 + 0.005;
    pareteBagno2.material = mattonelleMaterial.clone();
    pareteBagno2.material.diffuseTexture.uScale = 4;
    pareteBagno2.material.diffuseTexture.vScale = 3.3;
    pareteBagno2.material.bumpTexture.uScale = 4;
    pareteBagno2.material.bumpTexture.vScale = 3.3;
    objects.push(pareteBagno2);

    
    // Parete con finestra:
    const corners3 = [
        new BABYLON.Vector2(-8.45, 0),
        new BABYLON.Vector2(-8.45, wallHeight),
        new BABYLON.Vector2(-0.9, wallHeight),
        new BABYLON.Vector2(-0.9, 0) 
    ];
    const hole = [        
        new BABYLON.Vector2(-6.5, 1.1),
        new BABYLON.Vector2(-6.5, 3.5),
        new BABYLON.Vector2(-4.9, 3.5), 
        new BABYLON.Vector2(-4.9, 1.1)
    ];
    poly = new BABYLON.PolygonMeshBuilder("parete3", corners3, scene);
    poly.addHole(hole);
    var pareteBagno3 = poly.build();
    setPickableChildren(pareteBagno3, false);
    pareteBagno3.rotation.x = -Math.PI/2;
    pareteBagno3.position.z = depthFloor/2 - wallWidth/2 - 0.005;
    pareteBagno3.material = mattonelleMaterial.clone();
    pareteBagno3.material.diffuseTexture.uScale = 6;
    pareteBagno3.material.diffuseTexture.vScale = 3.3;
    pareteBagno3.material.bumpTexture.uScale = 6;
    pareteBagno3.material.bumpTexture.vScale = 3.3;
    objects.push(pareteBagno3);


    // Parete con porta:
    const corners4 = [
        new BABYLON.Vector2(0, 8.45),
        new BABYLON.Vector2(wallHeight, 8.45),
        new BABYLON.Vector2(wallHeight, 3.07), 
        new BABYLON.Vector2(0, 3.07),
        new BABYLON.Vector2(0, 4.75),
        new BABYLON.Vector2(doorHeight, 4.75),
        new BABYLON.Vector2(doorHeight, 6.75),
        new BABYLON.Vector2(0, 6.75)
    ];
    poly = new BABYLON.PolygonMeshBuilder("parete1", corners4, scene);
    var pareteBagno4 = poly.build();
    setPickableChildren(pareteBagno4, false);
    pareteBagno4.rotation.z = Math.PI/2;
    pareteBagno4.position.x = -0.875;
    pareteBagno4.material = mattonelleMaterial.clone();
    pareteBagno4.material.diffuseTexture.uScale = 3.3;
    pareteBagno4.material.diffuseTexture.vScale = 4;
    pareteBagno4.material.bumpTexture.uScale = 3.3;
    pareteBagno4.material.bumpTexture.vScale = 4;
    objects.push(pareteBagno4);
    pareteBagno4.setParent(wallInternal5);
    



    /******** CUCINA ********/


    // Cucina
    var cucina1 = BABYLON.MeshBuilder.CreateBox("cucina1", { width: 7.8, depth: 2.1, height: 2 }, scene);
    cucina1.position = new BABYLON.Vector3(7.4, 1, -4.5);
    cucina1.rotation.y = Math.PI / 2;
    cucina1.material = genericMaterial;
    objects.push(cucina1);
    navMeshObjects.push(cucina1);
    var cucina2 = BABYLON.MeshBuilder.CreateBox("cucina2", { width: 3.9, depth: 1.7, height: 2 }, scene);
    cucina2.position = new BABYLON.Vector3(7.6, 3, -6.5);
    cucina2.rotation.y = Math.PI / 2;
    cucina2.material = genericMaterial;
    objects.push(cucina2);

    if (loadModels) {
        //Cucina (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "cucina.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "cucina-texture.glb", scene);
        var cucinaModel = result.meshes[0];
        cucinaModel.scaling = new BABYLON.Vector3(-4.5, 4.5, 4.5);
        cucinaModel.position = new BABYLON.Vector3(6.4, 0, -2.65);
        cucinaModel.rotationQuaternion = null;
        cucinaModel.rotation.y = -Math.PI / 2;
        objects.push(cucinaModel);
    }

    if (loadModels) {
        //Mobile pensile (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "pensile.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "pensile-texture.glb", scene);
        var pensileModel = result.meshes[0];
        pensileModel.scaling = new BABYLON.Vector3(4.3, 2.5, 5.5);
        pensileModel.position = new BABYLON.Vector3(7.2, 3, -8.35);
        pensileModel.rotationQuaternion = null;
        pensileModel.rotation.y = -Math.PI / 2;
        objects.push(pensileModel);
        pensileModel.setParent(scene.getMeshByName("wall1"));

        var pensileModel2 = pensileModel.clone();
        pensileModel2.position.x -= 1.9;
        objects.push(pensileModel2);
    }

    // Frigo
    var frigo = BABYLON.MeshBuilder.CreateBox("frigo", { width: 1.35, depth: 2.1, height: 3.36 }, scene);
    frigo.position = new BABYLON.Vector3(7.6, 1.68, 1.7);
    frigo.material = genericMaterial;
    objects.push(frigo);
    navMeshObjects.push(frigo);
    if (loadModels) {
        //Frigo (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "frigo.glb", scene);
        var frigoModel = result.meshes[0];
        frigoModel.scaling = new BABYLON.Vector3(4.6, 3.6, 4.6);
        frigoModel.position = new BABYLON.Vector3(7, 0, 0.7);
        frigoModel.rotationQuaternion = null;
        frigoModel.rotation.y = -Math.PI / 2;
        objects.push(frigoModel);
    }


    //Chiavi (modello)
    if (lightVersion)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "chiavi.glb", scene);
    else
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "chiavi-texture.glb", scene);
    var chiaviModel = result.meshes[0];
    chiaviModel.scaling = new BABYLON.Vector3(3, 3, 3);
    chiaviModel.position = new BABYLON.Vector3(4.1, 1.8, 1.8);
    chiaviModel.rotationQuaternion = null;
    chiaviModel.rotation.y = Math.PI / 2;
    objects.push(chiaviModel);
    chiaviModel.setParent(wallInternal3);
    
    if (!player.ownKey()) {
        key.setParent(wallInternal3);

        var ex = [chiaviModel];

        //CREAZIONE CHIAVE SPECIALE
        class Key{
            #mesh;
            #kChildren;
            #excused;
            constructor(mesh, ex){
                this.#mesh = mesh;
                this.#mesh.name = "chiave0";
                this.#kChildren = key.getChildMeshes();
                var i = 1;
                this.#kChildren.forEach(e =>{
                    e.name = "chiave" + i;
                    i++;
                });
                this.#excused = [];
                ex.forEach(e =>{
                    var children = e.getChildMeshes();
                    this.#excused.push(e);
                    children.forEach(c =>{
                        this.#excused.push(c);
                    })
                });
            }
            
            getMesh(){
                return this.#mesh;
            }

            getMeshes(){
                return [this.#mesh].concat(this.#kChildren);
            }

            getName(){
                return "chiave";
            }

            gotKey(){
                this.#mesh.visibility = 0;
                this.#kChildren.forEach(e =>{
                    e.visibility = 0;
                })
            }

            getExcused(){
                return this.#excused;
            }
        }
        
        objKey = new Key(key,ex);
    }


    // Secchio
    var secchio = BABYLON.MeshBuilder.CreateBox("secchio", { width: 1.1, depth: 1.1, height: 1.6 }, scene);
    secchio.position = new BABYLON.Vector3(4.35, 0.8, -7.4);
    secchio.rotation.y = Math.PI / 8;
    secchio.material = genericMaterial;
    objects.push(secchio);
    navMeshObjects.push(secchio);
    if (loadModels) {
        //Secchio (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/cucina/", "secchio.glb", scene);
        var secchioModel = result.meshes[0];
        secchioModel.scaling = new BABYLON.Vector3(4.8, 3.7, 4.8);
        secchioModel.position = new BABYLON.Vector3(4.3, 0, -7.5);
        secchioModel.rotationQuaternion = null;
        secchioModel.rotation.y = Math.PI / 8;
        objects.push(secchioModel);

        secchioModel.setParent(wallInternal4);
    }


    //Finestra cucina (modello)
    if (loadModels) {
        finestraCucinaModel = finestraBagnoModel.clone();
        finestraCucinaModel.scaling = new BABYLON.Vector3(4, 2.8, 3);
        finestraCucinaModel.position = new BABYLON.Vector3(7, 0.65, -8.45);
        finestraCucinaModel.rotation.y = Math.PI;
        objects.push(finestraCucinaModel);

        finestraBagnoModel.setParent(scene.getMeshByName("wall2"));
        finestraCucinaModel.setParent(scene.getMeshByName("wall0"));
    }


    //Mattonelle cucina
    var mattonelleCucinaMaterial = new BABYLON.StandardMaterial("mattonelleCucinaMaterial");
    mattonelleCucinaMaterial.diffuseTexture = new BABYLON.Texture("textures/tiles-kitchen.jpg", scene);
    mattonelleCucinaMaterial.bumpTexture = new BABYLON.Texture("textures/tilesBump.png", scene);
    const cornersCucina = [
        new BABYLON.Vector2(0, 0),
        new BABYLON.Vector2(0, 1),
        new BABYLON.Vector2(7.8, 1),
        new BABYLON.Vector2(7.8, 0)
    ];
    var poly = new BABYLON.PolygonMeshBuilder("pareteCucina", cornersCucina, scene);
    var pareteCucina = poly.build();
    setPickableChildren(pareteCucina, false);
    pareteCucina.rotation.x = Math.PI/2;
    pareteCucina.rotation.y = -Math.PI/2;
    pareteCucina.position = new BABYLON.Vector3(8.42, 3, -8.45);
    pareteCucina.material = mattonelleCucinaMaterial;
    pareteCucina.material.diffuseTexture.uScale = 7;
    pareteCucina.material.diffuseTexture.vScale = 1;
    pareteCucina.material.bumpTexture.uScale = 7;
    pareteCucina.material.bumpTexture.vScale = 1;
    objects.push(pareteCucina);


    /******** SALOTTO ********/

    
    // Tavolo
    var tavolo = BABYLON.MeshBuilder.CreateBox("tavolo", { width: 4.4, depth: 2.5, height: 2.6 }, scene);
    tavolo.position = new BABYLON.Vector3(-0.6, 3.1, -1.85);
    tavolo.rotation.y = Math.PI / 3.5;
    tavolo.material = genericMaterial;
    objects.push(tavolo);
    // pezzo sotto del tavolo, serve per la navigation mesh
    var tavoloSotto = BABYLON.MeshBuilder.CreateBox("tavoloSotto", { width: 4.4, depth: 2.5, height: 1 }, scene);
    tavoloSotto.position = tavolo.position.clone();
    tavoloSotto.rotation = tavolo.rotation;
    tavoloSotto.position.y = 0.5;
    tavoloSotto.material = new BABYLON.StandardMaterial("tavoloMaterial", scene);
    tavoloSotto.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
    tavoloSotto.material.alpha = alphaValue;
    tavoloSotto.isPickable = false;      // se no la bambina non puo' andare sotto al tavolo
    objects.push(tavoloSotto);
    navMeshObjects.push(tavoloSotto);

    if (loadModels) {
        //Tavolo (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "tavolo.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "tavolo-texture.glb", scene);
        var tavoloModel = result.meshes[0];
        tavoloModel.scaling = new BABYLON.Vector3(1.05, 1, 0.92);
        tavoloModel.position = new BABYLON.Vector3(-0.6, 0, -1.85);
        tavoloModel.rotationQuaternion = null;
        tavoloModel.rotation.y = Math.PI / 3.5;
        objects.push(tavoloModel);
    }
    if (loadModels) {
        //Valigie sopra tavolo (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "valigie.glb", scene);
        var valigieModel = result.meshes[0];
        valigieModel.scaling = new BABYLON.Vector3(-5, 5, 5);
        valigieModel.position = new BABYLON.Vector3(-0.6, 2.3, -1.85);
        valigieModel.rotationQuaternion = null;
        valigieModel.rotation.y += Math.PI / 3.5;
        objects.push(valigieModel);

        valigieModel.setParent(tavoloModel);
    }

    // Pianta (per bloccare il passaggio)
    var pianta = BABYLON.MeshBuilder.CreateBox("pianta", { width: 1, depth: 1.7, height: 4 }, scene);
    pianta.position = new BABYLON.Vector3(-1.4, 2, 1.1);
    pianta.rotation.y = -Math.PI / 6;
    pianta.material = genericMaterial;
    objects.push(pianta);
    navMeshObjects.push(pianta);

    if (loadModels) {
        // Pianta (modello)
        var piantaModel3 = piantaModel1.clone();
        piantaModel3.position = new BABYLON.Vector3(-1.3, 0, 1.2);
        objects.push(piantaModel3);
    }


    // Divano
    var divano = BABYLON.MeshBuilder.CreateBox("divano", { width: 4.9, depth: 2, height: 1.64 }, scene);
    divano.position = new BABYLON.Vector3(-4.4, 0.82, -2.5);
    divano.rotation.y = 9*Math.PI / 7;
    divano.material = genericMaterial;
    objects.push(divano);
    navMeshObjects.push(divano);

    if (loadModels) {
        //Divano (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "divano.glb", scene);
        var divanoModel = result.meshes[0];
        divanoModel.scaling = new BABYLON.Vector3(4.8, 5, 4.6);
        divanoModel.position = new BABYLON.Vector3(-3.8, 0, -5);
        divanoModel.rotationQuaternion = null;
        divanoModel.rotation.y = 9*Math.PI / 7;
        objects.push(divanoModel);
    }

    if (loadModels) {
        if (!lightVersion) {
            //Quadro 1 (modello)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "quadro1.glb", scene);
            var quadro1Model = result.meshes[0];
            quadro1Model.scaling = new BABYLON.Vector3(2.7, 2.8, 2.7);
            quadro1Model.position = new BABYLON.Vector3(-8.45, 2, -5.5);
            quadro1Model.rotationQuaternion = null;
            quadro1Model.rotation.y = Math.PI / 2;
            setPickableChildren(quadro1Model, false);
            objects.push(quadro1Model);
            quadro1Model.setParent(scene.getMeshByName("wall3"));

            //Quadro 2 (modello)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "quadro2.glb", scene);
            var quadro2Model = result.meshes[0];
            quadro2Model.scaling = new BABYLON.Vector3(2.7, 2.8, 2.7);
            quadro2Model.position = new BABYLON.Vector3(-8.45, 2, -0.5);
            quadro2Model.rotationQuaternion = null;
            quadro2Model.rotation.y = Math.PI / 2;
            setPickableChildren(quadro2Model, false);
            objects.push(quadro2Model);
            quadro2Model.setParent(scene.getMeshByName("wall3"));


            //Quadro 3 (modello)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "quadro3.glb", scene);
            var quadro3Model = result.meshes[0];
            quadro3Model.scaling = new BABYLON.Vector3(2.3, 2.3, 2.3);
            quadro3Model.position = new BABYLON.Vector3(3.5, 1.6, -6);
            quadro3Model.rotationQuaternion = null;
            quadro3Model.rotation.y = -Math.PI / 2;
            setPickableChildren(quadro3Model, false);
            objects.push(quadro3Model);
            quadro3Model.setParent(wallInternal4);
            
            //Quadro 4 (modello)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "quadro4.glb", scene);
            var quadro4Model = result.meshes[0];
            quadro4Model.scaling = new BABYLON.Vector3(2.3, 2.3, 2.3);
            quadro4Model.position = new BABYLON.Vector3(3.5, 1.6, 0.5);
            quadro4Model.rotationQuaternion = null;
            quadro4Model.rotation.y = -Math.PI / 2;
            setPickableChildren(quadro4Model, false);
            objects.push(quadro4Model);
            quadro4Model.setParent(wallInternal3);
        }

        //Orso - tra le finestre (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "bear.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "bear-texture.glb", scene);
        var bearModel = result.meshes[0];
        bearModel.scaling = new BABYLON.Vector3(3, 3, 2.8);
        bearModel.position = new BABYLON.Vector3(-1.8, 2, -7.6);
        bearModel.rotationQuaternion = null;
        setPickableChildren(bearModel, false);
        objects.push(bearModel);
        bearModel.setParent(scene.getMeshByName("wall0"));
    }

    // Caminetto
    var caminetto = BABYLON.MeshBuilder.CreateBox("caminetto", { width: 2.6, depth: 0.9, height: 4 }, scene);
    caminetto.position = new BABYLON.Vector3(-8.1, 2, -3);
    caminetto.material = genericMaterial;
    caminetto.rotation.y = Math.PI / 2;
    objects.push(caminetto);
    navMeshObjects.push(caminetto);
    if (loadModels) {
        //Caminetto (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "caminetto.glb", scene);
        var caminettoModel = result.meshes[0];
        caminettoModel.scaling = new BABYLON.Vector3(-1.3, 1.3, 1.3);
        caminettoModel.position = new BABYLON.Vector3(-8.2, 0, -3);
        caminettoModel.rotationQuaternion = null;
        caminettoModel.rotation.y = Math.PI/2;
        objects.push(caminettoModel);
    }
    
    // Sedia 2
    var sedia2 = BABYLON.MeshBuilder.CreateBox("sedia2", { width: 1, depth: 1.1, height: 1 }, scene);
    sedia2.position = new BABYLON.Vector3(-4.3, 0.5, -7.1);
    sedia2.rotation.y = -Math.PI / 8;
    sedia2.material = genericMaterial;
    objects.push(sedia2);
    navMeshObjects.push(sedia2);
    var sedia2Schienale = BABYLON.MeshBuilder.CreateBox("sedia2Schienale", { width: 1, depth: 0.35, height: 1.1 }, scene);
    sedia2Schienale.position = new BABYLON.Vector3(-4.15, 1.55, -7.45);
    sedia2Schienale.rotation.y = -Math.PI / 8;
    sedia2Schienale.material = genericMaterial;
    objects.push(sedia2Schienale);

    if (loadModels) {
        //Sedia 2 (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "sedia.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "sedia-texture.glb", scene);
        var sediaModel2 = result.meshes[0];
        sediaModel2.scaling = new BABYLON.Vector3(4.5, 4.5, 4.5);
        sediaModel2.position = new BABYLON.Vector3(-4.9, 0, -6.9);
        sediaModel2.rotationQuaternion = null;
        sediaModel2.rotation.y = -Math.PI / 8;
        objects.push(sediaModel2);
    }

    // Sedia 3
    var sedia3 = BABYLON.MeshBuilder.CreateBox("sedia3", { width: 1, depth: 1.1, height: 1 }, scene);
    sedia3.position = new BABYLON.Vector3(-2.8, 0.5, -5.9);
    sedia3.rotation.y = - 6*Math.PI/8;
    sedia3.material = genericMaterial;
    objects.push(sedia3);
    navMeshObjects.push(sedia3);
    var sedia3Schienale = BABYLON.MeshBuilder.CreateBox("sedia3Schienale", { width: 1, depth: 0.35, height: 1.1 }, scene);
    sedia3Schienale.position = new BABYLON.Vector3(-2.5, 1.55, -5.6);
    sedia3Schienale.rotation.y = - 6*Math.PI/8;
    sedia3Schienale.material = genericMaterial;
    objects.push(sedia3Schienale);
    
    if (loadModels) {
        //Sedia 3 (modello)
        var sediaModel3 = sediaModel2.clone();
        sediaModel3.position = new BABYLON.Vector3(-2.8, 0, -6.5);
        sediaModel3.rotation.y = - 6*Math.PI/8;
        objects.push(sediaModel3);
    }


    // Libreria
    var libreria = BABYLON.MeshBuilder.CreateBox("divano", { width: 4.1, depth: 1.3, height: 3.95 }, scene);
    libreria.position = new BABYLON.Vector3(-4.2, 2, 2.2);
    libreria.material = genericMaterial;
    objects.push(libreria);
    navMeshObjects.push(libreria);

    if (loadModels) {
        //Libreria (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "libreria.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "libreria-texture.glb", scene);
        var libreriaModel = result.meshes[0];
        libreriaModel.scaling = new BABYLON.Vector3(5, 5, 4.5);
        libreriaModel.position = new BABYLON.Vector3(-2.2, 0, 1.7);
        libreriaModel.rotationQuaternion = null;
        libreriaModel.rotation.y = Math.PI;
        objects.push(libreriaModel);
    }


    if (loadModels) {
        //Finestra 1 salotto (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "finestra-larga.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "finestra-larga-texture.glb", scene);
        var finestraSalottoModel1 = result.meshes[0];
        finestraSalottoModel1.scaling = new BABYLON.Vector3(3, 3.2, 3);
        finestraSalottoModel1.position = new BABYLON.Vector3(2, 0, -8.45);
        finestraSalottoModel1.rotationQuaternion = null;
        finestraSalottoModel1.rotation.y = Math.PI;
        objects.push(finestraSalottoModel1);

        //Finestra 3 salotto (modello)
        var finestraSalottoModel3 = finestraSalottoModel1.clone();
        finestraSalottoModel3.position = new BABYLON.Vector3(-2.5, 0, -8.45);
        objects.push(finestraSalottoModel3);

        finestraSalottoModel1.setParent(scene.getMeshByName("wall0"));
        finestraSalottoModel3.setParent(scene.getMeshByName("wall0"));
    }

    //Porta 2 (uscita casa)
    var porta2 = BABYLON.MeshBuilder.CreateBox(DOOR_LIVINGROOM_TO_EXIT, { width: 2, depth: 0.4, height: 3.4 }, scene);
    porta2.position = new BABYLON.Vector3(-6.9, 1.7, -8.35);
    porta2.material = new BABYLON.StandardMaterial("portaMaterial4", scene);
    porta2.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    porta2.material.alpha = alphaValue;
    objects.push(porta2);
    navMeshObjects.push(porta2);

    if (loadModels) {
        //Porta casa (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/livingroom/salotto/", "porta-casa.glb", scene);
        var portaCasaModel = result.meshes[0];
        portaCasaModel.scaling = new BABYLON.Vector3(4, 3.2, 3);
        portaCasaModel.position = new BABYLON.Vector3(-7.9, 0, -8.15);
        portaCasaModel.rotationQuaternion = null;
        objects.push(portaCasaModel);
    }



    /******** Altro ********/

    //Pavimento
    var pavimento = BABYLON.Mesh.CreateGround("pavimento", widthFloor, depthFloor, 0, scene);
    var pavimentoMaterial = new BABYLON.StandardMaterial("pavimentoMaterial");
    
    // Color texture:
    pavimentoMaterial.diffuseTexture = new BABYLON.Texture("textures/wood.png", scene);
    pavimentoMaterial.diffuseTexture.uScale = 5;
    pavimentoMaterial.diffuseTexture.vScale = 3.5;
    
    if (!lightVersion) {
        // Bump texture:
        pavimentoMaterial.bumpTexture = new BABYLON.Texture("textures/woodBump.png", scene);
        pavimentoMaterial.bumpTexture.uScale = 5;
        pavimentoMaterial.bumpTexture.vScale = 3.5;
    }

    pavimento.material = pavimentoMaterial;
    objects.push(pavimento);
    navMeshObjects.push(pavimento);




    // OTTIMIZZAZIONI
    objects.forEach(ob => {
        ob.freezeWorldMatrix();
        ob.doNotSyncBoundingInfo = true;
        ob.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;

        let ch = ob.getChildMeshes();
        for (let i = 0; i < ch.length; i++) {
            ch[i].freezeWorldMatrix();
            ch[i].doNotSyncBoundingInfo = true;
        }
    });


    // Rimuovi physical light falloff da tutti i materiali. Serve perche' se no i mobili non vedono la spotlight.
    // Inoltre, questo codice aggiunge il glow effect alle finestre
    scene.materials.forEach(mat => {
        mat.freeze();
        mat.usePhysicalLightFalloff = false;

        if (mat._uniformBuffer._name == "glass") {
            mat.emissiveColor = new BABYLON.Color3(4/255, 4/255, 109/255);
        }
        else if (mat._uniformBuffer._name == "carpet") {
            mat.albedoColor = new BABYLON.Color3(145/255, 60/255, 70/255).toLinearSpace();
        }
    });

    return {"objects":objects, "navMeshObjects":navMeshObjects};
}


function getDoorGlass() {
    var m = [];
    scene.meshes.forEach(mesh => {
        if (mesh.name == "door-glass" || mesh.name.includes("door-sliding")) {
            m.push(mesh);
        }
    });
    return m;
}



function openDoor(meshToMove, finalPosition, meshToRemove, obstacle) {

    // Sblocca la mesh se no non si puo' animare
    meshToMove.unfreezeWorldMatrix();
    let ch = meshToMove.getChildMeshes();
    for (let i = 0; i < ch.length; i++) {
        ch[i].unfreezeWorldMatrix();
    }

    const anim = new BABYLON.Animation("door opening", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    const keyFrames = []; 

    keyFrames.push({
        frame: 0,
        value: meshToMove.position.clone()
    });
    keyFrames.push({
        frame: 30,
        value: finalPosition
    });

    anim.setKeys(keyFrames);

    meshToMove.animations.push(anim);

    scene.beginAnimation(meshToMove, 0, 30, false, 1, () => {
        // Questo codice viene eseguito quando l'animazione della porta termina
        meshToRemove.dispose();
        meshToMove.dispose();

        navigationPlugin.removeObstacle(obstacle);
    });
}
