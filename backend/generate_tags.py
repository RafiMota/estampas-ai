import os
import json
from pathlib import Path

IMAGES_DIR = Path("estampas")
OUTPUT_FILE = Path("backend/product_tags.json")

def categorize(name):
    name = name.lower()
    tags = []
    
    if "disney" in name or "mickey" in name or "minnie" in name or "alice" in name or "lilo" in name or "stitch" in name or "pooh" in name or "monstros s.a" in name or "enrolados" in name or "divertidamente" in name or "zé carioca" in name:
        tags.append("disney")
    if "harry potter" in name:
        tags.append("harry_potter")
    if "marvel" in name or "spider-man" in name or "capitão américa" in name or "justiceiro" in name or "guardiões da galáxia" in name:
        tags.append("marvel")
    if "star wars" in name or "mandalorian" in name:
        tags.append("star_wars")
    if "naruto" in name or "jujutsu kaisen" in name:
        tags.append("anime")
    if "hello kitty" in name or "kuromi" in name:
        tags.append("sanrio")
    if "gato" in name or "cat" in name or "pet" in name or "animal" in name or "onça" in name or "safari" in name:
        tags.append("pets")
    if "flamengo" in name or "palmeiras" in name or "vasco" in name or "corinthians" in name or "fluminense" in name or "senna" in name or "brasil" in name:
        tags.append("esportes")
    if "jesus" in name or "senhor" in name or "aparecida" in name or "maria" in name or "oração" in name or "bençoa" in name or "versículo" in name:
        tags.append("religioso")
    if "game" in name or "video game" in name or "pixel" in name:
        tags.append("geek")
    if "floral" in name or "flores" in name or "primavera" in name or "bloom" in name or "lavanda" in name:
        tags.append("floral")
    
    return tags if tags else ["geral"]

def generate_tags():
    if not IMAGES_DIR.exists():
        print("Diretório de imagens não encontrado.")
        return

    mapping = {}
    for file in IMAGES_DIR.iterdir():
        if file.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".avif"}:
            product_id = file.stem
            mapping[product_id] = categorize(product_id)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=4, ensure_ascii=False)
    
    print(f"Mapeamento de tags gerado em {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_tags()
