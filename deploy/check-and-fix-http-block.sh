#!/bin/bash
# Проверка и исправление HTTP блока

echo "🔍 Проверка HTTP блока"
echo "======================"
echo ""

# Показать полный HTTP блок
echo "Текущий HTTP блок:"
grep -A 15 "Rosebotanique.store HTTP" /root/Shtraf/nginx/nginx.conf | head -20
echo ""

# Проверить, есть ли редирект
if grep -A 10 "Rosebotanique.store HTTP" /root/Shtraf/nginx/nginx.conf | grep -q "return 301 https"; then
    echo "✅ Редирект настроен"
else
    echo "❌ Редирект НЕ настроен!"
    echo ""
    echo "Нужно добавить в HTTP блок:"
    echo "    return 301 https://\$host\$request_uri;"
    echo ""
    echo "Открой файл:"
    echo "    nano /root/Shtraf/nginx/nginx.conf"
    echo ""
    echo "Найди HTTP блок и замени содержимое на:"
    echo "    server {"
    echo "        listen 80;"
    echo "        listen [::]:80;"
    echo "        server_name rosebotanique.store www.rosebotanique.store;"
    echo "        return 301 https://\$host\$request_uri;"
    echo "    }"
fi

