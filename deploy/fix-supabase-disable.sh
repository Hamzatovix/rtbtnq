#!/bin/bash
# Отключение Supabase для использования локального хранения

set -e

echo "🔧 Отключение Supabase для использования локального хранения"
echo "==========================================================="
echo ""

ENV_FILE="/opt/rosebotanique/front/.env.production"

# Проверить существование файла
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Файл $ENV_FILE не найден!"
    exit 1
fi

echo "1️⃣  Проверка текущих переменных Supabase..."
if grep -q "SUPABASE_URL" "$ENV_FILE"; then
    echo "Найдены переменные Supabase:"
    grep "SUPABASE" "$ENV_FILE" | sed 's/=.*/=***/' || true
else
    echo "Переменные Supabase не найдены"
fi
echo ""

echo "2️⃣  Комментирование переменных Supabase..."
# Создать резервную копию
cp "$ENV_FILE" "${ENV_FILE}.backup-$(date +%Y%m%d-%H%M%S)"

# Закомментировать переменные Supabase
sed -i 's/^SUPABASE_URL=/#SUPABASE_URL=/' "$ENV_FILE"
sed -i 's/^SUPABASE_SERVICE_ROLE_KEY=/#SUPABASE_SERVICE_ROLE_KEY=/' "$ENV_FILE"
sed -i 's/^SUPABASE_PRODUCTS_TABLE=/#SUPABASE_PRODUCTS_TABLE=/' "$ENV_FILE"
sed -i 's/^SUPABASE_GALLERY_TABLE=/#SUPABASE_GALLERY_TABLE=/' "$ENV_FILE"
sed -i 's/^SUPABASE_ORDERS_TABLE=/#SUPABASE_ORDERS_TABLE=/' "$ENV_FILE"

echo "✅ Переменные Supabase закомментированы"
echo ""

echo "3️⃣  Проверка изменений..."
if grep -q "^#SUPABASE_URL" "$ENV_FILE"; then
    echo "✅ Изменения применены"
    echo ""
    echo "Закомментированные переменные:"
    grep "^#SUPABASE" "$ENV_FILE" | sed 's/=.*/=***/' || true
else
    echo "⚠️  Изменения не найдены"
fi
echo ""

echo "4️⃣  Перезапуск контейнера..."
docker restart rosebotanique
echo "✅ Контейнер перезапущен"
echo ""

echo "5️⃣  Ожидание запуска..."
sleep 5

if docker ps | grep -q rosebotanique; then
    echo "✅ Контейнер запущен"
else
    echo "❌ Контейнер не запустился!"
    echo "Логи:"
    docker logs rosebotanique --tail 20
    exit 1
fi
echo ""

echo "🎉 Готово!"
echo ""
echo "📋 Теперь приложение будет использовать локальное хранение (JSON файлы)"
echo "   вместо Supabase. Попробуй создать товар снова."


