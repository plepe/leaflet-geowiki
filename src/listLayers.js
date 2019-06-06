module.exports = function listLayers (layer) {
  let div = document.createElement('div')
  let actions = document.createElement('actions')
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

  let ul = document.createElement('ul')
  div.appendChild(ul)

  if (!layer.layerTree) {
    return div
  }

  layer.layerTree.forEach(subLayer => {
    let li = document.createElement('li')
    ul.appendChild(li)

    li.appendChild(listLayers(subLayer))
  })

  return div
}
