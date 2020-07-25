// game world script

cc.Class({
    extends: cc.Component,

    properties: {
		gameLayerNode: {
			default: null,
			type: cc.Node,
		},
		
		gameUINode: {
			default: null,
			type: cc.Node,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		// place holder
		// this affects the schedulers
		// cc.director.getScheduler().setTimeScale(1.0);
	},

    start () {
		// place holder
    },

    // update (dt) {},
});
