const pixi = require('pixi.js')
const $ = require('sk/$')
const Service = require('sk/core/Service')
const Resource = require('sk/core/Resource')
const Middleware = require('sk/core/Middleware')


class ResourcesService extends Service {
  constructor() {
    super('resources')
    
    this._loader = null
    this._resourcesById = null
    this._resourcesByUrl = null
    this._middlewares = null
    this._queueSize =null
    this._callback = null

    this._config = null
    this._logger = null
    this._profile = null

    this._loadProgressSignal = null
    this._loadErrorSignal = null
    this._resourceLoadedSignal = null
    this._loadCompletedSignal = null
    this._loadStartedSignal = null
    this._resourceUnloadedSignal = null
  }

  static registerMiddleware(type, middleware) {
    if (!!ResourcesService._middlewares[type]) {
      throw new Error(`Middleware "${type}" already registered.`)
    }

    if (!middleware || !middleware.prototype || !(middleware.prototype instanceof Middleware)) {
      throw new Error(`A middleware must by an instance of "sk.core.Middleware".`)
    }

    ResourcesService._middlewares[type] = middleware
  }

  static unregisterAll() {
    ResourcesService._middlewares = {}
  }

  /**
   * Bash path that will be used for all resources during loading.
   * @type {String}
   */
  get basePath() { return this._loader.baseUrl }
  set basePath(value) { this._loader.baseUrl = value }

  /**
   * Maximum number of concurrent loading process. Readonly.
   * @type {Number}
   */
  get maxConcurrency() { return this._loader._queue.concurrency }

  /**
   * Manager setup. Called internally by the engine. Do not call it manually.
   */
  setup() {
    let injector = $.getInjector()

    this._config  = injector.resolve('config')
    this._logger  = injector.resolve('logger')
    this._profile = injector.resolve('profile')

    this._loadProgressSignal     = injector.resolve('loadProgressSignal')
    this._loadErrorSignal        = injector.resolve('loadErrorSignal')
    this._resourceLoadedSignal   = injector.resolve('resourceLoadedSignal')
    this._loadCompletedSignal    = injector.resolve('loadCompletedSignal')
    this._loadStartedSignal      = injector.resolve('loadStartedSignal')
    this._resourceUnloadedSignal = injector.resolve('resourceUnloadedSignal')

    this._profile.begin('resources')
    this._loader = null
    this._resourcesById = {}
    this._resourcesByUrl = {}
    this._middlewares = {}
    this._queueSize = 0
    this._callback = null
    this._setupLoader()
    this._setupMiddlewares()
    this._setupEvents()
    this._profile.end('resources')
  }

  /**
   * Setup the PIXI loader.
   */
  _setupLoader() {
    this._profile.begin('setupLoader')
    let basePath = this._config.get('resources.base_path', '')
    let maxConcurrency = this._config.get('resources.max_concurrency')

    this._loader = new pixi.loaders.Loader(basePath, maxConcurrency)
    this._profile.end('setupLoader')
  }

  /**
   * Setup the loader middlewares.
   */
  _setupMiddlewares() {
    this._profile.begin('setupMiddlewares')
    // remove the current middlewares from the pixi loader. We don't change 
    // the Load._pixiMiddleware variable to avoid any conflit with non-skald 
    // pixi game running in the same page.
    this._loader._afterMiddleware = []

    // Middleware to convert the pixi resource to skald resource
    this._loader.use((pixiResource, next) => {
      pixiResource.skaldResource = new Resource(
        pixiResource.metadata.type,
        pixiResource.name,
        pixiResource.url,
        pixiResource.xhrType,
        pixiResource.data,
        pixiResource.metadata.metadata,
        pixiResource
      )
      next()
    })

    // Add all middlewares
    for (let type in ResourcesService._middlewares) {
      let middleware = null
      try {
        middleware = new ResourcesService._middlewares[type](type)
        middleware.setup()
      } catch (e) {
        this._logger.error(e)
        throw new Error(`Error while instantiating middleware "${type}" due to:`, e)
      }

      this._middlewares[type] = middleware
      this._loader.use((pixiResource, next) => {
        middleware.run(pixiResource).then(next)
      })
    }
    this._profile.end('setupMiddlewares')
  }

  /**
   * Configure the PIXI loader events.
   */
  _setupEvents() {
    this._profile.begin('setupEvents')
    this._loader.on('progress', (l, r) => this._onProgress(l, r))
    this._loader.on('error', (e, l, r) => this._onError(e, l, r))
    this._loader.on('load', (l, r) => this._onLoad(l, r))
    this._loader.on('complete', () => this._onComplete())
    this._profile.end('setupEvents')
  }

  /**
   * Handle progress event.
   */
  _onProgress(loader, pixiResource) {
    let total = this._queueSize
    let loaded = Math.floor(this._queueSize*loader.progress/100)
    
    this._loadProgressSignal.dispatch(loaded, total)
  }
  
  /**
   * Handle error event.
   */
  _onError(error, loader, pixiResource) {
    this._loadErrorSignal.dispatch(
      `Could not load the resource "${pixiResource.name}" from "${pixiResource.url}".`,
      error,
      {pixiResource}
    )

    this._logger.error(
      `Could not load the resource "${pixiResource.name}" from `+
      `"${pixiResource.url}" due to: ${error}`
    )
  }

  /**
   * Handle load event.
   */
  _onLoad(loader, pixiResource) {
    this._resourceLoadedSignal.dispatch(pixiResource.name, pixiResource.skaldResource)
    if (pixiResource.metadata.callback) {
      pixiResource.metadata.callback(pixiResource.skaldResource)
    }

    this._logger.trace(`(resources) Resource "${pixiResource.name}" loaded `+
                        `sucessfully.`)
  }
  
  /**
   * Handle complete event.
   */
  _onComplete(event) {
    this._loadCompletedSignal.dispatch()

    if (this._callback) {
      this._callback()
    }

    this._queueSize = 0
    this._loader.reset()
  }

  add(type, id, url, metadata, callback) {
    let middleware = this._middlewares[type]
    metadata = metadata || {}

    if (!type || !middleware) {
      throw new Error(`Trying to add a resource with non-registered type "${type}".`)
    }

    if (!id) {
      throw new Error('You must provide an ID to load a resource.')
    }

    if (!url) {
      throw new Error(`You must provide an URL to load a resource.`)
    }

    if (!middleware.check(url, metadata)) {
      throw new Error(`Resource "${id}" has an invalid URL or metadata `+
                      `for "${type}" middleware.`)
    }

    let response = middleware.preProcess(url, metadata)

    this._logger.trace(`(resources) Loading json "${id}" from "${url}".`)
    this._loader.add(id, response.url, {
      metadata: {
        type,
        callback,
        metadata: response.metadata,
      }
    })
  }

  load(callback) {
    if (this.isLoading()) return

    this._queueSize = this._loader._queue._tasks.length
    this._callback = callback

    this._loadStartedSignal.dispatch(this._queueSize)
    this._loader.load()
  }

  list() {
    return Object.keys(this._resourcesById)
  }

  cache(resource) {
    if (!(resource instanceof Resource)) {
      throw new Error(`You can only cache instances of "sk.core.Resource" class.`)
    }

    this._resourcesById[resource.id] = resource
    this._resourcesByUrl[resource.url] = resource

    let bucket = [resource]
    while (bucket.length) {
      let r = bucket.shift()

      if (!this._resourcesById[r.id]) {
        this._resourcesById[r.id] = r
      }
      if (r.url && !this._resourcesByUrl[r.url]) {
        this._resourcesByUrl[r.url] = r
      }
      
      bucket = bucket.concat(r.children || [])
    }
  }

  uncache(id) {    
    let resource = this.getResource(id)
    if (!resource) return

    resource.children.forEach(r => {
      delete this._resourcesById[r.id]
      if (r.url) delete this._resourcesByUrl[r.url]
    })

    delete this._resourcesById[id]
    delete this._resourcesByUrl[resource.url]
  }

  unload(id) {
    let resource = this.getResource(id)
    if (!resource) return

    let middleware = this._middlewares[resource.type]
    
    this.uncache(id)
    middleware.unload(resource)

    this._resourceUnloadedSignal.dispatch(id, resource)
  }

  isLoading() {
    return this._loader.loading
  }

  get(id) {
    let resource = this._resourcesById[id]
    return resource? resource.data : null
  }

  getByUrl(url) {
    let resource = this._resourcesByUrl[url]
    return resource? resource.data : null
  }

  getUrl(id) {
    let resource = this._resourcesById[id]
    return resource? resource.url : null
  }

  getType(id) {
    let resource = this._resourcesById[id]
    return resource? resource.type : null
  }

  getMetadata(id) {
    let resource = this._resourcesById[id]
    return resource? resource.metadata : null
  }

  getResource(id) {
    return this._resourcesById[id] || null
  }

  getResourceByUrl(url) {
    let resource = this._resourcesByUrl[url]
    return resource? resource : null
  }

  destroy() {
    this.list()
        .forEach(x => this.unload(x))
  }
}

ResourcesService._middlewares = {}

module.exports = ResourcesService
