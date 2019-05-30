const defaultStyle = require('./defaultStyle')
const leafletMapping = {
  'stroke': 'color',
  'stroke-width': 'weight',
  'stroke-opacity': 'opacity',
  'fill': 'fillColor',
  'fill-opacity': 'fillOpacity'
}

module.exports = (layer, style) => {
  let leafletStyle = {}
  
  let featureDefaultStyle = defaultStyle(layer)
  for (let k in featureDefaultStyle) {
    if (k in leafletMapping) {
      leafletStyle[leafletMapping[k]] = featureDefaultStyle[k]
    }
  }

  for (let k in style) {
    if (k in leafletMapping) {
      leafletStyle[leafletMapping[k]] = style[k]
    }
  }

  leafletStyle.stroke = style.stroke !== 'none'
  leafletStyle.fill = style.fill !== 'none'
  layer.setStyle(leafletStyle)
}
