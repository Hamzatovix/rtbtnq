#!/bin/bash
# Исправление конфигурации Nginx для rosebotanique.store

set -e

NGINX_CONF="/root/Shtraf/nginx/nginx.conf"
ROSEBOTANIQUE_IP="172.17.0.2"

echo "Исправляю конфигурацию Nginx..."

# 1. Проверяю текущую конфигурацию
echo "Текущий proxy_pass:"
grep "proxy_pass" "$NGINX_CONF" | grep "rosebotanique" || echo "Не найден"

# 2. Создаю резервную копию
BACKUP_FILE="/root/Shtraf/nginx/nginx.conf.backup-$(date +%Y%m%d-%H%M%S)"
cp "$NGINX_CONF" "$BACKUP_FILE"
echo "Резервная копия: $BACKUP_FILE"

# 3. Исправляю proxy_pass на правильный IP
echo "Исправляю proxy_pass на $ROSEBOTANIQUE_IP:3000..."
sed -i "s|proxy_pass http://172.17.0.1:3000|proxy_pass http://$ROSEBOTANIQUE_IP:3000|g" "$NGINX_CONF"

# 4. Проверяю, что конфигурация есть в файле
if ! grep -q "rosebotanique.store" "$NGINX_CONF"; then
    echo "❌ Конфигурация для rosebotanique.store не найдена в файле!"
    echo "Добавляю конфигурацию..."
    
    # Добавляю конфигурацию перед последней закрывающей скобкой
    python3 << PYTHON_SCRIPT
import re

with open("$NGINX_CONF", "r", encoding="utf-8") as f:
    content = f.read()

# Конфигурация для rosebotanique.store
new_config = """
# --- Rosebotanique.store HTTP (редирект на HTTPS) ---
server {
    listen 80;
    listen [::]:80;
    server_name rosebotanique.store www.rosebotanique.store;
    return 301 https://\$host\$request_uri;
}

# --- Rosebotanique.store HTTPS ---
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name rosebotanique.store www.rosebotanique.store;

    client_max_body_size 10M;

    # --- SSL (временно без сертификата) ---
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
        proxy_pass http://$ROSEBOTANIQUE_IP:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Forwarded-Port \$server_port;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }
}
"""

# Вставляем перед последней закрывающей скобкой
if "rosebotanique.store" not in content:
    # Находим последний server блок и добавляем после него
    pattern = r'(\}\s*)$'
    replacement = new_config + r'\n\1'
    new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    
    with open("$NGINX_CONF", "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✅ Конфигурация добавлена")
else:
    print("✅ Конфигурация уже существует")
PYTHON_SCRIPT
fi

# 5. Проверяю конфигурацию
echo ""
echo "Проверяю конфигурацию..."
docker exec shtrafnett_nginx nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Конфигурация правильная"
    
    # 6. Перезапускаю контейнер для перемонтирования файла
    echo ""
    echo "Перезапускаю контейнер для применения изменений..."
    cd /root/Shtraf
    docker compose restart nginx
    
    # 7. Проверяю, что конфигурация видна в контейнере
    echo ""
    echo "Проверяю конфигурацию в контейнере..."
    sleep 2
    if docker exec shtrafnett_nginx cat /etc/nginx/conf.d/default.conf | grep -q "rosebotanique.store"; then
        echo "✅ Конфигурация видна в контейнере"
    else
        echo "❌ Конфигурация всё ещё не видна в контейнере"
        echo "Проверь монтирование файла"
    fi
    
    # 8. Перезагружаю Nginx
    echo ""
    echo "Перезагружаю Nginx..."
    docker exec shtrafnett_nginx nginx -s reload
    
    echo ""
    echo "✅ Готово! Проверь работу:"
    echo "   curl -I -H 'Host: rosebotanique.store' http://176.57.213.174"
    echo "   curl -I -H 'Host: rosebotanique.store' https://176.57.213.174 -k"
else
    echo "❌ Ошибка в конфигурации! Откатываю изменения..."
    cp "$BACKUP_FILE" "$NGINX_CONF"
    exit 1
fi

