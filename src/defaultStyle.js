const spec = require('./geojson-css-spec.json')

module.exports = layer => {
  let result = {}

  for (let key in spec) {
    if (!spec[key]['geometry-types'] || spec[key]['geometry-types'].includes(layer.feature.geometry.type)) {
      result[key] = spec[key].default
    }
  }

  return result
}
