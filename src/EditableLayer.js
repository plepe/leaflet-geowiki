const ModulekitForm = require('modulekit-form')

const getLayerForm = require('./getLayerForm')
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

  edit () {
    this.editor.disableCurrentEditing()

    this.editor.currentEdit = this

    this.editor.sidebarDom.innerHTML = ''

    let form = document.createElement('form')
    this.editor.sidebarDom.appendChild(form)
    form.onsubmit = () => {
      this.editor.edit()
      return false
    }

    let f = new ModulekitForm(
      'data',
      getLayerForm(), {
        change_on_input: true
      }
    )

    f.show(form)

    let input = document.createElement('input')
    input.type = 'submit'
    input.value = 'Ok'
    form.appendChild(input)

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

      this.refresh()
    }
  }

  disableEdit () {
    this.editor.sidebarDom.innerHTML = ''
  }
}

module.exports = EditableLayer
