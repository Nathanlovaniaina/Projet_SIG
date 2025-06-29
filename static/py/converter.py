import os
from PIL import Image

# Dossier contenant les images d'origine
input_folder = "..\img"  # à adapter selon ton chemin
output_folder = input_folder

# Créer le dossier de sortie s'il n'existe pas
os.makedirs(output_folder, exist_ok=True)

# Parcours de chaque fichier dans le dossier
for filename in os.listdir(input_folder):
    # Vérifier l'extension (filtrage simple des images)
    if filename.lower().endswith(
        (".jpg", ".jpeg", ".bmp", ".gif", ".tiff", ".webp", ".png")
    ):
        input_path = os.path.join(input_folder, filename)

        try:
            # Ouvrir l'image
            with Image.open(input_path) as img:
                # Redimensionner à 300x168
                img_resized = img.resize((300, 168))

                # Préparer le nom de sortie (nom original sans extension + .png)
                base_name = os.path.splitext(filename)[0]
                output_path = os.path.join(output_folder, f"{base_name}.png")

                # Sauvegarder en PNG
                img_resized.save(output_path, format="PNG")
                print(f"[✓] Converti et redimensionné : {filename} → {output_path}")

        except Exception as e:
            print(f"[!] Erreur avec {filename} : {e}")
