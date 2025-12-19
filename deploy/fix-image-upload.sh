#!/bin/bash
# Скрипт для исправления загрузки изображений

echo "🔧 Исправление загрузки изображений"
echo "===================================="
echo ""

cd /opt/rosebotanique

echo "1️⃣  Обновляем код из репозитория..."
git pull

echo ""
echo "2️⃣  Останавливаем контейнер..."
docker stop rosebotanique 2>/dev/null || true
docker rm rosebotanique 2>/dev/null || true

echo ""
echo "3️⃣  Собираем новый образ..."
docker build -t rosebotanique:prod .

echo ""
echo "4️⃣  Создаём директорию для загрузок на хосте..."
mkdir -p /opt/rosebotanique/front/public/uploads/products
mkdir -p /opt/rosebotanique/front/public/uploads/gallery

echo ""
echo "5️⃣  Запускаем контейнер с volume для загрузок..."
docker run -d \
  --name rosebotanique \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  --env-file front/.env.production \
  rosebotanique:prod

echo ""
echo "6️⃣  Подключаем к сети shtraf_default..."
SHITRAF_NETWORK=$(docker inspect shtrafnett_nginx --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}' 2>/dev/null || echo "shtraf_default")
docker network connect $SHITRAF_NETWORK rosebotanique 2>/dev/null || echo "Уже подключён к сети"

echo ""
echo "✅ Готово!"
echo ""
echo "Теперь загрузка изображений будет работать:"
echo "  - Если задан BLOB_READ_WRITE_TOKEN → использует Vercel Blob"
echo "  - Если токена нет → сохраняет локально в /public/uploads/"
echo ""
echo "Проверь логи:"
echo "  docker logs rosebotanique --tail 50"
echo ""

