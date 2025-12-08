#!/bin/bash
# Финальная проверка и применение SSL

set -e

echo "🔍 Финальная проверка SSL"
echo "========================="
echo ""

# 1. Проверка SSL директив
echo "1️⃣  Проверка SSL директив в nginx.conf..."
if grep -q "^ssl_certificate.*rosebotanique.store.crt" /root/Shtraf/nginx/nginx.conf; then
    echo "✅ SSL директивы раскомментированы"
else
    echo "❌ SSL директивы всё ещё закомментированы!"
    echo "   Нужно убрать # перед ssl_certificate"
    exit 1
fi
echo ""

# 2. Проверка HTTP блока
echo "2️⃣  Проверка HTTP блока..."
if grep -A 5 "Rosebotanique.store HTTP" /root/Shtraf/nginx/nginx.conf | grep -q "return 301 https"; then
    echo "✅ HTTP блок настроен на редирект"
else
    echo "⚠️  HTTP блок может быть не настроен на редирект"
    echo "   Проверь, что есть: return 301 https://\$host\$request_uri;"
fi
echo ""

# 3. Перезапуск контейнера
echo "3️⃣  Перезапуск контейнера..."
docker restart shtrafnett_nginx
sleep 3
echo "✅ Контейнер перезапущен"
echo ""

# 4. Проверка конфигурации
echo "4️⃣  Проверка конфигурации Nginx..."
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

# 5. Проверка работы
echo "5️⃣  Проверка работы..."
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

