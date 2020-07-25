// a script for controlling battle

const EffectsController = function (obj) {

    obj.data = null;
    obj.numRes = 1;
    obj.numLoad = 0;
    
    obj.init = function (url = "configs/effects", force = false) {
        if ((this.url == url) && !force) { return; }

        this.materials = {
            sprite: cc.Material.createWithBuiltin(cc.Material.BUILTIN_NAME.SPRITE),
            gray: cc.Material.createWithBuiltin(cc.Material.BUILTIN_NAME.GRAY_SPRITE),
            unlit: cc.Material.createWithBuiltin(cc.Material.BUILTIN_NAME.UNLIT),
        }

        cc.resources.load(url, cc.JsonAsset, (err, asset) => {
            if (err) { cc.log(err); return; }
            this.data = asset.json;
            this.url = url;
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

    obj.apply = function (render, eff, duration = -1) {
        switch (eff) {
        case "attacked":
            if (duration < 0) {
                duration = this.data["attacked"].duration;
            }
            render.setMaterial(0, this.materials["attacked"]);
            render.scheduleOnce(() => { render.setMaterial(0, this.materials["sprite"]); }, duration);
        default:
            break;
        }

    }

    return obj;
}

export default EffectsController;