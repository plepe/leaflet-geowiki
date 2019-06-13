# leaflet-geowiki
A LeafletJS plugin for displaying and creating styled maps.

## Installation
```sh
npm add --save leaflet-geowiki
```

## Usage - Viewer
index.html:
```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css">
    <link rel="stylesheet" href="node_modules/leaflet-draw/dist/leaflet.draw.css">
    <link rel="stylesheet" href="node_modules/modulekit-form/dist/modulekit-form.css">
    <link rel="stylesheet" href="node_modules/@fortawesome/fontawesome-free/css/all.min.css"/>
    <link rel="stylesheet" href="node_modules/leaflet-geowiki/dist/leaflet-geowiki.css"/>
    <script src="node_modules/leaflet/dist/leaflet.js"></script>
    <script src="node_modules/leaflet-geowiki/dist/leaflet-geowiki.js"></script>
    <script src="index.js"></script>
  </head>
  <body>
    <div id='map' style='height: 200px;'></div>
  </body>
</html>
```

index.js:
```js
// Create Leaflet map object
var map = L.map('map')

// Add the default OSM tiles as background
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

var geowiki = L.geowikiViewer().addTo(map)
geowiki.load('example.geowiki', function (err) {
  if (err) { return alert(err) }
  map.fitBounds(geowiki.getBounds())
})
```

## Usage - Editor
index.html:
```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css">
    <link rel="stylesheet" href="node_modules/leaflet-draw/dist/leaflet.draw.css">
    <link rel="stylesheet" href="node_modules/modulekit-form/dist/modulekit-form.css">
    <link rel="stylesheet" href="node_modules/@fortawesome/fontawesome-free/css/all.min.css"/>
    <link rel="stylesheet" href="node_modules/leaflet-geowiki/dist/leaflet-geowiki-editor.css"/>
    <script src="node_modules/leaflet/dist/leaflet.js"></script>
    <script src="node_modules/leaflet-geowiki/dist/leaflet-geowiki-editor.js"></script>
    <script src="index.js"></script>
  </head>
  <body>
    <div id='map' style='position: absolute; top: 0; left: 0; right: 251px; bottom: 0;'></div>

    <div id='sidebar' style='position: absolute; top: 0; width: 246px; right: 0; bottom: 0; border-left: 1px solid black; padding: 2px; overflow-y: auto;'></div>
  </body>
</html>
```

index.js:
```js
// Create Leaflet map object
var map = L.map('map')

// Add the default OSM tiles as background
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

var geowiki = L.geowikiEditor({ sidebar: 'sidebar' }).addTo(map)
geowiki.load('example.geowiki', function (err) {
  if (err) { return alert(err) }
  map.fitBounds(geowiki.getBounds())
})

// later:
let files = geowiki.save()
console.log(files)
// [
//   {
//     "filename": "file1.geowiki",
//     "contents": "{ \"type\" ....
//   }
// ]
```

For a more advanced example, check out [geowiki-demo](https://github.com/plepe/geowiki-demo)
