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

    let form = document.createElement('form')
    this.editor.sidebarDom.appendChild(form)
    form.onsubmit = () => {
      this.disableEdit()
      this.editor.edit()
      return false
    }

    let f = new ModulekitForm(
      'data',
      getLayerForm(this.leafletLayer), {
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

      applyStyle(this.leafletLayer, this.style)
    }
  }

  disableEdit () {
    this.editor.sidebarDom.innerHTML = ''
    this.leafletLayer.editing.disable()
  }
}

module.exports = EditableFeature
