// util class containing results of PossibleSight Method
class sigthInfo {
    constructor(inSight, direction, vecFrom){
        this.inSight = inSight;
        this.direction = direction;
        this.vecFrom = vecFrom;
    }
}

var rayHelperC;

// method that checks if two objects are close to a certain distance and no objects are in bewteen them
function isInCloseSight(observer, lookedAt, excused, distance, adjustHeight = null){
    if(adjustHeight != null){
        var corPos = observer.absolutePosition.clone();
        corPos.y += adjustHeight;
    }else
        var corPos = observer.absolutePosition.clone();
    var vecFrom = lookedAt.absolutePosition.subtract(corPos);
    var vLength = vecFrom.length();
    var vecFrom = BABYLON.Vector3.Normalize(vecFrom);
    if(observer.name == "bambina"){
        observer.getChildMeshes().forEach(e =>{
            excused.push(e);
        });
    }
    var lookedAtList = [lookedAt];
    if(lookedAt.name == "torchMain"){
        lookedAt.getChildMeshes().forEach(e =>{
            lookedAtList.push(e);
        });
    }
    if(lookedAt.name == "chiave0"){
        lookedAt.getChildMeshes().forEach(e =>{
            lookedAtList.push(e);
        });
    }

    if(vLength <= distance){
        excused.push(observer);
        //Ray
        var ray = new BABYLON.Ray(corPos, vecFrom, distance);
        var hits = scene.multiPickWithRay(ray);

        if (hits){
            hits = sortPickedMeshesByDistance(hits, 0);
            for (var i = hits.length -1; i >= 0; i--) {
                if(lookedAtList.includes(hits[i].pickedMesh)){      
                    return true;
                }
            }
        }
    }  
    return false;
    
}
var rayHelper;
// method that checks if, given two objects and a forward direction of the observer, the lookedAt is in possible sight
function isInPossibleSight(observer, lookedAt, forward, targetCos){
    
    var direction = directionFrom(forward, observer);
    var vecFrom = BABYLON.Vector3.Normalize(lookedAt.absolutePosition.subtract(observer.absolutePosition));
    var cos = cosBetween(direction, vecFrom);
    
    var inS = false;
    if(cos >= targetCos){
        inS = true;
    }
    var inSight = new sigthInfo(inS, direction, vecFrom);
    return inSight;
}

function cosBetween(vector1, vector2){
    var cos = BABYLON.Vector3.Dot(vector1, vector2);
    return cos;
}

//calculate the actual direction vector
function directionFrom(forward, mesh){
    forward = vecToLocal(forward, mesh);
    var direction = forward.subtract(mesh.absolutePosition);
    direction = BABYLON.Vector3.Normalize(direction);
    return direction;
}

//calculate vector relative to mesh position
function vecToLocal(vector, mesh){
    var m = mesh.getWorldMatrix();
    var v = BABYLON.Vector3.TransformCoordinates(vector, m);
    return v;		 
}
function removeSubstring(originalString, substringToRemove) {
    return originalString.replace(substringToRemove, "");
}

  // sort the picked mesh array according to distance (closest mesh first)
function sortPickedMeshesByDistance(hit, mode) {
    if(mode == 0){
        return hit.sort(function(a, b) { //DESC
            return parseFloat(b.distance) - parseFloat(a.distance);
        });
    }else{
        return hit.sort(function(a, b) { //ASC
            return parseFloat(a.distance) - parseFloat(b.distance);
        });
    }
}
    
        
function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function updateImportedBoundingBox(parent){
    let childMeshes = parent.getChildMeshes();

    let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
    let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;

    for(let i=0; i<childMeshes.length; i++){
        let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
        let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;

        min = BABYLON.Vector3.Minimize(min, meshMin);
        max = BABYLON.Vector3.Maximize(max, meshMax);
    }

    parent.setBoundingInfo(new BABYLON.BoundingInfo(min, max));
    return parent;
}

function setBoundingBox(mesh, height, lenght, depth){
    mesh.setBoundingInfo(new BABYLON.BoundingInfo(new BABYLON.Vector3(lenght,lenght,lenght), new BABYLON.Vector3(height,height,height)));
    return mesh;
}



function showMessage(text, milliseconds) {
    
    // Metti il testo nella casella e mostra l'elemento
    document.getElementById("custom-text").innerHTML = text;
    document.getElementById("text-box").removeAttribute("hidden");
    
    // Dopo un tot di tempo, nascondi di nuovo l'elemento
    setTimeout(function() {
        document.getElementById("text-box").setAttribute("hidden", null);
    }, milliseconds);
}

function showMessageFixed(text) {
    // Metti il testo nella casella e mostra l'elemento
    document.getElementById("custom-text").innerHTML = text;
    document.getElementById("text-box").removeAttribute("hidden");
}

function hideMessage() {
    document.getElementById("text-box").setAttribute("hidden", null);
}


// Questa serve a rendere pickable/non-pickable le mesh importate, che sono sempre costituite da piu' parti
function setPickableChildren(mesh, bool) {
    mesh.isPickable = bool;
    let ch = mesh.getChildMeshes();
    for (let i = 0; i < ch.length; i++)
        ch[i].isPickable = bool;
}

// Questa serve a rendere visibili/invisibili le mesh importate, che sono sempre costituite da piu' parti
function setVisibilityChildren(mesh, value) {
    mesh.visibility = value;
    let ch = mesh.getChildMeshes();
    for (let i = 0; i < ch.length; i++)
        ch[i].visibility = value;
}

// Per aggiornare il numero di vite sullo schermo
function showLives(number) {
    let s = "LIVES:&nbsp;";
    for (let i=0; i<number; i++)
        s += " &#9825;"
    document.getElementById("lives").innerHTML = s;
}

function showHoldingKey() {
    let s = '<img width="15px" height="15px" style="position:relative; top:2px; left:5px;" src="images/key.png"/>'
    document.getElementById("key_symbol").innerHTML = s;
    document.getElementById("key_symbol").removeAttribute("hidden");
}


function showHoldingTorch(bool) {
    if (bool) {
        let s = '<img width="15px" height="15px" style="position:relative; top:2px; left:5px;" src="images/torch.png"/>'
        document.getElementById("torch_symbol").innerHTML = s;
        document.getElementById("torch_symbol").removeAttribute("hidden");
    }
    else {
        document.getElementById("torch_symbol").setAttribute("hidden", null);
    }
}

