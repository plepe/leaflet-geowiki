/* global L:false */
const EventEmitter = require('events')
const ModulekitForm = require('modulekit-form')

const Layer = require('./Layer')
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

    this.layer = new Layer(this)

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
      let item = this.layer.createLayer(event.layer)
      item.edit()

      this.emit('change', event)
    })
    this.map.on(L.Draw.Event.DRAWSTART, event => this.disableCurrentEditing())
    this.map.on(L.Draw.Event.EDITED, event => this.emit('change', event))
    this.map.on(L.Draw.Event.DELETED, event => this.emit('change', event))

    this.currentEdit = null

    let f = new ModulekitForm('page', {
      title: {
        type: 'text',
        name: 'Title'
      }
    })
    f.show(this.sidebarDom)
  }

  load (contents) {
    let data = JSON.parse(contents)

    if (data.type === 'FeatureCollection') {
      this.layer.load(data)
    } else if (data.type === 'Feature') {
      this.layer.load({
        type: 'FeatureCollection',
        features: [ data ]
      })
    }
  }

  disableCurrentEditing () {
    if (this.currentEdit) {
      this.currentEdit.disableEdit()
      this.currentEdit = null
    }
  }

  save () {
    let data = this.layer.toGeoJSON()

    return JSON.stringify(data, null, '  ')
  }
}

module.exports = Editor
