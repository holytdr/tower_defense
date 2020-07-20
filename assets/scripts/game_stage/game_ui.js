// ui script
import global from '../utils/global'

cc.Class({
    extends: cc.Component,

    properties: {
		countDownLabel: {
			default: null,
			type: cc.Label,
		},
		damageLabel: {
			default: null,
			type: cc.Prefab,
		},
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
		global.battle.ui = this;
	},

	countDown: function (sec, delay = 0) {
		this.delay = delay;
		this.timer = sec;
		this.countDown = true; 
	},

	update: function (dt) {
		if (this.countDown && this.timer > 0) {
			if (this.delay > 0) {
				this.delay -= dt;
				return;
			}
			this.timer -= dt;
			this.countDownLabel.string = Math.floor(this.timer) + 1;
			if (this.timer <= 0) {
				this.countDownLabel.string = global.messages.get("START") + "!";
				this.countDown = false;
				global.event.trigger("level_start");
				cc.tween(this.countDownLabel.node).to(3.0, {opacity: 0}).start();
			}
		}
	},

	showResources: function (res) {
		for (let i = 0; i < this.resourceLabels.length; ++i) {
			this.resourceLabels[0].getComponent(cc.Label).string = res[i];
		}
	},

	popDamage: function (damage, position, duration = 1.0, crit=false, moveBy = cc.v3(80, 80, 0)) {
		let label = cc.instantiate(this.damageLabel);
		label.zIndex = 10;
		label.position = position;

		let labelScript = label.getComponent(cc.Label);
		
		if (crit) {
			labelScript.string = damage + "!";
			label.color = new cc.Color(255, 255, 0);
			labelScript.fontSize = 50;
			labelScript.lineHeight = 50;
		} else {
			labelScript.string = damage;
			labelScript.fontSize = 40;
			labelScript.lineHeight = 40;
		}

		label.parent = this.node;
		cc.tween(label)
		.by(duration, {opacity: -label.opacity, position: moveBy})
		.call(label.destroy.bind(label))
		.start();
	},

    start () {

    },
});
