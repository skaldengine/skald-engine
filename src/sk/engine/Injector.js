const utils = require('sk/utils')
const Manager = require('sk/core/Manager')
const Service = require('sk/core/Service')
const Signal = require('sk/core/Signal')
const View = require('sk/core/View')
const shallowCopy = require('sk/utils/shallowCopy')

const TYPES = utils.enumeration({
  MANAGER   : '_managers',
  SERVICE   : '_services',
  SIGNAL    : '_signals',
  PROVIDER  : '_providers',
  FACTORY   : '_factories',
  INSTANCE  : '_instances',
  VIEW      : '_views',
})

class InjectionTarget {
  constructor(id, target, type, stateless=false) {
    this.id = id
    this.target = target
    this.type = type
    this.stateless = stateless
  }

  getObject() {
    if (this.type === TYPES.PROVIDER) {
      return this.target()
    
    } else if (this.type === TYPES.INSTANCE || this.type === TYPES.VIEW) {
      return this.target
    
    } else {
      return new this.target()
    }
  }
}

class Injector {
  constructor() {
    this._injectionPool = {}
    this._resolveStack = []

    this._managers = {}
    this._services = {}
    this._signals = {}
    this._factories = {}
    this._instances = {}
    this._providers = {}
    this._views = {}

    this._container = {}
  }

  get managers() { return shallowCopy(this._managers) }
  get services() { return shallowCopy(this._services) }
  get signals() { return shallowCopy(this._signals) }
  get factories() { return shallowCopy(this._factories) }
  get instances() { return shallowCopy(this._instances) }
  get providers() { return shallowCopy(this._providers) }
  get views() { return shallowCopy(this._views) }

  get container() { return shallowCopy(this._container) }

  _register(id, target, type, stateless=false) {
    if (this._injectionPool[id]) {
      throw new Error(`An object with "${id}" is already registered in the injector.`)
    }

    this._injectionPool[id] = new InjectionTarget(id, target, type, stateless)
  }

  registerManager(id, target) {
    if (!target || !target.prototype || !(target.prototype instanceof Manager)) {
      throw new Error(
        `Invalid type for manager "${id}". ` +
        `A manager must be a class inheriting from sk.core.Manager.`
      )
    } 

    this._register(id, target, TYPES.MANAGER)
  }
  registerService(id, target) {
    if (!target || !target.prototype || !(target.prototype instanceof Service)) {
      throw new Error(
        `Invalid type for service "${id}". ` +
        `A service must be a class inheriting from sk.core.Service.`
      )
    } 

    this._register(id, target, TYPES.SERVICE)
  }
  registerSignal(id, target) {
    if (!target || !target.prototype || !(target.prototype instanceof Signal)) {
      throw new Error(
        `Invalid type for signal "${id}". ` +
        `A signal must be a class inheriting from sk.core.Signal.`
      )
    } 

    this._register(id, target, TYPES.SIGNAL)
  }
  registerView(id, target) {
    if (!target || !target.prototype || !(target.prototype instanceof View)) {
      throw new Error(
        `Invalid type for view "${id}". ` +
        `A view must be a class inheriting from sk.core.View.`
      )
    }
    
    this._register(id, target, TYPES.VIEW)
  }
  registerFactory(id, target, stateless=false) {
    this._register(id, target, TYPES.FACTORY, stateless)
  }
  registerProvider(id, target, stateless=false) {
    this._register(id, target, TYPES.PROVIDER, stateless)
  }
  registerInstance(id, target) {
    this._register(id, target, TYPES.INSTANCE)
  }

  build() {
    Object
      .keys(this._injectionPool)
      .forEach((x) => this.resolve(x))
  }

  resolve(id) {
    if (this._container[id]) {
      return this._container[id]
    }

    if (!this._injectionPool[id]) {
      throw new Error(`Trying to inject an undefined object with id "${id}".`)
    }

    if (this._resolveStack.indexOf(id) >= 0) {
      this._resolveStack = []
      throw new Error(`Cyclic reference detected while injecting "${id}".`)
    }

    let target = this._injectionPool[id]
    let object = null
    this._resolveStack.push(id)
    try {
      object = target.getObject()
    } catch(e) {
      this._resolveStack = []
      console.error(`Could not inject the object with id "${id}".`)
      throw e
    }
    this._resolveStack.pop()

    if (!target.stateless) {
      this._container[id] = object
      this[target.type][id] = object
    }

    return object
  }

  destroy() {
    Object.keys(this._managers).forEach(x => {
      this._managers[x].destroy()
    })
    Object.keys(this._services).forEach(x => {
      this._services[x].destroy()
    })
    Object.keys(this._signals).forEach(x => {
      this._signals[x].destroy()
    })

    this._injectionPool = null
    this._resolveStack = null
    this._managers = null
    this._services = null
    this._signals = null
    this._factories = null
    this._instances = null
    this._providers = null
    this._views = null
    this._container = null
  }
}

module.exports = Injector