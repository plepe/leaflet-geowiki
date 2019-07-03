const getStyleForm = require('./getStyleForm')
const defaultStyle = require('./defaultStyle')
const spec = require('./geojson-css-spec.json')
const leafletStyleMapping = require('./leafletStyleMapping.json')

module.exports = {
  initLayer (layer) {
    if (!layer.parent) {
      layer.additionalStyles = []

      layer.on('formDef', formDef => {
        console.log(layer.additionalStyles)
        formDef.properties.def.additionalStyles = {
          name: 'Additional styles for features',
          type: 'array',
          index_type: 'array',
          def: {
            type: 'text'
          }
        }
      })

      layer.on('formSave', data => {
        layer.additionalStyles.splice(0, layer.additionalStyles.length, ...data.properties.additionalStyles)
      })
    } else {
      layer.additionalStyles = layer.parent.additionalStyles

      layer.on('formDef', formDef => {
        layer.additionalStyles.forEach(styleId => {
          formDef['style:' + styleId] = {
            name: 'Style "' + styleId + '" for features in this layer',
            type: 'form',
            def: getStyleForm(null, getFullStyle(null, layer.parent, styleId))
          }
        })
      })

      layer.on('formLoad', data => {
        layer.additionalStyles.forEach(styleId => {
          data['style:' + styleId] = layer['style:' + styleId] || {}
        })
      })

      layer.on('formSave', data => {
        layer.additionalStyles.forEach(styleId => {
          if (!(('style:' + styleId) in layer)) {
            layer['style:' + styleId] = {}
          }

          for (let k in data['style:' + styleId]) {
            if (data['style:' + styleId][k] === null) {
              delete layer['style:' + styleId][k]
            } else {
              layer['style:' + styleId][k] = data['style:' + styleId][k]
            }
          }
        })
      })
    }
  },

  initFeature (feature) {
    feature.on('formDef', formDef => {
      feature.parent.additionalStyles.forEach(styleId => {
        formDef['style:' + styleId] = {
          name: 'Style "' + styleId + '"',
          type: 'form',
          def: getStyleForm(feature.leafletLayer, getFullStyle(feature.leafletLayer, feature.parent, styleId))
        }
      })
    })

    feature.on('formLoad', data => {
      feature.parent.additionalStyles.forEach(styleId => {
        data['style:' + styleId] = feature['style:' + styleId] || {}
      })
    })

    feature.on('formSave', data => {
      feature.parent.additionalStyles.forEach(styleId => {
        if (!(('style:' + styleId) in feature)) {
          feature['style:' + styleId] = {}
        }

        for (let k in data['style:' + styleId]) {
          if (data['style:' + styleId][k] === null) {
            delete feature['style:' + styleId][k]
          } else {
            feature['style:' + styleId][k] = data['style:' + styleId][k]
          }
        }
      })
    })

    feature.on('refresh', () => {
      if (!feature.additionalFeatures) {
        feature.additionalFeatures = {}
      }

      let popupContent = feature.renderPopup()

      feature.parent.additionalStyles.forEach(styleId => {
        if (!(styleId in feature.additionalFeatures)) {
          feature.additionalFeatures[styleId] =
            L.geoJSON(feature.leafletLayer.toGeoJSON(), {
              pointToLayer: (feature, latlng) => L.circleMarker(latlng)
            }).getLayers()[0]
          feature.additionalFeatures[styleId].addTo(feature.editor._map)
          if (feature.edit) {
            feature.additionalFeatures[styleId].on('click', e => feature.edit())
          }
        }

        let style = getFullStyle(feature.leafletFeature, feature, styleId)
        let leafletStyle = {}

        for (let k in style) {
          if (k in leafletStyleMapping) {
            leafletStyle[leafletStyleMapping[k]] = style[k]
          }
        }

        leafletStyle.stroke = style.stroke !== 'none'
        if (spec['fill']['geometry-types'].includes(feature.leafletLayer.feature.geometry.type)) {
          leafletStyle.fill = style.fill !== 'none'
        }

        feature.additionalFeatures[styleId].setStyle(leafletStyle)

        if (popupContent) {
          feature.additionalFeatures[styleId].bindPopup(popupContent)
        }
      })
    })

    feature.on('notifyModify', () => {
      for (let k in feature.additionalFeatures) {
        feature.additionalFeatures[k].remove()
      }
      feature.additionalFeatures = {}

      feature.refresh()
    })
  }
}

function getFullStyle (leafletFeature, feature, styleId) {
  let style = {}

  let featureDefaultStyle
  if (feature.parent) {
    featureDefaultStyle = getFullStyle(leafletFeature, feature.parent, styleId)
  } else {
    featureDefaultStyle = defaultStyle(leafletFeature)
  }

  for (let k in featureDefaultStyle) {
    style[k] = featureDefaultStyle[k]
  }

  for (let k in feature['style:' + styleId]) {
    style[k] = feature['style:' + styleId][k]
  }

  return style
}