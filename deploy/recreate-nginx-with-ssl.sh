#!/bin/bash
# Пересоздание контейнера Nginx с SSL volumes

set -e

echo "🔧 Пересоздание контейнера Nginx с SSL volumes"
echo "=============================================="
echo ""

# 1. Получить информацию о текущем контейнере
echo "1️⃣  Получение информации о контейнере..."
NETWORK=$(docker inspect shtrafnett_nginx --format '{{.HostConfig.NetworkMode}}')
echo "Сеть: $NETWORK"
echo ""

# 2. Остановить и удалить контейнер
echo "2️⃣  Остановка и удаление контейнера..."
docker stop shtrafnett_nginx 2>/dev/null || echo "Контейнер уже остановлен"
docker rm shtrafnett_nginx
echo "✅ Контейнер удалён"
echo ""

# 3. Пересоздать контейнер с volumes
echo "3️⃣  Создание нового контейнера с SSL volumes..."
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

# 4. Подождать запуска
echo "4️⃣  Ожидание запуска..."
sleep 3
echo ""

# 5. Проверить статус
echo "5️⃣  Проверка статуса..."
if docker ps | grep -q shtrafnett_nginx; then
    echo "✅ Контейнер запущен"
else
    echo "❌ Контейнер не запущен!"
    echo "Логи:"
    docker logs shtrafnett_nginx --tail 20
    exit 1
fi
echo ""

# 6. Проверить файлы сертификатов
echo "6️⃣  Проверка файлов сертификатов..."
if docker exec shtrafnett_nginx ls -la /etc/ssl/certs/rosebotanique.store.crt > /dev/null 2>&1; then
    echo "✅ Сертификат найден"
    docker exec shtrafnett_nginx ls -lh /etc/ssl/certs/rosebotanique.store.crt
else
    echo "❌ Сертификат не найден!"
    exit 1
fi

if docker exec shtrafnett_nginx ls -la /etc/ssl/private/rosebotanique.store.key > /dev/null 2>&1; then
    echo "✅ Ключ найден"
    docker exec shtrafnett_nginx ls -lh /etc/ssl/private/rosebotanique.store.key
else
    echo "❌ Ключ не найден!"
    exit 1
fi
echo ""

# 7. Проверить конфигурацию
echo "7️⃣  Проверка конфигурации Nginx..."
if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Конфигурация правильная"
else
    echo "❌ Ошибка в конфигурации!"
    docker exec shtrafnett_nginx nginx -t
    exit 1
fi
echo ""

# 8. Проверка работы
echo "8️⃣  Проверка работы..."
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

