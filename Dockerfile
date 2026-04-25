# --- ESTÁGIO 1: Build do Frontend (React/Vite) ---
FROM node:20-slim AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- ESTÁGIO 2: Backend (FastAPI + AI) ---
FROM python:3.10-slim
WORKDIR /app

# Instalar dependências do sistema para processamento de imagem (OpenCV/Pillow)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependências do Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baixar o modelo CLIP durante o build (evita download no startup do container)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('clip-ViT-B-32')"

# Copiar o código do backend e as estampas
COPY backend/ ./backend/
COPY estampas/ ./estampas/

# Copiar o build do frontend para ser servido pelo FastAPI
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

# Variáveis de ambiente
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Expor a porta
EXPOSE 8080

# Rodar o servidor usando uvicorn (chamando pelo módulo)
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
