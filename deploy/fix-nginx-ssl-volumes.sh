#!/bin/bash
# Исправление volumes для SSL сертификатов

set -e

echo "🔧 Исправление volumes для SSL сертификатов"
echo "==========================================="
echo ""

# 1. Проверить статус контейнера
echo "1️⃣  Проверка статуса контейнера..."
if docker ps -a | grep -q shtrafnett_nginx; then
    echo "✅ Контейнер найден"
    docker ps -a | grep shtrafnett_nginx
else
    echo "❌ Контейнер не найден!"
    exit 1
fi
echo ""

# 2. Проверить, как запущен контейнер
echo "2️⃣  Проверка способа запуска..."
if docker inspect shtrafnett_nginx | grep -q "docker-compose"; then
    echo "✅ Контейнер запущен через docker-compose"
    USE_COMPOSE=true
else
    echo "⚠️  Контейнер запущен вручную (не через docker-compose)"
    USE_COMPOSE=false
fi
echo ""

# 3. Проверить текущие volumes
echo "3️⃣  Текущие volumes:"
docker inspect shtrafnett_nginx | grep -A 20 "Mounts" | head -25
echo ""

# 4. Решение
if [ "$USE_COMPOSE" = "true" ]; then
    echo "4️⃣  Решение: Перезапустить через docker-compose"
    echo ""
    echo "Выполни:"
    echo "  cd /root/Shtraf"
    echo "  docker-compose down"
    echo "  docker-compose up -d nginx"
else
    echo "4️⃣  Решение: Пересоздать контейнер с volumes"
    echo ""
    echo "Нужно остановить и пересоздать контейнер с volumes."
    echo ""
    echo "Сначала сохрани команду запуска:"
    echo "  docker inspect shtrafnett_nginx | grep -A 50 'Args'"
    echo ""
    echo "Затем останови и удали контейнер:"
    echo "  docker stop shtrafnett_nginx"
    echo "  docker rm shtrafnett_nginx"
    echo ""
    echo "И пересоздай с volumes (пример):"
    echo "  docker run -d \\"
    echo "    --name shtrafnett_nginx \\"
    echo "    --network <network_name> \\"
    echo "    -p 80:80 -p 443:443 \\"
    echo "    -v /root/Shtraf/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro \\"
    echo "    -v /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt:/etc/ssl/certs/rosebotanique.store.crt:ro \\"
    echo "    -v /root/Shtraf/nginx/ssl/rosebotanique/certificate.key:/etc/ssl/private/rosebotanique.store.key:ro \\"
    echo "    -v /root/Shtraf/nginx/certificate.crt:/etc/ssl/certs/shtraftest.ru.crt:ro \\"
    echo "    -v /root/Shtraf/nginx/certificate.key:/etc/ssl/private/shtraftest.ru.key:ro \\"
    echo "    nginx:1.25-alpine"
fi
echo ""

