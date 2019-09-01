const spec = require('./geojson-css-spec.json')

module.exports = (layer, inheritedValues) => {
  let style = {}

  for (let key in spec) {
    let def = spec[key]
    let formDef

    if (layer && spec[key]['geometry-types'] && !spec[key]['geometry-types'].includes(layer.feature.geometry.type)) {
      continue
    }

    switch (def.type) {
      case 'paint':
        formDef = {
          type: 'select_other',
          'placeholder': 'inherit' + (inheritedValues ? ' (' + inheritedValues[key] + ')' : ''),
          'button:other': 'Specify color',
          values: {
            'none': 'none'
          },
          other_def: {
            type: 'textarea'
          }
        }
        break
      case 'length':
      case 'opacity':
        formDef = {
          type: 'textarea',
          'placeholder': 'inherit' + (inheritedValues ? ' (' + inheritedValues[key] + ')' : '')
        }
        break
      case 'marker-type':
        formDef = {
          type: 'select',
          values: { none: 'None', pointer: 'Pointer' },
          placeholder: 'inherit' + (inheritedValues ? ' (' + inheritedValues[key] + ')' : '')
        }
        break
      default:
        console.log('unknown geojson field type', def.type)
        formDef = {
          type: 'textarea'
        }
    }

    formDef.name = def.name

    style[key] = formDef
  }

  return style
}
