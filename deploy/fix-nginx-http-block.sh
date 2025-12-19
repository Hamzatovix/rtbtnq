#!/bin/bash
# Исправление HTTP блока для rosebotanique.store

set -e

NGINX_CONF="/root/Shtraf/nginx/nginx.conf"
BACKUP_FILE="/root/Shtraf/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)"

echo "🔧 Исправление HTTP блока для rosebotanique.store"
echo "=================================================="
echo ""

# Создать резервную копию
echo "📦 Создаю резервную копию..."
cp "$NGINX_CONF" "$BACKUP_FILE"
echo "✅ Резервная копия: $BACKUP_FILE"
echo ""

# Исправить конфигурацию
echo "📝 Исправляю HTTP блок..."

python3 << 'PYTHON_SCRIPT'
import re

with open("/root/Shtraf/nginx/nginx.conf", "r", encoding="utf-8") as f:
    content = f.read()

# Найти и заменить HTTP блок с редиректом на блок с proxy_pass
old_block = r'# --- Rosebotanique\.store HTTP \(редирект на HTTPS\) ---\s*server\s*\{\s*listen\s+80;\s*listen\s+\[::\]:80;\s*server_name\s+rosebotanique\.store\s+www\.rosebotanique\.store;\s*return\s+301\s+https://\$host\$request_uri;\s*\}'

new_block = '''# --- Rosebotanique.store HTTP ---
server {
    listen 80;
    listen [::]:80;
    server_name rosebotanique.store www.rosebotanique.store;
    
    access_log /var/log/nginx/rosebotanique-access.log;
    error_log /var/log/nginx/rosebotanique-error.log;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://rosebotanique:3000;
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
    }
}'''

if re.search(old_block, content, re.DOTALL | re.MULTILINE):
    new_content = re.sub(old_block, new_block, content, flags=re.DOTALL | re.MULTILINE)
    with open("/root/Shtraf/nginx/nginx.conf", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✅ HTTP блок исправлен")
else:
    # Попробуем более простой паттерн
    simple_pattern = r'(server\s*\{\s*listen\s+80;\s*listen\s+\[::\]:80;\s*server_name\s+rosebotanique\.store\s+www\.rosebotanique\.store;\s*return\s+301\s+https://\$host\$request_uri;\s*\})'
    
    if re.search(simple_pattern, content, re.DOTALL | re.MULTILINE):
        new_content = re.sub(simple_pattern, new_block, content, flags=re.DOTALL | re.MULTILINE)
        with open("/root/Shtraf/nginx/nginx.conf", "w", encoding="utf-8") as f:
            f.write(new_content)
        print("✅ HTTP блок исправлен (простой паттерн)")
    else:
        print("⚠️  HTTP блок с редиректом не найден")
        print("Проверяю текущую конфигурацию...")
        if "proxy_pass http://rosebotanique:3000" in content:
            print("✅ Конфигурация уже правильная (proxy_pass найден)")
        else:
            print("❌ Нужно исправить вручную")
PYTHON_SCRIPT

echo ""

# Проверить конфигурацию
echo "🔍 Проверка конфигурации Nginx..."
if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Конфигурация правильная!"
    echo ""
    echo "🔄 Перезагружаю Nginx..."
    docker exec shtrafnett_nginx nginx -s reload
    echo "✅ Nginx перезагружен!"
    echo ""
    echo "🎉 Готово! Теперь:"
    echo "   - стоп-штраф.рф: работает на HTTPS (как и раньше)"
    echo "   - rosebotanique.store: работает на HTTP (проксируется на контейнер)"
    echo ""
    echo "📋 Проверка:"
    echo "   curl -I -H 'Host: rosebotanique.store' http://176.57.213.174"
    echo "   curl -I -H 'Host: стоп-штраф.рф' https://176.57.213.174 -k"
else
    echo "❌ Ошибка в конфигурации!"
    echo "Откатываю изменения..."
    cp "$BACKUP_FILE" "$NGINX_CONF"
    echo "Конфигурация восстановлена из резервной копии"
    exit 1
fi

