/* eslint-disable no-mixed-operators */
import { TimelineLite, TweenLite, gsap } from 'gsap/all'
// import Config from '../../Config'
import { Config } from '../Config'
const { settings, keys } = Config.player1
// const Config = {
//   speed: 7,
//   jumpLength: 200,
//   spawnPosition: -200,
//   moveMultiplier: 50,
//   speedInCollision: 4
// }

// const States = {
//   attack: 'attack',
//   idle: 'idle',
//   defense: 'defense'
// }

export default class Player1 {
  constructor (Object3D, mixer, THREELoopOnce) {
    this.Object3D = Object3D
    this.mixer = mixer
    this.THREELoopOnce = THREELoopOnce
    this.speed = settings.speed
    this.speedInCollision = settings.speedInCollision
    this.jumpLength = settings.jumpLength
    this.moveMultiplier = settings.moveMultiplier
    this._activeAction = null
    this.actions = {}
    this.actionNames = null
    this.key = this.generateControls(keys)
    this.isSwitchedBefore = false
    this.isSwitchOn = false // for switching animations for the other player orientation
    this.default = {
      rotation: {
        y: 1.5,
        opposite: { y: 4.5 }
      },
      position: {
        x: settings.spawnPosition
      }
    }
    this.timeline = new TimelineLite()
    this._playingAnim = {}
    this._health = 100

    this.init()
  }
  init () {
    gsap.ticker.lagSmoothing(0) // for not pausing rendering when swiching tabs and fps drop
    this.setActionNames()
    this.setPosition() // for setting position and rotation
    this.mixActions()
    this.fadeToAction()
    this.setAnimations()
    this.handleKeyboardEvents()
  }
  setActionNames () { // will cause bugs if name of object3d is changed
    this.actionNames = this.Object3D.animations.reduce((acc, anim) => {
      if (anim.name.includes('Armature')) {
        const cleanName = anim.name.split('|')[1]
        // removes the word Armature in the animation name
        anim.name = cleanName // sets new name to animation
        acc[cleanName] = cleanName
        return acc
      }
    }, {})
  }
  setPosition (positionX = this.default.position.x, rotation = this.default.rotation.y) {
    this.Object3D.position.x = positionX
    this.Object3D.rotation.y = rotation
  }
  mixActions () {
    this.Object3D.animations.forEach(animation => {
      this.actions[animation.name] = this.mixer.clipAction(animation)
    })
  }
  fadeToAction ({ name = 'idle', duration = 0.1, inReverse = false, speed = 1, isLoopOnce = false, isfreezeLastFrame = true } = {}) {
    if (this._activeAction) {
      let num
      inReverse ? num = -1 * speed : num = 1 * speed
      this._activeAction.clampWhenFinished = isfreezeLastFrame
      const previousAction = this._activeAction
      this._activeAction = this.actions[ name ]
      if (previousAction !== this._activeAction) previousAction.fadeOut(duration)
      this._activeAction.reset()
      if (isLoopOnce) this._activeAction.setLoop(this.THREELoopOnce)
      this._activeAction.setDuration()
      this._activeAction.setEffectiveTimeScale(num) // num = -1 is for reversing the animation
      this._activeAction.setEffectiveWeight(1)
      this._activeAction.fadeIn(duration)
      this._activeAction.play()
    } else this._activeAction = this.actions['idle'].play()

    this._playingAnim = { name: this._activeAction.getClip().name, inReverse, activeAction: this._activeAction, startTime: this._currentTime }
  }
  setAnimations () {
    this.moveLeft = ({ forcePlay } = {}) => {
      if (!this._shouldPlayAnim(this.actionNames.running, true) && !forcePlay) return
      if (!this.isSwitchOn) this.fadeToAction({ name: 'running', inReverse: true, speed: this.speed / 5 })
      else this.fadeToAction({ name: 'running', speed: this.speed / 5 })
    }
    this.moveRight = ({ forcePlay } = {}) => {
      if (!this._shouldPlayAnim(this.actionNames.running) && !forcePlay) return
      if (!this.isSwitchOn) this.fadeToAction({ name: 'running', speed: this.speed / 5 })
      else this.fadeToAction({ name: 'running', inReverse: true, speed: this.speed / 5 })
    }
    this.mmaKick = ({ forcePlay } = {}) => {
      // if(this.blockMovement)this.Object3D.x +=
      if (!this._shouldPlayAnim(this.actionNames.mmaKick) && !forcePlay) return
      this.blockMovement = true
      this.fadeToAction({ name: 'mmaKick', speed: 2, isLoopOnce: true })
      this.mixer.addEventListener('finished', event => {
        const finishedClip = event.action.getClip()
        if (finishedClip === this._activeAction.getClip()) {
          this.blockMovement = false
          this._lastHit = null
          this._properAnimFallback()
        }
        this.mixer.removeEventListener('finished')
      })
    }
    this.jump = ({ forcePlay } = {}) => {
      if (!this._shouldPlayAnim(this.actionNames.jumping) && !forcePlay) return
      if (!this.isAlreadyJumping) {
        this.isAlreadyJumping = true
        const timescale = this.speed / 3
        const duration = ((this.actions.jumping.getClip().duration / timescale))
        const halfDuration = (duration / 2).toFixed(4) * 1 /** divided by 2.2 because of up and down in timeline
        ( there is bug if its only by 2) also fadeToAction and timeline anim are syncing and because there are 2 actions */
        this.fadeToAction({ name: 'jumping', speed: timescale, isLoopOnce: true })
        this.timeline
          .to(this.Object3D.position, halfDuration, { y: this.jumpLength, ease: 'Power1.easeOut' })
          .to(this.Object3D.position, halfDuration, {
            y: 0,
            ease: 'Power1.easeIn',
            onComplete: () => {
              this.isAlreadyJumping = false
              this._properAnimFallback()
            }
          })
      }
    }
    this.idle = ({ forcePlay } = {}) => {
      if (forcePlay) this.fadeToAction({ name: 'idle' })
      else if (this._shouldPlayAnim(this.actionNames.idle)) this.fadeToAction({ name: 'idle' })
    }
  }
  handleKeyboardEvents () {
    this.logKeyDown = (event) => {
      if (event.code === this.key.right.code) {
        this.key.right.isDown = true
        if (this.key.left.isDown) {
          this.idle()
          return
        }
        this.moveRight()
      }
      if (event.code === this.key.left.code) {
        this.key.left.isDown = true
        if (this.key.right.isDown) {
          this.idle()
          return
        }
        this.moveLeft()
      }
      if (event.code === this.key.up.code) {
        this.key.up.isDown = true
        this.jump()
      }
      if (event.code === this.key.kick.code) {
        this.key.kick.isDown = true
        this.mmaKick()
      }
    }

    this.logKeyUp = (event) => {
      if (event.code === this.key.right.code) {
        this.key.right.isDown = false
        if (this.key.left.isDown) this.moveLeft() // in case if player holds a,d or w,d then releases one of the keys, otherwise idle animation will play
        else if (!this.key.left.isDown) this.idle()
      }
      if (event.code === this.key.left.code) {
        this.key.left.isDown = false
        if (this.key.right.isDown) this.moveRight() // in case if player holds a,d or a,w then releases one of the keys, otherwise idle animation will play
        else if (!this.key.right.isDown) this.idle()
      }
      if (event.code === this.key.up.code) {
        this.key.up.isDown = false
      }
      if (event.code === this.key.kick.code) {
        this.key.kick.isDown = false
      }
    }
    // window.addEventListener('keyup', this.logKeyUp)
    // window.addEventListener('keydown', this.logKeyDown)
  }

  _shouldPlayAnim (actionName, inReverse = false) {
    const isSameAnim = this.isSwitchOn && this.actionNames.running === actionName
      ? this._playingAnim.inReverse !== inReverse && actionName === this._playingAnim.name
      : this._playingAnim.inReverse === inReverse && actionName === this._playingAnim.name

    // interuptable animations (idle, running)
    const isInteruptableAnim = this._playingAnim.name === this.actionNames.idle ||
      this._playingAnim.name === this.actionNames.running

    const isNonInteruptAnimStoped = !isInteruptableAnim && !this._playingAnim.activeAction.isRunning()
    return !isSameAnim && isInteruptableAnim || isNonInteruptAnimStoped
  }

  _handleCollisionMovement (player2) {
    const isMovingLeft = this.key.left.isDown
    const isMovingRight = this.key.right.isDown
    const isStill = !this.key.left.isDown && !this.key.right.isDown
    const isInLeftSide = this.position.x <= player2.position.x
    const isInRightSide = this.position.x > player2.position.x

    const moveDistance = this._moveDistancePerFrame() / this.speedInCollision

    if (isInLeftSide) {
      if (isMovingRight) player2.position.x += moveDistance
      else if (isMovingLeft) this._handleMovement()
      else if (isStill) player2.position.x += moveDistance
    } else if (isInRightSide) {
      if (isMovingLeft) player2.position.x -= moveDistance
      else if (isMovingRight) this._handleMovement()
      else if (isStill) player2.position.x -= moveDistance
    }
  }
  handleRotationSwitch (opponentPosX) {
    if (this.position.x > opponentPosX) this.switchRight()
    else if (this.position.x < opponentPosX) this.switchLeft()
  }
  switchRight () {
    const isRotationDefault = this.default.rotation.y === this.Object3D.rotation.y
    if (isRotationDefault) {
      this.isSwitchOn = true
      const switchedRotation = this.default.rotation.opposite.y // switches to opposite value
      if (this.key.right.isDown) this.fadeToAction({ name: 'running', inReverse: true, speed: this.speed / 5, duration: 0.05 }) // fix for moonwalking bug after switching
      TweenLite.to(this.Object3D.rotation, 0.3, { y: switchedRotation, ease: 'Power1.easeOut' })
    }
  }
  switchLeft () {
    const isRotationDefault = this.default.rotation.y === this.Object3D.rotation.y
    if (!isRotationDefault) {
      if (this.isSwitchOn) {
        this.isSwitchOn = false
        const switchedRotation = this.default.rotation.y
        if (this.key.left.isDown) this.fadeToAction({ name: 'running', inReverse: true, speed: this.speed / 5, duration: 0.05 }) // fix for moonwalking bug after switching
        TweenLite.to(this.Object3D.rotation, 0.3, { y: switchedRotation, ease: 'Power1.easeOut' })
      }
    }
  }

  update (time, collidedPlayer) {
    this._currentTime = time

    if (collidedPlayer) {
      this._handleCollisionMovement(collidedPlayer)
    } else {
      this._handleMovement()
    }
    this._prevTime = time
  }
  _handleMovement () {
    if (this.key.left.isDown && this.key.right.isDown || this.blockMovement) {
      return
    }

    if (this.key.left.isDown) {
      if (this.key.right.isDown) return

      this.Object3D.position.x -= this._moveDistancePerFrame()
    }

    if (this.key.right.isDown) {
      if (this.key.left.isDown) return

      this.Object3D.position.x += this._moveDistancePerFrame()
    }
  }
  _properAnimFallback () {
    if (this.key.left.isDown && this.key.right.isDown) {
      this.idle({ forcePlay: true }) // if player holds a,d before and after jump
    } else if (this.key.right.isDown) {
      this.moveRight({ forcePlay: true })
    } else if (this.key.left.isDown) {
      this.moveLeft({ forcePlay: true })
    } else {
      this.idle({ forcePlay: true })
    }
  }

  _moveDistancePerFrame () {
    const passedTimeBetweenFrames = this._prevTime ? this._currentTime - this._prevTime : 0
    return passedTimeBetweenFrames * (this.speed * this.moveMultiplier)
  }
  generateControls (passedKeys) {
    const configKeys = Object.entries(passedKeys)
    let result = {}

    configKeys.forEach(([type, keyValue]) => {
      result[type] = {
        isDown: false,
        code: keyValue
      }
    })

    return result
  }
  removeHealth (amount) {
    this._health = this._health - amount <= 0 ? this._health = 0 : this._health - amount
    if (this._health === 0) {
      // console.error(this.Object3D.name + ' is dead')
      this._health = 100
    }
    return this._health
  }
  set lastHit (value) {
    this._lastHit = value
  }
  get lastHit () {
    return this._lastHit
  }

  get health () {
    return this._health
  }
  get name () {
    return this.Object3D.name
  }

  get activeActionName () {
    return this._activeAction.getClip().name
  }

  get playingAnim () {
    return this._playingAnim
  }

  get currentSpeed () {
    return this.speed
  }
  set currentSpeed (speed) {
    this.speed = speed
  }
  get Object3d () {
    return this.Object3D
  }
  get allActions () {
    return this.actions
  }
  get position () {
    return this.Object3D.position
  }
  set position (position) {
    this.Object3D.position = position
  }
}
