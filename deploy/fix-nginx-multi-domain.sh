#!/bin/bash
# Исправление конфигурации Nginx для работы двух доменов на порту 80

set -e

NGINX_CONF="/root/Shtraf/nginx/nginx.conf"
BACKUP_FILE="/root/Shtraf/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)"

echo "🔧 Исправление конфигурации Nginx для двух доменов"
echo "=================================================="
echo ""

# 1. Создать резервную копию
echo "📦 Создаю резервную копию..."
cp "$NGINX_CONF" "$BACKUP_FILE"
echo "✅ Резервная копия: $BACKUP_FILE"
echo ""

# 2. Проверить, что контейнеры в одной сети
echo "🌐 Проверка сетей Docker..."
NGINX_NETWORK=$(docker inspect shtrafnett_nginx --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}' 2>/dev/null | head -1)
echo "Сеть Nginx: $NGINX_NETWORK"

# Подключить rosebotanique к сети nginx (если нужно)
if docker network inspect $NGINX_NETWORK 2>/dev/null | grep -q "rosebotanique"; then
    echo "✅ Контейнер rosebotanique уже в сети"
else
    echo "🔗 Подключаю rosebotanique к сети nginx..."
    docker network connect $NGINX_NETWORK rosebotanique 2>/dev/null || echo "⚠️  Уже подключён или ошибка"
fi
echo ""

# 3. Проверить доступность контейнера
echo "🔍 Проверка доступности контейнера rosebotanique..."
if docker exec shtrafnett_nginx ping -c 1 rosebotanique > /dev/null 2>&1; then
    echo "✅ Контейнер доступен по имени 'rosebotanique'"
    PROXY_TARGET="http://rosebotanique:3000"
elif docker exec shtrafnett_nginx ping -c 1 host.docker.internal > /dev/null 2>&1; then
    echo "✅ Использую host.docker.internal"
    PROXY_TARGET="http://host.docker.internal:3000"
else
    ROSE_IP=$(docker inspect rosebotanique --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null | head -1)
    if [ -n "$ROSE_IP" ]; then
        echo "✅ Использую IP контейнера: $ROSE_IP"
        PROXY_TARGET="http://$ROSE_IP:3000"
    else
        echo "❌ Не удалось определить адрес контейнера"
        exit 1
    fi
fi
echo ""

# 4. Исправить конфигурацию
echo "📝 Исправляю конфигурацию..."

# Создать временный файл с исправленной конфигурацией
python3 << PYTHON_SCRIPT
import re

with open("$NGINX_CONF", "r", encoding="utf-8") as f:
    content = f.read()

# Найти HTTP блок для rosebotanique.store и заменить редирект на proxy_pass
# Ищем блок:
# server {
#     listen 80;
#     server_name rosebotanique.store www.rosebotanique.store;
#     return 301 https://$host$request_uri;
# }

# Заменяем на:
# server {
#     listen 80;
#     server_name rosebotanique.store www.rosebotanique.store;
#     location / {
#         proxy_pass http://rosebotanique:3000;
#         ...
#     }
# }

# Паттерн для поиска HTTP блока с редиректом
http_block_pattern = r'(server\s*\{[^}]*listen\s+80[^}]*server_name\s+rosebotanique\.store[^}]*return\s+301\s+https://[^}]*\})'

# Новая конфигурация HTTP блока
new_http_block = f'''server {{
    listen 80;
    listen [::]:80;
    server_name rosebotanique.store www.rosebotanique.store;

    access_log /var/log/nginx/rosebotanique-access.log;
    error_log /var/log/nginx/rosebotanique-error.log;

    client_max_body_size 10M;

    location / {{
        proxy_pass {PROXY_TARGET};
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }}
}}'''

# Заменяем
if re.search(http_block_pattern, content, re.DOTALL | re.MULTILINE):
    new_content = re.sub(http_block_pattern, new_http_block, content, flags=re.DOTALL | re.MULTILINE)
    with open("$NGINX_CONF", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✅ HTTP блок исправлен")
else:
    print("⚠️  HTTP блок с редиректом не найден, возможно уже исправлен")
    # Проверяем, есть ли правильный блок
    if "proxy_pass" in content and "rosebotanique.store" in content:
        print("✅ Конфигурация уже правильная")
    else:
        print("❌ Конфигурация не найдена, нужно добавить вручную")
PYTHON_SCRIPT

echo ""

# 5. Проверить конфигурацию
echo "🔍 Проверка конфигурации Nginx..."
if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Конфигурация правильная!"
    echo ""
    echo "🔄 Перезагружаю Nginx..."
    docker exec shtrafnett_nginx nginx -s reload
    echo "✅ Nginx перезагружен!"
    echo ""
    echo "🎉 Готово! Теперь оба проекта работают на порту 80:"
    echo "   - Первый проект: свой домен"
    echo "   - rosebotanique.store: проксируется на контейнер rosebotanique:3000"
    echo ""
    echo "📋 Проверка:"
    echo "   curl -I -H 'Host: rosebotanique.store' http://176.57.213.174"
else
    echo "❌ Ошибка в конфигурации!"
    echo "Откатываю изменения..."
    cp "$BACKUP_FILE" "$NGINX_CONF"
    echo "Конфигурация восстановлена из резервной копии"
    exit 1
fi

