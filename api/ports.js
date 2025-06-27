const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());

// Connexion à PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sig_ports',
  password: 'postgres',
  port: 5432
});

// Route API pour récupérer les ports
app.get('/ports', (req, res) => {
  pool.query(
    `SELECT id, nom, region, type_port, capacite, description, photo, superficie, profondeur, gestionnaire, 
     ST_X(geom) as longitude, ST_Y(geom) as latitude FROM ports`,
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }

      const geojson = {
        type: "FeatureCollection",
        features: result.rows.map(port => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [port.longitude, port.latitude]
          },
          properties: {
            id: port.id,
            nom: port.nom,
            region: port.region,
            type_port: port.type_port,
            capacite: port.capacite,
            description: port.description,
            photo: port.photo,
            superficie: port.superficie,
            profondeur: port.profondeur,
            gestionnaire: port.gestionnaire,
            latitude: port.latitude,
            longitude: port.longitude
          }
        }))
      };

      res.json(geojson);
    }
  );
});

// Nouvelle route API pour récupérer les régions distinctes
app.get('/regions', (req, res) => {
  pool.query(
    `SELECT DISTINCT region FROM ports ORDER BY region`,
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      // Extraire les régions en tableau simple
      const regions = result.rows.map(row => row.region);
      res.json(regions);
    }
  );
});

// Lancement du serveur
app.listen(3000, () => {
  console.log('API disponible sur http://localhost:3000');
});
