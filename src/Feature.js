const ModulekitForm = require('modulekit-form')
const getLayerForm = require('./getLayerForm')

const applyStyle = require('./applyStyle')

class Feature {
  constructor (editor, parent) {
    this.editor = editor
    this.parent = parent
  }

  load (data) {
    this.leafletLayer = L.geoJSON(data).getLayers()[0]
    this.properties = this.leafletLayer.feature.properties || {}
    this.style = this.leafletLayer.feature.style || {}
    this.add()
  }

  createFrom (leafletLayer) {
    this.leafletLayer = leafletLayer
    this.properties = {}
    this.style = {}
    this.add()
  }

  add () {
    this.leafletLayer.on('click', e => this.edit())

    if (this.leafletLayer.setStyle) {
      applyStyle(this.leafletLayer, this.style)
      this.leafletLayer.setStyle({ editing: {}, original: {} })
    }

    this.editor.items.addLayer(this.leafletLayer)
  }

  edit () {
    this.editor.disableCurrentEditing()

    this.leafletLayer.editing.enable()
    this.editor.currentEdit = this

    this.editor.sidebarDom.innerHTML = ''
    let f = new ModulekitForm(
      'data',
      getLayerForm(this.leafletLayer), {
        change_on_input: true
      }
    )

    f.show(this.editor.sidebarDom)

    f.set_data({
      properties: this.properties,
      style: this.style
    })

    f.onchange = () => {
      let newData = f.get_data()

      for (let k in newData.properties) {
        this.properties[k] = newData.properties[k]
      }
      for (let k in newData.style) {
        if (newData.style[k] === null) {
          delete this.style[k]
        } else {
          this.style[k] = newData.style[k]
        }
      }

      applyStyle(this.leafletLayer, this.style)
    }
  }

  disableEdit () {
    this.leafletLayer.editing.disable()
  }

  toGeoJSON () {
    let data = { type: 'Feature' }

    if (Object.keys(this.properties).length) {
      data.properties = this.properties
    }

    if (Object.keys(this.style).length) {
      data.style = this.style
    }

    data.geometry = this.leafletLayer.toGeoJSON().geometry

    return data
  }
}

module.exports = Feature
