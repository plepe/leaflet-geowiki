const spec = require('./geojson-css-spec.json')

module.exports = layer => {
  let result = {}

  for (let key in spec) {
    result[key] = spec[key].default
  }

  return result
}
