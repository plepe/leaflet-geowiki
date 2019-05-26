/* global L:false */

class Editor {
  constructor (options) {
    this.map = L.map(options.dom).setView([ 48.2006, 16.3673 ], 16)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map)

    this.items = new L.FeatureGroup()
    this.map.addLayer(this.items)
    var drawControl = new L.Control.Draw({
      edit: {
        featureGroup: this.items
      }
    })
    this.map.addControl(drawControl)

    this.map.on(L.Draw.Event.CREATED, function (event) {
      var layer = event.layer

      this.items.addLayer(layer)
    })
  }

  load (contents) {
    let data = JSON.parse(contents)

    if (data.type === 'FeatureCollection') {
      data.features.forEach(feature => {
        L.geoJSON(feature).getLayers().forEach(layer =>
          this.items.addLayer(layer)
        )
      })
    } else if (data.type === 'Feature') {
      this.items.addLayer(L.geoJSON(data).getLayers().forEach(layer =>
        this.items.addLayer(layer)
      ))
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
