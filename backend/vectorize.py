"""
Script de Vetorização de Imagens usando CLIP + ChromaDB
========================================================
Carrega todas as imagens da pasta 'estampas', gera embeddings
visuais com o modelo CLIP e armazena no ChromaDB para
busca por similaridade.
"""

import os
import sys
from pathlib import Path

# Fix for Windows terminal Unicode encoding
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

from PIL import Image
from sentence_transformers import SentenceTransformer
import chromadb

# ── Configurações ──────────────────────────────────────────
IMAGES_DIR = Path(__file__).resolve().parent.parent / "estampas"
CHROMA_DIR = Path(__file__).resolve().parent / "chroma_db"
COLLECTION_NAME = "estampas"
CLIP_MODEL = "clip-ViT-B-32"
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".bmp", ".tiff"}


def load_images(images_dir: Path) -> list[tuple[str, Image.Image]]:
    """Carrega todas as imagens suportadas do diretório."""
    images = []
    for file in sorted(images_dir.iterdir()):
        if file.suffix.lower() in SUPPORTED_EXTENSIONS:
            try:
                img = Image.open(file).convert("RGB")
                # Usar o nome do arquivo sem extensão como ID
                product_id = file.stem
                images.append((product_id, img))
                print(f"  ✓ Carregada: {file.name}")
            except Exception as e:
                print(f"  ✗ Erro ao carregar {file.name}: {e}")
    return images


def vectorize_and_store():
    """Pipeline principal: carrega imagens → gera embeddings → salva no ChromaDB."""

    print("=" * 60)
    print("🎨 VETORIZAÇÃO DE ESTAMPAS")
    print("=" * 60)

    # 1. Verificar diretório de imagens
    if not IMAGES_DIR.exists():
        print(f"\n❌ Diretório de imagens não encontrado: {IMAGES_DIR}")
        sys.exit(1)

    # 2. Carregar imagens
    print(f"\n📁 Carregando imagens de: {IMAGES_DIR}")
    images = load_images(IMAGES_DIR)
    if not images:
        print("❌ Nenhuma imagem encontrada!")
        sys.exit(1)
    print(f"\n✅ {len(images)} imagens carregadas.")

    # 3. Carregar modelo CLIP
    print(f"\n🤖 Carregando modelo CLIP ({CLIP_MODEL})...")
    model = SentenceTransformer(CLIP_MODEL)
    print("✅ Modelo carregado.")

    # 4. Gerar embeddings
    print("\n🔄 Gerando embeddings visuais...")
    ids = [img_id for img_id, _ in images]
    pil_images = [img for _, img in images]
    embeddings = model.encode(pil_images, show_progress_bar=True)
    print(f"✅ {len(embeddings)} embeddings gerados (dimensão: {embeddings.shape[1]}).")

    # 5. Salvar no ChromaDB
    print(f"\n💾 Salvando no ChromaDB em: {CHROMA_DIR}")
    CHROMA_DIR.mkdir(parents=True, exist_ok=True)
    client = chromadb.PersistentClient(path=str(CHROMA_DIR))

    # Carregar tags
    tags_path = Path(__file__).resolve().parent / "product_tags.json"
    product_tags = {}
    if tags_path.exists():
        import json
        with open(tags_path, "r", encoding="utf-8") as f:
            product_tags = json.load(f)
        print(f"✅ Tags carregadas para {len(product_tags)} produtos.")

    # Recriar a coleção (limpa dados antigos)
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    # Preparar metadados com nome do arquivo original e tags
    metadatas = []
    for img_id, _ in images:
        # Encontrar o arquivo original para obter a extensão
        original_file = None
        for file in IMAGES_DIR.iterdir():
            if file.stem == img_id:
                original_file = file.name
                break
        
        # Tags (armazenar como string separada por vírgula para compatibilidade)
        tags_list = product_tags.get(img_id, ["geral"])
        tags_str = ",".join(tags_list)

        metadatas.append({
            "filename": original_file or f"{img_id}.avif",
            "name": img_id,
            "tags": tags_str
        })

    collection.add(
        ids=ids,
        embeddings=embeddings.tolist(),
        metadatas=metadatas,
    )

    print(f"✅ {collection.count()} vetores armazenados na coleção '{COLLECTION_NAME}'.")
    print("\n" + "=" * 60)
    print("🎉 VETORIZAÇÃO CONCLUÍDA COM SUCESSO!")
    print("=" * 60)


if __name__ == "__main__":
    vectorize_and_store()
