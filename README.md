# Phishing Simulation

Üniversite veri merkezi için phishing simülasyon uygulaması.

## Mimari

```
┌─────────────────────────┐         ┌─────────────────────────┐
│     FRONTEND VM         │         │      BACKEND VM         │
│                         │         │                         │
│  ┌───────────────────┐  │  /api/  │  ┌───────────────────┐  │
│  │      Nginx        │──┼────────▶│  │     Node.js       │  │
│  │   Port: 80/443    │  │         │  │    Port: 8080     │  │
│  └───────────────────┘  │         │  └───────────────────┘  │
└─────────────────────────┘         └─────────────────────────┘
```

## Teknolojiler

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Web Server | Nginx |
| Container | Docker |

---

## Kurulum (Docker)

Detaylı kurulum için [DEPLOYMENT.md](DEPLOYMENT.md) dosyasına bakın.

### 1. Environment dosyalarını oluşturun

```bash
cp .env.backend.example .env.backend
cp .env.frontend.example .env.frontend
```

### 2. IP adreslerini düzenleyin

```bash
# .env.backend
CORS_ORIGIN=http://FRONTEND_IP

# .env.frontend
BACKEND_URL=BACKEND_IP:8080
```

### 3. Backend VM

```bash
docker-compose -f docker-compose.backend.yml up -d --build
```

### 4. Frontend VM

```bash
docker-compose -f docker-compose.frontend.yml up -d --build
```

---

## Geliştirme (Lokal)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Proje Yapısı

```
.
├── backend/                    # Node.js API
│   ├── src/
│   │   ├── index.ts           # Express server
│   │   ├── config.ts          # Yapılandırma
│   │   └── db.ts              # In-memory veritabanı
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── pages/             # Sayfa bileşenleri
│   │   ├── components/        # Ortak bileşenler
│   │   ├── api.ts             # API istemcisi
│   │   └── types.ts           # TypeScript tipleri
│   ├── Dockerfile.production
│   └── package.json
│
├── docker-compose.backend.yml  # Backend Docker Compose
├── docker-compose.frontend.yml # Frontend Docker Compose
└── DEPLOYMENT.md               # Kurulum kılavuzu
```

---

## API Endpoints

| Method | Path | Açıklama |
|--------|------|----------|
| GET | /health | Health check |
| GET | /campaigns | Kampanya listesi |
| GET | /campaigns/:id | Kampanya detayı |
| POST | /campaigns | Yeni kampanya |
| POST | /campaigns/:id/start | Kampanya başlat |
| POST | /events | Event kaydet |

---

## Özellikler

- Phishing kampanya yönetimi
- Dashboard ve istatistikler
- Landing page şablonları
- E-posta şablonları
- Olay takibi (click, submit)

---

## Lisans

Bu proje üniversite içi kullanım için geliştirilmiştir.
