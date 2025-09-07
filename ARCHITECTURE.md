# Cursor Mobile Backend - Mimari

## 🏗️ Genel Yapı

```
cursor-mobile-backend/
├── src/
│   ├── main.ts                    # Uygulama giriş noktası
│   ├── app.module.ts              # Ana modül
│   ├── common/                    # Ortak servisler
│   │   ├── guards/                # Güvenlik guard'ları
│   │   ├── interceptors/          # Logging interceptor
│   │   └── filters/               # Exception filter
│   └── modules/                   # İş mantığı modülleri
│       ├── projects/              # Proje yönetimi
│       ├── files/                 # Dosya yönetimi
│       ├── git/                   # Git entegrasyonu
│       ├── cursor/                # Cursor CLI entegrasyonu
│       ├── preview/               # Dev server yönetimi
│       └── websocket/             # WebSocket desteği
├── package.json                   # Bağımlılıklar
├── tsconfig.json                  # TypeScript yapılandırması
├── start.sh                       # Production başlatma scripti
├── dev.sh                         # Development başlatma scripti
└── README.md                      # Dokümantasyon
```

## 🔄 Veri Akışı

### 1. Proje Keşfi

```
Workspace Scan → Project Detection → Framework Detection → Git Status → WebSocket Notification
```

### 2. Dosya İşlemleri

```
File Request → Path Validation → File System Access → Content Processing → Response
```

### 3. Git İşlemleri

```
Git Command → SimpleGit → Repository Operations → Status Update → WebSocket Notification
```

### 4. Cursor Entegrasyonu

```
Prompt/Command → CLI Execution → Process Monitoring → Result Processing → WebSocket Update
```

### 5. Preview Yönetimi

```
Port Detection → Server Spawning → Process Monitoring → Status Updates → WebSocket Notifications
```

## 📡 API Endpoints

### Projeler

- `GET /projects` - Proje listesi
- `GET /projects/scan` - Workspace tarama
- `GET /projects/:path` - Proje detayları
- `POST /projects/:path/refresh` - Proje yenileme

### Dosyalar

- `GET /files/list` - Dosya listesi
- `GET /files/content` - Dosya içeriği
- `POST /files/write` - Dosya yazma
- `DELETE /files/:path` - Dosya silme
- `POST /files/directory` - Klasör oluşturma

### Git

- `GET /git/status` - Git durumu
- `GET /git/diff` - Diff görüntüleme
- `POST /git/commit` - Commit oluşturma
- `GET /git/log` - Commit geçmişi
- `GET /git/branches` - Branch listesi
- `POST /git/checkout` - Branch değiştirme
- `POST /git/pull` - Pull işlemi
- `POST /git/push` - Push işlemi

### Cursor

- `POST /cursor/prompt` - Prompt gönderme
- `POST /cursor/command` - Komut çalıştırma
- `POST /cursor/open` - Cursor'da açma
- `GET /cursor/responses` - Yanıt listesi
- `GET /cursor/response/:id` - Yanıt detayı
- `POST /cursor/cancel/:id` - İşlem iptal

### Preview

- `GET /preview/detect/:path` - Server tespit
- `POST /preview/start` - Server başlatma
- `POST /preview/stop` - Server durdurma
- `GET /preview/servers` - Server listesi
- `GET /preview/status/:path` - Server durumu
- `GET /preview/ports/available` - Kullanılabilir portlar

## 🔌 WebSocket Events

### Bağlantı Yönetimi

- `connected` - Bağlantı kuruldu
- `disconnected` - Bağlantı kesildi
- `ping/pong` - Bağlantı kontrolü

### Proje Events

- `join_project` - Projeye katılma
- `leave_project` - Projeden ayrılma
- `project_update` - Proje güncellemesi

### Dosya Events

- `subscribe_file_changes` - Dosya değişiklik dinleme
- `unsubscribe_file_changes` - Dosya değişiklik dinlemeyi durdurma
- `file_change` - Dosya değişikliği bildirimi

### Cursor Events

- `subscribe_cursor_updates` - Cursor güncelleme dinleme
- `unsubscribe_cursor_updates` - Cursor güncelleme dinlemeyi durdurma
- `cursor_update` - Cursor işlem güncellemesi

### Preview Events

- `dev_server_started` - Dev server başlatıldı
- `dev_server_stopped` - Dev server durduruldu
- `port_status_changed` - Port durumu değişti

## 🛡️ Güvenlik Katmanları

### 1. CORS Koruması

- Origin kontrolü
- Method kısıtlamaları
- Header kontrolü

### 2. Helmet Güvenlik

- Content Security Policy
- XSS koruması
- Clickjacking koruması

### 3. Input Validation

- Class-validator ile doğrulama
- Type transformation
- Whitelist kontrolü

### 4. API Key Doğrulama (Opsiyonel)

- X-API-Key header kontrolü
- Environment-based konfigürasyon

### 5. Rate Limiting (Gelecek)

- Request rate kontrolü
- IP-based kısıtlamalar

## 📊 Performans Optimizasyonları

### 1. Dosya İşlemleri

- Maksimum dosya boyutu kontrolü
- Lazy loading
- Cache mekanizması

### 2. Git İşlemleri

- SimpleGit instance caching
- Async işlemler
- Error handling

### 3. WebSocket

- Room-based broadcasting
- Event filtering
- Connection pooling

### 4. File Watching

- Chokidar optimizasyonu
- Ignore patterns
- Debouncing

## 🔧 Konfigürasyon

### Environment Variables

```env
# Server
PORT=3001
HOST=0.0.0.0

# Cursor
CURSOR_WORKSPACE_PATH=/path/to/workspace
CURSOR_CLI_PATH=/usr/local/bin/cursor

# Git
GIT_AUTHOR_NAME="Mobile Backend"
GIT_AUTHOR_EMAIL="mobile-backend@cursor.local"

# Security
CORS_ORIGIN=*
API_KEY=optional-secret-key

# Performance
WATCH_INTERVAL=1000
MAX_FILE_SIZE=10485760
DEFAULT_DEV_PORTS=3000,3001,8080,8000,5000
```

## 🚀 Deployment

### Development

```bash
./dev.sh
```

### Production

```bash
./start.sh
```

### Docker (Gelecek)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

## 📈 Monitoring

### Logging

- Request/Response logging
- Error tracking
- Performance metrics

### Health Checks

- Server status
- Database connectivity
- External service availability

### Metrics

- Request count
- Response time
- Error rate
- WebSocket connections
