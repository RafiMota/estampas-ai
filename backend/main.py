"""
API FastAPI — E-Commerce de Estampas com Recomendação Visual
=============================================================
Endpoints:
  GET  /products       → Lista todos os produtos do catálogo
  POST /recommend      → Recebe IDs favoritos, retorna recomendações via CLIP
  GET  /images/{name}  → Serve imagens estáticas das estampas
"""

import os
from pathlib import Path
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import chromadb

# ── Configurações ──────────────────────────────────────────
IMAGES_DIR = Path(__file__).resolve().parent.parent / "estampas"
CHROMA_DIR = Path(__file__).resolve().parent / "chroma_db"
COLLECTION_NAME = "estampas"

# ── App FastAPI ────────────────────────────────────────────
app = FastAPI(
    title="Estampas AI — API de Recomendação Visual",
    description="Sistema de recomendação de estampas baseado em Visão Computacional (CLIP)",
    version="1.0.0",
)

# CORS para o frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ChromaDB Client ───────────────────────────────────────
chroma_client = chromadb.PersistentClient(path=str(CHROMA_DIR))


def get_collection():
    """Obtém a coleção ChromaDB de estampas."""
    try:
        return chroma_client.get_collection(
            name=COLLECTION_NAME,
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Coleção de vetores não encontrada. Execute vectorize.py primeiro.",
        )


# ── Modelos Pydantic ──────────────────────────────────────
class RecommendRequest(BaseModel):
    favorites: list[str]
    n_results: Optional[int] = 10


class Product(BaseModel):
    id: str
    name: str
    filename: str
    image_url: str
    tags: list[str] = []


class RecommendResponse(BaseModel):
    recommendations: list[Product]


# ── Endpoints ─────────────────────────────────────────────
@app.get("/products", response_model=list[Product])
async def list_products():
    """Lista todos os produtos do catálogo."""
    collection = get_collection()
    result = collection.get(include=["metadatas"])

    products = []
    for i, product_id in enumerate(result["ids"]):
        metadata = result["metadatas"][i]
        tags = metadata.get("tags", "").split(",") if metadata.get("tags") else []
        products.append(
            Product(
                id=product_id,
                name=metadata.get("name", product_id),
                filename=metadata.get("filename", f"{product_id}.avif"),
                image_url=f"/images/{metadata.get('filename', f'{product_id}.avif')}",
                tags=tags
            )
        )

    return products


@app.post("/recommend", response_model=RecommendResponse)
async def recommend(request: RecommendRequest):
    """
    Recebe uma lista de IDs favoritos e retorna recomendações
    baseadas na similaridade visual via CLIP.

    O algoritmo:
    1. Busca os vetores (embeddings) dos produtos favoritados
    2. Calcula o vetor médio (perfil de gosto do usuário)
    3. Faz uma busca por similaridade de cosseno no ChromaDB
    4. Filtra os produtos já favoritados dos resultados
    5. Retorna os mais similares
    """
    if not request.favorites:
        raise HTTPException(status_code=400, detail="Lista de favoritos vazia.")

    collection = get_collection()

    # 1. Buscar vetores e metadados dos favoritos
    try:
        fav_result = collection.get(
            ids=request.favorites,
            include=["embeddings", "metadatas"],
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao buscar favoritos: {e}")

    if fav_result.get("embeddings") is None or len(fav_result.get("embeddings", [])) == 0:
        raise HTTPException(status_code=404, detail="Nenhum favorito encontrado na base.")

    # Extrair perfil de tags do usuário
    user_tags = []
    if fav_result.get("metadatas"):
        for meta in fav_result["metadatas"]:
            if meta:
                tags_raw = meta.get("tags") or ""
                tags = tags_raw.split(",")
                user_tags.extend([t.strip() for t in tags if t.strip() and t.strip() != "geral"])
    
    from collections import Counter
    user_tag_profile = Counter(user_tags)
    top_user_tags = {tag for tag, count in user_tag_profile.most_common(3)}

    # 2. Calcular vetor médio (perfil visual)
    embeddings = np.array(fav_result["embeddings"])
    mean_vector = np.mean(embeddings, axis=0).tolist()

    # 3. Busca por similaridade visual (pedir mais resultados para filtrar/reordenar)
    # Aumentamos n_query significativamente para ter margem de manobra com as tags
    n_query = max(request.n_results * 4, 40)
    total_items = collection.count()
    n_query = min(n_query, total_items)

    query_result = collection.query(
        query_embeddings=[mean_vector],
        n_results=n_query,
        include=["metadatas", "distances"],
    )

    # 4. Sistema de Score Híbrido (Visual + Tags)
    candidates = []
    for i, product_id in enumerate(query_result["ids"][0]):
        if product_id in request.favorites:
            continue
            
        metadata = query_result["metadatas"][0][i]
        distance = query_result["distances"][0][i] # Menor é melhor (0 a 2)
        
        # Similaridade visual base: 1 - (dist / 2) -> 0 a 1
        visual_score = 1.0 - (distance / 2.0)
        
        # Bônus por tags
        tags_raw = metadata.get("tags") or ""
        product_tags = {t.strip() for t in tags_raw.split(",") if t.strip()}
        tag_match_count = len(product_tags.intersection(top_user_tags))
        
        # Cada tag em comum adiciona um bônus (ex: 0.2 por tag, max 0.6)
        tag_bonus = min(tag_match_count * 0.25, 0.75)
        
        # Penalidade se o usuário tem um gosto forte e o produto não bate em NADA
        # (Isso ajuda a filtrar o que o usuário reclamou de "discrepante")
        penalty = 0
        if top_user_tags and not product_tags.intersection(set(user_tags)):
             penalty = 0.3
        
        final_score = visual_score + tag_bonus - penalty
        
        candidates.append({
            "score": final_score,
            "product": Product(
                id=product_id,
                name=metadata.get("name", product_id),
                filename=metadata.get("filename", f"{product_id}.avif"),
                image_url=f"/images/{metadata.get('filename', f'{product_id}.avif')}",
                tags=list(product_tags)
            )
        })

    # Ordenar candidatos pelo score final (maior é melhor)
    candidates.sort(key=lambda x: x["score"], reverse=True)

    # Pegar os top N
    recommendations = [c["product"] for c in candidates[:request.n_results]]

    return RecommendResponse(recommendations=recommendations)


@app.get("/images/{filename:path}")
async def serve_image(filename: str):
    """Serve as imagens das estampas."""
    file_path = IMAGES_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Imagem não encontrada.")
    return FileResponse(file_path)


# ── Inicialização ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
