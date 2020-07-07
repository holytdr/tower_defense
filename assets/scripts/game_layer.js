// game layer script

cc.Class({
    extends: cc.Component,

    properties: {
		levelPrefabs: {
			default: [],
			type: cc.Prefab
		},
		levelsConfig: {
			default: null,
			type: cc.JsonAsset,
		},
		enemiesConfig: {
			default: null,
			type: cc.JsonAsset,
		},
		towersConfig: {
			default: null,
			type: cc.JsonAsset,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		let level = cc.instantiate(this.levelPrefabs[0]);
		level.getComponent("level").configure(this.levelsConfig.json[level.name], this.enemiesConfig.json, this.towersConfig.json);
		level.parent = this.node;
	},

    start () {

    },

    // update (dt) {},
});
