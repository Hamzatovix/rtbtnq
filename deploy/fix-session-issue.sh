#!/bin/bash
# Исправление проблемы с сессией

echo "🔧 Диагностика и исправление проблемы с сессией"
echo "================================================"
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "1️⃣  Проверка файлов данных..."
echo ""

if docker exec rosebotanique ls -la /app/src/data/ 2>/dev/null | grep -q "\.json"; then
    echo -e "${GREEN}✅ Файлы данных доступны${NC}"
    docker exec rosebotanique ls -la /app/src/data/ | grep "\.json"
else
    echo -e "${RED}❌ Файлы данных не найдены${NC}"
    echo "Проверяю volume..."
    if [ -d "/opt/rosebotanique/front/src/data" ]; then
        echo "Директория на хосте существует"
        ls -la /opt/rosebotanique/front/src/data/ | grep "\.json" || echo "JSON файлы не найдены на хосте"
    else
        echo "Директория /opt/rosebotanique/front/src/data не существует"
    fi
fi

echo ""

echo "2️⃣  Тест API логина..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rosebotanique","password":"RoseBot2024!"}' \
  -c /tmp/cookies.txt -v 2>&1)

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Логин работает${NC}"
    
    # Проверяем cookie
    if echo "$RESPONSE" | grep -q "set-cookie.*auth-token"; then
        COOKIE_LINE=$(echo "$RESPONSE" | grep -i "set-cookie.*auth-token")
        echo "Cookie установлен:"
        echo "$COOKIE_LINE" | head -1
        
        # Проверяем флаг Secure
        if echo "$COOKIE_LINE" | grep -q "Secure"; then
            echo -e "${YELLOW}⚠️  Cookie имеет флаг Secure - не будет работать по HTTP${NC}"
        else
            echo -e "${GREEN}✅ Cookie без флага Secure - будет работать по HTTP${NC}"
        fi
    else
        echo -e "${RED}❌ Cookie не установлен${NC}"
    fi
else
    echo -e "${RED}❌ Логин не работает${NC}"
    echo "$RESPONSE" | head -5
fi

echo ""

echo "3️⃣  Тест API verify (с cookie)..."
echo ""

if [ -f "/tmp/cookies.txt" ]; then
    VERIFY_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/verify \
      -b /tmp/cookies.txt -v 2>&1)
    
    if echo "$VERIFY_RESPONSE" | grep -q '"authenticated":true'; then
        echo -e "${GREEN}✅ Verify работает с cookie${NC}"
    else
        echo -e "${RED}❌ Verify не работает${NC}"
        echo "$VERIFY_RESPONSE" | grep -E "HTTP|authenticated" | head -3
    fi
else
    echo "Cookie файл не найден, тестирую без cookie..."
    VERIFY_RESPONSE=$(curl -s -X GET http://localhost:3000/api/auth/verify -v 2>&1)
    echo "$VERIFY_RESPONSE" | grep -E "HTTP|authenticated" | head -3
fi

echo ""

echo "4️⃣  Проверка кода на сервере..."
echo ""

cd /opt/rosebotanique
if git status | grep -q "modified"; then
    echo -e "${YELLOW}⚠️  Есть незакоммиченные изменения${NC}"
    echo "Обновляю код из Git..."
    git pull
else
    echo "Код актуален"
    git pull
fi

echo ""

echo "5️⃣  Проверка исправления cookies в коде..."
echo ""

if grep -q "x-forwarded-proto" front/src/app/api/auth/login/route.ts 2>/dev/null; then
    echo -e "${GREEN}✅ Исправление для cookies применено${NC}"
else
    echo -e "${YELLOW}⚠️  Исправление для cookies не найдено в коде${NC}"
    echo "Нужно обновить код из Git или применить исправление вручную"
fi

echo ""

echo "=========================================="
echo "💡 Рекомендации:"
echo ""
echo "1. Если cookie имеет флаг Secure, но доступ по HTTP:"
echo "   - Обнови код: git pull"
echo "   - Пересобери образ: docker build -t rosebotanique:prod ."
echo "   - Перезапусти контейнер"
echo ""
echo "2. Если файлы данных не найдены:"
echo "   - Проверь volume: docker inspect rosebotanique | grep -A 10 Mounts"
echo "   - Убедись, что файлы есть: ls -la /opt/rosebotanique/front/src/data/"
echo ""
echo "3. Для входа в бэк-офис используй:"
echo "   - URL: http://176.57.213.174:3000/backoffice/login"
echo "   - Логин: rosebotanique"
echo "   - Пароль: RoseBot2024!"
echo ""

