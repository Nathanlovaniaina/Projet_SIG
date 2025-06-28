-- Activer l'extension PostGIS si ce n'est pas encore fait
CREATE EXTENSION IF NOT EXISTS postgis;

-- Supprimer la table si elle existe
DROP TABLE IF EXISTS ports;

-- Créer la table ports avec les colonnes supplémentaires
CREATE TABLE ports (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(150) NOT NULL,
  region VARCHAR(100),
  type_port VARCHAR(50),            -- Commercial, Pêche, Militaire, etc.
  capacite INTEGER,                 -- Capacité en tonnes
  description TEXT,
  photo VARCHAR(255),               -- URL de la photo
  superficie NUMERIC(10,2),         -- en hectares
  profondeur NUMERIC(5,2),          -- en mètres
  gestionnaire VARCHAR(150),
  geom geometry(Point, 4326)
);

-- Insérer les données des ports avec exemples pour les colonnes supplémentaires
INSERT INTO ports (nom, region, type_port, capacite, description, photo, superficie, profondeur, gestionnaire, geom) VALUES
('Toamasina', 'Atsinanana', 'Commercial', 500000, 'Le principal port commercial de Madagascar.', 'Port_Toamasina.png', 150.00, 15.0, 'Port Autonome de Toamasina', ST_SetSRID(ST_MakePoint(49.426722, -18.15525), 4326)),
('Antsiranana (Diego‑Suarez)', 'Diana', 'Commercial', 200000, 'Port important dans le nord.', 'Port_Antsiranana.png', 80.50, 12.5, 'Port Antsiranana', ST_SetSRID(ST_MakePoint(49.285097, -12.277319), 4326)),
('Toliara (Tuléar)', 'Atsimo-Andrefana', 'Pêche', 100000, 'Port de pêche majeur du sud-ouest.', 'Port_Toliara.png', 60.00, 10.0, 'Société Portuaire de Toliara', ST_SetSRID(ST_MakePoint(43.6667, -23.35), 4326)),
('Ehoala (Fort‑Dauphin)', 'Anosy', 'Commercial', 150000, 'Port en développement dans le sud-est.', 'Port_Ehoala.png', 70.00, 14.0, 'Gestionnaire Ehoala', ST_SetSRID(ST_MakePoint(46.9636774, -25.0674465), 4326)),
('Mahajanga', 'Boeny', 'Commercial', 180000, 'Grand port de la côte ouest.', 'Port_Mahajanga.png', 90.00, 13.0, 'Port de Mahajanga', ST_SetSRID(ST_MakePoint(46.3146, -15.722), 4326)),
('Sainte‑Marie', 'Alaotra-Mangoro', 'Pêche', 40000, 'Petit port pour la pêche et tourisme.', 'Port_Sainte-Marie.png', 25.00, 8.0, 'Gestion locale Sainte-Marie', ST_SetSRID(ST_MakePoint(49.8167, -17.0833), 4326)),
('Antalaha', 'Sava', 'Commercial', 50000, 'Port exportateur de vanille.', 'Port_Antalaha.png', 30.00, 9.0, 'Port Antalaha', ST_SetSRID(ST_MakePoint(50.278549, -14.906124), 4326)),
('Maintirano', 'Melaky', 'Pêche', 30000, 'Petit port de pêche.', 'Port_Maintirano.png', 20.00, 7.5, 'Gestion locale Maintirano', ST_SetSRID(ST_MakePoint(44.02951, -18.06354), 4326)),
('Manakara', 'Fitovinany', 'Commercial', 40000, 'Port régional du sud-est.', 'Port_Manakara.png', 28.00, 10.0, 'Gestion Manakara', ST_SetSRID(ST_MakePoint(48.0167, -22.15), 4326)),
('Mananjary', 'Vatovavy', 'Pêche', 35000, 'Port mixte pêche et commerce.', 'Port_Mananjary.png', 26.00, 9.5, 'Gestion Mananjary', ST_SetSRID(ST_MakePoint(48.3333, -21.2167), 4326)),
('Morombe', 'Atsimo-Andrefana', 'Pêche', 20000, 'Port de pêche local.', 'Port_Morombe.png', 18.00, 7.0, 'Gestion Morombe', ST_SetSRID(ST_MakePoint(43.3167, -20.2833), 4326)),
('Morondava', 'Menabe', 'Commercial', 70000, 'Port commercial sur la côte ouest.', 'Port_Morondava.png', 45.00, 11.0, 'Port de Morondava', ST_SetSRID(ST_MakePoint(44.2833, -20.2833), 4326)),
('Nosy‑Be (Hell‑Ville)', 'Diana', 'Touristique', 15000, 'Port touristique important.', 'Port_Nosy-Be.png', 15.00, 6.0, 'Gestion Nosy-Be', ST_SetSRID(ST_MakePoint(48.2522, -13.3123), 4326)),
('Saint‑Louis (Ambilobe)', 'Diana', 'Pêche', 12000, 'Petit port de pêche.', 'Port_Saint-louis.png', 12.00, 5.5, 'Gestion Saint-Louis', ST_SetSRID(ST_MakePoint(49.05, -13.2), 4326)),
('Belo‑sur‑Mer', 'Menabe', 'Pêche', 10000, 'Port de pêche local.', 'Port_Belo-Sur-Mer.png', 10.00, 5.0, 'Gestion Belo-Sur-Mer', ST_SetSRID(ST_MakePoint(44.45, -19.6833), 4326)),
('Farafangana', 'Atsimo-Atsinanana', 'Commercial', 60000, 'Port régional.', 'Port_Farafangana.png', 40.00, 10.5, 'Port de Farafangana', ST_SetSRID(ST_MakePoint(47.8333, -22.8167), 4326)),
('Maroantsetra', 'Analanjirofo', 'Commercial', 55000, 'Port dans le nord-est.', 'Port_Maroantsetra.png', 35.00, 9.8, 'Gestion Maroantsetra', ST_SetSRID(ST_MakePoint(49.7333, -15.4333), 4326));


UPDATE ports SET type_port = 'Peche' WHERE type_port LIKE 'Pêche';


-- Vérifier le contenu avec les coordonnées extraites du geom
SELECT 
  id, nom, region, type_port, capacite, description, photo, superficie, profondeur, gestionnaire,
  ST_X(geom) AS longitude, ST_Y(geom) AS latitude 
FROM ports;
