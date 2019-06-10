const Vue = require('vue')

function showLayer (data) {
  let div = document.createElement('li')

  let el = document.createElement('div')
  el.innerHTML = '<div v-bind:class="{ hidden: isHidden }"><span class="actions"><a href="#" v-on:click="$data.toggleVisibility()" class="toggle-vis"></a></span><a href="#" v-on:click="$data.edit()">{{ $data.name() }}</a></div>'
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
