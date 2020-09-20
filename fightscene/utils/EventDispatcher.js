export default class EventDispatcher {
  constructor () {
    this.events = {}
  }
  dispatch (event, details) {
    // Check if this event not exists
    if (this.events[event] === undefined) {
      const error = { error: `This event: ${event} does not exist` }
      throw (error)
      // return false
    }
    this.events[event].listeners.forEach((listener) => {
      listener(details)
    })
  }

  addListener (event, callback) {
    // Check if the callback is not a function
    if (typeof callback !== 'function') {
      const error = { error: `The listener callback must be a function, the given type is ${typeof callback}` }
      // console.error(`The listener callback must be a function, the given type is ${typeof callback}`)
      throw (error)
    }
    // Check if the event is not a string
    if (typeof event !== 'string') {
      const error = { error: `The event name must be a string, the given type is ${typeof event}` }
      // console.error(`The event name must be a string, the given type is ${typeof event}`)
      throw (error)
    }

    // Create the event if not exists
    if (this.events[event] === undefined) {
      this.events[event] = {
        listeners: []
      }
    }

    // Check if callback is already added to listeners
    const sameListener = this.events[event].listeners.find(listener => listener.toString() === callback.toString())
    if (!sameListener) this.events[event].listeners.push(callback)

    // if (sameListener) console.warn('The same listener is already added to this event')
    // else this.events[event].listeners.push(callback)
  }

  removeListener (event, callback) {
    // Check if this event not exists
    if (this.events[event] === undefined) {
      // console.error(`This event: ${event} does not exist`)
      const error = { error: `This event: ${event} does not exist` }
      throw (error)
    }

    this.events[event].listeners = this.events[event].listeners.filter(listener => {
      return listener.toString() !== callback.toString()
    })
  }
}
