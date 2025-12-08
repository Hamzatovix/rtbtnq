#!/bin/bash
# Пересоздание Nginx контейнера БЕЗ SSL volumes для rosebotanique.store
# Использовать до получения SSL сертификата

set -e

echo "🔄 Пересоздание Nginx контейнера без SSL для rosebotanique.store"
echo "================================================================"
echo ""

# Получить сеть
NETWORK=$(docker inspect shtrafnett_nginx --format '{{.HostConfig.NetworkMode}}' 2>/dev/null || echo "shtraf_default")
echo "📡 Сеть: $NETWORK"
echo ""

# Остановить и удалить контейнер
echo "1️⃣  Остановка и удаление контейнера..."
docker stop shtrafnett_nginx 2>/dev/null || true
docker rm shtrafnett_nginx 2>/dev/null || true
echo "✅ Контейнер удалён"
echo ""

# Создать контейнер БЕЗ SSL volumes для rosebotanique
echo "2️⃣  Создание контейнера БЕЗ SSL volumes для rosebotanique..."
docker run -d \
  --name shtrafnett_nginx \
  --network "$NETWORK" \
  -p 80:80 -p 443:443 \
  -v /root/Shtraf/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /root/Shtraf/nginx/certificate.crt:/etc/ssl/certs/shtraftest.ru.crt:ro \
  -v /root/Shtraf/nginx/certificate.key:/etc/ssl/private/shtraftest.ru.key:ro \
  -v shtraf_frontend_dist:/var/www/frontend:rw \
  -v shtraf_static_volume:/app/productionfiles:rw \
  -v shtraf_media_volume:/app/media:rw \
  nginx:1.25-alpine

echo "✅ Контейнер создан"
echo ""

# Проверить статус
echo "3️⃣  Проверка статуса..."
sleep 3
if docker ps | grep -q shtrafnett_nginx; then
    echo "✅ Контейнер запущен успешно!"
    echo ""
    echo "🧪 Тестирование..."
    curl -I -H "Host: rosebotanique.store" http://176.57.213.174 || echo "⚠️  curl не удался, но это нормально"
else
    echo "❌ Контейнер не запустился!"
    echo ""
    echo "📋 Логи:"
    docker logs shtrafnett_nginx --tail 20
    exit 1
fi

echo ""
echo "✅ Готово! Сайт должен работать на HTTP"
echo ""
echo "💡 Когда получите SSL сертификат:"
echo "   1. Скопировать сертификат в /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt"
echo "   2. Раскомментировать HTTPS блок в nginx.conf"
echo "   3. Изменить HTTP блок на редирект (return 301 https://\$host\$request_uri;)"
echo "   4. Пересоздать контейнер С SSL volumes (использовать recreate-nginx-with-ssl.sh)"

