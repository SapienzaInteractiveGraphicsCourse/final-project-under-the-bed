class BedSpotlight{

    static activeNumber;
    id;
    #spotlight;
    #shadowGenerator;

    constructor(origin, direction, angle, exponent, range){
        this.id = this.activeNumber;
        this.activeNumber++;
        this.origin = origin;
        this.direction = direction;
        this.angle = angle;
        this.exponent = exponent;
        this.#spotlight = new BABYLON.SpotLight("torchLight" + this.id, origin, direction, angle, exponent);
        this.#spotlight.range = range;

        // COLORE spotlight:
        this.#spotlight.diffuse = new BABYLON.Color3(1, 1, 0.8);
        this.#spotlight.specular = new BABYLON.Color3(1, 1, 1);

        this.#spotlight.shadowMinZ = Number.MIN_VALUE;

        //Shadows
        this.#shadowGenerator = new BABYLON.ShadowGenerator(1024, this.#spotlight);
        this.#shadowGenerator.forceBackFacesOnly = true;
        this.#shadowGenerator.useOpacityTextureForTransparentShadow = true;
        this.#shadowGenerator.depthScale = 2048;
    }

    setParent(parent){
        this.#spotlight.parent = parent;
    }

    addMeshToShadow(mesh){
        this.#shadowGenerator.addShadowCaster(mesh, true);
    }

    resetShadows(){
        this.#shadowGenerator.dispose();
        this.#shadowGenerator = new BABYLON.ShadowGenerator(1024, this.#spotlight);
        this.#shadowGenerator.useExponentialShadowMap = true;
        this.#shadowGenerator.forceBackFacesOnly = true;
        this.#shadowGenerator.usePoissonSampling = true;
        this.#shadowGenerator.depthScale = 2048;
    }

    dispose(){
        this.#spotlight.dispose();
    }

    getSpotlight(){
        return this.#spotlight;
    }

    setIntensity(power){
        this.#spotlight.intensity = power;
    }

}



