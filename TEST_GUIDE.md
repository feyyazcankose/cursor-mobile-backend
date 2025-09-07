# 🧪 Cursor Mobile Backend Test Rehberi

## 🚀 Server Başlatma

```bash
# Development modunda
./dev.sh

# Veya manuel
npm run start:dev
```

Server başladıktan sonra: `http://localhost:3001`

## 📋 API Test Senaryoları

### 1. **Proje Yönetimi Testleri**

#### Projeleri Listele

```bash
curl -X GET http://localhost:3001/projects
```

#### Workspace'i Tara

```bash
curl -X GET http://localhost:3001/projects/scan
```

#### Belirli Proje Detayları

```bash
curl -X GET "http://localhost:3001/projects/$(echo '/Users/feyyazcankose/Workspace' | base64)"
```

### 2. **Dosya Yönetimi Testleri**

#### Dosya Listesi

```bash
curl -X GET "http://localhost:3001/files/list?projectPath=/Users/feyyazcankose/Workspace&directoryPath="
```

#### Dosya İçeriği

```bash
curl -X GET "http://localhost:3001/files/content?projectPath=/Users/feyyazcankose/Workspace&filePath=README.md"
```

#### Dosya Yazma

```bash
curl -X POST http://localhost:3001/files/write \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/Users/feyyazcankose/Workspace",
    "filePath": "test.txt",
    "content": "Merhaba Dünya!"
  }'
```

### 3. **Git Testleri**

#### Git Durumu

```bash
curl -X GET "http://localhost:3001/git/status?projectPath=/Users/feyyazcankose/Workspace"
```

#### Git Diff

```bash
curl -X GET "http://localhost:3001/git/diff?projectPath=/Users/feyyazcankose/Workspace"
```

#### Git Commit

```bash
curl -X POST http://localhost:3001/git/commit \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/Users/feyyazcankose/Workspace",
    "message": "Test commit from mobile backend",
    "all": true
  }'
```

### 4. **Cursor Testleri**

#### Prompt Gönderme

```bash
curl -X POST http://localhost:3001/cursor/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/Users/feyyazcankose/Workspace",
    "prompt": "Bu projeyi analiz et ve özetle"
  }'
```

#### Cursor'da Açma

```bash
curl -X POST http://localhost:3001/cursor/open \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/Users/feyyazcankose/Workspace"
  }'
```

### 5. **Preview Testleri**

#### Çalışan Server'ları Tespit Et

```bash
curl -X GET "http://localhost:3001/preview/detect/$(echo '/Users/feyyazcankose/Workspace' | base64)"
```

#### Port Durumu

```bash
curl -X POST http://localhost:3001/preview/ports/check \
  -H "Content-Type: application/json" \
  -d '{
    "port": 3000,
    "host": "localhost"
  }'
```

## 🔌 WebSocket Testleri

### WebSocket Bağlantısı (Node.js ile)

```javascript
const io = require("socket.io-client");

const socket = io("http://localhost:3001/mobile");

socket.on("connected", (data) => {
  console.log("Bağlandı:", data);
});

socket.on("file_change", (data) => {
  console.log("Dosya değişti:", data);
});

// Projeye katıl
socket.emit("join_project", { projectPath: "/Users/feyyazcankose/Workspace" });

// Dosya değişikliklerini dinle
socket.emit("subscribe_file_changes", {
  projectPath: "/Users/feyyazcankose/Workspace",
});
```

### WebSocket Test (Browser Console)

```javascript
const socket = io("http://localhost:3001/mobile");

socket.on("connected", (data) => {
  console.log("Connected:", data);
});

// Test ping
socket.emit("ping");
socket.on("pong", (data) => {
  console.log("Pong received:", data);
});
```

## 🐛 Hata Ayıklama

### Server Logları

```bash
# Development modunda logları görmek için
npm run start:dev

# Veya background'da çalışıyorsa
tail -f logs/app.log
```

### Port Kontrolü

```bash
# Port 3001'in kullanımda olup olmadığını kontrol et
lsof -i :3001
```

### Process Kontrolü

```bash
# NestJS process'ini bul
ps aux | grep "nest start"
```

## 📱 Mobil Uygulama Testleri

### React Native ile Test

```javascript
// API çağrısı
const response = await fetch("http://192.168.1.100:3001/projects");
const projects = await response.json();

// WebSocket bağlantısı
import io from "socket.io-client";
const socket = io("http://192.168.1.100:3001/mobile");
```

### Flutter ile Test

```dart
// HTTP isteği
final response = await http.get(Uri.parse('http://192.168.1.100:3001/projects'));
final projects = jsonDecode(response.body);

// WebSocket bağlantısı
import 'package:socket_io_client/socket_io_client.dart' as IO;
final socket = IO.io('http://192.168.1.100:3001/mobile');
```

## 🔧 Postman Collection

Postman'da test etmek için:

1. **Environment Variables:**
   - `base_url`: `http://localhost:3001`
   - `workspace_path`: `/Users/feyyazcankose/Workspace`

2. **Test Collection'ı oluştur:**
   - GET `/projects`
   - GET `/projects/scan`
   - GET `/files/list`
   - POST `/files/write`
   - GET `/git/status`
   - POST `/cursor/prompt`
   - GET `/preview/ports/available`

## ✅ Başarılı Test Sonuçları

- ✅ Server başarıyla çalışıyor
- ✅ API endpoint'leri yanıt veriyor
- ✅ WebSocket bağlantısı kuruluyor
- ✅ CORS ayarları çalışıyor
- ✅ Güvenlik başlıkları aktif

## 🚨 Yaygın Sorunlar

1. **Port zaten kullanımda:** Farklı port kullanın
2. **CORS hatası:** Origin'i kontrol edin
3. **WebSocket bağlantı hatası:** Firewall ayarlarını kontrol edin
4. **Dosya izin hatası:** Workspace path'ini kontrol edin
