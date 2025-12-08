#!/bin/bash
# Проверка логов Nginx и исправление проблем

set -e

echo "🔍 Проверка логов Nginx контейнера"
echo "=================================="
echo ""

CONTAINER_ID=$(docker ps -a | grep shtrafnett_nginx | awk '{print $1}' | head -1)

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Контейнер shtrafnett_nginx не найден!"
    exit 1
fi

echo "📋 ID контейнера: $CONTAINER_ID"
echo ""

# Проверить статус
echo "1️⃣  Статус контейнера:"
docker ps -a | grep shtrafnett_nginx
echo ""

# Проверить логи
echo "2️⃣  Последние логи контейнера:"
docker logs "$CONTAINER_ID" --tail 50
echo ""

# Проверить, есть ли ошибки SSL
if docker logs "$CONTAINER_ID" 2>&1 | grep -q "cannot load certificate"; then
    echo "❌ Обнаружена ошибка SSL сертификата!"
    echo ""
    echo "Проверка сертификата на хосте:"
    if [ -f "/root/Shtraf/nginx/ssl/rosebotanique/certificate.crt" ]; then
        echo "Файл существует"
        head -5 /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
        echo ""
        if openssl x509 -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt -text -noout > /dev/null 2>&1; then
            echo "✅ Сертификат в правильном формате"
        else
            echo "❌ Сертификат в неправильном формате!"
            echo "Проверь содержимое файла:"
            echo "  head -10 /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt"
        fi
    else
        echo "❌ Файл сертификата не найден!"
    fi
fi

echo ""
echo "💡 Если видишь ошибку SSL, проверь:"
echo "   1. Формат сертификата (должен начинаться с -----BEGIN CERTIFICATE-----)"
echo "   2. Конфигурацию nginx.conf (SSL директивы должны быть раскомментированы)"
echo "   3. Права доступа к файлам сертификата"


