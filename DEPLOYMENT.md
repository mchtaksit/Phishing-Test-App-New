# Phishing Simulation - Deployment Kılavuzu

## Mimari

```
┌─────────────────────────────┐      ┌─────────────────────────────┐
│      FRONTEND VM            │      │       BACKEND VM            │
│      (10.0.0.1)             │      │       (10.0.0.2)            │
│                             │      │                             │
│  ┌───────────────────────┐  │      │  ┌───────────────────────┐  │
│  │   Nginx Container     │  │      │  │  Node.js Container    │  │
│  │   ─────────────────   │  │      │  │  ─────────────────    │  │
│  │   • Static dosyalar   │──┼──────┼─▶│  • REST API           │  │
│  │   • Reverse Proxy     │  │      │  │  • Port: 8080         │  │
│  │   • Port: 80/443      │  │      │  │                       │  │
│  └───────────────────────┘  │      │  └───────────────────────┘  │
│                             │      │                             │
└─────────────────────────────┘      └─────────────────────────────┘
         ▲
         │
    Kullanıcılar
```

---

## Ön Gereksinimler

Her iki VM'de:
- Docker Engine 20.10+
- Docker Compose 2.0+

```bash
# Docker kurulumu (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

---

## Adım 1: Backend VM Kurulumu

### 1.1 Proje dosyalarını Backend VM'e kopyalayın

```bash
# Sadece backend klasörünü kopyalayın
scp -r backend/ user@BACKEND_VM_IP:/opt/phishing-sim/
scp docker-compose.backend.yml user@BACKEND_VM_IP:/opt/phishing-sim/docker-compose.yml
scp .env.backend user@BACKEND_VM_IP:/opt/phishing-sim/.env
```

### 1.2 Backend VM'de .env dosyasını düzenleyin

```bash
ssh user@BACKEND_VM_IP
cd /opt/phishing-sim
nano .env
```

```env
# Frontend VM'nin IP adresini girin
CORS_ORIGIN=http://10.0.0.1
```

### 1.3 Backend'i başlatın

```bash
cd /opt/phishing-sim
docker-compose up -d --build

# Logları kontrol edin
docker-compose logs -f
```

### 1.4 Backend'in çalıştığını doğrulayın

```bash
curl http://localhost:8080/health
# Beklenen çıktı: OK
```

---

## Adım 2: Frontend VM Kurulumu

### 2.1 Proje dosyalarını Frontend VM'e kopyalayın

```bash
# Frontend klasörünü kopyalayın
scp -r frontend/ user@FRONTEND_VM_IP:/opt/phishing-sim/
scp docker-compose.frontend.yml user@FRONTEND_VM_IP:/opt/phishing-sim/docker-compose.yml
scp .env.frontend user@FRONTEND_VM_IP:/opt/phishing-sim/.env
```

### 2.2 Frontend VM'de .env dosyasını düzenleyin

```bash
ssh user@FRONTEND_VM_IP
cd /opt/phishing-sim
nano .env
```

```env
# Backend VM'nin IP adresini girin
BACKEND_URL=10.0.0.2:8080
```

### 2.3 Frontend'i başlatın

```bash
cd /opt/phishing-sim
docker-compose up -d --build

# Logları kontrol edin
docker-compose logs -f
```

### 2.4 Frontend'in çalıştığını doğrulayın

```bash
curl http://localhost/health
# Beklenen çıktı: OK

curl http://localhost/api/health
# Backend'e proxy - Beklenen çıktı: OK
```

---

## Adım 3: Firewall Ayarları

### Backend VM (10.0.0.2)

```bash
# Sadece Frontend VM'den 8080 portuna erişime izin ver
sudo ufw allow from 10.0.0.1 to any port 8080
sudo ufw enable
```

### Frontend VM (10.0.0.1)

```bash
# Dışarıdan 80 ve 443 portlarına erişime izin ver
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## SSL/TLS Sertifikası (Production)

### Self-Signed Sertifika (Test için)

```bash
mkdir -p /opt/phishing-sim/ssl
cd /opt/phishing-sim/ssl

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout server.key \
  -out server.crt \
  -subj "/CN=phishing.university.local"
```

### Let's Encrypt (Production için)

```bash
# Certbot kurulumu
sudo apt install certbot

# Sertifika al
sudo certbot certonly --standalone -d phishing.university.local

# Sertifikaları kopyala
cp /etc/letsencrypt/live/phishing.university.local/fullchain.pem /opt/phishing-sim/ssl/server.crt
cp /etc/letsencrypt/live/phishing.university.local/privkey.pem /opt/phishing-sim/ssl/server.key
```

---

## Yararlı Komutlar

### Container Durumu

```bash
# Tüm container'ları listele
docker-compose ps

# Container logları
docker-compose logs -f

# Belirli container logu
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Yeniden Başlatma

```bash
# Servisleri yeniden başlat
docker-compose restart

# Sıfırdan build et ve başlat
docker-compose up -d --build --force-recreate
```

### Durdurma

```bash
# Servisleri durdur
docker-compose down

# Volume'larla birlikte sil (DİKKAT: Veri kaybı!)
docker-compose down -v
```

---

## Sorun Giderme

### Backend'e bağlanılamıyor

```bash
# Backend VM'de:
docker-compose logs backend
curl http://localhost:8080/health

# Frontend VM'den Backend'e erişim testi:
curl http://BACKEND_IP:8080/health
```

### CORS Hatası

Backend'deki `.env` dosyasında `CORS_ORIGIN` değerinin Frontend URL'i ile eşleştiğinden emin olun:

```env
CORS_ORIGIN=http://10.0.0.1
```

### Container başlamıyor

```bash
# Detaylı hata mesajı
docker-compose logs --tail=100

# Container'ı interaktif çalıştır
docker-compose run --rm frontend sh
```

---

## Hızlı Referans

| VM | IP (Örnek) | Port | Servis |
|---|---|---|---|
| Frontend | 10.0.0.1 | 80, 443 | Nginx (Static + Proxy) |
| Backend | 10.0.0.2 | 8080 | Node.js API |

| Dosya | Açıklama |
|---|---|
| `docker-compose.frontend.yml` | Frontend VM için compose |
| `docker-compose.backend.yml` | Backend VM için compose |
| `.env.frontend` | Frontend ortam değişkenleri |
| `.env.backend` | Backend ortam değişkenleri |
