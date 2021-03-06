/**
 * Recursively copies the provided object. This functions is a shortcut for:
 *
 *     JSON.parse(JSON.stringify(object))
 *
 * @param {Object} object - The source object.
 * @return {Object} The copied object.
 */
function shallowCopy(object) {
  let result = {}
  Object.keys(object)
        .forEach(x => result[x] = object[x])
  return result
}

module.exports = shallowCopy