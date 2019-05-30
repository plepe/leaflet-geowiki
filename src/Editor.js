/* global L:false */
const EventEmitter = require('events')
const ModulekitForm = require('modulekit-form')

const getLayerForm = require('./getLayerForm')
const applyStyle = require('./applyStyle')
const defaultStyle = require('./defaultStyle')
global.lang_str = {}

/**
 * Something changed within the content (feature added, feature modified, feature deleted)
 * @event Editor#change
 * @param {object} event - Event from Leaflet.Draw
 */

class Editor extends EventEmitter {
  constructor (options) {
    super()
    let dom = options.dom
    if (typeof options.dom === 'string') {
      dom = document.getElementById(options.dom)
    }

    let mapDom = document.createElement('div')
    mapDom.className = 'geowiki-editor-map'
    dom.appendChild(mapDom)

    this.sidebarDom = document.createElement('div')
    this.sidebarDom.className = 'geowiki-editor-sidebar'
    dom.appendChild(this.sidebarDom)

    this.map = L.map(mapDom).setView([ 48.2006, 16.3673 ], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map)

    this.items = new L.FeatureGroup()
    this.map.addLayer(this.items)
    var drawControl = new L.Control.Draw({
      draw: {
        polyline: {
          shapeOptions: {}
        },
      },
      edit: {
        featureGroup: this.items,
        edit: false
      }
    })
    this.map.addControl(drawControl)

    this.map.on(L.Draw.Event.CREATED, event => {
      var layer = event.layer
      layer.feature = { type: 'Feature', properties: {}, style: {} }

      this.addLayer(layer)
      this.editLayer(layer)

      this.emit('change', event)
    })
    this.map.on(L.Draw.Event.DRAWSTART, event => this.disableCurrentEditing())
    this.map.on(L.Draw.Event.EDITED, event => this.emit('change', event))
    this.map.on(L.Draw.Event.DELETED, event => this.emit('change', event))

    this.currentEdit = null
  }

  load (contents) {
    let data = JSON.parse(contents)

    if (data.type === 'FeatureCollection') {
      data.features.forEach(feature => {
        L.geoJSON(feature).getLayers().forEach(layer => this.addLayer(layer))
      })
    } else if (data.type === 'Feature') {
      this.items.addLayer(L.geoJSON(data).getLayers().forEach(layer =>
        this.items.addLayer(layer)
      ))
    }
  }

  addLayer (layer) {
    layer.on('click', e => this.editLayer(layer))

    if (layer.setStyle) {
      applyStyle(layer, layer.feature.style)
      layer.setStyle({ editing: {}, original: {} })
    }

    this.items.addLayer(layer)
  }

  editLayer (layer) {
    this.disableCurrentEditing()

    layer.editing.enable()
    this.currentEdit = layer

    this.sidebarDom.innerHTML = ''
    let f = new ModulekitForm(
      'page',
      getLayerForm(layer), {
        change_on_input: true
      }
    )

    f.set_data({
      properties: layer.feature.properties,
      style: layer.feature.style
    })

    f.show(this.sidebarDom)

    f.onchange = () => {
      let newData = f.get_data()

      for (let k in newData.properties) {
        layer.feature.properties[k] = newData.properties[k]
      }
      for (let k in newData.style) {
        if (newData.style[k] === null) {
          delete layer.feature.style[k]
        } else {
          layer.feature.style[k] = newData.style[k]
        }
      }

      applyStyle(layer, layer.feature.style)
    }
  }

  disableCurrentEditing () {
    if (this.currentEdit) {
      this.currentEdit.editing.disable()
      this.currentEdit = null
    }
  }

  save () {
    let data = {
      type: 'FeatureCollection',
      features: this.items.getLayers().map(layer => {
        return layer.toGeoJSON()
      })
    }

    return JSON.stringify(data, null, '  ')
  }
}

module.exports = Editor
