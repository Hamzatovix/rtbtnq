#!/bin/bash
# Скрипт для проверки логов и диагностики проблем

echo "🔍 Проверка логов контейнера rosebotanique"
echo "=========================================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "1️⃣  Последние 50 строк логов:"
echo "----------------------------"
docker logs rosebotanique --tail 50
echo ""

echo "2️⃣  Поиск ошибок:"
echo "----------------"
docker logs rosebotanique 2>&1 | grep -i "error\|fail\|exception" | tail -20 || echo "Ошибок не найдено"
echo ""

echo "3️⃣  Поиск проблем с авторизацией:"
echo "--------------------------------"
docker logs rosebotanique 2>&1 | grep -i "auth\|login\|session\|cookie\|jwt" | tail -20 || echo "Записей не найдено"
echo ""

echo "4️⃣  Проверка файлов данных:"
echo "--------------------------"
docker exec rosebotanique ls -la /app/src/data/ 2>/dev/null || echo "❌ Директория /app/src/data/ не найдена"
echo ""

echo "5️⃣  Проверка переменных окружения:"
echo "--------------------------------"
docker exec rosebotanique env | grep -E "ADMIN|JWT|NODE_ENV|BASE_URL" | sort
echo ""

echo "6️⃣  Тест API логина:"
echo "-------------------"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rosebotanique","password":"RoseBot2024!"}')

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Логин работает${NC}"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}❌ Логин не работает${NC}"
    echo "$RESPONSE"
fi
echo ""

echo "7️⃣  Тест API verify:"
echo "-------------------"
RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/verify \
  -H "Cookie: auth-token=test" 2>&1)

echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

echo "8️⃣  Проверка статуса контейнера:"
echo "--------------------------------"
docker ps | grep rosebotanique
echo ""

echo "=========================================="
echo "💡 Полезные команды:"
echo ""
echo "  # Все логи:"
echo "  docker logs rosebotanique"
echo ""
echo "  # Последние 100 строк:"
echo "  docker logs rosebotanique --tail 100"
echo ""
echo "  # Логи в реальном времени:"
echo "  docker logs rosebotanique -f"
echo ""
echo "  # Логи с временными метками:"
echo "  docker logs rosebotanique -t"
echo ""

