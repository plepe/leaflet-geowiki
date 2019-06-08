const spec = require('./geojson-css-spec.json')

module.exports = layer => {
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
          'placeholder': 'inherit',
          'button:other': "Specify color",
          values: {
            'none': 'none'
          },
          other_def: {
            type: 'color'
          }
        }
        break
      case 'length':
      case 'opacity':
        formDef = {
          type: 'float'
        }
        break
      default:
        console.log('unknown geojson field type', def.type)
        formDef = {
          type: 'text'
        }
    }

    formDef.name = def.name

    style[key] = formDef
  }

  return {    
    properties: {
      name: 'Properties',
      type: 'form',
      def: {
        name: {
          type: 'text',
          name: 'Name'
        }
      }
    },
    style: {
      name: 'Style',
      type: 'form',
      def: style
    }
  }
}
