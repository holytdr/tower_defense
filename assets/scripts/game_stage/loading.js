// a script to control loading behavior
import global from '../utils/global'

cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label,
        },
        progressBar: {
            default: null,
            type: cc.ProgressBar
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        this.dot = 0;
        this.labelTimer = 0.;
        this.labelInterval = 0.5;
        this.labelText = global.messages.get("LOADING");
        this.label.string = this.labelText;
    },

    update: function (dt) {
        this.labelTimer += dt;
        if (this.labelTimer >= this.labelInterval) {
            this.labelTimer = 0;
            this.dot = (this.dot + 1)%4;
            this.label.string = this.labelText + ".".repeat(this.dot);
        }
    },

    setProgress: function (progress) {
        this.progressBar.progress = progress;
        return progress >= 1.0;
    }
});
