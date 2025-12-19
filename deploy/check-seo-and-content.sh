#!/bin/bash
# Проверка SEO и контента сайта

set -e

echo "🔍 Проверка SEO и контента сайта"
echo "================================="
echo ""

# 1. Проверить, что сайт показывает правильный контент
echo "1️⃣  Проверка контента главной страницы..."
echo "Заголовок страницы:"
curl -s https://rosebotanique.store | grep -o '<title>.*</title>' | head -1 || echo "Не найден"
echo ""

echo "Мета-описание:"
curl -s https://rosebotanique.store | grep -o '<meta name="description" content="[^"]*"' | head -1 || echo "Не найдено"
echo ""

# 2. Проверить robots.txt
echo "2️⃣  Проверка robots.txt..."
curl -s https://rosebotanique.store/robots.txt | head -20
echo ""

# 3. Проверка sitemap.xml
echo "3️⃣  Проверка sitemap.xml..."
curl -s https://rosebotanique.store/sitemap.xml | head -30
echo ""

# 4. Проверить переменную окружения NEXT_PUBLIC_BASE_URL
echo "4️⃣  Проверка переменной окружения NEXT_PUBLIC_BASE_URL..."
if docker exec rosebotanique env | grep -q "NEXT_PUBLIC_BASE_URL"; then
    docker exec rosebotanique env | grep "NEXT_PUBLIC_BASE_URL"
else
    echo "⚠️  Переменная NEXT_PUBLIC_BASE_URL не установлена"
    echo "   Это может привести к неправильным URL в мета-тегах"
fi
echo ""

# 5. Проверить, что сайт не редиректит на другой домен
echo "5️⃣  Проверка редиректов..."
curl -I https://rosebotanique.store 2>&1 | grep -E "(HTTP|Location|Server)" | head -5
echo ""

echo "💡 Рекомендации для индексации в Google:"
echo "   1. Убедись, что переменная NEXT_PUBLIC_BASE_URL=https://rosebotanique.store установлена"
echo "   2. Отправь сайт на индексацию в Google Search Console:"
echo "      https://search.google.com/search-console"
echo "   3. Запроси индексацию главной страницы через Search Console"
echo "   4. Подожди несколько дней для индексации"


