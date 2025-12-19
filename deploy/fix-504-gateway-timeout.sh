#!/bin/bash
# Исправление 504 Gateway Timeout

echo "Диагностика проблемы 504 Gateway Timeout..."
echo ""

# 1. Проверка доступности из контейнера Nginx
echo "1. Проверка доступности 172.17.0.2:3000 из контейнера Nginx..."
docker exec shtrafnett_nginx wget -q -O- --timeout=3 http://172.17.0.2:3000 2>&1 | head -5
if [ $? -eq 0 ]; then
    echo "✅ Контейнер доступен"
else
    echo "❌ Контейнер недоступен по IP 172.17.0.2"
fi
echo ""

# 2. Проверка сетей
echo "2. Проверка Docker сетей..."
echo "Сеть shtrafnett_nginx:"
docker inspect shtrafnett_nginx --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} (IP: {{$value.IPAddress}}){{end}}'
echo ""
echo "Сеть rosebotanique:"
docker inspect rosebotanique --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} (IP: {{$value.IPAddress}}){{end}}'
echo ""

# 3. Проверка доступности через host.docker.internal
echo "3. Проверка через host.docker.internal:3000..."
docker exec shtrafnett_nginx wget -q -O- --timeout=3 http://host.docker.internal:3000 2>&1 | head -5
if [ $? -eq 0 ]; then
    echo "✅ Доступен через host.docker.internal"
    echo "💡 Используй: proxy_pass http://host.docker.internal:3000;"
else
    echo "❌ Недоступен через host.docker.internal"
fi
echo ""

# 4. Подключение к одной сети
echo "4. Вариант: подключить контейнеры к одной сети..."
SHITRAF_NETWORK=$(docker inspect shtrafnett_nginx --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}')
echo "Сеть первого проекта: $SHITRAF_NETWORK"

# Проверяю, подключен ли rosebotanique к этой сети
if docker network inspect "$SHITRAF_NETWORK" 2>/dev/null | grep -q "rosebotanique"; then
    echo "✅ rosebotanique уже в сети $SHITRAF_NETWORK"
    ROSE_IP=$(docker inspect rosebotanique --format "{{range .NetworkSettings.Networks}}{{if eq .NetworkID (docker network inspect $SHITRAF_NETWORK --format '{{.Id}}')}}{{.IPAddress}}{{end}}{{end}}")
    echo "IP в сети $SHITRAF_NETWORK: $ROSE_IP"
    if [ -n "$ROSE_IP" ]; then
        echo "💡 Используй: proxy_pass http://$ROSE_IP:3000;"
    fi
else
    echo "❌ rosebotanique НЕ в сети $SHITRAF_NETWORK"
    echo "Подключаю..."
    docker network connect "$SHITRAF_NETWORK" rosebotanique 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Подключен к сети $SHITRAF_NETWORK"
        ROSE_IP=$(docker inspect rosebotanique --format "{{range .NetworkSettings.Networks}}{{if eq .NetworkID (docker network inspect $SHITRAF_NETWORK --format '{{.Id}}')}}{{.IPAddress}}{{end}}{{end}}")
        echo "IP в сети: $ROSE_IP"
        echo "💡 Используй: proxy_pass http://rosebotanique:3000; (по имени контейнера)"
    else
        echo "❌ Не удалось подключить"
    fi
fi
echo ""

# 5. Проверка доступности порта 3000 на хосте
echo "5. Проверка порта 3000 на хосте..."
curl -I http://localhost:3000 2>&1 | head -3
if [ $? -eq 0 ]; then
    echo "✅ Порт 3000 доступен на хосте"
else
    echo "❌ Порт 3000 недоступен на хосте"
fi

