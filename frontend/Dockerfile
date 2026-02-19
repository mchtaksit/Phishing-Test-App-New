# --- Aşama 1: Build (Derleme) ---
FROM node:20-alpine as builder
WORKDIR /app

# Paket dosyalarını kopyala ve kur
COPY package*.json ./
RUN npm install

# Tüm kodları kopyala
COPY . .

# Backend URL'sini build aşamasına dahil et
ARG BACKEND_URL
ENV VITE_BACKEND_URL=$BACKEND_URL

# Projeyi derle (Vite için dist klasörü oluşur)
RUN npm run build

# --- Aşama 2: Sunum (Nginx) ---
FROM nginx:alpine

# Derlenen statik dosyaları Nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# 80 portunu aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]
