#!/bin/bash
# Добавление конфигурации для rosebotanique.store в Nginx первого проекта

set -e

NGINX_CONF="/root/Shtraf/nginx/nginx.conf"
BACKUP_FILE="/root/Shtraf/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)"

echo "Создаю резервную копию конфигурации..."
cp "$NGINX_CONF" "$BACKUP_FILE"
echo "Резервная копия: $BACKUP_FILE"

echo ""
echo "Добавляю конфигурацию для rosebotanique.store..."

# Проверяем, есть ли уже конфигурация для rosebotanique
if grep -q "rosebotanique.store" "$NGINX_CONF"; then
    echo "⚠️  Конфигурация для rosebotanique.store уже существует!"
    exit 1
fi

# Создаём временный файл с новой конфигурацией
cat > /tmp/rosebotanique-nginx.conf << 'ROSEBOTANIQUE_CONFIG'

# --- Rosebotanique.store HTTP (редирект на HTTPS) ---
server {
    listen 80;
    listen [::]:80;
    server_name rosebotanique.store www.rosebotanique.store;
    return 301 https://$host$request_uri;
}

# --- Rosebotanique.store HTTPS ---
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rosebotanique.store www.rosebotanique.store;

    client_max_body_size 10M;

    # --- SSL (временно без сертификата, нужно настроить Let's Encrypt) ---
    # ssl_certificate     /etc/ssl/certs/rosebotanique.store.crt;
    # ssl_certificate_key /etc/ssl/private/rosebotanique.store.key;
    # ssl_protocols TLSv1.2 TLSv1.3;
    # ssl_ciphers 'EECDH+AESGCM:EECDH+CHACHA20:EDH+AESGCM';
    # ssl_prefer_server_ciphers off;
    # ssl_session_cache shared:SSL:10m;
    # ssl_session_timeout 1d;
    # ssl_session_tickets off;

    # --- Security Headers ---
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";

    # --- Проксирование на rosebotanique контейнер ---
    location / {
        proxy_pass http://host.docker.internal:3000;
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
}
ROSEBOTANIQUE_CONFIG

# Добавляем конфигурацию в конец файла (перед закрывающей скобкой)
# Используем Python для вставки перед последней закрывающей скобкой
python3 << PYTHON_SCRIPT
import re

with open("$NGINX_CONF", "r", encoding="utf-8") as f:
    content = f.read()

# Читаем новую конфигурацию
with open("/tmp/rosebotanique-nginx.conf", "r", encoding="utf-8") as f:
    new_config = f.read()

# Вставляем перед последней закрывающей скобкой
# Ищем последний server блок и добавляем после него
if "rosebotanique.store" not in content:
    # Находим последний закрывающий блок server
    pattern = r'(\}\s*)$'
    replacement = new_config + r'\n\1'
    new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    with open("$NGINX_CONF", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✅ Конфигурация добавлена")
else:
    print("⚠️  Конфигурация уже существует")
PYTHON_SCRIPT

echo ""
echo "Проверяю конфигурацию..."
docker exec shtrafnett_nginx nginx -t

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Конфигурация правильная!"
    echo ""
    echo "Перезагружаю Nginx..."
    docker exec shtrafnett_nginx nginx -s reload
    echo ""
    echo "✅ Готово! Конфигурация применена."
    echo ""
    echo "⚠️  ВАЖНО: Нужно настроить SSL сертификат для rosebotanique.store"
    echo "   Используй Let's Encrypt или добавь свой сертификат"
else
    echo ""
    echo "❌ Ошибка в конфигурации! Откатываю изменения..."
    cp "$BACKUP_FILE" "$NGINX_CONF"
    echo "Конфигурация восстановлена из резервной копии"
    exit 1
fi

