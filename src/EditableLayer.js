const ModulekitForm = require('modulekit-form')

const getStyleForm = require('./getStyleForm')
const Layer = require('./Layer')
const EditableFeature = require('./EditableFeature')
const listLayers = require('./listLayers')
const defaultStyle = require('./defaultStyle')

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

    let header = document.createElement('h2')
    header.appendChild(document.createTextNode("Edit "))
    header.appendChild(document.createTextNode(this.name()))
    this.editor.sidebarDom.appendChild(header)

    let form = document.createElement('form')
    this.editor.sidebarDom.appendChild(form)
    form.onsubmit = () => {
      this.editor.edit()
      return false
    }

    let formDef = {}
    formDef.properties = {
      type: 'form',
      name: 'Properties',
      def: {
        name: {
          type: 'text',
          name: 'Name'
        }
      }
    }

    if (!this.parent) {
      formDef.featureFields = {
        'type': 'hash',
        'name': 'Fields',
        'desc': 'Define which fields should be collected for each map feature',
        'default': 1,
        'button:add_element': 'Add another field',
        'key_def': {
          'type': 'text',
          'name': 'Key'
        },
        'def': {
          'type': 'form',
          'def': {
            'name': {
              'type': 'text',
              'name': 'Name',
              'weight': -1
            },
            'type': {
              'type': 'select',
              'name': 'Type',
              'values': {
                'text': 'Text, single line',
                'textarea': 'Text, multiple lines'
              },
              'default': 'text'
            }
          }
        }
      }
    }

    formDef.style = {
      name: 'Style for Features in this layer',
      type: 'form',
      def: getStyleForm(null, this.parent ? this.parent.getFullStyle() : defaultStyle())
    }

    let f = new ModulekitForm(
      'data',
      formDef, {
        change_on_input: true
      }
    )

    f.show(form)

    let input = document.createElement('input')
    input.type = 'submit'
    input.value = 'Ok'
    form.appendChild(input)

    f.set_data({
      featureFields: this.featureFields,
      properties: this.properties,
      style: this.style
    })

    f.onchange = () => {
      let newData = f.get_data()

      if (newData.featureFields) {
        this.featureFields = newData.featureFields
      }
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

      header.innerHTML = ''
      header.appendChild(document.createTextNode("Edit "))
      header.appendChild(document.createTextNode(this.name()))

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
        a.title = 'Toggle visibility'
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
    a.innerHTML = '<i class="fas fa-plus"></i> Create new sublayer'
    a.href = '#'
    a.onclick = () => {
      let layer = new EditableLayer(this.editor, this)
      this.layerTree.push(layer)
      this.editor._currentLayer = layer
      layer.edit()
      return false
    }
    li.appendChild(a)

    li = document.createElement('li')
    ul.appendChild(li)
    a = document.createElement('a')
    a.innerHTML = '<i class="fas fa-eye"></i> Toggle visibility'
    a.href = '#'
    a.onclick = () => {
      this.toggleVisibility()
      return false
    }
    li.appendChild(a)

    li = document.createElement('li')
    ul.appendChild(li)
    a = document.createElement('a')
    if (this.parent) {
      a.innerHTML = '<i class="fas fa-trash-alt"></i> Delete layer and contents'
    } else {
      a.innerHTML = '<i class="fas fa-window-close"></i> Close file'
    }
    a.href = '#'
    a.onclick = () => {
      this.remove()
      this.editor.edit()
      return false
    }
    li.appendChild(a)
  }

  remove () {
    this.layerTree.concat().forEach(item => item.remove())
    this.items.concat().forEach(item => item.remove())
    if (this.parent) {
      this.parent._removeLayer(this)
    } else {
      this.editor._closeFile(this)
    }
  }

  _removeLayer (item) {
    this.layerTree.splice(this.layerTree.indexOf(item), 1)
  }

  _removeFeature (item) {
    this.items.splice(this.items.indexOf(item), 1)
  }

  disableEdit () {
    this.editor.sidebarDom.innerHTML = ''
  }
}

module.exports = EditableLayer
