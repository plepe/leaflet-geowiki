const ModulekitForm = require('modulekit-form')

const getLayerForm = require('./getLayerForm')
const Layer = require('./Layer')
const EditableFeature = require('./EditableFeature')
const listLayers = require('./listLayers')

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

    if (this.layerTree.length) {
      let h = document.createElement('h3')
      h.innerHTML = 'Sublayers'
      form.appendChild(h)

      form.appendChild(listLayers(this))
    }

    if (this.items.length) {
      let h = document.createElement('h3')
      h.innerHTML = 'Items'
      form.appendChild(h)

      let ul = document.createElement('ul')
      form.appendChild(ul)

      this.items.forEach(item => {
        let li = document.createElement('li')
        ul.appendChild(li)

        let actions = document.createElement('span')
        actions.className = 'actions'
        li.appendChild(actions)

        let a = document.createElement('a')
        a.innerHTML = '<i class="fas fa-eye"></i>'
        a.href = '#'
        a.onclick = () => {
          item.toggleVisibility()
          return false
        }
        actions.appendChild(a)

        a = document.createElement('a')
        a.appendChild(document.createTextNode(item.name()))
        a.href = '#'
        a.onclick = () => {
          item.edit()
          return false
        }
        li.appendChild(a)
      })
    }

    let actions = document.createElement('div')
    actions.className = 'actions'
    form.appendChild(actions)

    let h = document.createElement('h3')
    h.appendChild(document.createTextNode('Actions'))
    actions.appendChild(h)

    let ul = document.createElement('ul')
    form.appendChild(ul)

    let li = document.createElement('li')
    ul.appendChild(li)
    let a = document.createElement('a')
    a.innerHTML = '<i class="fas fa-eye"></i> Create new sublayer'
    a.href = '#'
    a.onclick = () => {
      let layer = new EditableLayer(this.editor, this)
      this.layerTree.push(layer)
      this.editor._currentLayer = layer
      layer.edit()
      return false
    }
    li.appendChild(a)
  }

  disableEdit () {
    this.editor.sidebarDom.innerHTML = ''
  }
}

module.exports = EditableLayer
