module.exports = function objectCopy (from, to) {
  for (let k in from) {
    to[k] = from[k]
  }
}
