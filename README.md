# leaflet-geowiki
A LeafletJS plugin for displaying and creating styled maps. Read more about the [Geowiki suite on the blog](https://geowiki.net).

Geowiki files are valid GeoJSON files, with style information added. See the [Geowiki file format specification](https://github.com/plepe/geowiki-spec) for details.

## Installation
```sh
npm add --save leaflet-geowiki
```

## Usage
`leaflet-geowiki` can either be used in view or edit mode.

View mode:
```js
// Create Leaflet map object
var map = L.map('map')

// Initialize Geowiki viewer
var geowiki = L.geowikiViewer().addTo(map)

// Load a file
geowiki.load('example.geowiki', function (err) {
  if (err) { return alert(err) }
  map.fitBounds(geowiki.getBounds())
})
```

Edit mode:
```js
// Create Leaflet map object
var map = L.map('map')

// Initialize Geowiki editor
var geowiki = L.geowikiEditor({ sidebar: 'sidebar' }).addTo(map)

// Load a file
geowiki.load('example.geowiki', function (err) {
  if (err) { return alert(err) }
  map.fitBounds(geowiki.getBounds())
})

// later, get contents of all loaded files:
let files = geowiki.save()
console.log(files)
// [
//   {
//     "filename": "example.geowiki",
//     "contents": "{ \"type\" ....
//   }
// ]
```

Check the files [example-viewer.html](blob/master/example-viewer.html) and [example-editor.html](blob/master/example-editor.html). For a more advanced example, check out [geowiki-demo](https://github.com/plepe/geowiki-demo).

## Development
```sh
git clone https://github.com/plepe/leaflet-geowiki
cd leaflet-geowiki
npm install
npm run watch-viewer OR npm run watch-editor
```
