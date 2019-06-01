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
    if (this.leafletLayer.setStyle) {
      applyStyle(this.leafletLayer, this.style)
      this.leafletLayer.setStyle({ editing: {}, original: {} })
    }

    this.editor.addLayer(this.leafletLayer)
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
