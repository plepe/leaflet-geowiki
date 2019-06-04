/* global L:false */

const Layer = require('./Layer')
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

    let layer = this.createLayer(this, null)
    layer.load(contents)
    this.layerTree.push(layer)

    this._currentLayer = layer

    callback(null, layer)
  },

  createLayer (featureGroup) {
    return new Layer(featureGroup)
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
