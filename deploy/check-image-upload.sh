#!/bin/bash
# Диагностика проблемы загрузки изображений

echo "🔍 Диагностика проблемы загрузки изображений"
echo "============================================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "1️⃣  Проверка переменных окружения..."
echo ""

# Проверяем BLOB_READ_WRITE_TOKEN в контейнере
BLOB_TOKEN=$(docker exec rosebotanique env | grep BLOB_READ_WRITE_TOKEN | cut -d'=' -f2)

if [ -z "$BLOB_TOKEN" ]; then
    echo -e "${RED}❌ BLOB_READ_WRITE_TOKEN не задан${NC}"
    echo ""
    echo "Это обязательная переменная для загрузки изображений в Vercel Blob"
    echo ""
    echo "Как получить токен:"
    echo "1. Зайди на https://vercel.com/dashboard"
    echo "2. Выбери проект или создай новый"
    echo "3. Перейди в Settings → Storage → Blob"
    echo "4. Создай новый токен или скопируй существующий"
    echo ""
    echo "Или используй альтернативное решение (локальное хранение)"
else
    echo -e "${GREEN}✅ BLOB_READ_WRITE_TOKEN задан${NC}"
    echo "Длина токена: ${#BLOB_TOKEN} символов"
    if [ ${#BLOB_TOKEN} -lt 20 ]; then
        echo -e "${YELLOW}⚠️  Токен слишком короткий, возможно неверный${NC}"
    fi
fi

echo ""

echo "2️⃣  Проверка логов контейнера (последние ошибки)..."
echo ""

docker logs rosebotanique 2>&1 | grep -i -E "upload|blob|image|error|500" | tail -20 || echo "Ошибок не найдено"

echo ""

echo "3️⃣  Тест API загрузки (с моковым файлом)..."
echo ""

# Создаём тестовый файл
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test.png 2>/dev/null || echo "Не удалось создать тестовый файл"

if [ -f "/tmp/test.png" ]; then
    RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload/image \
      -F "file=@/tmp/test.png" \
      -v 2>&1)
    
    if echo "$RESPONSE" | grep -q "200 OK"; then
        echo -e "${GREEN}✅ Загрузка работает${NC}"
        echo "$RESPONSE" | grep -E "url|filename" | head -2
    elif echo "$RESPONSE" | grep -q "500"; then
        echo -e "${RED}❌ Ошибка 500${NC}"
        echo "Детали ошибки:"
        echo "$RESPONSE" | grep -A 5 -B 5 "500" | head -10
    else
        echo -e "${YELLOW}⚠️  Неожиданный ответ${NC}"
        echo "$RESPONSE" | head -10
    fi
    rm -f /tmp/test.png
else
    echo "Не удалось создать тестовый файл для проверки"
fi

echo ""

echo "4️⃣  Проверка .env.production..."
echo ""

ENV_FILE="/opt/rosebotanique/front/.env.production"
if [ -f "$ENV_FILE" ]; then
    BLOB_IN_FILE=$(grep "^BLOB_READ_WRITE_TOKEN=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"')
    if [ -z "$BLOB_IN_FILE" ]; then
        echo -e "${RED}❌ BLOB_READ_WRITE_TOKEN не задан в .env.production${NC}"
        echo ""
        echo "Добавь в $ENV_FILE:"
        echo "BLOB_READ_WRITE_TOKEN=твой_токен_здесь"
    else
        echo -e "${GREEN}✅ BLOB_READ_WRITE_TOKEN задан в .env.production${NC}"
        echo "Длина: ${#BLOB_IN_FILE} символов"
    fi
else
    echo -e "${RED}❌ Файл .env.production не найден${NC}"
fi

echo ""

echo "============================================="
echo "💡 Решения:"
echo ""
echo "Вариант 1: Получить токен Vercel Blob"
echo "  1. Зайди на https://vercel.com/dashboard"
echo "  2. Создай Storage → Blob"
echo "  3. Скопируй токен"
echo "  4. Добавь в .env.production: BLOB_READ_WRITE_TOKEN=..."
echo "  5. Перезапусти контейнер"
echo ""
echo "Вариант 2: Использовать локальное хранение (альтернатива)"
echo "  Можно настроить сохранение изображений на сервере"
echo "  вместо Vercel Blob"
echo ""

