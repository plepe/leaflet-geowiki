const Feature = require('./Feature')

class Layer {
  constructor (editor, parent) {
    this.editor = editor
    this.parent = parent
    this.items = []
    this.properties = {}
    this.style = {}
  }

  createLayer (featureGroup, layer) {
    return new Layer(featureGroup, layer)
  }

  createFeature (featureGroup, layer) {
    return new Feature(featureGroup, layer)
  }

  load (data) {
    data.features.forEach(feature => {
      let item

      switch (feature.type) {
        case 'FeatureCollection':
          item = this.createLayer(this.editor, this)
          break
        case 'Feature':
          item = this.createFeature(this.editor, this)
          break
      }

      item.load(feature)
      this.items.push(item)
          
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

    data.features = this.items.map(item => {
      return item.toGeoJSON()
    })

    return data
  }
}

module.exports = Layer
