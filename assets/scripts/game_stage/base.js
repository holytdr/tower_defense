import global from '../utils/global'

// tower base script
const BaseState = {
	Invalid: -1,
	Empty: 0,
	BuiltTower: 1,
};

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad: function () {
        this.state = BaseState.Empty;
        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
			// do not pass it to parent nodes
			event.stopPropagation();
			// check state and call the corresponding menu
			switch (this.state) {
			case BaseState.Empty:
				global.battle.level.callBaseMenu(this);
				break;
			case BaseState.BuiltTower:
				global.battle.level.callTowerMenu(this, this.tower);
				break;
			default:
				break;
			}
		})
    },

	setState: function (state) {
		if (this.state == state) {
			return;
		}
		
		switch (state) {
		case BaseState.Invalid:
			break;
		default:
			break;
		}
		
		// save previous state
		this.prevState = this.state;
		this.state = state;
    },
    
	buildTower: function (data) {
		let towerData = this.levelScript.towersData[data];
		let cost = towerData.levels[0].cost;
		if (!global.resources.check(cost)) {
			return false;
		}
		global.resources.cost(cost);

		// use single type for now
		let tower = cc.instantiate(this.levelScript.towerPrefab);
        // cc.log(data + ", " + JSON.stringify(this.towersData[data]));
		let towerScript = tower.getComponent("tower");
        towerScript.configure(towerData, this.node.position);
		tower.parent = this.levelScript.node;
		
		this.setState(BaseState.BuiltTower);
		this.tower = towerScript;
		return true;
	},
	
	sellTower: function () {
		global.resources.add(this.tower.sellReturn(), true, this.node.position);
		this.tower.node.destroy();
		this.tower = undefined;
		this.setState(BaseState.Empty);
	},
	
	upgradeTower: function () {
		this.tower.upgrade();
    },
    
    start () {

    },

    // update (dt) {},
});
