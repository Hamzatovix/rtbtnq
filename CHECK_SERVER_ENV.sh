#!/bin/bash
# Скрипт для проверки переменных окружения на сервере

echo "🔍 Проверка переменных окружения на сервере"
echo "============================================"
echo ""

cd /opt/rosebotanique

echo "1️⃣  Проверяем файл .env.production:"
echo "-----------------------------------"
if [ -f "front/.env.production" ]; then
    echo "✅ Файл существует"
    echo ""
    echo "📄 Полное содержимое файла:"
    echo "---"
    cat front/.env.production
    echo "---"
    echo ""
    echo "🔑 Переменные Telegram:"
    cat front/.env.production | grep -E "^(TELEGRAM|NEXT_PUBLIC)" || echo "   (переменные не найдены)"
else
    echo "❌ Файл НЕ найден"
fi

echo ""
echo "2️⃣  Проверяем файл .env.production.example:"
echo "---------------------------------------------"
if [ -f "front/.env.production.example" ]; then
    echo "✅ Файл существует"
    echo ""
    echo "📄 Содержимое файла:"
    echo "---"
    cat front/.env.production.example
    echo "---"
else
    echo "❌ Файл НЕ найден (нужно сделать git pull)"
fi

echo ""
echo "3️⃣  Проверяем переменные в Docker контейнере:"
echo "----------------------------------------------"
if docker ps | grep -q rosebotanique; then
    echo "✅ Контейнер запущен"
    echo ""
    echo "🔑 Переменные Telegram в контейнере:"
    docker exec rosebotanique env | grep -E "^(TELEGRAM|NEXT_PUBLIC)" || echo "   ❌ Переменные НЕ найдены в контейнере!"
    echo ""
    echo "📋 Все переменные окружения в контейнере (первые 20):"
    docker exec rosebotanique env | head -20
else
    echo "❌ Контейнер не запущен"
fi

echo ""
echo "4️⃣  Проверяем как запущен контейнер:"
echo "-------------------------------------"
if docker ps | grep -q rosebotanique; then
    echo "   Команда запуска (проверяем наличие --env-file):"
    docker inspect rosebotanique --format='{{.Config.Cmd}}' 2>/dev/null || echo "   (не удалось получить)"
    echo ""
    echo "   Проверяем аргументы запуска:"
    docker inspect rosebotanique --format='{{range .Args}}{{println .}}{{end}}' | grep -E "(env-file|--env-file)" || echo "   ⚠️  Флаг --env-file НЕ найден!"
fi

echo ""
echo "✅ Проверка завершена"
echo ""
echo "💡 Если переменные Telegram есть в .env.production, но НЕТ в контейнере,"
echo "   нужно пересоздать контейнер с флагом --env-file front/.env.production"

