/* global L:false */

const Layer = require('./Layer')
global.lang_str = {}

L.GeowikiViewer = L.FeatureGroup.extend({
  initialize (options) {
    L.Util.setOptions(this, options)

    this._layers = {}
    this.layerTree = []
  },

  load (file, callback) {
    if (!callback) {
      callback = () => {}
    }

    if (typeof file === 'string') {
      let req = new window.XMLHttpRequest()
      req.open('GET', file)
      req.overrideMimeType('application/json')
      req.onreadystatechange = () => {
        if (req.readyState !== 4) {
          return
        }
        if (req.status === 200) {
          try {
            let data = JSON.parse(req.responseText)
            this.load(data, callback)
          } catch (e) {
            callback(e)
          }
        } else {
          callback(new Error(req.statusText))
        }
      }

      return req.send(null)
    }

    let layer = this.createLayer(this, null)
    layer.load(file)
    this.layerTree.push(layer)

    this.currentLayer = layer

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
