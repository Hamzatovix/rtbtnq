#!/bin/bash
# Проверка формата сертификата

echo "🔍 Проверка формата сертификата"
echo "==============================="
echo ""

# 1. Проверить содержимое сертификата
echo "1️⃣  Первые 5 строк сертификата:"
head -5 /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
echo ""

# 2. Проверить, есть ли BEGIN CERTIFICATE
echo "2️⃣  Проверка формата:"
if grep -q "BEGIN CERTIFICATE" /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt; then
    echo "✅ Найдена строка BEGIN CERTIFICATE"
else
    echo "❌ НЕ найдена строка BEGIN CERTIFICATE!"
    echo "   Файл может быть пустым или в неправильном формате"
fi

if grep -q "END CERTIFICATE" /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt; then
    echo "✅ Найдена строка END CERTIFICATE"
else
    echo "❌ НЕ найдена строка END CERTIFICATE!"
fi
echo ""

# 3. Проверить размер файла
echo "3️⃣  Размер файла:"
ls -lh /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
echo ""

# 4. Проверить ключ
echo "4️⃣  Проверка ключа:"
if grep -q "BEGIN.*PRIVATE KEY" /root/Shtraf/nginx/ssl/rosebotanique/certificate.key; then
    echo "✅ Ключ в правильном формате"
else
    echo "❌ Ключ в неправильном формате!"
fi
echo ""

# 5. Попытка проверить через openssl
echo "5️⃣  Проверка через openssl:"
if openssl x509 -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt -text -noout > /dev/null 2>&1; then
    echo "✅ Сертификат валидный"
    openssl x509 -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt -text -noout | grep -E "Subject:|Issuer:|Not After" | head -3
else
    echo "❌ Сертификат невалидный или повреждён!"
    echo ""
    echo "Попробуй проверить содержимое файла:"
    echo "  cat /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt"
fi
echo ""

