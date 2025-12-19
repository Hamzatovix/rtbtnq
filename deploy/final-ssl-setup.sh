#!/bin/bash
# Финальная настройка SSL для rosebotanique.store

set -e

echo "🔐 Финальная настройка SSL для rosebotanique.store"
echo "=================================================="
echo ""

NGINX_CONF="/root/Shtraf/nginx/nginx.conf"
BACKUP_FILE="/root/Shtraf/nginx/nginx.conf.backup-ssl-final-$(date +%Y%m%d-%H%M%S)"

# Резервная копия
echo "1️⃣  Создание резервной копии..."
cp "$NGINX_CONF" "$BACKUP_FILE"
echo "✅ Резервная копия: $BACKUP_FILE"
echo ""

# Проверка сертификата
echo "2️⃣  Проверка сертификата..."
if openssl x509 -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt -text -noout > /dev/null 2>&1; then
    echo "✅ Сертификат в правильном формате"
    openssl x509 -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt -noout -subject -dates
else
    echo "❌ Ошибка в формате сертификата!"
    exit 1
fi
echo ""

# Обновление конфигурации Nginx
echo "3️⃣  Обновление конфигурации Nginx..."
python3 << 'PYTHON_SCRIPT'
import re
import sys

nginx_conf = "/root/Shtraf/nginx/nginx.conf"

try:
    with open(nginx_conf, "r", encoding="utf-8") as f:
        content = f.read()
    
    changes_made = False
    
    # 1. Раскомментировать SSL директивы для rosebotanique.store HTTPS
    # Ищем блок HTTPS для rosebotanique.store
    https_pattern = r'(# --- Rosebotanique\.store HTTPS ---.*?server_name rosebotanique\.store www\.rosebotanique\.store;.*?client_max_body_size.*?\n)(.*?)(# --- Security Headers ---)'
    
    def uncomment_ssl(match):
        nonlocal changes_made
        header = match.group(1)
        ssl_section = match.group(2)
        security = match.group(3)
        
        # Раскомментировать все SSL директивы
        uncommented = re.sub(r'^(\s*)# (ssl_)', r'\1\2', ssl_section, flags=re.MULTILINE)
        uncommented = re.sub(r'^(\s*)# (ssl_)', r'\1\2', uncommented, flags=re.MULTILINE)
        
        # Убрать комментарий "временно без сертификата"
        uncommented = re.sub(r'# --- SSL.*?---', '# --- SSL ---', uncommented, flags=re.DOTALL)
        
        changes_made = True
        return header + uncommented + security
    
    new_content = re.sub(https_pattern, uncomment_ssl, content, flags=re.DOTALL)
    
    # 2. Изменить HTTP блок на редирект
    # Найти HTTP блок и заменить location на редирект
    http_pattern = r'(# --- Rosebotanique\.store HTTP ---.*?server_name rosebotanique\.store www\.rosebotanique\.store;.*?)(location / \{.*?proxy_pass.*?\}.*?\})'
    
    def change_to_redirect(match):
        nonlocal changes_made
        header = match.group(1)
        
        # Заменить на редирект
        redirect_block = '''    return 301 https://$host$request_uri;
}'''
        
        changes_made = True
        return header + redirect_block
    
    new_content = re.sub(http_pattern, change_to_redirect, new_content, flags=re.DOTALL)
    
    # Сохранить изменения
    if changes_made:
        with open(nginx_conf, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("✅ Конфигурация обновлена!")
        print("   - SSL директивы раскомментированы")
        print("   - HTTP блок изменён на редирект на HTTPS")
    else:
        print("⚠️  Изменения не найдены. Проверь конфигурацию вручную.")
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

PYTHON_SCRIPT

echo ""

# Пересоздание контейнера
echo "4️⃣  Пересоздание контейнера с SSL volumes..."
NETWORK=$(docker inspect shtrafnett_nginx --format '{{.HostConfig.NetworkMode}}' 2>/dev/null || echo "shtraf_default")

docker stop shtrafnett_nginx 2>/dev/null || true
docker rm shtrafnett_nginx 2>/dev/null || true

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

# Проверка запуска
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

# Проверка конфигурации
echo "6️⃣  Проверка конфигурации Nginx..."
if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Конфигурация правильная"
else
    echo "❌ Ошибка в конфигурации!"
    docker exec shtrafnett_nginx nginx -t
    exit 1
fi
echo ""

# Проверка работы
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
echo ""
echo "💡 Сертификат действителен до: Jan 6 2027"


