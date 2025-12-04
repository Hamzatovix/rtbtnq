#!/bin/bash
# Диагностика проблемы с Nginx для rosebotanique.store

echo "=========================================="
echo "Диагностика проблемы с Nginx"
echo "=========================================="
echo ""

# 1. Проверка конфигурации в файле
echo "1. Проверка конфигурации в файле /root/Shtraf/nginx/nginx.conf"
if grep -q "rosebotanique.store" /root/Shtraf/nginx/nginx.conf; then
    echo "✅ Конфигурация найдена в файле"
    echo ""
    echo "Содержимое:"
    grep -A 40 "rosebotanique.store" /root/Shtraf/nginx/nginx.conf | head -50
else
    echo "❌ Конфигурация НЕ найдена в файле!"
fi
echo ""

# 2. Проверка как монтируется конфигурация
echo "2. Проверка монтирования конфигурации в контейнер"
echo "Mounts контейнера shtrafnett_nginx:"
docker inspect shtrafnett_nginx | grep -A 20 "Mounts" | grep -E "(Source|Destination|nginx.conf)"
echo ""

# 3. Проверка конфигурации внутри контейнера
echo "3. Проверка конфигурации внутри контейнера"
echo "Проверяю /etc/nginx/conf.d/default.conf:"
docker exec shtrafnett_nginx cat /etc/nginx/conf.d/default.conf 2>/dev/null | grep -A 40 "rosebotanique.store" || echo "❌ Конфигурация не найдена в контейнере"
echo ""

# 4. Проверка сетей Docker
echo "4. Проверка Docker сетей"
echo "Сеть контейнера shtrafnett_nginx:"
docker inspect shtrafnett_nginx --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}'
echo ""
echo "Сеть контейнера rosebotanique:"
docker inspect rosebotanique --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}'
echo ""

# 5. IP адреса контейнеров
echo "5. IP адреса контейнеров"
echo "IP shtrafnett_nginx:"
docker inspect shtrafnett_nginx --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'
echo ""
echo "IP rosebotanique:"
ROSEBOTANIQUE_IP=$(docker inspect rosebotanique --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
echo "$ROSEBOTANIQUE_IP"
echo ""

# 6. Проверка доступности
echo "6. Проверка доступности rosebotanique из контейнера Nginx"
if [ -n "$ROSEBOTANIQUE_IP" ]; then
    echo "Проверяю доступность http://$ROSEBOTANIQUE_IP:3000..."
    docker exec shtrafnett_nginx wget -q -O- --timeout=3 http://$ROSEBOTANIQUE_IP:3000 2>&1 | head -5
    if [ $? -eq 0 ]; then
        echo "✅ Контейнер доступен по IP: $ROSEBOTANIQUE_IP:3000"
    else
        echo "❌ Контейнер недоступен по IP"
        echo "Проверяю через host.docker.internal..."
        docker exec shtrafnett_nginx wget -q -O- --timeout=3 http://host.docker.internal:3000 2>&1 | head -5
    fi
else
    echo "❌ Не удалось получить IP контейнера"
fi
echo ""

# 7. Проверка docker-compose.yml
echo "7. Проверка docker-compose.yml первого проекта"
if [ -f /root/Shtraf/docker-compose.yml ]; then
    echo "Найден docker-compose.yml"
    echo "Сети:"
    grep -A 10 "networks:" /root/Shtraf/docker-compose.yml | head -15
else
    echo "docker-compose.yml не найден"
fi
echo ""

# 8. Проверка текущей конфигурации proxy_pass
echo "8. Текущая конфигурация proxy_pass для rosebotanique"
grep -A 5 "rosebotanique.store" /root/Shtraf/nginx/nginx.conf | grep "proxy_pass" || echo "proxy_pass не найден"
echo ""

echo "=========================================="
echo "Диагностика завершена"
echo "=========================================="

