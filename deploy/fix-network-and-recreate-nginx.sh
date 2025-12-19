#!/bin/bash
# Исправление сети и пересоздание Nginx контейнера с SSL

set -e

echo "🔧 Исправление сети и пересоздание Nginx с SSL"
echo "=============================================="
echo ""

# 1. Найти сеть контейнера rosebotanique
echo "1️⃣  Поиск сети контейнера rosebotanique..."
if docker ps -a | grep -q rosebotanique; then
    ROSE_NETWORK=$(docker inspect rosebotanique --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}' 2>/dev/null | head -1)
    if [ -n "$ROSE_NETWORK" ]; then
        echo "✅ Найдена сеть контейнера rosebotanique: $ROSE_NETWORK"
        NETWORK="$ROSE_NETWORK"
    else
        echo "⚠️  Сеть не найдена через inspect, проверяю все сети..."
        # Получить первую сеть из списка
        NETWORK=$(docker network ls --format '{{.Name}}' | grep -E '(shtraf|bridge|default)' | head -1)
        if [ -z "$NETWORK" ]; then
            NETWORK="bridge"
        fi
        echo "✅ Используем сеть: $NETWORK"
    fi
else
    echo "⚠️  Контейнер rosebotanique не найден"
    # Проверить существующие сети
    echo "Доступные сети:"
    docker network ls
    NETWORK=$(docker network ls --format '{{.Name}}' | grep -E '(shtraf|bridge)' | head -1 || echo "bridge")
    echo "✅ Используем сеть: $NETWORK"
fi
echo ""

# 2. Удалить старый контейнер (если есть)
echo "2️⃣  Удаление старого контейнера..."
docker stop shtrafnett_nginx 2>/dev/null || true
docker rm shtrafnett_nginx 2>/dev/null || true
echo "✅ Старый контейнер удалён"
echo ""

# 3. Создать контейнер с правильной сетью
echo "3️⃣  Создание контейнера с сетью: $NETWORK..."
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

# 4. Подключить rosebotanique к сети nginx (если нужно)
if docker ps -a | grep -q rosebotanique; then
    echo "4️⃣  Подключение rosebotanique к сети nginx..."
    if docker network inspect "$NETWORK" 2>/dev/null | grep -q "rosebotanique"; then
        echo "✅ rosebotanique уже в сети $NETWORK"
    else
        docker network connect "$NETWORK" rosebotanique 2>/dev/null && echo "✅ Подключён к сети" || echo "⚠️  Не удалось подключить (возможно уже подключён)"
    fi
fi
echo ""

# 5. Проверить запуск
echo "5️⃣  Проверка запуска..."
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

# 6. Проверить конфигурацию
echo "6️⃣  Проверка конфигурации Nginx..."
if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Конфигурация правильная"
else
    echo "❌ Ошибка в конфигурации!"
    docker exec shtrafnett_nginx nginx -t
    exit 1
fi
echo ""

# 7. Проверка работы
echo "7️⃣  Проверка работы..."
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


