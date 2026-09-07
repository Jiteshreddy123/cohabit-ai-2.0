# Stage 1: Build the React Frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the FastAPI Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies if required by any python packages (like psycopg2)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend source code
COPY backend/ .

# Copy the compiled React files from Stage 1 into the backend's static folder
RUN mkdir -p static
COPY --from=frontend-builder /app/frontend/dist ./static/

# Render automatically maps the $PORT environment variable
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000}
