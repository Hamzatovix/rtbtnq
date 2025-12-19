#!/bin/bash
# Скрипт для проверки переменных окружения на сервере

echo "🔍 Проверка переменных окружения на сервере"
echo "============================================"
echo ""

cd /opt/rosebotanique

echo "1️⃣  Проверяем наличие файлов .env:"
echo ""

if [ -f "front/.env.production.example" ]; then
    echo "✅ front/.env.production.example существует"
    echo "   Содержимое:"
    cat front/.env.production.example | grep -E "^(TELEGRAM|NEXT_PUBLIC)" || echo "   (переменные не найдены)"
else
    echo "❌ front/.env.production.example НЕ найден"
    echo "   Нужно обновить код: git pull"
fi

echo ""

if [ -f "front/.env.production" ]; then
    echo "✅ front/.env.production существует"
    echo "   Содержимое (только переменные Telegram):"
    cat front/.env.production | grep -E "^(TELEGRAM|NEXT_PUBLIC)" || echo "   (переменные не найдены)"
else
    echo "❌ front/.env.production НЕ найден"
    echo "   Нужно создать из example:"
    echo "   cp front/.env.production.example front/.env.production"
fi

echo ""
echo "2️⃣  Проверяем переменные в Docker контейнере:"
echo ""

if docker ps | grep -q rosebotanique; then
    echo "✅ Контейнер запущен"
    echo ""
    echo "   Переменные окружения в контейнере:"
    docker exec rosebotanique env | grep -E "^(TELEGRAM|NEXT_PUBLIC)" || echo "   (переменные не найдены)"
else
    echo "❌ Контейнер не запущен"
fi

echo ""
echo "3️⃣  Проверяем как запущен контейнер:"
echo ""

if docker ps | grep -q rosebotanique; then
    echo "   Команда запуска контейнера:"
    docker inspect rosebotanique --format='{{.Config.Cmd}}' 2>/dev/null || echo "   (не удалось получить)"
    echo ""
    echo "   Переменные окружения из конфига:"
    docker inspect rosebotanique --format='{{range .Config.Env}}{{println .}}{{end}}' | grep -E "^(TELEGRAM|NEXT_PUBLIC)" || echo "   (переменные не найдены)"
fi

echo ""
echo "✅ Проверка завершена"

