// a script for controlling battle

const EffectsController = function (obj) {

    obj.data = null;
    obj.materials = {};
    obj.numRes = 1;
    obj.numLoad = 0;

    obj.init = function (url = "configs/effects") {
        cc.resources.load(url, cc.JsonAsset, (err, asset) => {
            if (err) { cc.log(err); return; }
            this.data = asset.json;
            this.numRes = 1 +  Object.keys(this.data).length;
            this.numLoad = 1;
            this.loadResources();
        });
    };

    obj.loadResources = function () {
        // load materials
        for (let key of Object.keys(this.data)) {
            cc.resources.load("materials/" + key, cc.Material, (err, mat) => {
                if (err) { cc.log(err); return; }
                this.materials[key] = mat;
                this.numLoad ++;
            });
        }
    };

    obj.ready = function () {
        return this.numLoad >= this.numRes;
    };

    return obj;
}

export default EffectsController;