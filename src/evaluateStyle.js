const Twig = require('twig')
const cache = {}

module.exports = (feature, style) => {
  let result = {}

  for (let k in style) {
    if (style[k].match(/\{[\{%]/)) {
      if (!(style[k] in cache)) {
        cache[style[k]] = Twig.twig({ data: style[k] })
      }

      result[k] = cache[style[k]].render({
        properties: feature.properties
      })
    } else {
      result[k] = style[k]
    }
  }

  return result
}
