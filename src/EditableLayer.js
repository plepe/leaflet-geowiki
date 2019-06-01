const Layer = require('./Layer')
const EditableFeature = require('./EditableFeature')

class EditableLayer extends Layer {
  createLayer (featureGroup, layer) {
    return new EditableLayer(featureGroup, layer)
  }

  createFeature (featureGroup, layer) {
    return new EditableFeature(featureGroup, layer)
  }

  leafletCreateLayer (leafletLayer) {
    let item = new EditableFeature(this.editor, this)
    item.createFrom(leafletLayer)
    this.items.push(item)
    this.editor.addLayer(leafletLayer)

    return item
  }

}

module.exports = EditableLayer
