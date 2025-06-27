-- Activer l'extension PostGIS si ce n'est pas encore fait
CREATE EXTENSION IF NOT EXISTS postgis;

-- Supprimer la table si elle existe
DROP TABLE IF EXISTS ports;

-- Créer la table ports
CREATE TABLE ports (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(150),
  geom geometry(Point, 4326)
);

-- Insérer les données des ports
INSERT INTO ports (nom, geom) VALUES 
('Toamasina', ST_SetSRID(ST_MakePoint(49.426722, -18.15525), 4326)),
('Antsiranana (Diego‑Suarez)', ST_SetSRID(ST_MakePoint(49.285097, -12.277319), 4326)),
('Toliara (Tuléar)', ST_SetSRID(ST_MakePoint(43.6667, -23.35), 4326)),
('Ehoala (Fort‑Dauphin)', ST_SetSRID(ST_MakePoint(46.9636774, -25.0674465), 4326)),
('Mahajanga', ST_SetSRID(ST_MakePoint(46.3146, -15.722), 4326)),
('Sainte‑Marie', ST_SetSRID(ST_MakePoint(49.8167, -17.0833), 4326)),
('Antalaha', ST_SetSRID(ST_MakePoint(50.278549, -14.906124), 4326)),
('Maintirano', ST_SetSRID(ST_MakePoint(44.02951, -18.06354), 4326)),
('Manakara', ST_SetSRID(ST_MakePoint(48.0167, -22.15), 4326)),
('Mananjary', ST_SetSRID(ST_MakePoint(48.3333, -21.2167), 4326)),
('Morombe', ST_SetSRID(ST_MakePoint(43.3167, -20.2833), 4326)),
('Morondava', ST_SetSRID(ST_MakePoint(44.2833, -20.2833), 4326)),
('Nosy‑Be (Hell‑Ville)', ST_SetSRID(ST_MakePoint(48.2522, -13.3123), 4326)),
('Saint‑Louis (Ambilobe)', ST_SetSRID(ST_MakePoint(49.05, -13.2), 4326)),
('Belo‑sur‑Mer', ST_SetSRID(ST_MakePoint(44.45, -19.6833), 4326)),
('Farafangana', ST_SetSRID(ST_MakePoint(47.8333, -22.8167), 4326)),
('Maroantsetra', ST_SetSRID(ST_MakePoint(49.7333, -15.4333), 4326));

-- Vérifier le contenu
SELECT id, nom, ST_AsText(geom) FROM ports;
