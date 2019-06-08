const Feature = require('./Feature')
const defaultStyle = require('./defaultStyle')

class Layer {
  constructor (editor, parent) {
    this.editor = editor
    this.parent = parent
    this.items = []
    this.properties = {}
    this.style = {}
    this.layerTree = []
    this.isHidden = false
  }

  name () {
    if (this.properties.name) {
      return this.properties.name
    }

    if (this.parent) {
      return 'Layer' + ' #' + (this.parent.layerTree.indexOf(this) + 1)
    }

    return 'unnamed'
  }

  path () {
    if (this.parent) {
      return this.parent.path() + '/' + this.parent.layerTree.indexOf(this)
    } else {
      return '/' + this.editor.layerTree.indexOf(this)
    }
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

  getFullStyle (leafletFeature) {
    let style = {}

    let featureDefaultStyle
    if (this.parent) {
      featureDefaultStyle = this.parent.getFullStyle(leafletFeature)
    } else {
      featureDefaultStyle = defaultStyle(leafletFeature)
    }

    for (let k in featureDefaultStyle) {
      style[k] = featureDefaultStyle[k]
    }

    for (let k in this.style) {
      style[k] = this.style[k]
    }

    return style
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

  allSubLayers () {
    let result = []

    this.layerTree.forEach(layer =>
      result = result.concat([ layer ].concat(layer.allSubLayers()))
    )

    return result
  }

  hide () {
    this.isHidden = true
    this.layerTree.forEach(item => item.hide())
    this.items.forEach(item => item.hide())
  }

  show () {
    this.isHidden = false
    this.layerTree.forEach(item => item.show())
    this.items.forEach(item => item.show())
  }

  toggleVisibility () {
    if (this.isHidden) {
      this.show()
    } else {
      this.hide()
    }
  }

  refresh () {
    this.layerTree.forEach(item => item.refresh())
    this.items.forEach(item => item.refresh())
  }
}

module.exports = Layer
