const applyStyle = require('./applyStyle')

class Feature {
  constructor (editor, parent) {
    this.editor = editor
    this.parent = parent
    this.isHidden = false
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
      applyStyle(this.leafletLayer, this.getFullStyle())
      this.leafletLayer.setStyle({ editing: {}, original: {} })
    }

    this.editor.addLayer(this.leafletLayer)
  }

  getFullStyle () {
    let style = {}

    let featureDefaultStyle = this.parent.getFullStyle()
    for (let k in featureDefaultStyle) {
      style[k] = featureDefaultStyle[k]
    }

    for (let k in this.style) {
      style[k] = this.style[k]
    }

    return style
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

  hide () {
    this.isHidden = true
    this.leafletLayer.remove()
  }

  show () {
    this.isHidden = false
    this.leafletLayer.addTo(this.editor._map)
  }

  toggleVisibility () {
    if (this.isHidden) {
      this.show()
    } else {
      this.hide()
    }
  }

  refresh () {
    applyStyle(this.leafletLayer, this.getFullStyle())
  }
}

module.exports = Feature
