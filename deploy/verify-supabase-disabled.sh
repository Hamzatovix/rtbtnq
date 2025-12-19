#!/bin/bash
# Проверка отключения Supabase

set -e

echo "🔍 Проверка отключения Supabase"
echo "================================"
echo ""

# 1. Проверить переменные окружения в контейнере
echo "1️⃣  Проверка переменных окружения в контейнере..."
if docker exec rosebotanique env | grep -q "^SUPABASE_URL="; then
    echo "❌ Переменные Supabase всё ещё активны!"
    docker exec rosebotanique env | grep "^SUPABASE"
    echo ""
    echo "💡 Нужно пересоздать контейнер с новым .env.production"
else
    echo "✅ Переменные Supabase не найдены (отключены)"
fi
echo ""

# 2. Проверить логи после перезапуска
echo "2️⃣  Проверка логов после перезапуска..."
echo "Последние 20 строк логов:"
docker logs rosebotanique --tail 20 | tail -10
echo ""

# 3. Проверить, что файл .env.production изменён
echo "3️⃣  Проверка файла .env.production..."
if grep -q "^#SUPABASE_URL" /opt/rosebotanique/front/.env.production; then
    echo "✅ Переменные Supabase закомментированы в .env.production"
    echo ""
    echo "Закомментированные переменные:"
    grep "^#SUPABASE" /opt/rosebotanique/front/.env.production | sed 's/=.*/=***/' || true
else
    echo "⚠️  Переменные Supabase не найдены в .env.production"
fi
echo ""

echo "💡 Если переменные всё ещё активны в контейнере:"
echo "   Контейнер был создан с --env-file, нужно пересоздать его"
echo ""
echo "   docker stop rosebotanique"
echo "   docker rm rosebotanique"
echo "   cd /opt/rosebotanique"
echo "   docker run -d --name rosebotanique --restart unless-stopped -p 3000:3000 -v /opt/rosebotanique/front/prisma_data:/app/prisma_data -v /opt/rosebotanique/front/src/data:/app/src/data -v /opt/rosebotanique/front/public/uploads:/app/public/uploads --env-file front/.env.production rosebotanique:prod"


