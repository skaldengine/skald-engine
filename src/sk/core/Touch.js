const $ = require('sk/$')

/**
 * The touch object stores the touch state for a single finger on the screen.
 * Touch objects are created by the touch manager and can be accessed using
 * `game.touches.get(index)` or `game.touches.getFirstTouch()`.
 */
class Touch {
  constructor(index) {
    this._id = null
    this._index = index

    this._down = false
    this._x = null
    this._y = null
    this._force = null
    this._radiusX = null
    this._radiusY = null
    this._rotation = null

    this._display = null
    this._renderer = null
  }

  /**
   * The id of the touch (set by the browser touch identifier). Readonly.
   * @type {String}
   */
  get id() { return this._id }

  /**
   * The index of the touch. Readonly.
   * @type {Number}
   */
  get index() { return this._index }

  /**
   * The game instance. Readonly.
   * @type {Game}
   */
  get game() { return this._game }

  /**
   * Flag telling if this touch object is active (i.e., finger is touching the
   * screen). Readonly.
   * @type {Boolean}
   */
  get down() { return this._down }

  /**
   * The position x of the finger. Readonly.
   * @type {Number}
   */
  get x() { return this._x }

  /**
   * The position y of the finger. Readonly.
   * @type {Number}
   */
  get y() { return this._y }

  /**
   * The position <x, y> of the finger. Readonly.
   * @type {PIXI.Point}
   */
  get position() { return new PIXI.Point(this._x, this._y) }

  /**
   * The force applied to the touch. This is an experimental feature and may
   * not work on every browser. Readonly.
   * @type {Number}
   */
  get force() { return this._force }

  /**
   * The radius (in the x axis) of the touch to the touch. This is an
   * experimental feature and may not work on every browser. Readonly.
   * @type {Number}
   */
  get radiusX() { return this._radiusX }

  /**
   * The radius (in the y axis) of the touch to the touch. This is an
   * experimental feature and may not work on every browser. Readonly.
   * @type {Number}
   */
  get radiusY() { return this._radiusY }

  /**
   * The radius of the touch to the touch. This is an experimental feature and
   * may not work on every browser. Readonly.
   * @type {PIXI.Point}
   */
  get radius() { return new PIXI.Point(this._radiusX, this._radiusY) }

  /**
   * The rotation of the touch to the touch. This is an experimental feature
   * and may not work on every browser. Readonly.
   * @type {Number}
   */
  get rotation() { return this._rotation }

  setup() {
    let injector = $.getInjector()
    this._display = injector.resolve('display')
    this._renderer = injector.resolve('renderer')
  }

  /**
   * Binds a this object to a browser touch object.
   * 
   * @param {Touch} touch - The browser touch object.
   */
  bind(touch) {
    this._down = true
    this._id = touch.identifier
    this.notify(touch)
  }

  /**
   * Unbinds a this object to a browser touch object.
   * 
   * @param {Touch} [touch] - The browser touch object.
   */
  unbind(touch) {
    this._id = -1
    this._down = false
    if (touch) this.notify(touch)
  }

  /**
   * Update this object from the browser touch object.
   * 
   * @param {Touch} touch - The browser touch object.
   */
  notify(touch) {
    let view = this._renderer.view
    let display = this._display

    let rect = view.getBoundingClientRect();
    let res = display.resolution;

    let x = ((touch.pageX - rect.left) * (display.width/rect.width)) * res;
    let y = ((touch.pageY - rect.top) * (display.height/rect.height)) * res;

    this._x = x
    this._y = y
    this._force = touch.force || touch.webkitForce || 0
    this._radiusX = touch.radiusX || touch.webkitRadiusX || 0
    this._radiusY = touch.radiusY || touch.webkitRadiusY || 0
    this._rotation = touch.rotationAngle || touch.webkitRotationAngle || 0
  }
}

module.exports = Touch