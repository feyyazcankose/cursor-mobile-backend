# 🧶 Yarn ile Cursor Mobile Backend Kullanımı

## 🚀 Hızlı Başlangıç

### 1. **Development Modunda Başlatma**

```bash
# Otomatik kurulum ve başlatma
./dev.sh

# Veya manuel
yarn install
yarn start:dev
```

### 2. **Production Modunda Başlatma**

```bash
# Otomatik kurulum, build ve başlatma
./start.sh

# Veya manuel
yarn install
yarn build
yarn start:prod
```

## 📦 Yarn Komutları

### **Kurulum**

```bash
# Bağımlılıkları yükle
yarn install

# Development bağımlılıklarını yükle
yarn add socket.io-client --dev
```

### **Geliştirme**

```bash
# Development modunda çalıştır
yarn start:dev

# Build et
yarn build

# Production modunda çalıştır
yarn start:prod
```

### **Test**

```bash
# API testlerini çalıştır
./test-api.sh

# WebSocket testini çalıştır
node test-websocket.js

# Unit testleri çalıştır
yarn test
```

## 🔧 Yarn Workspace (Opsiyonel)

Eğer monorepo kullanıyorsanız, `package.json`'a workspace ekleyebilirsiniz:

```json
{
  "name": "cursor-mobile-backend",
  "private": true,
  "workspaces": ["packages/*"]
}
```

## 📱 Mobil Uygulama Entegrasyonu

### **React Native**

```bash
# React Native projesinde
yarn add socket.io-client
```

```javascript
import io from "socket.io-client";

const socket = io("http://192.168.1.100:3001/mobile");
```

### **Flutter**

```yaml
# pubspec.yaml
dependencies:
  socket_io_client: ^2.0.3+1
```

```dart
import 'package:socket_io_client/socket_io_client.dart' as IO;

final socket = IO.io('http://192.168.1.100:3001/mobile');
```

## 🐛 Hata Ayıklama

### **Yarn Cache Temizleme**

```bash
# Yarn cache'i temizle
yarn cache clean

# node_modules'ü sil ve yeniden yükle
rm -rf node_modules
yarn install
```

### **Lock File Sorunları**

```bash
# yarn.lock'u sil ve yeniden oluştur
rm yarn.lock
yarn install
```

### **Dependency Çakışmaları**

```bash
# Resolutions kullan
yarn add package-name --dev
```

## 📊 Performans

### **Yarn Berry (v2+) Kullanımı**

```bash
# Yarn Berry'ye geç
yarn set version berry

# Zero-installs aktif et
yarn config set nodeLinker node-modules
```

### **Bundle Analizi**

```bash
# Bundle boyutunu analiz et
yarn build --analyze
```

## 🔒 Güvenlik

### **Audit**

```bash
# Güvenlik açıklarını kontrol et
yarn audit

# Güvenlik açıklarını düzelt
yarn audit --fix
```

### **Outdated Packages**

```bash
# Eski paketleri kontrol et
yarn outdated

# Paketleri güncelle
yarn upgrade-interactive
```

## 📈 Monitoring

### **Yarn Scripts**

```json
{
  "scripts": {
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\""
  }
}
```

## 🎯 Best Practices

1. **Lock File'ı Commit Et**: `yarn.lock` dosyasını git'e ekleyin
2. **Exact Versions**: Production'da exact version kullanın
3. **Audit Regular**: Düzenli olarak `yarn audit` çalıştırın
4. **Clean Install**: CI/CD'de `yarn install --frozen-lockfile` kullanın
5. **Workspace**: Büyük projelerde workspace kullanın

## 🚨 Yaygın Sorunlar

### **"Cannot find module" Hatası**

```bash
# node_modules'ü temizle
rm -rf node_modules yarn.lock
yarn install
```

### **"Peer dependency" Uyarıları**

```bash
# Peer dependency'leri yükle
yarn add package-name --peer
```

### **"Out of memory" Hatası**

```bash
# Node.js memory limit'ini artır
export NODE_OPTIONS="--max-old-space-size=4096"
yarn install
```

## 📚 Faydalı Linkler

- [Yarn Documentation](https://yarnpkg.com/docs)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
- [Yarn Berry](https://yarnpkg.com/getting-started/install)
- [NestJS Documentation](https://docs.nestjs.com/)
