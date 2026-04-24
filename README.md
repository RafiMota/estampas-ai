# Estampas AI

MVP de e-commerce com recomendação visual inteligente, construído para o **GoHacks 2026**.

Combina **CLIP** (visão computacional) com um sistema híbrido de tags para recomendar estampas personalizadas com base nos favoritos do usuário.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | FastAPI + ChromaDB + CLIP (`clip-ViT-B-32`) |
| Frontend | React 19 + Tailwind CSS v4 + Vite |
| IA | `sentence-transformers` — embeddings visuais |

---

## Estrutura do projeto

```
estampas-ai/
├── backend/
│   ├── main.py             # API FastAPI (endpoints + lógica de recomendação híbrida)
│   ├── vectorize.py        # Pipeline: imagens → embeddings CLIP → ChromaDB
│   ├── product_tags.json   # Mapeamento produto → categorias (anime, futebol, floral…)
│   ├── generate_tags.py    # Script auxiliar para gerar tags automaticamente
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── index.css
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── Gallery.jsx      # Catálogo de produtos
│   │       ├── ForMe.jsx        # Aba "Pra Mim" — recomendações da IA
│   │       └── ProductCard.jsx  # Card estilo e-commerce com preço e favoritar
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── estampas/               # Imagens do catálogo (.avif)
```

---

## Pré-requisitos

- **Python 3.10+**
- **Node.js 18+**
- **pip**

---

## Como rodar

### 1. Clone o repositório

```bash
git clone https://github.com/RafiMota/estampas-ai.git
cd estampas-ai
```

### 2. Backend

```bash
cd backend

# Crie e ative o ambiente virtual
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate

# Instale as dependências
pip install -r requirements.txt
```

#### Vectorize as imagens

Na primeira execução (ou sempre que adicionar novas estampas), gere os embeddings CLIP:

```bash
python vectorize.py
```

Isso escaneia a pasta `estampas/`, gera os vetores visuais com CLIP e os armazena no ChromaDB local.

#### Inicie o servidor

```bash
uvicorn main:app --reload --port 8000
```

A API estará disponível em `http://localhost:8000`.

---

### 3. Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`.

> O Vite já está configurado com proxy para o backend — não é necessário configurar CORS no browser.

---

## Como funciona a recomendação

```
Usuário favorita estampas
        ↓
Backend busca embeddings CLIP dos favoritos no ChromaDB
        ↓
Calcula vetor médio (perfil visual do usuário)
        ↓
Busca por similaridade de cosseno na coleção completa
        ↓
Score híbrido: similaridade visual + bônus por tags em comum
        ↓
Retorna os top-N produtos (excluindo os já favoritados)
```

O score final de cada candidato é calculado como:

```
score = visual_score + tag_bonus - penalty

visual_score  = 1 - (distância_cosseno / 2)     → 0 a 1
tag_bonus     = nº de tags em comum × 0.25       → máx 0.75
penalty       = 0.30 se não compartilhar nenhuma tag com o perfil
```

---

## Adicionando novas estampas

1. Copie a imagem para `estampas/`
   - Formatos suportados: `.avif`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.tiff`
   - O nome do arquivo vira o nome do produto — ex: `Minha Estampa.avif`

2. Adicione as tags do produto em `backend/product_tags.json`:
   ```json
   {
     "Minha Estampa": ["floral", "natureza"]
   }
   ```

3. Re-execute a vectorização:
   ```bash
   python vectorize.py
   ```

4. Reinicie o backend.

### Categorias de tags disponíveis

`anime` · `disney` · `marvel` · `star_wars` · `harry_potter` · `futebol` · `religioso` · `gato` · `pet` · `animal` · `floral` · `natureza` · `games` · `retro` · `personalizado` · `fashion` · `tipografia` · `arte` · `cute` · `brasil` · `minimalista` · `romantico` · `familia` · `musica` · `senna` · `stranger_things` · `hello_kitty` · `infantil`

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/products` | Lista todos os produtos com tags |
| `POST` | `/recommend` | Retorna recomendações baseadas nos favoritos |
| `GET` | `/images/{filename}` | Serve imagens do catálogo |

### Exemplo — `/recommend`

```bash
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "favorites": ["Naruto - Hokage Clean", "Jujutsu Kaisen - Gojo Moldura"],
    "n_results": 12
  }'
```

Resposta:
```json
{
  "recommendations": [
    {
      "id": "Naruto - Sasuke Uchiha",
      "name": "Naruto - Sasuke Uchiha",
      "filename": "Naruto - Sasuke Uchiha.avif",
      "image_url": "/images/Naruto - Sasuke Uchiha.avif",
      "tags": ["anime"]
    }
  ]
}
```

---

## Documentação interativa

Com o backend rodando, acesse:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`