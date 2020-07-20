// a script to control start page
import global from './utils/global'

cc.Class({
    extends: cc.Component,

    properties: {
        background: {
            default: null,
            type: cc.Sprite,
        },
        label: {
            default: null,
            type: cc.Label,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        this.node.width = cc.winSize.width;
        this.node.height = cc.winSize.height;
        global.messages.load("configs/messages", () => {
            this.enableSceneChange();
        });
    },

    enableSceneChange: function () {
        this.label.node.active = true;
        this.label.string = global.messages.get("WELCOME");
        this.labelOpacity = this.label.node.opacity;
        cc.tween(this.label.node)
            .to(2.0, { opacity: 0 })
            .to(2.0, { opacity: this.labelOpacity })
            .union().repeatForever()
            .start();
        this.node.on(cc.Node.EventType.TOUCH_START, (event)=>{
            cc.director.loadScene("world_map", (err, scene) => {
                if (err) { cc.log(err); return; }
                 cc.director.runScene(scene);
            });
        });
    },

    start () {

    },

    // update (dt) {},
});
