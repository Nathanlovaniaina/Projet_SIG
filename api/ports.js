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
app.get('/ports', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
              'id', id,
              'nom', nom
            )
          )
        )
      ) AS geojson
      FROM ports;
    `);

    res.json(result.rows[0].geojson); // <- renvoyer le GeoJSON directement
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});


// Lancement du serveur
app.listen(3000, () => {
  console.log('API disponible sur http://localhost:3000/ports');
});
