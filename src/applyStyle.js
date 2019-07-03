const spec = require('./geojson-css-spec.json')
const leafletStyleMapping = require('./leafletStyleMapping.json')

module.exports = (leafletFeature, style) => {
  let leafletStyle = {}

  for (let k in style) {
    if (k in leafletStyleMapping) {
      leafletStyle[leafletStyleMapping[k]] = style[k]
    }
  }

  leafletStyle.stroke = style.stroke !== 'none'
  if (spec['fill']['geometry-types'].includes(leafletFeature.feature.geometry.type)) {
    leafletStyle.fill = style.fill !== 'none'
  }
  leafletFeature.setStyle(leafletStyle)
}
