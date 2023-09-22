
async function createHallway() {

    var alphaValue = 1;

    var loadModels = true;
    if (loadModels) alphaValue = 0;     // da mettere a 0. Con valori > 0 per vedere dove sono i mobili

    var objects = [];
    var navMeshObjects = [];
    var mirrorObjects = [];

    const widthFloor = 5;
    const depthFloor = 28;
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
    mirrorObjects.push(w[0]);


    // Materiale generico, assegnato alle mesh invisibili usate per i mobili
    var genericMaterial = new BABYLON.StandardMaterial("genericMaterial", scene);
    genericMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
    genericMaterial.alpha = alphaValue;

    var result;


    // VERSIONE LIGHT
    var lightVersion = document.getElementById("lighter").checked;



    /***** CARTELLI con scritte *****/
    if (document.getElementById("hints").checked) {
        // Cartello 6 (use mirror to reflect light)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/cartelli/", "cartello6.glb", scene);
        var cart6 = result.meshes[0];
        cart6.scaling = new BABYLON.Vector3(-1.4, 1.2, 1.2);
        cart6.position = new BABYLON.Vector3(-2.3, 0.52, 8.7);
        cart6.rotationQuaternion = null;
        cart6.rotation.y = Math.PI;
        setPickableChildren(cart6, false);
        objects.push(cart6);
        cart6.setParent(scene.getMeshByName("wall3"));

        // Cartello 7 (stairs at the end of the hallway)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/cartelli/", "cartello7.glb", scene);
        var cart7 = result.meshes[0];
        cart7.scaling = new BABYLON.Vector3(-1.6, 1.3, 1.2);
        cart7.position = new BABYLON.Vector3(2.35, 1.8, 9.4);
        cart7.rotationQuaternion = null;
        //cart7.rotation.y = Math.PI;
        setPickableChildren(cart7, false);
        objects.push(cart7);
        cart7.setParent(scene.getMeshByName("wall1"));

        // Cartello 8 (crouch to reach the stairs)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/cartelli/", "cartello8.glb", scene);
        var cart8 = result.meshes[0];
        cart8.scaling = new BABYLON.Vector3(-1.2, 1, 1);
        cart8.position = new BABYLON.Vector3(1.4, 2.2, -7.9);
        cart8.rotationQuaternion = null;
        cart8.rotation.y = Math.PI/2;
        cart8.rotation.y -= Math.PI/8;
        setPickableChildren(cart8, false);
        objects.push(cart8);
    }


    if (loadModels) {
        //Pianta (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/", "pianta.glb", scene);
        var piantaModel = result.meshes[0];
        piantaModel.scaling = new BABYLON.Vector3(3.5, 3.5, 3.5);
        piantaModel.position = new BABYLON.Vector3(1.8, 0, 13.3);
        piantaModel.rotationQuaternion = null;
        objects.push(piantaModel);

        //Lampade (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/", "lampadaMuro.glb", scene);
        var lampadaModel1 = result.meshes[0];
        lampadaModel1.scaling = new BABYLON.Vector3(3.5, 3.5, 3.5);
        lampadaModel1.position = new BABYLON.Vector3(2.45, 2.8, 8.2);
        lampadaModel1.rotationQuaternion = null;
        lampadaModel1.rotation.y = -Math.PI / 2;
        setPickableChildren(lampadaModel1, false);
        objects.push(lampadaModel1);

        var lampadaModel2 = lampadaModel1.clone();
        lampadaModel2.position.z = 0.3;
        setPickableChildren(lampadaModel2, false);
        objects.push(lampadaModel2);
        
        lampadaModel1.setParent(scene.getMeshByName("wall1"));
        lampadaModel2.setParent(scene.getMeshByName("wall1"));
    }
    
    //Armadietto 1
    var armadietto1 = BABYLON.MeshBuilder.CreateBox("armadietto1", { width: 3, depth: 1.3, height: 2.55 }, scene);
    armadietto1.position = new BABYLON.Vector3(0.95, 1.3, 7.5);
    armadietto1.material = genericMaterial;
    objects.push(armadietto1);
    navMeshObjects.push(armadietto1);

    if (loadModels) {
        //Armadietto 1 (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "armadietto.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "armadietto-texture.glb", scene);
        var armadiettoModel1 = result.meshes[0];
        armadiettoModel1.scaling = new BABYLON.Vector3(6, 4.9, 4.8);
        armadiettoModel1.position = new BABYLON.Vector3(-0.3, 0, 8.1);
        armadiettoModel1.rotationQuaternion = null;
        objects.push(armadiettoModel1);
        mirrorObjects.push(armadiettoModel1);
    }

    //Armadietto 2
    var armadietto2 = BABYLON.MeshBuilder.CreateBox("armadietto2", { width: 3, depth: 1.3, height: 2.55 }, scene);
    armadietto2.position = new BABYLON.Vector3(0.95, 1.3, 2);
    armadietto2.material = genericMaterial;
    armadietto2.rotation.y = Math.PI / 6;
    objects.push(armadietto2);
    navMeshObjects.push(armadietto2);

    if (loadModels) {
        //Armadietto 2 (modello)
        var armadiettoModel2 = armadiettoModel1.clone();
        armadiettoModel2.position = new BABYLON.Vector3(1.65, 0, 0.9);
        armadiettoModel2.rotation.y = Math.PI / 6;
        armadiettoModel2.rotation.y += Math.PI;
        objects.push(armadiettoModel2);
        mirrorObjects.push(armadiettoModel2);
    }
    
    if (loadModels && !lightVersion) {
        //Quadri (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "quadri-1.glb", scene);
        var quadriModel1 = result.meshes[0];
        quadriModel1.scaling = new BABYLON.Vector3(-3, 3, 3);
        quadriModel1.position = new BABYLON.Vector3(-2.35, 0.2, 6);
        quadriModel1.rotationQuaternion = null;
        quadriModel1.rotation.y = Math.PI / 2;
        setPickableChildren(quadriModel1, false);
        objects.push(quadriModel1);
        quadriModel1.setParent(scene.getMeshByName("wall3"));

        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "quadri-2.glb", scene);
        var quadriModel2 = result.meshes[0];
        quadriModel2.scaling = new BABYLON.Vector3(-3, 3, 3);
        quadriModel2.position = new BABYLON.Vector3(-2.35, 0.2, 8.5);
        quadriModel2.rotationQuaternion = null;
        quadriModel2.rotation.y = Math.PI / 2;
        setPickableChildren(quadriModel2, false);
        objects.push(quadriModel2);
        quadriModel2.setParent(scene.getMeshByName("wall3"));
    }
    // Specchio
    if (lightVersion)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "mirrorDirty.glb", scene);
    else
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "mirrorDirty-texture.glb", scene);
    mirrorModel = result.meshes[0];
    mirrorModel.name = "Mirror";
    setPickableChildren(mirrorModel, true);
    mirrorModel.scaling = new BABYLON.Vector3(-1.5, 1.5, 1.5);
    mirrorModel.position = new BABYLON.Vector3(-2.36, 0.5, 7.9);
    mirrorModel.rotationQuaternion = null;
    mirrorModel.rotation.y = Math.PI;
    objects.push(mirrorModel);
    mirrorModel.setParent(scene.getMeshByName("wall3"));

    mirrorLight = new BedSpotlight(new BABYLON.Vector3(-2, 1.5, 7.9), new BABYLON.Vector3(1,0,0), Math.PI/2, 10, 10);
    mirrorLight.setIntensity(0);


    //Sgabello
    var sgabello = BABYLON.MeshBuilder.CreateBox("sgabello", { width: 1, depth: 1, height: 1.5 }, scene);
    sgabello.position = new BABYLON.Vector3(1.7, 0.75, 0);
    sgabello.material = genericMaterial;
    objects.push(sgabello);
    navMeshObjects.push(sgabello);

    if (loadModels) {
        //Sgabello (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "sgabello.glb", scene);
        var sgabelloModel1 = result.meshes[0];
        sgabelloModel1.scaling = new BABYLON.Vector3(4, 3.35, 4.3);
        sgabelloModel1.position = new BABYLON.Vector3(1.2, 0, 0.5);
        sgabelloModel1.rotationQuaternion = null;
        objects.push(sgabelloModel1);
    }
    

    //Libreria
    var libreria = BABYLON.MeshBuilder.CreateBox("libreria", { width: 4, depth: 1, height: 4 }, scene);
    libreria.position = new BABYLON.Vector3(-1.3, 2, -1.5);
    libreria.material = new BABYLON.StandardMaterial("libreriaMaterial", scene);
    libreria.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
    libreria.material.alpha = alphaValue;
    libreria.rotation.y = -5* Math.PI / 8;
    objects.push(libreria);
    navMeshObjects.push(libreria);
    
    if (loadModels) {
        //Libreria (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "libreria.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "libreria-texture.glb", scene);
        var libreriaModel = result.meshes[0];
        libreriaModel.scaling = new BABYLON.Vector3(-4.9, 5, -3.7);
        libreriaModel.position = new BABYLON.Vector3(-1.6, 0, 0.5);
        libreriaModel.rotationQuaternion = null;
        libreriaModel.rotation.y = -5* Math.PI / 8;
        objects.push(libreriaModel);
    }

    //Tavolo
    var tavolo = BABYLON.MeshBuilder.CreateBox("tavolo", { width: 3.2, depth: 1.6, height: 4 }, scene);
    tavolo.position = new BABYLON.Vector3(0.7, 3.5, -8.9);
    tavolo.material = new BABYLON.StandardMaterial("tavoloMaterial", scene);
    tavolo.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
    tavolo.material.alpha = alphaValue;
    tavolo.rotation.y = - Math.PI / 8;
    objects.push(tavolo);
    // pezzo sotto del tavolo, serve per la navigation mesh
    var tavoloSotto = BABYLON.MeshBuilder.CreateBox("tavoloSotto", { width: 3.2, depth: 1.6, height: 1 }, scene);
    tavoloSotto.position = tavolo.position.clone();
    tavoloSotto.rotation = tavolo.rotation;
    tavoloSotto.position.y = 0.5;
    tavoloSotto.material = new BABYLON.StandardMaterial("libreriaMaterial", scene);
    tavoloSotto.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
    tavoloSotto.material.alpha = alphaValue;
    tavoloSotto.isPickable = false;      // se no la bambina non puo' andare sotto al tavolo
    objects.push(tavoloSotto);
    navMeshObjects.push(tavoloSotto);

    if (loadModels) {
        // Tavolo (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "tavolo.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "tavolo-texture.glb", scene);
        var tavoloModel = result.meshes[0];
        tavoloModel.scaling = new BABYLON.Vector3(4.2, 4.6, 4);
        tavoloModel.position = new BABYLON.Vector3(-0.95, 0, -8.8);
        tavoloModel.rotationQuaternion = null;
        tavoloModel.rotation.y = - Math.PI / 8;
        objects.push(tavoloModel);
    }
    if (document.getElementById("hints").checked) {
        cart8.setParent(tavoloModel);
    }
    

    //Finestra 1 (modello)
    if (loadModels) {
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/", "finestra.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/", "finestra-texture.glb", scene);
        var finestraModel = result.meshes[0];
        finestraModel.scaling = new BABYLON.Vector3(4, 3.2, 3);
        finestraModel.position = new BABYLON.Vector3(2.45, 0, 13.5);
        finestraModel.rotationQuaternion = null;
        finestraModel.rotation.y = Math.PI / 2;
        objects.push(finestraModel);
        mirrorObjects.push(finestraModel);
    }
    
    //Finestra 2 (modello)
    if (loadModels) {
        var finestraModel2 = finestraModel.clone();
        finestraModel2.position = new BABYLON.Vector3(2.45, 0, 6.5);
        objects.push(finestraModel2);
        mirrorObjects.push(finestraModel2);
    }

    //Finestra 3 (modello)
    if (loadModels) {
        var finestraModel3 = finestraModel.clone();
        finestraModel3.position = new BABYLON.Vector3(2.45, 0, -1.5);
        objects.push(finestraModel3);
    }
    
    // Rendi le finestre "figlie" della parete a cui sono attaccate. Cosi' quando la parete sparisce, spariscono anche loro:
    if (loadModels) {
        let wall = scene.getMeshByName("wall1");
        finestraModel.setParent(wall);
        finestraModel2.setParent(wall);
        finestraModel3.setParent(wall);
    }




    //Porta 1 (verso la stanza da letto)
    var porta1 = BABYLON.MeshBuilder.CreateBox(DOOR_HALLWAY_TO_BEDROOM, { width: 2.1, depth: 0.3, height: 3.3 }, scene);
    porta1.position = new BABYLON.Vector3(-2.35, 1.65, 12.5);
    porta1.rotation.y = Math.PI/2;
    porta1.material = new BABYLON.StandardMaterial("porta1Material", scene);
    porta1.material.diffuseColor = new BABYLON.Color3(0.6, 0.6, 1);
    porta1.material.alpha = alphaValue;
    objects.push(porta1);
    navMeshObjects.push(porta1);

    if (loadModels) {
        //Porta (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/", "porta.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/", "porta-texture.glb", scene);
        var portaModel1 = result.meshes[0];
        portaModel1.scaling = new BABYLON.Vector3(4, 3.2, 2.2);
        portaModel1.position = new BABYLON.Vector3(-2.25, 0, 13.5);
        portaModel1.rotationQuaternion = null;
        portaModel1.rotation.y = Math.PI/2;
        objects.push(portaModel1);
    }




    //Porta 2 (verso il salotto)
    var porta2 = BABYLON.MeshBuilder.CreateBox(DOOR_HALLWAY_TO_LIVINGROOM, { width: 1.5, depth: 0.3, height: 3 }, scene);
    porta2.position = new BABYLON.Vector3(1.3, 1.5, -11.6);
    porta2.material = new BABYLON.StandardMaterial("porta2Material", scene);
    porta2.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
    porta2.material.alpha = alphaValue;
    objects.push(porta2);
    navMeshObjects.push(porta2);
    

    //Scala a chiocciola (verso il salotto)
    var scala = BABYLON.MeshBuilder.CreateBox("scala", { width: 3.5, depth: 2.1, height: 6 }, scene);
    scala.position = new BABYLON.Vector3(0.5, 3, -12.6);
    scala.material = new BABYLON.StandardMaterial("scalaMaterial", scene);
    scala.material.diffuseColor = new BABYLON.Color3(1, 0, 1);
    scala.material.alpha = alphaValue;
    objects.push(scala);
    navMeshObjects.push(scala);

    if (loadModels) {
        // Scala (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "staircase-colonna.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "staircase-colonna-texture.glb", scene);
        var scalaModel = result.meshes[0];
        scalaModel.scaling = new BABYLON.Vector3(-4, 4.5, 4);
        scalaModel.position = new BABYLON.Vector3(0, -4.7, -12);
        scalaModel.rotationQuaternion = null;
        scalaModel.rotation.y = -Math.PI / 2;
        scalaModel.rotation.y += -Math.PI / 10;
        objects.push(scalaModel);
    }


    //Porta 3 (chiusa)
    var porta3 = BABYLON.MeshBuilder.CreateBox(DOOR_LOCKED, { width: 2.1, depth: 0.3, height: 3.3 }, scene);
    porta3.position = new BABYLON.Vector3(-2.35, 1.65, 2);
    porta3.rotation.y = Math.PI/2;
    porta3.material = new BABYLON.StandardMaterial("porta3Material", scene);
    porta3.material.diffuseColor = new BABYLON.Color3(0.6, 0.6, 1);
    porta3.material.alpha = alphaValue;
    objects.push(porta3);
    navMeshObjects.push(porta3);

    if (loadModels) {
        //Porta (modello)
        var portaModel2 = portaModel1.clone();
        portaModel2.position = new BABYLON.Vector3(-2.25, 0, 3);
        objects.push(portaModel2);
    }


    //Porta 4 (chiusa)
    var porta4 = BABYLON.MeshBuilder.CreateBox(DOOR_LOCKED, { width: 2.1, depth: 0.3, height: 3.3 }, scene);
    porta4.position = new BABYLON.Vector3(-2.35, 1.65, -5.5);
    porta4.rotation.y = Math.PI/2;
    porta4.material = new BABYLON.StandardMaterial("porta4Material", scene);
    porta4.material.diffuseColor = new BABYLON.Color3(0.6, 0.6, 1);
    porta4.material.alpha = alphaValue;
    objects.push(porta4);
    navMeshObjects.push(porta4);

    if (loadModels) {
        //Porta (modello)
        var portaModel3 = portaModel1.clone();
        portaModel3.position = new BABYLON.Vector3(-2.25, 0, -4.5);
        objects.push(portaModel3);
    }

    // Rendi le porte chiuse "figlie" della parete a cui sono attaccate
    if (loadModels) {
        let wall = scene.getMeshByName("wall3");
        portaModel2.setParent(wall);
        portaModel3.setParent(wall);
    }


    //Ringhiera scale 
    var fence = BABYLON.MeshBuilder.CreateBox("fence", { width: 0.7, depth: 3.2, height: 4 }, scene);
    fence.position = new BABYLON.Vector3(-0.9, 2, -12);
    fence.material = new BABYLON.StandardMaterial("porta2Material", scene);
    fence.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
    fence.material.alpha = alphaValue;
    objects.push(fence);
    navMeshObjects.push(fence);

    if (loadModels) {
        //Ringhiera scale (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "fence.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "models/furniture/hallway/", "fence-texture.glb", scene);
        var fenceModel = result.meshes[0];
        fenceModel.scaling = new BABYLON.Vector3(3, 4, 3.2);
        fenceModel.position = new BABYLON.Vector3(0.3, 0, -12.35);
        fenceModel.rotationQuaternion = null;
        objects.push(fenceModel);
    }



    //Pavimento visibile (bucato dove c'e' la scala a chiocciola)
    const corners = [
        new BABYLON.Vector2(-widthFloor/2, -depthFloor/2),
        new BABYLON.Vector2(-0.9, -depthFloor/2),
        new BABYLON.Vector2(-0.9, -depthFloor/2 + 2.5),
        new BABYLON.Vector2(widthFloor/2 - 0.5, -depthFloor/2 + 2.5),
        new BABYLON.Vector2(widthFloor/2 - 0.5, -depthFloor/2),
        new BABYLON.Vector2(widthFloor/2, -depthFloor/2),
        new BABYLON.Vector2(widthFloor/2, depthFloor/2),
        new BABYLON.Vector2(-widthFloor/2, depthFloor/2),
    ];
    var poly = new BABYLON.PolygonMeshBuilder("pavimentoVis", corners, scene);
    var pavimentoVis = poly.build();

    var pavimentoMaterial = new BABYLON.StandardMaterial("pavimentoMaterial");
    // Color texture:
    pavimentoMaterial.diffuseTexture = new BABYLON.Texture("textures/wood.png", scene);
    pavimentoMaterial.diffuseTexture.uScale = 1;
    pavimentoMaterial.diffuseTexture.vScale = 5;
    // Bump texture:
    pavimentoMaterial.bumpTexture = new BABYLON.Texture("textures/woodBump.png", scene);
    pavimentoMaterial.bumpTexture.uScale = 1;
    pavimentoMaterial.bumpTexture.vScale = 5;
    
    pavimentoVis.material = pavimentoMaterial;
    objects.push(pavimentoVis);

    //Vero pavimento (invisible, usato per la navigation mesh)
    var pavimento = BABYLON.Mesh.CreateGround("pavimento", widthFloor, depthFloor, 0, scene);
    pavimento.isVisible = false;
    objects.push(pavimento);
    navMeshObjects.push(pavimento);
    mirrorObjects.push(pavimento);



    // OTTIMIZZAZIONI
    objects.forEach(ob => {
        ob.freezeWorldMatrix();
        ob.doNotSyncBoundingInfo = true;

        let ch = ob.getChildMeshes();
        for (let i = 0; i < ch.length; i++) {
            ch[i].freezeWorldMatrix();
            ch[i].doNotSyncBoundingInfo = true;
        }
    });



    // Rimuovi physical light falloff da tutti i materiali. Serve perche' se no i mobili non vedono la spotlight.
    // Inoltre, questo codice aggiunge il glow effect alle finestre
    scene.materials.forEach(mat => {
        mat.freeze();           // ottimizza gli shader dicendo che il materiale non cambiera'
        mat.usePhysicalLightFalloff = false;

        if (mat._uniformBuffer._name == "glass") {
            mat.emissiveColor = new BABYLON.Color3(4/255, 4/255, 109/255);
        }
        else if (mat._uniformBuffer._name == "carpet") {
            mat.albedoColor = new BABYLON.Color3(145/255, 60/255, 70/255).toLinearSpace();
        }
    });

    return {"objects":objects, "navMeshObjects":navMeshObjects, "mirrorObjects":mirrorObjects};
}




