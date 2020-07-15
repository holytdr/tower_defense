// level script
import global from './global'


cc.Class({
    extends: cc.Component,

    properties: {
		towerPrefab: {
			default: null,
			type: cc.Prefab
		},
		enemyPrefab: {
			default: null,
			type: cc.Prefab
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		this.bases = this.node.getChildByName("bases").getChildren();
		this.routes = this.node.getChildByName("routes").getChildren();
		// pass this script to the base
		for (var base of this.bases) {
			base.getComponent("base").levelScript = this;
			base.opacity = 0;
		}
		for (var route of this.routes) {
			route.active = false;
		}
		global.event.register("level_start", this.levelStart.bind(this));
		global.event.register("enemy_goal", this.enemyGoal.bind(this));
		global.battle.field = this;
	},
	
	configure: function (levelConf, enemyConf, towerConf) {
		this.life = levelConf.life;
		this.wavesData = levelConf.waves;
		this.enemiesData = enemyConf;
		this.towersData = towerConf;
		this.enemiesList = [];
		this.resources = [0];
		this.resourcesRes = [0];
	},
	
	closeMenu: function () {
		for (var base of this.bases) {
			base.getComponent("base").closeMenu();
		}
	},
	
	onDestroy: function () {
		global.event.clear();
	},
	
	levelStart: function() {
		this.wave = 0;
		this.waveTimer = 0;
		this.enemyCount = 0;
		// cc.log(JSON.stringify(this.wavesData));
		// cc.log(JSON.stringify(this.enemiesData));
		this.currWave = this.wavesData[this.wave];
	},
	
	addEnemy: function () {
		if (this.enemyCount < this.currWave.count) {
			let enemy = cc.instantiate(this.enemyPrefab);
			let enemyData = this.enemiesData[this.currWave.id];
			let enemyScript = enemy.getComponent("enemy");

			// register enemy with an ID
			let nid = this.enemiesList.length;
			enemyScript.configure(this.wave, nid, enemyData, this.routes);

			// add an event for removing this enemy
			this.enemiesList.push(enemyScript);
			global.event.register("enemy" + nid, (nid) => { this.enemiesList[nid] = undefined; });
			// increment of count
			enemy.parent = this.node;
			this.enemyCount++;
		} else {
			this.wave++;
			this.enemyCount = 0;
			// check for end of waves
			if (this.wave < this.wavesData.length) {
				this.currWave = this.wavesData[this.wave];
			} else {
				this.currWave = undefined;	
			}
		}
	},
	
	enemyGoal: function () {
		this.life--;
		cc.log("Life left: " + this.life);
	},

	enemyDestroy: function (reward, wave, nid, pos) {
		this.enemiesList[nid] = undefined;
		global.event.trigger("null_target" + nid);
		global.event.off("null_target" + nid);

		if (!reward) { return; }
		let waveData = this.wavesData[wave];
		let increment = [];
		for (let i = 0; i < this.resources.length; ++i) {
			this.resourcesRes[i] += waveData.resources[i];
			let inc = Math.floor(this.resourcesRes[i]) - this.resources[i];
			increment.push(inc);
			this.resources[i] += inc;
		}
		global.battle.uiLayer.popResources(increment, pos.add(cc.v2(0, 80)));
		global.battle.uiLayer.showResources(this.resources);
	},
	
	update: function (dt) {
		if (this.currWave) {
			this.waveTimer += dt;
			let newEnemy = ((this.enemyCount == 0) && (this.waveTimer > this.currWave.wait)) ||
						   ((this.enemyCount > 0) && (this.waveTimer >= this.currWave.interval));
			if (newEnemy) {
				this.waveTimer = 0;
				this.addEnemy();
				// cc.log("Wave " + this.wave + ", Enemy " + this.enemyCount + ": " + JSON.stringify(this.enemiesData[this.currWave.id]));
			}
		}
		
		// search enemy
		for (var base of this.bases) {
			let tower = base.getComponent("base").tower;
			// built tower
			// TODO: use bitwise flag to separate different states
			if (tower != undefined) {
				tower.searchEnemy(this.enemiesList);
			}
		}
	},
	
    start () {

    },

    // update (dt) {},
});
