const io = require("socket.io-client");

console.log("🔌 WebSocket Test Başlatılıyor...");

const socket = io("http://localhost:3001/mobile");

socket.on("connect", () => {
  console.log("✅ WebSocket bağlantısı kuruldu");

  // Ping testi
  socket.emit("ping");
});

socket.on("connected", (data) => {
  console.log("📱 Server mesajı:", data.message);
  console.log("🆔 Client ID:", data.clientId);
});

socket.on("pong", (data) => {
  console.log("🏓 Pong alındı:", data.timestamp);
});

socket.on("file_change", (data) => {
  console.log("📄 Dosya değişti:", data);
});

socket.on("cursor_update", (data) => {
  console.log("🤖 Cursor güncellemesi:", data);
});

socket.on("connect_error", (error) => {
  console.error("❌ Bağlantı hatası:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Bağlantı kesildi:", reason);
});

// Test mesajları gönder
setTimeout(() => {
  console.log("📤 Test mesajları gönderiliyor...");

  // Projeye katıl
  socket.emit("join_project", {
    projectPath: "/Users/feyyazcankose/Workspace",
  });

  // Dosya değişikliklerini dinle
  socket.emit("subscribe_file_changes", {
    projectPath: "/Users/feyyazcankose/Workspace",
  });

  // Cursor güncellemelerini dinle
  socket.emit("subscribe_cursor_updates", {
    projectPath: "/Users/feyyazcankose/Workspace",
  });
}, 2000);

// 10 saniye sonra bağlantıyı kapat
setTimeout(() => {
  console.log("🔌 Test tamamlandı, bağlantı kapatılıyor...");
  socket.disconnect();
  process.exit(0);
}, 10000);
