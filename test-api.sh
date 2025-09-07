#!/bin/bash

echo "🧪 Cursor Mobile Backend API Testleri"
echo "======================================"

BASE_URL="http://localhost:3001"
WORKSPACE_PATH="/Users/feyyazcankose/Workspace"

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test fonksiyonu
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body"
    fi
}

echo ""
echo "1. 📁 Proje Yönetimi Testleri"
echo "-----------------------------"
test_endpoint "GET" "/projects" "" "Projeleri listele"
test_endpoint "GET" "/projects/scan" "" "Workspace'i tara"

echo ""
echo "2. 📄 Dosya Yönetimi Testleri"
echo "-----------------------------"
test_endpoint "GET" "/files/list?projectPath=$WORKSPACE_PATH&directoryPath=" "" "Dosya listesi"

echo ""
echo "3. 🔧 Git Testleri"
echo "------------------"
test_endpoint "GET" "/git/status?projectPath=$WORKSPACE_PATH" "" "Git durumu"

echo ""
echo "4. 🌐 Preview Testleri"
echo "----------------------"
test_endpoint "GET" "/preview/ports/available" "" "Kullanılabilir portlar"
test_endpoint "POST" "/preview/ports/check" '{"port": 3000, "host": "localhost"}' "Port kontrolü"

echo ""
echo "5. 🤖 Cursor Testleri"
echo "---------------------"
test_endpoint "GET" "/cursor/responses" "" "Cursor yanıtları"

echo ""
echo "6. 🔌 WebSocket Testi"
echo "--------------------"
echo -n "WebSocket bağlantısı test ediliyor... "
if command -v node >/dev/null 2>&1; then
    node test-websocket.js 2>/dev/null | head -3
else
    echo -e "${YELLOW}⚠️  Node.js bulunamadı, WebSocket testi atlandı${NC}"
fi

echo ""
echo "======================================"
echo "🎉 Test tamamlandı!"
echo ""
echo "📱 Mobil uygulama için:"
echo "   API: $BASE_URL"
echo "   WebSocket: ws://localhost:3001/mobile"
echo ""
echo "📚 Detaylı test rehberi: TEST_GUIDE.md"
