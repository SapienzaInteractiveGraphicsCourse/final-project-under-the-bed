
async function createBedroom() {

    var alphaValue = 1;

    var loadModels = true;
    if (loadModels) alphaValue = 0;     // da mettere a 0. Con valori > 0 per vedere dove sono i mobili

    var objects = [];
    var navMeshObjects = [];

    // Messe qui cosi' possiamo usare valori diversi dentro createHallway e createLivingroom
    const widthFloor = 20;
    const depthFloor = 10;
    const a = new BABYLON.Vector3(-widthFloor / 2, 0, -depthFloor / 2);
    const b = new BABYLON.Vector3(widthFloor / 2, 0, -depthFloor / 2);
    const c = new BABYLON.Vector3(widthFloor / 2, 0, depthFloor / 2);
    const d = new BABYLON.Vector3(-widthFloor / 2, 0, depthFloor / 2);

    var w = createWall(a, b, 0);        // il terzo parametro e' un indice usato per dare nomi diversi ai muri
    objects.push(w[0]);
    objects.push(w[1]);
    objects.push(w[2]);
    w = createWall(b, c, 1);
    objects.push(w[0]);
    objects.push(w[1]);
    objects.push(w[2]);
    w = createWall(c, d, 2);
    objects.push(w[0]);
    objects.push(w[1]);
    objects.push(w[2]);
    w = createWall(d, a, 3);
    objects.push(w[0]);
    objects.push(w[1]);
    objects.push(w[2]);


    // Materiale generico, assegnato alle mesh invisibili usate per i mobili
    var genericMaterial = new BABYLON.StandardMaterial("genericMaterial", scene);
    genericMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.2, 0.2);
    genericMaterial.alpha = alphaValue;

    var result;


    // VERSIONE LIGHT
    var lightVersion = document.getElementById("lighter").checked;


    /***** CARTELLI con scritte *****/

    if (document.getElementById("hints").checked) {
        // Cartello 1 (press C to crouch)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/cartelli/", "cartello1.glb", scene);
        var cart1 = result.meshes[0];
        cart1.scaling = new BABYLON.Vector3(-1.4, 1.2, 1.2);
        cart1.position = new BABYLON.Vector3(0.5, 2.2, 4.55);
        cart1.rotationQuaternion = null;
        cart1.rotation.y = -Math.PI/2;
        cart1.rotation.y += Math.PI/6;
        setPickableChildren(cart1, false);
        objects.push(cart1);
        cart1.setParent(scene.getMeshByName("wall2"));

        // Cartello 2 (shift + spacebar to jump)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/cartelli/", "cartello2.glb", scene);
        var cart2 = result.meshes[0];
        cart2.scaling = new BABYLON.Vector3(-1.4, 1.2, 1.2);
        cart2.position = new BABYLON.Vector3(-8.8, 3.2, -4.9);
        cart2.rotationQuaternion = null;
        cart2.rotation.y = Math.PI/2;
        setPickableChildren(cart2, false);
        objects.push(cart2);
        cart2.setParent(scene.getMeshByName("wall0"));

        // Cartello 3 (q to pick torch etc)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/cartelli/", "cartello3.glb", scene);
        var cart3 = result.meshes[0];
        cart3.scaling = new BABYLON.Vector3(-1.4, 1.2, 1.2);
        cart3.position = new BABYLON.Vector3(-2.1, 1, 0.9);
        cart3.rotationQuaternion = null;
        setPickableChildren(cart3, false);
        objects.push(cart3);

        // Cartello 4 (v to peek)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/cartelli/", "cartello4.glb", scene);
        var cart4 = result.meshes[0];
        cart4.scaling = new BABYLON.Vector3(-1.4, 1.2, 1.2);
        cart4.position = new BABYLON.Vector3(0.6, 4.5, -4.7);
        cart4.rotationQuaternion = null;
        cart4.rotation.y = Math.PI/2;
        cart4.rotation.y -= Math.PI/10;
        setPickableChildren(cart4, false);
        objects.push(cart4);
        cart4.setParent(scene.getMeshByName("wall0"));

        // Cartello 11 (hit a monster from behind)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/cartelli/", "cartello11.glb", scene);
        var cart11 = result.meshes[0];
        cart11.scaling = new BABYLON.Vector3(-1.4, 1.2, 1.2);
        cart11.position = new BABYLON.Vector3(3.5, 3.2, 4.9);
        cart11.rotationQuaternion = null;
        cart11.rotation.y = -Math.PI/2;
        //cart11.rotation.y += Math.PI/6;
        setPickableChildren(cart11, false);
        objects.push(cart11);
        cart11.setParent(scene.getMeshByName("wall2"));
        
    }

    

    /***** MOBILI *****/

    //Letto
    var letto = BABYLON.MeshBuilder.CreateBox("letto", { width: 3, depth: 6, height:0.7 }, scene);
    letto.position.y += 0.5;
    letto.material = genericMaterial;
    letto.position.z = -a.z - 3;
    letto.position.x = a.x + 1.6;
    objects.push(letto);
    navMeshObjects.push(letto);

    if (loadModels) {
        // Letto (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "letto.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "letto-texture.glb", scene);
        var lettoModel = result.meshes[0];
        lettoModel.scaling = new BABYLON.Vector3(5, 3, 5);
        lettoModel.position = new BABYLON.Vector3(a.x + 5, 0, -a.z - 6);
        objects.push(lettoModel);
    }

    if (loadModels) {
        // Quadri sopra al letto (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "quadri1.glb", scene);
        var quadriModel = result.meshes[0];
        quadriModel.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
        quadriModel.position = new BABYLON.Vector3(-9.93, -1.8, 1.4);
        quadriModel.rotationQuaternion = null;
        quadriModel.rotation.y = Math.PI/2;
        setPickableChildren(quadriModel, false);
        objects.push(quadriModel);

        quadriModel.setParent(scene.getMeshByName("wall3"));
    }

    // Comodino
    var comodino = BABYLON.MeshBuilder.CreateBox("comodino", { width: 1.3, depth: 1, height: 2.7 }, scene);
    comodino.position = new BABYLON.Vector3(-6.05, 1.35, 4.1);
    comodino.material = genericMaterial;
    objects.push(comodino);
    navMeshObjects.push(comodino);

    if (loadModels) {
        // Comodino (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "comodino.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "comodino-texture.glb", scene);
        var comodinoModel = result.meshes[0];
        comodinoModel.scaling = new BABYLON.Vector3(4.5, 4.5, 4.5);
        comodinoModel.position = new BABYLON.Vector3(-5.5, 0, 3.7);
        objects.push(comodinoModel);
    }

    if (loadModels) {
        // Orsetto peluche (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "orsetto.glb", scene);
        var orsettoModel = result.meshes[0];
        orsettoModel.scaling = new BABYLON.Vector3(0.7, 0.7, -0.7);
        orsettoModel.position = new BABYLON.Vector3(-2.4, 0, -4.55);
        orsettoModel.rotationQuaternion = null;
        orsettoModel.rotation.y = Math.PI;
        orsettoModel.rotation.y += Math.PI/6;
        setPickableChildren(orsettoModel, false);
        objects.push(orsettoModel);
    }
    
    // Tappeto (modello)
    if (loadModels) {
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "tappeto2.glb", scene);
        var tappetoModel = result.meshes[0];
        tappetoModel.scaling = new BABYLON.Vector3(2.3, 2.6, 2.6);
        tappetoModel.position = new BABYLON.Vector3(-6.5, 0, -0.7);
        tappetoModel.rotationQuaternion = null;
        tappetoModel.rotation.y = -Math.PI/2;
        setPickableChildren(tappetoModel, false);            // se no per salirci sopra deve saltare
        objects.push(tappetoModel);
    }
    

    //Cassettiera
    var cassettiera = BABYLON.MeshBuilder.CreateBox("cassettiera", { width: 4.2, depth: 2, height: 2.5 }, scene);
    cassettiera.position.y = 1.25;
    cassettiera.material = genericMaterial;
    cassettiera.position.z = -d.z + 1;
    cassettiera.position.x = d.x + 4.15;
    objects.push(cassettiera);
    navMeshObjects.push(cassettiera);
    
    if (loadModels) {
        //Cassettiera (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "cassettiera.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "cassettiera-texture.glb", scene);
        var cassettieraModel = result.meshes[0];
        cassettieraModel.scaling = new BABYLON.Vector3(5.1, 6, 7);
        cassettieraModel.position = new BABYLON.Vector3(-7.85, 0, -3.05);
        cassettieraModel.rotationQuaternion = null;
        objects.push(cassettieraModel);
    }

    //Giocattoli su cassettiera
    var giocattoli = BABYLON.MeshBuilder.CreateBox("cassettiera", { width: 2.8, depth: 0.6, height: 0.8 }, scene);
    giocattoli.position = new BABYLON.Vector3(-6.05, 2.9, -4.4);
    giocattoli.material = genericMaterial;
    objects.push(giocattoli);

    if (loadModels) {
        //Giocattoli su cassettiera (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "giocattoli.glb", scene);
        var giocattoliModel = result.meshes[0];
        giocattoliModel.scaling = new BABYLON.Vector3(1.5, 1.5, -1.5);
        giocattoliModel.position = new BABYLON.Vector3(-5.5, 2.48, -4.5);
        giocattoliModel.rotationQuaternion = null;
        giocattoliModel.rotation.y = Math.PI/2;
        objects.push(giocattoliModel);

        giocattoliModel.setParent(cassettieraModel);
    }



    // Scatola giocattoli
    var toys = BABYLON.MeshBuilder.CreateBox("toys", { width: 1.8, depth: 1.5, height: 1.6 }, scene);
    toys.position = new BABYLON.Vector3(-9, 0.8, -3.75);
    toys.material = genericMaterial;
    toys.rotation.y = Math.PI/8;
    objects.push(toys);
    navMeshObjects.push(toys);
    if (loadModels) {
        //Scatola giocattoli (modello)
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "toy-box.glb", scene);
        var toysModel = result.meshes[0];
        toysModel.scaling = new BABYLON.Vector3(-2.2, 2.2, 2.2);
        toysModel.position = new BABYLON.Vector3(-9, 0, -3.6);
        toysModel.rotationQuaternion = null;
        toysModel.rotation.y = Math.PI/8;
        objects.push(toysModel);
    }


    //Armadio
    var armadio = BABYLON.MeshBuilder.CreateBox("armadio", { width: 1.94, depth: 5.8, height: 4 }, scene);
    armadio.position.y += 2;
    armadio.material = genericMaterial;
    armadio.position.z = -d.z + 3;
    objects.push(armadio);
    navMeshObjects.push(armadio);

    if (loadModels) {
        //Armadio (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "armadio.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "armadio-texture.glb", scene);
        var armadioModel = result.meshes[0];
        armadioModel.scaling = new BABYLON.Vector3(12.5, 7.8, 12.2);
        armadioModel.position = new BABYLON.Vector3(3.15, 2, -3.4);
        armadioModel.rotationQuaternion = null;
        armadioModel.rotation.y = - Math.PI/2;
        objects.push(armadioModel);
    }

    //Scrivania
    var scrivania = BABYLON.MeshBuilder.CreateBox("scrivania", { width: 1.6, depth: 4.1, height: 0.85 }, scene);
    scrivania.position.y += 1.9;
    scrivania.material = genericMaterial;
    scrivania.position.z = +2.8;
    scrivania.rotation.y = Math.PI / 6;
    scrivania.position.x = 2;
    objects.push(scrivania);
    // pezzo sotto della scrivania, serve per la navigation mesh
    var scrivaniaSotto = BABYLON.MeshBuilder.CreateBox("scrivaniaSotto", { width: 1.6, depth: 4.1, height: 0.85 }, scene);
    scrivaniaSotto.position = scrivania.position.clone();
    scrivaniaSotto.position.y = 0.425;
    scrivaniaSotto.material = new BABYLON.StandardMaterial("libreriaMaterial", scene);
    scrivaniaSotto.material.diffuseColor = new BABYLON.Color3(1, 1, 0);
    scrivaniaSotto.material.alpha = alphaValue;
    scrivaniaSotto.rotation.y = Math.PI / 6;
    scrivaniaSotto.isPickable = false;      // se no la bambina non puo' andare sotto al tavolo
    objects.push(scrivaniaSotto);
    navMeshObjects.push(scrivaniaSotto);

    if (loadModels) {
        // Scrivania (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "scrivania.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "scrivania-texture.glb", scene);
        var scrivaniaModel = result.meshes[0];
        scrivaniaModel.scaling = new BABYLON.Vector3(7.5, 6, 6.8);
        scrivaniaModel.position = new BABYLON.Vector3(0.45, 0, 1.45);
        scrivaniaModel.rotationQuaternion = null;
        scrivaniaModel.rotation.y = - Math.PI/2 + Math.PI / 6 ;
        objects.push(scrivaniaModel);
    }


    //Sedia
    var sedia = BABYLON.MeshBuilder.CreateBox("sedia", { width: 1.3, depth: 1.5, height: 1.45 }, scene);
    sedia.position.y += 0.5;
    sedia.material = genericMaterial;
    sedia.position.z = -b.z - 0.9;
    sedia.position.x = b.x - 1.2;
    sedia.rotation.y = -Math.PI/2 - 0.4;
    objects.push(sedia);
    navMeshObjects.push(sedia);

    if (loadModels) {
        // Sedia (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "sedia.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "sedia-texture.glb", scene);
        var sediaModel = result.meshes[0];
        sediaModel.scaling = new BABYLON.Vector3(6, 5, 6);
        sediaModel.position = new BABYLON.Vector3(b.x - 1.5, 0, -b.z - 1.7);
        sediaModel.rotationQuaternion = null;
        sediaModel.rotation.y = -Math.PI/2 - 0.4;
        objects.push(sediaModel);
    }

    if (loadModels) {
        // Quadro accanto alla libreria
        result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "quadro2.glb", scene);
        var quadro2Model = result.meshes[0];
        quadro2Model.scaling = new BABYLON.Vector3(1.6, 1.6, 1.6);
        quadro2Model.position = new BABYLON.Vector3(9.93, 0.6, 1.75);
        quadro2Model.rotationQuaternion = null;
        quadro2Model.rotation.y = -Math.PI/2;
        setPickableChildren(quadro2Model, false);
        objects.push(quadro2Model);

        quadro2Model.setParent(scene.getMeshByName("wall1"));
    }

    //Libreria
    var libreria = BABYLON.MeshBuilder.CreateBox("libreria", { width: 1.65, depth: 6, height: 4 }, scene);
    libreria.position.y += 2;
    libreria.material = genericMaterial;
    libreria.position.z = b.z + 3;
    libreria.position.x = b.x - 1.5 / 2;
    objects.push(libreria);
    navMeshObjects.push(libreria);
    
    if (loadModels) {
        //Libreria (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "libreria.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/bedroom/", "libreria-texture.glb", scene);
        var libreriaModel = result.meshes[0];
        libreriaModel.scaling = new BABYLON.Vector3(-5.6, 5.05, 5.5);
        libreriaModel.position = new BABYLON.Vector3(8.5, 0, 0);
        libreriaModel.rotationQuaternion = null;
        libreriaModel.rotation.y = -Math.PI/2;
        objects.push(libreriaModel);
    }

    //Finestra 1 (modello)
    if (loadModels) {
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "finestra-larga.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "finestra-larga-texture.glb", scene);
        var finestraModel = result.meshes[0];
        finestraModel.scaling = new BABYLON.Vector3(3, 3.2, 3);
        finestraModel.position = new BABYLON.Vector3(-4.5, 0.2, 4.95);
        finestraModel.rotationQuaternion = null;
        objects.push(finestraModel);
    }

    //Finestra 2 (modello)
    if (loadModels) {
        var finestraModel2 = finestraModel.clone();
        finestraModel2.position = new BABYLON.Vector3(5, 0.2, 4.95);
        objects.push(finestraModel2);
    }
    
    // Rendi le finestre "figlie" della parete a cui sono attaccate. Cosi' quando la parete sparisce, spariscono anche loro:
    if (loadModels) {
        let wall = scene.getMeshByName("wall2");
        finestraModel.setParent(wall);
        finestraModel2.setParent(wall);
    }


    //Porta
    var porta = BABYLON.MeshBuilder.CreateBox(DOOR_BEDROOM_TO_HALLWAY, { width: 2.1, depth: 0.3, height: 3.3 }, scene);
    porta.position = new BABYLON.Vector3(6, 1.65, -4.85);
    porta.material = genericMaterial;
    objects.push(porta);
    navMeshObjects.push(porta);

    if (loadModels) {
        //Porta (modello)
        if (lightVersion)
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "porta.glb", scene);
        else
            result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://sapienzainteractivegraphicscourse.github.io/final-project-under-the-bed/models/furniture/", "porta-texture.glb", scene);
        var portaModel = result.meshes[0];
        portaModel.scaling = new BABYLON.Vector3(4, 3.2, 2.2);
        portaModel.position = new BABYLON.Vector3(5, 0, -4.75);
        portaModel.rotationQuaternion = null;
        objects.push(portaModel);
    }



    //Pavimento
    var pavimento = BABYLON.Mesh.CreateGround("pavimento", widthFloor, depthFloor, 0, scene);
    var pavimentoMaterial = new BABYLON.StandardMaterial("pavimentoMaterial");
    
    // Color texture:
    pavimentoMaterial.diffuseTexture = new BABYLON.Texture("textures/wood.png", scene);
    pavimentoMaterial.diffuseTexture.uScale = 3.5;
    pavimentoMaterial.diffuseTexture.vScale = 1.5;
    
    // Bump texture:
    pavimentoMaterial.bumpTexture = new BABYLON.Texture("textures/woodBump.png", scene);
    pavimentoMaterial.bumpTexture.uScale = 3.5;
    pavimentoMaterial.bumpTexture.vScale = 1.5;
    
    pavimento.material = pavimentoMaterial;
    objects.push(pavimento);
    navMeshObjects.push(pavimento);



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

    return {"objects":objects, "navMeshObjects":navMeshObjects};
}




