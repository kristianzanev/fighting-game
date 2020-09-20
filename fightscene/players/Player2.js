import Player1 from './Player1'
import { Config } from '../Config'
const { settings, keys } = Config.player2

export default class Player2 extends Player1 {
  // eslint-disable-next-line no-useless-constructor
  constructor (model, mixer, THREELoopOnce) {
    super(model, mixer, THREELoopOnce)

    this.key = this.generateControls(keys)
    this.speed = settings.speed
    this.speedInCollision = settings.speedInCollision
    this.jumpLength = settings.jumpLength
    this.moveMultiplier = settings.moveMultiplier

    this.default.position.x = settings.spawnPosition
    this.setPosition(settings.spawnPosition) // for setting position and rotation
  }
}
