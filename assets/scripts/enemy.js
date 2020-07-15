// enemy script
import global from './global'

var animeComponent = require("animation");
const UnitState = require("unit_state");

cc.Class({
	extends: animeComponent,

    properties: {
		healthBarPrefab: {
			default: null,
			type: cc.Prefab,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		// place holder
	},
	
	onDestroy: function () {
		// its parent is game_ui, so destroy it explicitly
		this.hbar.node.destroy();
	},

	configure: function (wave, nid, data, pathPoints) {
		this.wave = wave;
		this.nid = nid;
		// basic attributes
		this.hp = data.hp;
		this.maxHp = data.hp;
		this.defense = data.defense;
		this.speed = data.speed;
		this.originalSpeed = data.speed;
		this.vitality = data.vitality;
		
		// path and direction
		this.pathPoints = pathPoints;
		this.currPt = 0;
		this.node.position = pathPoints[0].position;
		this.findDirection(pathPoints[1].position);

		// initialize animation
		let size = this.initAnimation(data);

		// configure health bar
		let hbarNode = cc.instantiate(this.healthBarPrefab);
		this.hbar = hbarNode.getComponent(cc.ProgressBar);
		hbarNode.zIndex = 1;
		this.hbar.progress = 1.0;

		this.updateHbarWidth(size);
		// hide health bar first
		hbarNode.active = false;
		// put it on the UI layer
		hbarNode.parent = global.battle.uiLayer.node;
		
		// state
		this.setState(UnitState.Move);
		this.node.opacity = 255;
	},

	updateHbarWidth: function (size) {
		this.hbar.width = size.x + 10;
		this.hbar.height = size.y + 10;
		this.hbar.node.width = size.x;
		this.hbar.totalLength = size.x;
		this.hbar.node.getChildByName("bar").position = cc.v3(-size.x/2., 0, 0);
	},

	updateHbarPos: function () {
		if (this.hbar.node.active) {
			this.hbar.node.position = this.node.position.add(cc.v2(0, this.hbar.height));
		}
	},

	update: function (dt) {
		this.animeUpdate(dt);
		// move
		if (this.state == UnitState.Move) {
			let dest = this.pathPoints[this.currPt + 1].position;
			let dist = dest.sub(this.node.position).mag();
			let moved = dt*this.speed;
			
			// cannot reach the next point yet
			if (dist > moved) {
				this.node.position = this.node.position.add(this.direction.mul(moved));
			// reach the point
			} else {
				this.node.position = dest;
				this.currPt++;
				// check the next point
				// cc.log(this.currPt + ", " + this.pathPoints.length);
				if (this.currPt >= this.pathPoints.length - 1) {
					this.setState(UnitState.Goal);
				} else {
					// move the residual part
					dest = this.pathPoints[this.currPt + 1].position;
					this.findDirection(dest);
					this.node.position = this.node.position.add(this.direction.mul(moved - dist));
				}
			}
		}
		this.updateHbarPos();
	},
	
	damage: function (damage, hitRecover = 0.0) {
		if ((damage <= 0) || (this.state == UnitState.Goal) || (this.state == UnitState.Dead)) {
			return;
		}
		this.hp -= damage;
		this.hbar.node.active = true;
		this.updateHbarPos();
		this.hbar.progress = Math.max(this.hp, 0)/this.maxHp;
		let recover = hitRecover/Math.max(0.05, this.vitality);
		if (recover > 0.01) {
			this.speed = 0;
			cc.tween(this).to(recover, {speed: this.originalSpeed}, { easing: t => t*t }).start();
			this.playAnimeOnce(UnitState.Damage, recover);
		}
		if (this.hp <= 0) {
			this.setState(UnitState.Dead);
		}
	},

	setState: function (state) {
		if (this.state == state) {
			return;
		}
		
		switch (state) {
		case UnitState.Undefined:
            break;
		case UnitState.Idle:
            this.playAnime(UnitState.Idle, -1);
            break;
		case UnitState.Move:
            this.playAnime(UnitState.Move, -1);
			break;
		case UnitState.Goal:
            this.unregister(false);
			global.event.trigger("enemy_goal");
			cc.tween(this.node).to(1.0, {opacity: 0}).call(this.node.destroy.bind(this.node)).start();
			break;
		case UnitState.Dead:
			this.unregister(true);
			this.playAnimeOnce(UnitState.Dead, -1, false);
			cc.tween(this.node)
				.to(3.0, {})
				.to(2.0, {opacity: 0})
				.call(this.node.destroy.bind(this.node)).start();
			break;
		default:
			break;
		}
		
		// save previous state
		this.prevState = this.state;
		this.state = state;
		// cc.log("Set Enemy State: " + this.state);
	},
	
	unregister: function (reward) {
		this.hbar.node.active = false;
		cc.log("destroy: " + this.nid);
		global.battle.field.enemyDestroy(reward, this.wave, this.nid, this.node.position);
	},

    start () {

    },

});
