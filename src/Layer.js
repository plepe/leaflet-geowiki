const Feature = require('./Feature')

class Layer {
  constructor (editor, parent) {
    this.editor = editor
    this.parent = parent
    this.items = []
    this.properties = {}
    this.style = {}
    this.layerTree = []
  }

  createLayer (featureGroup, layer) {
    return new Layer(featureGroup, layer)
  }

  createFeature (featureGroup, layer) {
    return new Feature(featureGroup, layer)
  }

  load (data) {
    this.properties = data.properties || {}
    this.style = data.style || {}

    data.features.forEach(feature => {
      let item

      switch (feature.type) {
        case 'FeatureCollection':
          item = this.createLayer(this.editor, this)
          this.layerTree.push(item)
          break
        case 'Feature':
          item = this.createFeature(this.editor, this)
          this.items.push(item)
          break
      }

      item.load(feature)
    })
  }

  toGeoJSON () {
    let data = {
      type: 'FeatureCollection'
    }

    if (Object.keys(this.properties).length) {
      data.properties = this.properties
    }

    if (Object.keys(this.style).length) {
      data.style = this.style
    }

    data.features = this.layerTree.map(item => {
      return item.toGeoJSON()
    })

    data.features = data.features.concat(this.items.map(item => {
      return item.toGeoJSON()
    }))

    return data
  }
}

module.exports = Layer
