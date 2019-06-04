module.exports = function listLayers (layer) {
  console.log(layer)
  let div = document.createElement('div')
  div.appendChild(document.createTextNode(layer.properties ? layer.properties.name : 'unnamed'))

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
