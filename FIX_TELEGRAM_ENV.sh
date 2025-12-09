#!/bin/bash
# Скрипт для настройки переменных окружения Telegram бота на сервере

echo "🔧 Настройка Telegram бота"
echo "=========================="
echo ""

cd /opt/rosebotanique

# Проверяем существование файла .env.production
if [ ! -f "front/.env.production" ]; then
    echo "📝 Создаем файл front/.env.production..."
    touch front/.env.production
    echo "# Telegram Bot Configuration" >> front/.env.production
    echo "TELEGRAM_BOT_TOKEN=" >> front/.env.production
    echo "TELEGRAM_CHAT_ID=" >> front/.env.production
    echo "" >> front/.env.production
    echo "# Base URL" >> front/.env.production
    echo "NEXT_PUBLIC_BASE_URL=https://rosebotanique.store" >> front/.env.production
    echo ""
    echo "✅ Файл создан. Теперь отредактируйте его:"
    echo "   nano front/.env.production"
    echo ""
    echo "Добавьте ваши значения:"
    echo "   TELEGRAM_BOT_TOKEN=ваш_токен"
    echo "   TELEGRAM_CHAT_ID=ваш_chat_id"
    echo ""
    read -p "Нажмите Enter после редактирования файла..."
else
    echo "✅ Файл front/.env.production существует"
fi

# Проверяем, что переменные заполнены
if grep -q "TELEGRAM_BOT_TOKEN=$" front/.env.production || grep -q "^TELEGRAM_BOT_TOKEN=$" front/.env.production; then
    echo ""
    echo "⚠️  ВНИМАНИЕ: TELEGRAM_BOT_TOKEN не заполнен!"
    echo "Отредактируйте файл: nano front/.env.production"
    exit 1
fi

if grep -q "TELEGRAM_CHAT_ID=$" front/.env.production || grep -q "^TELEGRAM_CHAT_ID=$" front/.env.production; then
    echo ""
    echo "⚠️  ВНИМАНИЕ: TELEGRAM_CHAT_ID не заполнен!"
    echo "Отредактируйте файл: nano front/.env.production"
    exit 1
fi

echo ""
echo "🔄 Пересоздаем контейнер с переменными окружения..."

# Останавливаем и удаляем старый контейнер
docker stop rosebotanique 2>/dev/null || true
docker rm rosebotanique 2>/dev/null || true

# Собираем образ
echo "📦 Собираем Docker образ..."
docker build -t rosebotanique:prod .

# Запускаем контейнер с переменными окружения
echo "🚀 Запускаем контейнер..."
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
echo "✅ Проверяем переменные окружения..."
docker exec rosebotanique env | grep TELEGRAM

echo ""
echo "📋 Проверяем статус контейнера..."
docker ps | grep rosebotanique

echo ""
echo "✅ Готово! Теперь создайте тестовый заказ и проверьте Telegram."

