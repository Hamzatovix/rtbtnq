#!/bin/bash
# Настройка Nginx для rosebotanique.store на порту 8080

echo "Создаю конфигурацию Nginx для rosebotanique.store на порту 8080..."

# Создаём конфигурацию
cat > /etc/nginx/sites-available/rosebotanique.store << 'EOF'
server {
    listen 8080;
    listen [::]:8080;
    server_name rosebotanique.store www.rosebotanique.store;

    access_log /var/log/nginx/rosebotanique-access.log;
    error_log /var/log/nginx/rosebotanique-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
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

    # Кеширование статических файлов Next.js
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    # Кеширование изображений
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 24h;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF

echo "Активирую конфигурацию..."
ln -sf /etc/nginx/sites-available/rosebotanique.store /etc/nginx/sites-enabled/

echo "Проверяю конфигурацию..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Конфигурация правильная. Запускаю Nginx..."
    systemctl start nginx
    systemctl status nginx --no-pager
    echo ""
    echo "✅ Готово! Сайт будет доступен по адресу: http://rosebotanique.store:8080"
else
    echo "❌ Ошибка в конфигурации! Исправь ошибки и попробуй снова."
    exit 1
fi

