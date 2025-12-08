#!/bin/bash
# Финальное применение SSL настроек

set -e

echo "🚀 Финальное применение SSL"
echo "==========================="
echo ""

# 1. Проверка HTTP блока
echo "1️⃣  Проверка HTTP блока..."
if grep -A 5 "Rosebotanique.store HTTP" /root/Shtraf/nginx/nginx.conf | grep -q "return 301 https"; then
    echo "✅ HTTP блок настроен на редирект"
else
    echo "⚠️  HTTP блок может быть не настроен на редирект"
    echo "   Проверяю текущую конфигурацию..."
    grep -A 10 "Rosebotanique.store HTTP" /root/Shtraf/nginx/nginx.conf | head -15
fi
echo ""

# 2. Перезапуск контейнера
echo "2️⃣  Перезапуск контейнера..."
docker restart shtrafnett_nginx
sleep 3
echo "✅ Контейнер перезапущен"
echo ""

# 3. Проверка конфигурации
echo "3️⃣  Проверка конфигурации Nginx..."
if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Конфигурация правильная"
    docker exec shtrafnett_nginx nginx -s reload
    echo "✅ Nginx перезагружен"
else
    echo "❌ Ошибка в конфигурации!"
    docker exec shtrafnett_nginx nginx -t
    exit 1
fi
echo ""

# 4. Проверка работы
echo "4️⃣  Проверка работы..."
echo ""

echo "Проверка редиректа HTTP → HTTPS:"
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: rosebotanique.store" http://176.57.213.174 2>/dev/null || echo "000")
HTTP_LOCATION=$(curl -s -o /dev/null -w "%{redirect_url}" -H "Host: rosebotanique.store" http://176.57.213.174 2>/dev/null || echo "")

if [ "$HTTP_REDIRECT" = "301" ]; then
    echo "   ✅ HTTP редиректит на HTTPS (код: $HTTP_REDIRECT)"
    if [ -n "$HTTP_LOCATION" ]; then
        echo "   ✅ Location: $HTTP_LOCATION"
    fi
else
    echo "   ⚠️  HTTP возвращает код: $HTTP_REDIRECT (ожидался 301)"
    echo "   Проверь HTTP блок в nginx.conf"
fi

echo ""
echo "Проверка HTTPS:"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k -H "Host: rosebotanique.store" https://176.57.213.174 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "   ✅ HTTPS работает (код: $HTTPS_STATUS)"
else
    echo "   ⚠️  HTTPS возвращает код: $HTTPS_STATUS (ожидался 200)"
    echo "   Проверь SSL сертификат и конфигурацию"
fi
echo ""

echo "🎉 Настройка завершена!"
echo ""
echo "📋 Проверь в браузере:"
echo "   - http://rosebotanique.store → должен редиректить на https://"
echo "   - https://rosebotanique.store → должен открыться с зелёным замочком 🔒"

