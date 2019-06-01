const ModulekitForm = require('modulekit-form')

const getLayerForm = require('./getLayerForm')
const Feature = require('./Feature')
const applyStyle = require('./applyStyle')

class EditableFeature extends Feature {
  add () {
    this.leafletLayer.on('click', e => this.edit())

    super.add()
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
        if (newData.style[k] === null) {
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
}

module.exports = EditableFeature
