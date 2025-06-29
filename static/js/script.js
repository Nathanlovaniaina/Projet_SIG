const map = L.map('map').setView([-18.7669, 46.8691], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let portsData = null;
let geojsonLayer = null;
let provenancesLayer = null;
let linesLayer = null;
let routingControl = null;

const image_path = "static/img/";
const regionSelect = document.getElementById('regionSelect');
const typeSelect = document.getElementById('typeSelect');
const capacityInput = document.getElementById('capacityInput');
const searchInput = document.getElementById('searchInput');
const portDetails = document.getElementById('portDetails');

// Chargement des données depuis l’API ports
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

// Normalisation texte sans accents
function normalize(str) {
  return str ? str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase() : '';
}

// Filtrer et afficher les ports sur la carte
function afficherPorts(data) {
  if (geojsonLayer) {
    geojsonLayer.remove();
  }
  if (provenancesLayer) {
    provenancesLayer.remove();
    provenancesLayer = null;
  }
  if (linesLayer) {
    linesLayer.remove();
    linesLayer = null;
  }
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
  portDetails.innerHTML = `<div class="detail-item"><div class="detail-icon"><i class="fas fa-anchor"></i></div><div>Cliquez sur un port pour voir les détails.</div></div>`;

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

// Affichage des détails dans panneau latéral + boutons itinéraire et affichage provenances
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
    <button id="btnItineraire" class="itineraire-btn">Itinéraire vers ce port</button>
    <div id="itineraireInfo" class="itineraire-info"></div>
    <h4>Provenances</h4>
    <div id="provenancesInfo" class="itineraire-info">Chargement...</div>
  `;

  if (props.latitude && props.longitude) {
    map.setView([props.latitude, props.longitude], 8);
  }

  // Supprime anciennes couches provenances et lignes
  if (provenancesLayer) {
    provenancesLayer.remove();
    provenancesLayer = null;
  }
  if (linesLayer) {
    linesLayer.remove();
    linesLayer = null;
  }
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }

  // Bouton itinéraire
  document.getElementById('btnItineraire').addEventListener('click', () => {
    calculerItineraire(props.latitude, props.longitude);
  });

  // Charge les provenances du port
  afficherProvenances(props.id);
}

// Calcul et affichage itinéraire entre position user et port
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
      createMarker: (i, wp) => L.marker(wp.latLng),
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

// Affiche les provenances d’un port sélectionné avec marqueurs et lignes de trajet
function afficherProvenances(idPort) {
  const provenancesDiv = document.getElementById('provenancesInfo');
  provenancesDiv.innerHTML = 'Chargement des provenances...';

  // Supprimer anciens layers s'ils existent
  if (window.provenancesLayer) {
    map.removeLayer(window.provenancesLayer);
    window.provenancesLayer = null;
  }

  if (window.linesLayer) {
    map.removeLayer(window.linesLayer);
    window.linesLayer = null;
  }

  fetch(`http://localhost:3000/provenances/${idPort}`)
    .then(res => res.json())
    .then(data => {
      if (!data.provenances || data.provenances.length === 0) {
        provenancesDiv.innerHTML = 'Aucune provenance enregistrée pour ce port.';
        return;
      }

      const listHtml = data.provenances.map(p =>
        `<b>${p.nom_port_etranger}</b> (${p.pays}) — Marchandise : ${p.marchandise}`
      ).join('<br>');
      provenancesDiv.innerHTML = listHtml;

      // Définir l'icône utilisée pour les ports étrangers
      const portForeignIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        shadowSize: [41, 41]
      });


      // Vérification pré-chargement image icône
      const testImg = new Image();
      testImg.src = portForeignIcon.options.iconUrl;
      testImg.onerror = () => {
        // Si image pas trouvée, remplacer par l'icône Leaflet par défaut
        portForeignIcon.options.iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
      };

      // Afficher les ports étrangers sur la carte
      const features = data.provenances.map(p => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [p.longitude, p.latitude]
        },
        properties: {
          nom: p.nom_port_etranger,
          pays: p.pays,
          marchandise: p.marchandise
        }
      }));

      window.provenancesLayer = L.geoJSON(features, {
        pointToLayer: (feature, latlng) => {
          return L.marker(latlng, { icon: portForeignIcon });
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          layer.bindPopup(`<b>${props.nom}</b><br>${props.pays}<br>Marchandise : ${props.marchandise}`);
        }
      }).addTo(map);

      // Création des lignes entre port sélectionné et ports étrangers
      const selectedPort = portsData.features.find(f => f.properties.id === idPort);
      if (selectedPort) {
        const latLngStart = [selectedPort.properties.latitude, selectedPort.properties.longitude];
        const lines = data.provenances.map(p => {
          return L.polyline([latLngStart, [p.latitude, p.longitude]], {
            color: '#FF5733',
            weight: 2,
            opacity: 0.7,
            dashArray: '5, 10'
          });
        });

        window.linesLayer = L.layerGroup(lines).addTo(map);
      }
    })
    .catch(err => {
      console.error("Erreur chargement provenances :", err);
      provenancesDiv.innerHTML = 'Erreur lors du chargement des provenances.';
    });
}


// Écouteurs sur filtres pour mise à jour carte
regionSelect.addEventListener('change', () => afficherPorts(portsData));
typeSelect.addEventListener('change', () => afficherPorts(portsData));
capacityInput.addEventListener('input', () => afficherPorts(portsData));
searchInput.addEventListener('input', () => afficherPorts(portsData));
