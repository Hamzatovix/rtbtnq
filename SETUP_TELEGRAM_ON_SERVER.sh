#!/bin/bash
# Скрипт для настройки Telegram бота на сервере
# Использует значения из .env.production.example

echo "🔧 Настройка Telegram бота на сервере"
echo "======================================"
echo ""

cd /opt/rosebotanique

# Проверяем существование .env.production.example
if [ ! -f "front/.env.production.example" ]; then
    echo "❌ Файл front/.env.production.example не найден!"
    echo "Сначала обновите код: git pull"
    exit 1
fi

# Создаем .env.production из example, если его нет
if [ ! -f "front/.env.production" ]; then
    echo "📝 Создаем front/.env.production из example..."
    cp front/.env.production.example front/.env.production
    echo "✅ Файл создан"
else
    echo "✅ Файл front/.env.production уже существует"
    echo "📝 Проверяем наличие переменных Telegram..."
    
    # Проверяем, есть ли переменные Telegram
    if ! grep -q "^TELEGRAM_BOT_TOKEN=" front/.env.production; then
        echo "⚠️  TELEGRAM_BOT_TOKEN не найден, добавляем из example..."
        grep "^TELEGRAM_BOT_TOKEN=" front/.env.production.example >> front/.env.production
    fi
    
    if ! grep -q "^TELEGRAM_CHAT_ID=" front/.env.production; then
        echo "⚠️  TELEGRAM_CHAT_ID не найден, добавляем из example..."
        grep "^TELEGRAM_CHAT_ID=" front/.env.production.example >> front/.env.production
    fi
fi

echo ""
echo "📋 Проверяем переменные Telegram в .env.production:"
grep "^TELEGRAM" front/.env.production || echo "⚠️  Переменные Telegram не найдены!"

echo ""
echo "🔄 Пересоздаем контейнер с переменными окружения..."

# Останавливаем и удаляем старый контейнер
echo "⏹️  Останавливаем контейнер..."
docker stop rosebotanique 2>/dev/null || true
docker rm rosebotanique 2>/dev/null || true

# Собираем образ
echo "📦 Собираем Docker образ..."
docker build -t rosebotanique:prod .

# Запускаем контейнер с переменными окружения
echo "🚀 Запускаем контейнер с --env-file..."
docker run -d \
  --name rosebotanique \
  --network shtraf_default \
  -p 3000:3000 \
  --restart unless-stopped \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  --env-file front/.env.production \
  rosebotanique:prod

echo ""
echo "⏳ Ждем запуска контейнера..."
sleep 5

echo ""
echo "✅ Проверяем переменные окружения в контейнере:"
docker exec rosebotanique env | grep TELEGRAM

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Переменные окружения установлены!"
    echo ""
    echo "📋 Проверяем статус контейнера:"
    docker ps | grep rosebotanique
    echo ""
    echo "✅ Готово! Теперь создайте тестовый заказ и проверьте Telegram."
else
    echo ""
    echo "❌ Переменные окружения не найдены в контейнере!"
    echo "Проверьте файл front/.env.production на сервере"
fi

