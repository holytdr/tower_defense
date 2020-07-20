const Messenger = {
    lang: "zh-cn",

    load: function (url, callBack = function () {}) {
        // do not repeatedly load the same resource
        if (this.url && this.url == url) { return; }
        cc.resources.load(url, cc.JsonAsset, (err, asset) => {
            if (err) {
                cc.log(err);
            } else {
                this.data = asset.json;
                this.setLanguage(this.lang);
                this.url = url;
            }
            callBack(err, this.data);
        })
    },

    setLanguage: function (lang) {
        if (this.data && this.data.hasOwnProperty(lang)) {
            this.mes = this.data[lang];
        } else {
            console.log("cannot find language data: " + lang);
        }
    },

    get: function (key) {
        if (!this.mes || !this.mes.hasOwnProperty(key)) { return key; }
        return this.mes[key];
    }

};

export default Messenger;
// module.exports = Messenger;
