#!/bin/bash
# Временное отключение SSL для rosebotanique.store

set -e

echo "🔧 Временное отключение SSL"
echo "==========================="
echo ""

NGINX_CONF="/root/Shtraf/nginx/nginx.conf"
BACKUP_FILE="/root/Shtraf/nginx/nginx.conf.backup-ssl-disabled-$(date +%Y%m%d-%H%M%S)"

# 1. Создать резервную копию
echo "1️⃣  Создание резервной копии..."
cp "$NGINX_CONF" "$BACKUP_FILE"
echo "✅ Резервная копия: $BACKUP_FILE"
echo ""

# 2. Закомментировать SSL директивы
echo "2️⃣  Закомментирование SSL директив..."
python3 << 'PYTHON_SCRIPT'
import re

with open("/root/Shtraf/nginx/nginx.conf", "r", encoding="utf-8") as f:
    content = f.read()

# Найти и закомментировать SSL директивы для rosebotanique.store
# Ищем блок между "Rosebotanique.store HTTPS" и "Security Headers"
ssl_pattern = r'(# --- Rosebotanique\.store HTTPS ---.*?ssl_session_tickets off;)'

def comment_ssl(match):
    block = match.group(0)
    # Закомментировать все строки с ssl_ (кроме уже закомментированных)
    lines = block.split('\n')
    result = []
    for line in lines:
        if line.strip().startswith('ssl_') and not line.strip().startswith('#'):
            result.append('    # ' + line.strip())
        else:
            result.append(line)
    return '\n'.join(result)

new_content = re.sub(ssl_pattern, comment_ssl, content, flags=re.DOTALL)

with open("/root/Shtraf/nginx/nginx.conf", "w", encoding="utf-8") as f:
    f.write(new_content)

print("✅ SSL директивы закомментированы")
PYTHON_SCRIPT

echo ""

# 3. Изменить HTTP блок на проксирование (убрать редирект)
echo "3️⃣  Изменение HTTP блока на проксирование..."
python3 << 'PYTHON_SCRIPT'
import re

with open("/root/Shtraf/nginx/nginx.conf", "r", encoding="utf-8") as f:
    content = f.read()

# Найти HTTP блок с редиректом и заменить на проксирование
http_block_pattern = r'(# --- Rosebotanique\.store HTTP.*?return 301 https://\$host\$request_uri;\s*\})'

new_http_block = '''# --- Rosebotanique.store HTTP ---
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

new_content = re.sub(http_block_pattern, new_http_block, content, flags=re.DOTALL)

with open("/root/Shtraf/nginx/nginx.conf", "w", encoding="utf-8") as f:
    f.write(new_content)

print("✅ HTTP блок изменён на проксирование")
PYTHON_SCRIPT

echo ""

# 4. Закомментировать HTTPS блок (временно)
echo "4️⃣  Закомментирование HTTPS блока..."
python3 << 'PYTHON_SCRIPT'
import re

with open("/root/Shtraf/nginx/nginx.conf", "r", encoding="utf-8") as f:
    content = f.read()

# Закомментировать весь HTTPS блок для rosebotanique.store
https_block_pattern = r'(# --- Rosebotanique\.store HTTPS ---.*?^\})'

def comment_https_block(match):
    block = match.group(0)
    lines = block.split('\n')
    result = []
    for line in lines:
        if line.strip() and not line.strip().startswith('#'):
            result.append('#' + line)
        else:
            result.append(line)
    return '\n'.join(result)

new_content = re.sub(https_block_pattern, comment_https_block, content, flags=re.DOTALL | re.MULTILINE)

with open("/root/Shtraf/nginx/nginx.conf", "w", encoding="utf-8") as f:
    f.write(new_content)

print("✅ HTTPS блок закомментирован")
PYTHON_SCRIPT

echo ""

# 5. Проверить конфигурацию
echo "5️⃣  Проверка конфигурации..."
# Сначала нужно пересоздать контейнер без SSL volumes
echo "⚠️  Нужно пересоздать контейнер без SSL volumes"
echo ""

echo "✅ Конфигурация обновлена!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Пересоздать контейнер без SSL volumes"
echo "   2. Проверить работу HTTP"
echo ""
echo "💡 Когда сертификат будет готов:"
echo "   1. Скопировать сертификат в /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt"
echo "   2. Раскомментировать SSL директивы"
echo "   3. Изменить HTTP блок на редирект"
echo "   4. Пересоздать контейнер с SSL volumes"

