#!/bin/bash
# Проверка конфигурации Nginx для rosebotanique.store

echo "Проверяю конфигурацию Nginx..."

# 1. Проверь, что конфигурация добавлена в файл
echo ""
echo "=== Проверка файла конфигурации ==="
if grep -q "rosebotanique.store" /root/Shtraf/nginx/nginx.conf; then
    echo "✅ Конфигурация для rosebotanique.store найдена в файле"
    echo ""
    echo "Содержимое конфигурации:"
    grep -A 30 "rosebotanique.store" /root/Shtraf/nginx/nginx.conf
else
    echo "❌ Конфигурация для rosebotanique.store НЕ найдена в файле!"
    exit 1
fi

# 2. Проверь, что Nginx видит конфигурацию
echo ""
echo "=== Проверка конфигурации внутри контейнера ==="
docker exec shtrafnett_nginx cat /etc/nginx/conf.d/default.conf | grep -A 30 "rosebotanique.store" || echo "❌ Конфигурация не найдена в контейнере"

# 3. Проверь доступность контейнера rosebotanique
echo ""
echo "=== Проверка доступности rosebotanique контейнера ==="
docker exec shtrafnett_nginx ping -c 1 172.17.0.1 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Хост доступен"
else
    echo "❌ Хост недоступен"
fi

# 4. Проверь, может ли Nginx достучаться до порта 3000
echo ""
echo "=== Проверка порта 3000 ==="
docker exec shtrafnett_nginx wget -q -O- --timeout=2 http://172.17.0.1:3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Порт 3000 доступен"
else
    echo "❌ Порт 3000 недоступен из контейнера Nginx"
    echo "   Попробуй использовать IP контейнера rosebotanique"
fi

# 5. Найди IP контейнера rosebotanique
echo ""
echo "=== IP контейнера rosebotanique ==="
ROSEBOTANIQUE_IP=$(docker inspect rosebotanique --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
echo "IP: $ROSEBOTANIQUE_IP"

if [ -n "$ROSEBOTANIQUE_IP" ]; then
    echo "Проверяю доступность..."
    docker exec shtrafnett_nginx wget -q -O- --timeout=2 http://$ROSEBOTANIQUE_IP:3000 > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Контейнер доступен по IP: $ROSEBOTANIQUE_IP:3000"
        echo ""
        echo "💡 Используй этот IP в proxy_pass: http://$ROSEBOTANIQUE_IP:3000"
    else
        echo "❌ Контейнер недоступен по IP"
    fi
fi

