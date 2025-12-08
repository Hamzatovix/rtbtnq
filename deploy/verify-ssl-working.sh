#!/bin/bash
# Проверка работы SSL после замены ключа

set -e

echo "🔍 Проверка работы SSL"
echo "======================"
echo ""

# 1. Проверить статус контейнера
echo "1️⃣  Проверка статуса контейнера..."
if docker ps | grep -q shtrafnett_nginx; then
    echo "✅ Контейнер запущен"
    docker ps | grep shtrafnett_nginx
else
    echo "❌ Контейнер не запущен!"
    echo "Логи:"
    docker logs shtrafnett_nginx --tail 30
    exit 1
fi
echo ""

# 2. Проверить конфигурацию Nginx
echo "2️⃣  Проверка конфигурации Nginx..."
if docker exec shtrafnett_nginx nginx -t 2>&1 | grep -q "successful"; then
    echo "✅ Конфигурация правильная"
else
    echo "❌ Ошибка в конфигурации!"
    docker exec shtrafnett_nginx nginx -t
    exit 1
fi
echo ""

# 3. Проверить соответствие ключа и сертификата
echo "3️⃣  Проверка соответствия ключа и сертификата..."
CERT_MODULUS=$(openssl x509 -noout -modulus -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt 2>/dev/null | openssl md5 | awk '{print $NF}')
KEY_MODULUS=$(openssl rsa -noout -modulus -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.key 2>/dev/null | openssl md5 | awk '{print $NF}')

if [ "$CERT_MODULUS" = "$KEY_MODULUS" ]; then
    echo "✅ Сертификат и ключ соответствуют!"
    echo "   Модуль сертификата: $CERT_MODULUS"
    echo "   Модуль ключа: $KEY_MODULUS"
else
    echo "❌ Сертификат и ключ НЕ соответствуют!"
    echo "   Модуль сертификата: $CERT_MODULUS"
    echo "   Модуль ключа: $KEY_MODULUS"
    exit 1
fi
echo ""

# 4. Проверка редиректа HTTP → HTTPS
echo "4️⃣  Проверка редиректа HTTP → HTTPS..."
HTTP_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: rosebotanique.store" http://176.57.213.174 2>/dev/null || echo "000")
HTTP_LOCATION=$(curl -s -I -H "Host: rosebotanique.store" http://176.57.213.174 2>/dev/null | grep -i "location:" || echo "")

if [ "$HTTP_REDIRECT" = "301" ]; then
    echo "✅ HTTP редиректит на HTTPS (код: $HTTP_REDIRECT)"
    if [ -n "$HTTP_LOCATION" ]; then
        echo "   $HTTP_LOCATION"
    fi
else
    echo "⚠️  HTTP возвращает код: $HTTP_REDIRECT (ожидался 301)"
fi
echo ""

# 5. Проверка HTTPS
echo "5️⃣  Проверка HTTPS..."
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -k -H "Host: rosebotanique.store" https://176.57.213.174 2>/dev/null || echo "000")
if [ "$HTTPS_STATUS" = "200" ]; then
    echo "✅ HTTPS работает (код: $HTTPS_STATUS)"
else
    echo "⚠️  HTTPS возвращает код: $HTTPS_STATUS (ожидался 200)"
fi
echo ""

# 6. Проверка сертификата через openssl
echo "6️⃣  Проверка SSL сертификата..."
echo | openssl s_client -servername rosebotanique.store -connect 176.57.213.174:443 -showcerts 2>/dev/null | grep -A 2 "Certificate chain" || echo "⚠️  Не удалось проверить сертификат"
echo ""

echo "🎉 Проверка завершена!"
echo ""
echo "📋 Проверь в браузере:"
echo "   - http://rosebotanique.store → должен редиректить на https://"
echo "   - https://rosebotanique.store → должен открыться с зелёным замочком 🔒"


