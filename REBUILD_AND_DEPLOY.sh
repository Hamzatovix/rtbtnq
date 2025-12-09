#!/bin/bash
# Скрипт для пересборки и обновления на сервере

echo "🔨 Пересборка и обновление на сервере"
echo "======================================"
echo ""

cd /opt/rosebotanique

echo "1️⃣  Обновление кода из Git..."
git pull

echo ""
echo "2️⃣  Остановка и удаление старого контейнера..."
docker stop rosebotanique
docker rm rosebotanique

echo ""
echo "3️⃣  Пересборка Docker образа..."
docker build -t rosebotanique:prod .

echo ""
echo "4️⃣  Запуск нового контейнера..."
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
echo "⏳ Ожидание запуска контейнера (5 секунд)..."
sleep 5

echo ""
echo "✅ Проверка статуса контейнера:"
docker ps | grep rosebotanique

echo ""
echo "📋 Проверка переменных Telegram:"
docker exec rosebotanique env | grep TELEGRAM

echo ""
echo "✅ Готово! Теперь создайте тестовый заказ и проверьте логи:"
echo "   docker logs rosebotanique --tail 100 | grep Telegram"

