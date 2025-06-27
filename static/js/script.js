// Initialisation de la carte
const map = L.map('map').setView([-18.7669, 46.8691], 5);

// Fond de carte OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

// Charger les ports en GeoJSON depuis l'API
fetch('http://localhost:3000/ports')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: function (feature, layer) {
        layer.bindPopup(`<b>${feature.properties.nom}</b>`);
      }
    }).addTo(map);
  })
  .catch(err => console.error(err));

