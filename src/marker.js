module.exports = (options) => {
  if (!options.marker || options.marker === 'none') {
    return {}
  }

  let color = '#000000'
  let width = 1
  let fillColor = '#ff0000'

  if (options.marker === 'pointer') {
    return {
      className: 'leaflet-geowiki-icon',
      iconSize: [ 25, 45 ],
      iconAnchor: [ 13, 45 ],
      html: '<svg><path d="M0.5,12.5 A 12,12 0 0 1 24.5,12.5 C 24.5,23 13,30 12.5,44.5 C 12,30 0.5,23 0.5,12.5" style="stroke: ' + options['marker-stroke'] + '; stroke-width: ' + options['marker-stroke-width'] + '; fill: ' + options['marker-fill'] + ';"/></svg>'
    }
  }
}
