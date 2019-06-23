/* global L:false, define:false */

const Layer = require('./Layer')
const importUmap = require('./importUmap')
global.lang_str = {}

/**
 * @class L.GeowikiViewer
 * Geowiki Viewer class
 */
L.GeowikiViewer = L.FeatureGroup.extend({
  initialize (options) {
    L.Util.setOptions(this, options)

    this._layers = {}
    this.layerTree = []
  },

  /**
   * load a file
   * @method load
   * @memberof L.GeowikiViewer
   * @param {L.GeowikiViewer#Filedata|string} filedata - Information about the file being loaded. Alternatively, a file name can be provided, which will be loaded via XMLHttpRequest.
   * @param {function} [callback] - Callback which will be called when the file is loaded with (err, result). Result of type Layer.
   */
  load (filedata, callback) {
    let contents

    if (!callback) {
      callback = () => {}
    }

    if (typeof filedata === 'string') {
      filedata = {
        name: filedata
      }
    }

    if (!('contents' in filedata)) {
      let req = new window.XMLHttpRequest()
      req.open('GET', filedata.name)
      req.overrideMimeType('application/json')
      req.onreadystatechange = () => {
        if (req.readyState !== 4) {
          return
        }

        if (req.status === 200) {
          filedata.contents = req.responseText
          this.load(filedata, callback)
        } else {
          callback(new Error(req.statusText))
        }
      }

      return req.send(null)
    } else if (typeof filedata.contents === 'string') {
      try {
        contents = JSON.parse(filedata.contents)
      } catch (e) {
        return callback(e)
      }
    } else {
      contents = filedata.contents
    }

    if (filedata.name.match(/\.umap$/)) {
      contents = importUmap(contents)
    }

    if (!('properties' in contents)) {
      contents.properties = {}
    }
    if (!('name' in contents.properties)) {
      contents.properties.name = filedata.name
    }

    let layer = this.createLayer(this, null)
    layer.filedata = filedata
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

    this.layerTree.forEach(layer => {
      result = result.concat([ layer ].concat(layer.allSubLayers()))
    })

    return result
  },

  /**
   * returns a hash of all layers, with the path as key and the layer object as value
   * @returns {Object.<string, Layer>}
   */
  allLayers () {
    let result = {}

    this.allSubLayers().forEach(layer => {
      result[layer.path()] = layer
    })

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
  module.exports = L
} else if (typeof define === 'function' && define.amd) {
  define(L)
}
