module.exports = layer => {
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
      def: {
        'stroke': {
          name: 'stroke color',
          type: 'select_other',
          'placeholder': 'inherit',
          'button:other': "Specify color",
          values: {
            'none': 'none'
          },
          other_def: {
            type: 'color'
          }
        },
        'stroke-width': {
          type: 'float',
          name: 'stroke width'
        },
        'stroke-opacity': {
          name: 'stroke opacity',
          type: 'float'
        },
        'fill': {
          name: 'fill color',
          type: 'select_other',
          'placeholder': 'inherit',
          'button:other': "Specify color",
          values: {
            'none': 'none'
          },
          other_def: {
            type: 'color'
          }
        },
        'fill-opacity': {
          name: 'fill opacity',
          type: 'float'
        }
      }
    }
  }
}
