import EventListener from './event_listener'
import BattleController from './battle'
import EffectsController from '../utils/effects'
import Messenger from './messages'

const global = global || {};
global.event = EventListener({});
global.battle = BattleController({});
global.effects = EffectsController({});
global.messages = Messenger;
// default
global.currLevel = 1;

export default global;