const fs = require('fs')
const Vue = require('vue')

function showLayer (data) {
  let div = document.createElement('li')

  let el = document.createElement('div')
  el.innerHTML = fs.readFileSync(__dirname + '/listLayers.html', 'utf8')
  div.appendChild(el)

  new Vue({ el, data })

  let subLayers = listLayers(data)
  if (subLayers) {
    div.appendChild(subLayers)
  }

  return div
}

function listLayers (layer) {
  if (!layer.layerTree) {
    return document.createElement('div')
  }

  let ul = document.createElement('ul')
  ul.className = 'leaflet-geowiki'

  layer.layerTree.forEach(subLayer => {
    let li = showLayer(subLayer)
    ul.appendChild(li)
  })

  return ul
}

module.exports = listLayers
