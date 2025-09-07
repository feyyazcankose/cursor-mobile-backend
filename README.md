# Cursor Mobile Backend

Bu backend servisi, Cursor IDE ile mobil cihazlar arasında köprü görevi görür. Mobil uygulamanız aracılığıyla projelerinizi takip edebilir, dosyaları yönetebilir, Git işlemlerini gerçekleştirebilir ve Cursor'a prompt gönderebilirsiniz.

## 🚀 Özellikler

### 📁 Proje Yönetimi

- Workspace'deki tüm projeleri otomatik tespit etme
- Proje detaylarını görüntüleme (dil, framework, Git durumu)
- Proje değişikliklerini anlık takip etme

### 📄 Dosya Yönetimi

- Dosya ve klasör listeleme
- Dosya içeriklerini okuma ve yazma
- Dosya değişikliklerini anlık takip etme
- Dosya oluşturma ve silme

### 🔧 Git Entegrasyonu

- Git durumunu görüntüleme
- Commit, push, pull işlemleri
- Branch yönetimi
- Diff görüntüleme
- Commit geçmişi

### 🤖 Cursor CLI Entegrasyonu

- Cursor'a prompt gönderme
- Komut çalıştırma
- Cursor'da proje açma
- İşlem durumunu takip etme

### 🌐 Preview Desteği

- Local development server'ları tespit etme
- Dev server başlatma/durdurma
- Port durumunu kontrol etme
- Framework otomatik tespit

### 📡 WebSocket Desteği

- Anlık bildirimler
- Dosya değişiklik bildirimleri
- Cursor işlem durumu bildirimleri
- Proje güncellemeleri

## 🛠️ Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Cursor IDE (CLI erişimi için)

### Adımlar

1. **Projeyi klonlayın:**

```bash
git clone <repository-url>
cd cursor-mobile-backend
```

2. **Bağımlılıkları yükleyin:**

```bash
npm install
```

3. **Environment dosyasını oluşturun:**

```bash
cp .env.example .env
```

4. **Environment değişkenlerini düzenleyin:**

```env
# Server Configuration
PORT=3001
HOST=0.0.0.0

# Cursor Configuration
CURSOR_WORKSPACE_PATH=/Users/yourusername/Workspace
CURSOR_CLI_PATH=/usr/local/bin/cursor

# Git Configuration
GIT_AUTHOR_NAME="Mobile Backend"
GIT_AUTHOR_EMAIL="mobile-backend@cursor.local"

# Security
CORS_ORIGIN=*
API_KEY=your-secret-api-key
```

5. **Uygulamayı başlatın:**

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Dokümantasyonu

### Projeler

- `GET /projects` - Tüm projeleri listele
- `GET /projects/scan` - Workspace'i yeniden tara
- `GET /projects/:path` - Belirli proje detayları
- `POST /projects/:path/refresh` - Projeyi yenile

### Dosyalar

- `GET /files/list?projectPath=...&directoryPath=...` - Dosya listesi
- `GET /files/content?projectPath=...&filePath=...` - Dosya içeriği
- `POST /files/write` - Dosya yazma
- `DELETE /files/:projectPath/:filePath` - Dosya silme
- `POST /files/directory` - Klasör oluşturma

### Git

- `GET /git/status?projectPath=...` - Git durumu
- `GET /git/diff?projectPath=...` - Diff görüntüleme
- `POST /git/commit` - Commit oluşturma
- `GET /git/log?projectPath=...` - Commit geçmişi
- `GET /git/branches?projectPath=...` - Branch listesi
- `POST /git/checkout` - Branch değiştirme
- `POST /git/pull` - Pull işlemi
- `POST /git/push` - Push işlemi

### Cursor

- `POST /cursor/prompt` - Prompt gönderme
- `POST /cursor/command` - Komut çalıştırma
- `POST /cursor/open` - Cursor'da açma
- `GET /cursor/responses` - Tüm yanıtları listele
- `GET /cursor/response/:id` - Belirli yanıt
- `POST /cursor/cancel/:id` - İşlemi iptal etme

### Preview

- `GET /preview/detect/:projectPath` - Çalışan server'ları tespit et
- `POST /preview/start` - Dev server başlat
- `POST /preview/stop` - Dev server durdur
- `GET /preview/servers` - Tüm server'ları listele
- `GET /preview/status/:projectPath` - Server durumu
- `GET /preview/ports/available` - Kullanılabilir portlar

## 🔌 WebSocket Events

### Bağlantı

- `connected` - Bağlantı kuruldu
- `disconnected` - Bağlantı kesildi

### Proje Events

- `join_project` - Projeye katıl
- `leave_project` - Projeden ayrıl
- `project_update` - Proje güncellendi

### Dosya Events

- `subscribe_file_changes` - Dosya değişikliklerini dinle
- `unsubscribe_file_changes` - Dosya değişiklik dinlemeyi durdur
- `file_change` - Dosya değişti

### Cursor Events

- `subscribe_cursor_updates` - Cursor güncellemelerini dinle
- `unsubscribe_cursor_updates` - Cursor güncelleme dinlemeyi durdur
- `cursor_update` - Cursor işlemi güncellendi

## 🔒 Güvenlik

- CORS yapılandırması
- Helmet güvenlik başlıkları
- API key doğrulama (opsiyonel)
- Input validation
- Rate limiting (gelecek sürümde)

## 🐛 Hata Ayıklama

### Loglar

Uygulama detaylı loglar üretir. Development modunda çalıştırırken konsol çıktısını takip edin.

### Yaygın Sorunlar

1. **Cursor CLI bulunamıyor:**
   - Cursor'u PATH'e eklediğinizden emin olun
   - `CURSOR_CLI_PATH` environment değişkenini kontrol edin

2. **Port zaten kullanımda:**
   - Farklı bir port kullanın
   - `PORT` environment değişkenini değiştirin

3. **Dosya izinleri:**
   - Workspace klasörüne yazma izni verin
   - Git repository'lerine erişim izni kontrol edin

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Sorunlarınız için GitHub Issues kullanın veya iletişime geçin.
