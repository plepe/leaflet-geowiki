const leafletMapping = {
  'stroke': 'color',
  'stroke-width': 'weight',
  'stroke-opacity': 'opacity',
  'fill': 'fillColor',
  'fill-opacity': 'fillOpacity',
  'radius': 'radius'
}

module.exports = (layer, style) => {
  let leafletStyle = {}

  for (let k in style) {
    if (k in leafletMapping) {
      leafletStyle[leafletMapping[k]] = style[k]
    }
  }

  leafletStyle.stroke = style.stroke !== 'none'
  leafletStyle.fill = style.fill !== 'none'
  layer.setStyle(leafletStyle)
}
