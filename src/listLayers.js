function showLayer (layer) {
  let div = document.createElement('li')
  let actions = document.createElement('span')
  actions.className = 'actions'
  div.appendChild(actions)

  let a = document.createElement('a')
  a.innerHTML = '<i class="fas fa-eye"></i>'
  a.href = '#'
  a.onclick = () => {
    layer.toggleVisibility()
    return false
  }
  actions.appendChild(a)

  a = document.createElement('a')
  a.appendChild(document.createTextNode(layer.name()))
  a.href = '#'
  a.onclick = () => {
    layer.edit()
    return false
  }
  div.appendChild(a)

  let subLayers = listLayers(layer)
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

  layer.layerTree.forEach(subLayer => {
    let li = showLayer(subLayer)
    ul.appendChild(li)
  })

  return ul
}

module.exports = listLayers
