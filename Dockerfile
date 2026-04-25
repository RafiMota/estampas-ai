# --- ESTÁGIO 1: Build do Frontend ---
FROM node:20-slim AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- ESTÁGIO 2: Backend (Versão Otimizada) ---
FROM python:3.10-slim
WORKDIR /app

# Instalar dependências do sistema e limpar cache no mesmo comando
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Instalar PyTorch CPU primeiro (Economiza ~1.5GB)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Instalar o restante das dependências
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Baixar o modelo CLIP
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('clip-ViT-B-32')"

# Copiar apenas o necessário
COPY backend/ ./backend/
COPY estampas/ ./estampas/
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

ENV PORT=8080
ENV PYTHONUNBUFFERED=1

EXPOSE 8080

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
