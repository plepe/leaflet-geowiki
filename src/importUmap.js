const styleMapping = {
  color: 'stroke',
  opacity: 'stroke-opacity',
  weight: 'stroke-width'
}

module.exports = function (data) {
  data.layers.forEach(layer => {
    if (layer.properties && layer.properties._storage_options) {
      layer.style = {}
      for (let k in layer.properties._storage_options) {
        if (k in styleMapping) {
          layer.style[styleMapping[k]] = layer.properties._storage_options[k]
        } else {
          layer.style[k] = layer.properties._storage_options[k]
        }
      }
      delete layer.properties
    }

    layer.properties = layer._storage
    delete layer._storage

    layer.features.forEach(feature => {
      feature.style = {}
      for (let k in feature.properties._storage_options) {
        if (k in styleMapping) {
          feature.style[styleMapping[k]] = feature.properties._storage_options[k]
        } else {
          feature.style[k] = feature.properties._storage_options[k]
        }
      }
      delete feature.properties._storage_options
    })
  })

  return {
    'type': 'FeatureCollection',
    'properties': data.properties,
    'features': data.layers
  }
}
