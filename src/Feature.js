/* global L:false */

const marker = require('./marker')
const spec = require('./geojson-css-spec.json')

const leafletStyleMapping = {
  'stroke': 'color',
  'stroke-width': 'weight',
  'stroke-opacity': 'opacity',
  'fill': 'fillColor',
  'fill-opacity': 'fillOpacity',
  'radius': 'radius'
}

class Feature {
  constructor (editor, parent) {
    this.editor = editor
    this.parent = parent
    this.isHidden = false
  }

  name () {
    return this.properties.name || 'unnamed'
  }

  load (data) {
    this.leafletLayer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng)
    }).getLayers()[0]

    if (this.leafletLayer.feature.geometry.type === 'Point') {
      let latlng = this.leafletLayer.getLatLng()
      this.leafletMarker = L.marker(latlng)
      this.leafletMarker.addTo(this.editor._map)
    }

    this.properties = this.leafletLayer.feature.properties || {}
    this.style = this.leafletLayer.feature.style || {}
    this.add()
  }

  createFrom (leafletLayer) {
    this.properties = {}
    this.style = {}

    this.leafletLayer = leafletLayer
    this.leafletLayer.feature = this.leafletLayer.toGeoJSON()

    if (this.leafletLayer.feature.geometry.type === 'Point') {
      let latlng = this.leafletLayer.getLatLng()

      if (this.leafletLayer.setStyle) { // is circleMarker
        this.leafletMarker = L.marker(latlng)
        this.leafletMarker.addTo(this.editor._map)
      } else {
        this.leafletMarker = this.leafletLayer
        this.leafletLayer = L.circleMarker(latlng)
        this.leafletLayer.feature = this.leafletMarker.feature
        this.leafletLayer.addTo(this.editor._map)

        this.style = {
          marker: 'pointer',
          stroke: 'none',
          fill: 'none'
        }
      }
    }

    this.add()
  }

  add () {
    if (this.leafletLayer.setStyle) {
      this.leafletLayer.setStyle({ editing: {}, original: {} })
    }

    this.refresh()

    this.editor.addLayer(this.leafletLayer)
  }

  getFullStyle () {
    let style = {}

    let featureDefaultStyle = this.parent.getFullStyle(this.leafletLayer)
    for (let k in featureDefaultStyle) {
      style[k] = featureDefaultStyle[k]
    }

    for (let k in this.style) {
      style[k] = this.style[k]
    }

    return style
  }

  renderPopup () {
    let div = document.createElement('div')
    let hasContent = false

    if (this.properties.name) {
      let d = document.createElement('h4')
      d.appendChild(document.createTextNode(this.properties.name))
      div.appendChild(d)
      hasContent = true
    }

    if (this.properties.description) {
      let d = document.createElement('div')
      d.appendChild(document.createTextNode(this.properties.name.replace(/\n/g, "<br>\n")))
      div.appendChild(d)
      hasContent = true
    }

    for (let k in this.parent.featureFields) {
      if (k === 'name' || k === 'description' || !this.properties[k]) {
        continue
      }

      let d = document.createElement('div')
      let b = document.createElement('b')
      b.appendChild(document.createTextNode(this.parent.featureFields[k].name) + ': ')
      d.appendChild(b)

      let v = document.createElement('span')
      v.appendChild(document.createTextNode(this.properties[k]))
      d.appendChild(v)
      div.appendChild(d)
      hasContent = true
    }

    if (!hasContent) {
      return null
    }

    return div
  }

  toGeoJSON () {
    let data = { type: 'Feature' }

    data.properties = {}
    for (let k in this.properties) {
      if (this.properties[k] !== null) {
        data.properties[k] = this.properties[k]
      }
    }

    if (Object.keys(this.style).length) {
      data.style = this.style
    }

    data.geometry = this.leafletLayer.toGeoJSON().geometry

    return data
  }

  hide () {
    this.isHidden = true
    this.leafletLayer.remove()
  }

  show () {
    this.isHidden = false
    this.leafletLayer.addTo(this.editor._map)
  }

  toggleVisibility () {
    if (this.isHidden) {
      this.show()
    } else {
      this.hide()
    }
  }

  refresh () {
    let style = this.getFullStyle()
    let popupContent = this.renderPopup()
    let leafletStyle = {}

    for (let k in style) {
      if (k in leafletStyleMapping) {
        leafletStyle[leafletStyleMapping[k]] = style[k]
      }
    }

    leafletStyle.stroke = style.stroke !== 'none'
    if (spec['fill']['geometry-types'].includes(this.leafletLayer.feature.geometry.type)) {
      leafletStyle.fill = style.fill !== 'none'
    }
    this.leafletLayer.setStyle(leafletStyle)
    if (popupContent) {
      this.leafletLayer.bindPopup(popupContent)
    }

    if (this.leafletMarker) {
      this.leafletMarker.setIcon(L.divIcon(marker(style)))

      if (popupContent) {
        this.leafletMarker.bindPopup(popupContent)
      }
    }
  }
}

module.exports = Feature
