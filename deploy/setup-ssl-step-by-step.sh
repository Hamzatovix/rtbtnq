#!/bin/bash
# Пошаговая настройка SSL для rosebotanique.store

set -e

echo "🔒 Настройка SSL для rosebotanique.store"
echo "========================================"
echo ""

# 1. Проверка файлов
echo "1️⃣  Проверка файлов..."
if [ -f "/tmp/rosebotanique.crt" ] && [ -f "/tmp/rosebotanique.key" ]; then
    echo "✅ Файлы найдены"
    ls -lh /tmp/rosebotanique.crt /tmp/rosebotanique.key
else
    echo "❌ Файлы не найдены!"
    echo "   Убедись, что файлы созданы в /tmp/"
    exit 1
fi
echo ""

# 2. Проверка содержимого сертификата
echo "2️⃣  Проверка сертификата..."
if grep -q "BEGIN CERTIFICATE" /tmp/rosebotanique.crt && grep -q "END CERTIFICATE" /tmp/rosebotanique.crt; then
    echo "✅ Сертификат выглядит правильно"
    openssl x509 -in /tmp/rosebotanique.crt -text -noout | grep -E "Subject:|Issuer:|Not After" | head -3
else
    echo "⚠️  Сертификат может быть неправильным (нет BEGIN/END CERTIFICATE)"
fi
echo ""

# 3. Проверка ключа
echo "3️⃣  Проверка ключа..."
if grep -q "BEGIN.*PRIVATE KEY" /tmp/rosebotanique.key && grep -q "END.*PRIVATE KEY" /tmp/rosebotanique.key; then
    echo "✅ Ключ выглядит правильно"
else
    echo "⚠️  Ключ может быть неправильным (нет BEGIN/END PRIVATE KEY)"
fi
echo ""

# 4. Создание директории
echo "4️⃣  Создание директории для сертификатов..."
mkdir -p /root/Shtraf/nginx/ssl/rosebotanique
echo "✅ Директория создана"
echo ""

# 5. Копирование файлов
echo "5️⃣  Копирование файлов..."
cp /tmp/rosebotanique.crt /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
cp /tmp/rosebotanique.key /root/Shtraf/nginx/ssl/rosebotanique/certificate.key
echo "✅ Файлы скопированы"
echo ""

# 6. Установка прав
echo "6️⃣  Установка прав доступа..."
chmod 644 /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
chmod 600 /root/Shtraf/nginx/ssl/rosebotanique/certificate.key
echo "✅ Права установлены"
echo ""

# 7. Проверка финальных файлов
echo "7️⃣  Проверка финальных файлов..."
ls -la /root/Shtraf/nginx/ssl/rosebotanique/
echo ""

echo "✅ Файлы готовы!"
echo ""
echo "📋 Следующие шаги:"
echo "   1. Добавить volumes в docker-compose.yml"
echo "   2. Раскомментировать SSL в nginx.conf"
echo "   3. Изменить HTTP блок на редирект"
echo "   4. Перезапустить контейнер"
echo ""

