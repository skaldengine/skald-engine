const assertColor = require('sk/colors/_common').assertColor
const assertFloat = require('sk/colors/_common').assertFloat
const colorToRgb = require('sk/colors/colorToRgb')
const rgbToColor = require('sk/colors/rgbToColor')

/**
 * Shortcut for `blend(0x000000, color2, amount)`.
 *
 * @param {Number} color - The int color.
 * @param {Number} amount - Weight of the blend.
 */
function shade(color, amount) {
  assertColor(color, `shade`)
  amount = assertFloat(amount, `amount`, `shade`)

  let c2 = colorToRgb(color)

  return rgbToColor(
    Math.round(c2.red*amount),
    Math.round(c2.green*amount),
    Math.round(c2.blue*amount)
  )
}


module.exports = shade