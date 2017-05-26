import System from 'sk/core/System'
import * as $ from 'sk/$'
import * as utils from 'sk/utils'

/**
 * Creates a new system.
 * 
 * This function receives an object with the system specification, and 
 * register a new system into the engine if the specification is valid.
 *
 * You must provide a name for the system, which will be used to link the
 * system on the scenes. Check the user guide for a suggestion of how to name
 * the system. Additionally to the name, you should provide an access name. 
 * The access will be used to access the system after it is created. See the 
 * examples below to have an idea of how this will work. Notice that, if you 
 * don't provide an access name, the access will be by its name.
 *
 * It is important to also notice that names cannot be duplicated in the engine
 * (you can't have two systems with the same name), however, you may have
 * multiple systems with the same access name. In this case, when adding
 * systems with duplicated access to the entity, only the last system will be 
 * added.
 *
 * You also must provide a `check` function. Everytime an entity is added to
 * scene, the scene will call this check function passing the entity as 
 * argument. The check function will tell the scene if the system is interested
 * into that entity (i.e., if the entity can be processed by the system). With
 * this, the scene will create a cached list of the entities specifically for
 * the system.
 * 
 * A system accepts a map with custom `data` values. All content of the data
 * map can be accessed just like an attribute in the system, and it will be
 * used to serialize and deserialize the object, so keep it limited to 
 * JSON-compatible data.
 *
 * Similarly to the data map, the system also accepts a map of `methods`,
 * which can be accessed directly as common methods. If you are using es6, 
 * remember that you **cannot** use arrow functions here, due to how it treats
 * the `this` value (if you use the arrow function, this will be the current
 * scope, e.g., the window). Check below for usage examples.
 *
 * It is strongly recommended that the system methods be used only to change
 * or return the system state, without access to any external resource 
 * (including the entity itself). This is important in order to create 
 * independent and reusable systems.
 * 
 *
 * Usage example:
 *
 *     sk.system({
 *       name: 'Collision',
 *       access: 'collision',
 *       check: function(entity) {
 *         return entity.has('Collider')
 *       },
 *       update: function(entities) {
 *         ... process the entitites ...
 *       }
 *     })
 * 
 *
 * @param {Object} spec
 * @param {String} spec.name - The system name, which will be used in the scene
 *        declaration.
 * @param {String} spec.access - The access name of the system which will be 
 *        used to access the system in the scene object.
 * @param {Function} spec.initialize - The initialization function.
 * @param {Function} spec.check - The check function.
 * @param {Function} spec.update - The update function.
 * @param {Object} spec.data - The attributes of the system.
 * @param {Object} spec.methods - The methods of the system.
 */
export function system(spec) {
  // Spec validation
  _validate(spec)

  // Processing values
  let {c, p} = _process(spec)

  // Create the system class
  let Class = utils.createClass(System, c, p)

  // Set id
  $.setClassId(Class)

  // Register
  return Class
}


// Shortcut for throwing an error
function throws(message, error) {
  error = error || Error
  throw new error(message)
}

// Validates the spec
function _validate(spec) {
  // Empty spec
  if (!spec)
    throws(`Empty system specification. Please provide an object with the `+
           `system declaration.`)

  // Spec type
  if (typeof spec !== 'object')
    throws(`The system specification must be an object.`)

  // Check function not provided
  if (!spec.check)
    throws(`The system "${spec.name}" must have a check function.`)

  // Check is a function
  if (!utils.isFunction(spec.check))
    throws(`Check function for "${spec.name}" system must be a function.`)
  
  // Initialize is a function
  if (spec.initialize && !utils.isFunction(spec.initialize))
    throws(`Initialize function for "${spec.name}" system must be a function.`)

  // Destroy is a function
  if (spec.destroy && !utils.isFunction(spec.destroy))
    throws(`Destroy function for "${spec.name}" system must be a function.`)

  // Update is a function
  if (spec.update && !utils.isFunction(spec.update))
    throws(`Update function for "${spec.name}" system must be a `+
                        `function.`)
  
  // Data items
  if (spec.data) {
    if (typeof spec.data !== 'object')
      throws(`Data for system "${spec.name}" must be an object. You `+
             `provided "${spec.data}" instead.`)

    for (let key in spec.data) {
      if (utils.isFunction(spec.data[key]))
        throws(`Attribute "${key}" for system "${spec.name}" can't be a `+
               `function, use the *method* option if you want to include a `+
               `method.`)
    }
  }

  // Method items
  if (spec.methods) {
    if (typeof spec.methods !== 'object')
      throws(`Methods for system "${spec.name}" must be an object. You `+
             `provided "${spec.methods}" instead.`)

    let data = spec.data || {}
    for (let key in spec.methods) {
      if (data[key] !== undefined)
        throws(`Method "${key}" for system "${spec.name}" is using a `+
               `duplicated name, please change the method name.`)

      if (!utils.isFunction(spec.methods[key]))
        throws(`Method "${key}" for system "${spec.name}" must be a `+
               `function.`)
    }
  }
}

// Process values
function _process(spec) {
  let c = {} // class namespace
  let p = {} // prototype

  // Static properties
  let data = Object.freeze(spec.data || {})
  let methods = Object.freeze(spec.methods || {})
  let attributes = Object.freeze(Object.keys(data))
  p._$data = c._$data = data
  p._$methods = c._$methods = methods
  p._$attributes = c._$attributes = attributes

  // Data and method values
  for (let k in data) p[k] = data[k]
  for (let k in methods) p[k] = methods[k]

  // Shortcuts (override methods)
  if (spec.initialize) p.initialize = spec.initialize
  if (spec.destroy) p.destroy = spec.destroy
  if (spec.check) p.check = spec.check
  if (spec.update) p.update = spec.update

  return {c, p}
}
