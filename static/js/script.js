const map = L.map('map').setView([-18.7669, 46.8691], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let portsData = null;
let geojsonLayer = null;

const image_path = "static/img/"
const regionSelect = document.getElementById('regionSelect');
const typeSelect = document.getElementById('typeSelect');
const capacityInput = document.getElementById('capacityInput');
const searchInput = document.getElementById('searchInput');
const portDetails = document.getElementById('portDetails');

// Chargement des données depuis l’API
fetch('http://localhost:3000/ports')
  .then(res => res.json())
  .then(data => {
    portsData = data;
    afficherPorts(portsData);
  })
  .catch(console.error);

// Récupérer les régions depuis l'API et remplir la liste déroulante
fetch('http://localhost:3000/regions')
  .then(res => res.json())
  .then(data => {
    data.forEach(region => {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });
  })
  .catch(console.error);


function decodeLatin1(str) {
  return decodeURIComponent(escape(str));
}


// Fonction pour normaliser texte sans accents
function normalize(str) {
  return str ? str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase() : '';
}

// Fonction pour filtrer et afficher les ports
function afficherPorts(data) {
  if (geojsonLayer) {
    geojsonLayer.remove();
  }

  const filtered = {
    ...data,
    features: data.features.filter(f => {
      const props = f.properties;

      if (regionSelect.value && normalize(props.region) !== normalize(regionSelect.value)) return false;
      if (typeSelect.value && normalize(props.type_port) !== normalize(typeSelect.value)) return false;
      if (capacityInput.value && props.capacite < Number(capacityInput.value)) return false;

      const search = normalize(searchInput.value);
      if (search && !normalize(props.nom).includes(search)) return false;

      return true;
    })
  };

  geojsonLayer = L.geoJSON(filtered, {
    onEachFeature: (feature, layer) => {
      layer.on('click', () => afficherDetails(feature.properties));
      layer.bindPopup(`<b>${feature.properties.nom}</b>`);
    }
  }).addTo(map);
}

// Affichage détails dans panneau latéral
let routingControl = null;  // Stocke le contrôle Leaflet Routing Machine

// Modifier afficherDetails pour ajouter un bouton "Itinéraire"
function afficherDetails(props) {
  const photoUrl = props.photo
    ? `${image_path}${props.photo}`
    : "https://via.placeholder.com/300x150?text=Pas+d'image";


  portDetails.innerHTML = `
    <h4>${props.nom}</h4>
    <img src="${photoUrl}" alt="Photo de ${props.nom}" style="max-width: 100%; height: auto; border-radius: 8px;" />
    <p><strong>Type de port :</strong> ${props.type_port || 'N/A'}</p>
    <p><strong>Description :</strong> ${props.description || 'N/A'}</p>
    <p><strong>Superficie :</strong> ${props.superficie || 'N/A'} ha</p>
    <p><strong>Profondeur :</strong> ${props.profondeur || 'N/A'} m</p>
    <p><strong>Capacité :</strong> ${props.capacite || 'N/A'} tonnes</p>
    <p><strong>Gestionnaire :</strong> ${props.gestionnaire || 'N/A'}</p>
    <p><strong>Coordonnées :</strong> ${props.latitude.toFixed(5)}, ${props.longitude.toFixed(5)}</p>
    <button id="btnItineraire">Itinéraire vers ce port</button>
    <div id="itineraireInfo" style="margin-top:10px; font-weight:bold;"></div>
  `;

  if (props.latitude && props.longitude) {
    map.setView([props.latitude, props.longitude], 12);
  }

  afficherZonesEtRoutes(props);

  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  document.getElementById('itineraireInfo').innerHTML = '';

  document.getElementById('btnItineraire').addEventListener('click', () => {
    calculerItineraire(props.latitude, props.longitude);
  });
}


// Fonction calculant et affichant l'itinéraire
function calculerItineraire(latPort, lonPort) {
  const infoDiv = document.getElementById('itineraireInfo');
  infoDiv.innerHTML = "Calcul de l'itinéraire...";

  if (!navigator.geolocation) {
    infoDiv.innerHTML = "Géolocalisation non supportée par ce navigateur.";
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    // Supprimer ancien itinéraire
    if (routingControl) {
      map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLon),
        L.latLng(latPort, lonPort)
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: '#4169E1', opacity: 0.8, weight: 6 }] },
      createMarker: (i, wp) => L.marker(wp.latLng), // marqueurs par défaut
      formatter: new L.Routing.Formatter({ language: 'fr', unit: 'metric' })
    }).addTo(map);

    routingControl.on('routesfound', e => {
      const summary = e.routes[0].summary;
      const distKm = (summary.totalDistance / 1000).toFixed(2);
      const durationMin = Math.ceil(summary.totalTime / 60);
      infoDiv.innerHTML = `Distance : ${distKm} km<br>Durée estimée : ${durationMin} min`;
    });

    routingControl.on('routingerror', () => {
      infoDiv.innerHTML = "Erreur lors du calcul de l'itinéraire.";
    });
  }, () => {
    infoDiv.innerHTML = "Impossible de récupérer votre position.";
  });
}


// Exemple zones et routes fictives
function afficherZonesEtRoutes(props) {
  if (window.zonesLayer) map.removeLayer(window.zonesLayer);
  if (window.routesLayer) map.removeLayer(window.routesLayer);

  const zoneCoords = [
    [props.latitude + 0.01, props.longitude - 0.01],
    [props.latitude + 0.01, props.longitude + 0.01],
    [props.latitude - 0.01, props.longitude + 0.01],
    [props.latitude - 0.01, props.longitude - 0.01]
  ];
  window.zonesLayer = L.polygon(zoneCoords, { color: 'blue', weight: 2, fillOpacity: 0.1 }).addTo(map);

  const routeCoords = [
    [props.latitude, props.longitude],
    [props.latitude + 0.2, props.longitude + 0.3]
  ];
  window.routesLayer = L.polyline(routeCoords, { color: 'red', dashArray: '5, 10' }).addTo(map);
}

// Écouteurs sur filtres
regionSelect.addEventListener('change', () => afficherPorts(portsData));
typeSelect.addEventListener('change', () => afficherPorts(portsData));
capacityInput.addEventListener('input', () => afficherPorts(portsData));
searchInput.addEventListener('input', () => afficherPorts(portsData));
