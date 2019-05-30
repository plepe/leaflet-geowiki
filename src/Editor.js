/* global L:false */
const EventEmitter = require('events')

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

    let sidebarDom = document.createElement('div')
    sidebarDom.className = 'geowiki-editor-sidebar'
    dom.appendChild(sidebarDom)

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
      layer.setStyle({ editing: {}, original: {} })
    }

    this.items.addLayer(layer)
  }

  editLayer (layer) {
    this.disableCurrentEditing()

    layer.editing.enable()
    this.currentEdit = layer
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
