/* global L:false */

require('leaflet-draw')
const yaml = require('yaml')

require('./Viewer.js')
const EditableLayer = require('./EditableLayer')
const listLayers = require('./listLayers')

/**
 * @typedef L.GeowikiViewer#Filedata
 * Information about a file being loaded / saved
 * @property {string} [contents] - Contents of the file. If missing, a XMLHttpRequest will be created with the name of the file.
 * @property {string} [name] - File name including extension. Required, if contents is missing.
 */

/**
 * @class L.GeowikiEditor
 * @extends L.GeowikiViewer
 * Geowiki Editor class
 */
L.GeowikiEditor = L.GeowikiViewer.extend({
  initialize (options) {
    L.GeowikiViewer.prototype.initialize(options)

    if (typeof options.sidebar === 'string') {
      this.sidebarDom = document.getElementById(options.sidebar)
    } else {
      this.sidebarDom = document.createElement('div')
    }
    this.sidebarDom.className = 'geowiki-editor-sidebar'

    this.on('preload', () => {
      this.disableCurrentEditing()
      this.closeDefaultFile()
    })
    this.on('load', () => this.edit())

    // create an initial empty file
    this.load({
      name: 'unnamed.geowiki',
      contents: require('./defaultFile.json')
    })
    this._currentLayer = this.layerTree[0].layerTree[0]

    // this.edit()
  },

  // only the default file is loaded
  isOnlyDefaultFile () {
    return this.layerTree.length === 1 &&
      this.layerTree[0].layerTree.length === 1 &&
      this.layerTree[0].layerTree[0].layerTree.length === 0 &&
      this.layerTree[0].layerTree[0].items.length === 0 &&
      this.layerTree[0].items.length === 0 &&
      Object.keys(this.layerTree[0].properties).length === 1 &&
      Object.keys(this.layerTree[0].style).length === 0
  },

  closeDefaultFile () {
    if (this.isOnlyDefaultFile()) {
      this.layerTree = []
    }
  },

  createLayer (featureGroup) {
    return new EditableLayer(featureGroup)
  },

  currentLayer () {
    if (!this._currentLayer) {
      if (!this.layerTree.length) {
        this.layerTree.push(this.createLayer(this, null))
      }
      return this.layerTree[0]
    }

    return this._currentLayer
  },

  onAdd (map) {
    L.GeowikiViewer.prototype.onAdd(map)

    this.drawControl = new L.Control.Draw({
      draw: {
        circle: false,
        polyline: {
          shapeOptions: {}
        }
      },
      edit: {
        featureGroup: this,
        edit: false,
        remove: false
      }
    })
    map.addControl(this.drawControl)

    map.on(L.Draw.Event.CREATED, event => {
      let item = this.currentLayer().leafletCreateLayer(event.layer)
      item.edit()

      this.fire('change', event)
    })
    map.on(L.Draw.Event.DRAWSTART, event => this.disableCurrentEditing())
    map.on(L.Draw.Event.EDITED, event => this.fire('change', event))
    map.on(L.Draw.Event.DELETED, event => this.fire('change', event))
    map.on(L.Draw.Event.EDITMOVE, event => this.currentEdit.notifyModify(event))
    map.on(L.Draw.Event.EDITVERTEX, event => this.currentEdit.notifyModify(event))

    this.edit()
  },

  disableCurrentEditing () {
    if (this.currentEdit) {
      this.currentEdit.disableEdit()
      this.currentEdit = null
    }
  },

  /**
   * save all files
   * @method saveAll
   * @memberof L.GeowikiEditor
   * @return {L.GeowikiViewer#Filedata[]} Returns meta data and contents of all files. All properties of the file data from loading will be kept, only contents updated.
   */
  saveAll () {
    return this.layerTree.map((layer, i) => {
      let contents = layer.toGeoJSON()
      contents['geowiki-version'] = "0.1"

      let filedata = {}
      for (let k in layer.filedata) {
        filedata[k] = layer.filedata[k]
      }

      filedata.contents = yaml.stringify(contents)
      if (!('name' in filedata)) {
        result.name = 'unnamed.geowiki'
      }

      return filedata
    })
  },

  edit () {
    this.sidebarDom.innerHTML = ''

    if (this.layerTree.length) {
      this.sidebarDom.appendChild(listLayers(this))
    }
  },

  _closeFile (item) {
    this.layerTree.splice(this.layerTree.indexOf(item), 1)
  }
})

L.geowikiEditor = (options) => {
  return new L.GeowikiEditor(options)
}
