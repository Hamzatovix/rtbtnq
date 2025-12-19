#!/bin/bash
# Обновление конфигурации Nginx для включения SSL

set -e

echo "🔧 Обновление конфигурации Nginx для SSL"
echo "========================================"
echo ""

NGINX_CONF="/root/Shtraf/nginx/nginx.conf"
BACKUP_FILE="/root/Shtraf/nginx/nginx.conf.backup-ssl-$(date +%Y%m%d-%H%M%S)"

# Резервная копия
echo "1️⃣  Создание резервной копии..."
cp "$NGINX_CONF" "$BACKUP_FILE"
echo "✅ Резервная копия: $BACKUP_FILE"
echo ""

# Проверка существования файла
if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Файл $NGINX_CONF не найден!"
    exit 1
fi

echo "2️⃣  Обновление конфигурации..."
echo ""

# Используем Python для редактирования
python3 << 'PYTHON_SCRIPT'
import re
import sys

nginx_conf = "/root/Shtraf/nginx/nginx.conf"

try:
    with open(nginx_conf, "r", encoding="utf-8") as f:
        content = f.read()
    
    changes_made = False
    
    # 1. Раскомментировать SSL директивы для rosebotanique.store HTTPS
    # Найти блок с закомментированными SSL директивами
    ssl_pattern = r'(# --- Rosebotanique\.store HTTPS ---.*?)(# --- SSL.*?)(# ssl_certificate.*?# ssl_session_tickets off;)(.*?# --- Security Headers ---)'
    
    def uncomment_ssl(match):
        nonlocal changes_made
        header = match.group(1)
        ssl_comment = match.group(2)
        ssl_directives = match.group(3)
        security = match.group(4)
        
        # Раскомментировать SSL директивы
        uncommented = re.sub(r'^# (ssl_)', r'    \1', ssl_directives, flags=re.MULTILINE)
        uncommented = re.sub(r'^# (ssl_)', r'    \1', uncommented, flags=re.MULTILINE)
        uncommented = re.sub(r'^    # ', r'    ', uncommented, flags=re.MULTILINE)
        
        # Убрать комментарий "временно без сертификата"
        ssl_comment_clean = re.sub(r'# --- SSL.*?---', '# --- SSL ---', ssl_comment, flags=re.DOTALL)
        
        changes_made = True
        return header + ssl_comment_clean + uncommented + security
    
    new_content = re.sub(ssl_pattern, uncomment_ssl, content, flags=re.DOTALL)
    
    # 2. Изменить HTTP блок на редирект
    # Найти HTTP блок с proxy_pass и заменить на редирект
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
        print("")
        print("Изменения:")
        print("  - SSL директивы раскомментированы")
        print("  - HTTP блок изменён на редирект на HTTPS")
    else:
        print("⚠️  Изменения не найдены. Возможно, конфигурация уже обновлена.")
        print("")
        print("Проверь вручную:")
        print("  1. SSL директивы должны быть без #")
        print("  2. HTTP блок должен содержать: return 301 https://\$host\$request_uri;")
    
except Exception as e:
    print(f"❌ Ошибка: {e}")
    sys.exit(1)

PYTHON_SCRIPT

echo ""
echo "3️⃣  Проверка синтаксиса..."
echo ""

# Проверка через временный контейнер (если текущий не запущен)
if docker ps | grep -q shtrafnett_nginx; then
    echo "Проверка через запущенный контейнер..."
    if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
        echo "✅ Синтаксис правильный!"
    else
        echo "❌ Ошибка в синтаксисе!"
        docker exec shtrafnett_nginx nginx -t
        exit 1
    fi
else
    echo "⚠️  Контейнер не запущен. Проверка будет выполнена после пересоздания."
fi

echo ""
echo "✅ Готово!"
echo ""
echo "📋 Следующий шаг:"
echo "   Пересоздать контейнер с SSL volumes:"
echo "   bash deploy/recreate-nginx-with-ssl.sh"

