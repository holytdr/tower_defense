// game layer script
import global from '../utils/global'

cc.Class({
    extends: cc.Component,
    properties: {
		ui: {
			default: null,
			type: cc.Node,
		},
		loading: {
			default: null,
			type: cc.Node,
		}
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		this.started = false;
		this.loading.active = true;
		// load configurations
		cc.resources.loadDir("configs", cc.JsonAsset, (err, assets) => {
			if (err) { cc.log(err); return; }
			this.configs = {};
			for (let asset of assets) {
				this.configs[asset.name] = asset.json;
			}
			this.loadLevel(global.currLevel, this.configs['levels'][global.currLevel], this.configs['towers']);
		});
		global.battle.game = this;
	},

	loadLevel: function (lvl, levelConf, towerConf) {
		this.setNumResources(levelConf, towerConf);
		this.loadEnemies(levelConf);
		this.loadTowers(towerConf);
		// instantiate level
		cc.resources.load("levels/level_" + lvl, (err, prefab) => {
			if (err) { cc.log(err); return; }
			let level = cc.instantiate(prefab);
			this.currLevel = level;	
			this.numLoad += 1;
		});
	},

	getLoadProgress: function () {
		if (!this.numLoad || !this.numRes) {
			return 0.;
		}
		return this.numLoad/this.numRes;
	},

	setNumResources(levelConf, towerConf) {
		// prefab
		this.numRes = 1;
		this.numLoad = 0;
		// number of sprites to be load (2 = texture + action)
		this.numRes += levelConf.waves.length*2;

		// number of towers to be load
		for (var tid of Object.keys(towerConf)) {
			let tower = towerConf[tid];
			this.numRes += tower.levels.length*2;
			// bullet sprites
			for (let level of tower.levels) {
				this.numRes += level.hasOwnProperty("bullet_sprite") ? 1 : 0;
			}
		}
	},

	startLevel: function (time) {
		let levelData = this.configs["levels"][global.currLevel];
		let towerData = this.configs['towers'];
		this.currLevel.getComponent("level").configure(levelData, this.monsterRes, towerData);
		this.currLevel.opacity = 0;
		this.currLevel.parent = this.node;
		this.ui.getComponent("game_ui").countDown(time, 0.5);
		cc.tween(this.currLevel).to(0.5, {opacity: 255}).start();
		cc.tween(this.ui).to(0.5, {opacity: 255}).start();
	},

	loadEnemies: function (level) {
		this.monsterRes = {};
		let waves = level.waves;
		for (let wave of waves) {
			let sprite = wave.monster.sprite;
			if (!this.monsterRes.hasOwnProperty(sprite)) {
				this.monsterRes[sprite] = {};
				this.loadAnimation(this.monsterRes[sprite], "sprites/" + sprite);
			}
		}
	},

	loadTowers: function (towers) {
		for (var tid of Object.keys(towers)) {
			let tower = towers[tid];
			for (let level of tower.levels) {
				this.loadAnimation(level, "sprites/" + level.sprite);
				// bullet sprite
				if (level.hasOwnProperty("bullet_sprite")) {
					cc.resources.load('textures/' + level.bullet_sprite, cc.SpriteFrame, (err, frame) => {
						if (err) { cc.log(err); return; }
						level.bulletSprite = frame;
						this.numLoad += 1;
					});
				}
			}
		}
	},

	loadAnimation: function (container, path) {
		// animation actions
		cc.resources.load(path, cc.JsonAsset, (err, res) => {
			this.numLoad += 1;
			if (err) {
				cc.log(err + ": " + path);
			} else {
				container.frameRects = res.json.frame_rects;
				container.animations = res.json.animations;
			}
		});

		// animation texture
		cc.resources.load(path, cc.Texture2D, (err, tex) => {
			this.numLoad += 1;
			if (err) {
				cc.log(err + ": " + path);
			} else {
				container.texture = tex;
			}
		});
	},

    start () {

    },

    update (dt) {
		if (!this.started) {
			let progress = this.getLoadProgress();
			if (this.loading.getComponent("loading").setProgress(progress)) {
				this.started = true;
				cc.tween(this.loading).to(1.0, {opacity: 0, active: false}).start();
				this.scheduleOnce(() => {
					this.startLevel(5);
				}, 0.5);
			}
		}
	},
});
