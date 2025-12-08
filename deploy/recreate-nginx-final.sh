#!/bin/bash
# Финальное пересоздание Nginx контейнера с SSL

set -e

echo "🔧 Пересоздание Nginx контейнера с SSL"
echo "======================================"
echo ""

# Используем сеть shtraf_default напрямую
NETWORK="shtraf_default"

echo "📡 Используем сеть: $NETWORK"
echo ""

# Удалить старый контейнер (если есть)
echo "1️⃣  Удаление старого контейнера..."
docker stop shtrafnett_nginx 2>/dev/null || true
docker rm shtrafnett_nginx 2>/dev/null || true
echo "✅ Старый контейнер удалён"
echo ""

# Создать контейнер с правильной сетью
echo "2️⃣  Создание контейнера с SSL volumes..."
docker run -d \
  --name shtrafnett_nginx \
  --network "$NETWORK" \
  -p 80:80 -p 443:443 \
  -v /root/Shtraf/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /root/Shtraf/nginx/certificate.crt:/etc/ssl/certs/shtraftest.ru.crt:ro \
  -v /root/Shtraf/nginx/certificate.key:/etc/ssl/private/shtraftest.ru.key:ro \
  -v /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt:/etc/ssl/certs/rosebotanique.store.crt:ro \
  -v /root/Shtraf/nginx/ssl/rosebotanique/certificate.key:/etc/ssl/private/rosebotanique.store.key:ro \
  -v shtraf_frontend_dist:/var/www/frontend:rw \
  -v shtraf_static_volume:/app/productionfiles:rw \
  -v shtraf_media_volume:/app/media:rw \
  nginx:1.25-alpine

echo "✅ Контейнер создан"
echo ""

# Проверить запуск
echo "3️⃣  Проверка запуска..."
sleep 3

if docker ps | grep -q shtrafnett_nginx; then
    echo "✅ Контейнер запущен"
else
    echo "❌ Контейнер не запустился!"
    echo "Логи:"
    docker logs shtrafnett_nginx --tail 30
    exit 1
fi
echo ""

# Проверить конфигурацию
echo "4️⃣  Проверка конфигурации Nginx..."
if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Конфигурация правильная"
else
    echo "❌ Ошибка в конфигурации!"
    docker exec shtrafnett_nginx nginx -t
    exit 1
fi
echo ""

# Проверка работы
echo "5️⃣  Проверка работы..."
echo ""
echo "Проверка редиректа HTTP → HTTPS:"
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: rosebotanique.store" http://176.57.213.174 2>/dev/null || echo "000")
if [ "$HTTP_REDIRECT" = "301" ]; then
    echo "   ✅ HTTP редиректит на HTTPS (код: $HTTP_REDIRECT)"
else
    echo "   ⚠️  HTTP возвращает код: $HTTP_REDIRECT (ожидался 301)"
fi

echo ""
echo "Проверка HTTPS:"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k -H "Host: rosebotanique.store" https://176.57.213.174 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "   ✅ HTTPS работает (код: $HTTPS_STATUS)"
else
    echo "   ⚠️  HTTPS возвращает код: $HTTPS_STATUS (ожидался 200)"
fi

echo ""
echo "🎉 Готово!"
echo ""
echo "📋 Проверь в браузере:"
echo "   - http://rosebotanique.store → должен редиректить на https://"
echo "   - https://rosebotanique.store → должен открыться с зелёным замочком 🔒"


