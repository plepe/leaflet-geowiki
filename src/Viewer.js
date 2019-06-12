/* global L:false */

const Layer = require('./Layer')
const importUmap = require('./importUmap')
global.lang_str = {}

L.GeowikiViewer = L.FeatureGroup.extend({
  initialize (options) {
    L.Util.setOptions(this, options)

    this._layers = {}
    this.layerTree = []
  },

  load (filename, contents, callback) {
    if (!callback) {
      callback = () => {}
    }

    if (typeof contents === null) {
      let req = new window.XMLHttpRequest()
      req.open('GET', filename)
      req.overrideMimeType('application/json')
      req.onreadystatechange = () => {
        if (req.readyState !== 4) {
          return
        }

        if (req.status === 200) {
          this.load(filename, req.responseText, callback)
        } else {
          callback(new Error(req.statusText))
        }
      }

      return req.send(null)
    } else if (typeof contents === 'string') {
      try {
        contents = JSON.parse(contents)
      } catch (e) {
        return callback(e)
      }
    }

    if (filename.match(/\.umap$/)) {
      contents = importUmap(contents)
    }

    if (!('properties' in contents)) {
      contents.properties = {}
    }
    if (!('name' in contents.properties)) {
      contents.properties.name = filename
    }

    let layer = this.createLayer(this, null)
    layer.filename = filename
    this.fire('preload', layer)

    layer.load(contents)
    this.layerTree.push(layer)

    this._currentLayer = layer

    this.fire('load', layer)
    callback(null, layer)
  },

  createLayer (featureGroup) {
    return new Layer(featureGroup)
  },

  /**
   * returns an array of all layers
   * @returns Layer[]
   */
  allSubLayers () {
    let result = []

    this.layerTree.forEach(layer =>
      result = result.concat([ layer ].concat(layer.allSubLayers()))
    )

    return result
  },

  /**
   * returns a hash of all layers, with the path as key and the layer object as value
   * @returns {Object.<string, Layer>}
   */
  allLayers () {
    let result = {}

    this.allSubLayers().map(layer => result[layer.path()] = layer)

    return result
  },

  /**
   * returns a hash of all layer names, with the path as key and the name as value
   * @returns {Object.<string, string>}
   */
  allLayerNames () {
    let layers = this.allLayers()
    let result = {}

    for (let k in layers) {
      let rec = k.split('/').length - 2
      result[k] = '> '.repeat(rec) + layers[k].name()
    }

    return result
  }
})

L.geowikiViewer = (options) => {
  return new L.GeowikiViewer(options)
}

if (typeof module === 'object' && typeof module.exports === 'object') {
  module.exports = L;
} else if (typeof define === 'function' && define.amd) {
  define(L);
}
