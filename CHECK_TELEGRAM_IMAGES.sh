#!/bin/bash
# Скрипт для проверки отправки изображений в Telegram

echo "🔍 Проверка отправки изображений в Telegram"
echo "============================================="
echo ""

cd /opt/rosebotanique

echo "1️⃣  Проверяем версию кода:"
echo "---------------------------"
git log --oneline -1 front/src/lib/telegram.ts

echo ""
echo "2️⃣  Проверяем наличие логирования изображений в коде:"
echo "------------------------------------------------------"
grep -n "Проверка изображений товаров" front/src/lib/telegram.ts || echo "❌ Логирование не найдено - код не обновлен!"

echo ""
echo "3️⃣  Проверяем последние логи с деталями:"
echo "------------------------------------------"
docker logs rosebotanique --tail 200 | grep -A 5 -B 5 "Проверка изображений товаров" || echo "Нет записей о проверке изображений"

echo ""
echo "4️⃣  Проверяем все логи Telegram:"
echo "---------------------------------"
docker logs rosebotanique --tail 100 | grep Telegram | tail -20

echo ""
echo "5️⃣  Проверяем, что контейнер использует новый код:"
echo "----------------------------------------------------"
docker exec rosebotanique cat /app/src/lib/telegram.ts | grep -n "Проверка изображений товаров" || echo "❌ В контейнере старая версия кода!"

echo ""
echo "✅ Проверка завершена"
echo ""
echo "💡 Если код не обновлен в контейнере, нужно пересобрать образ:"
echo "   docker stop rosebotanique"
echo "   docker rm rosebotanique"
echo "   docker build -t rosebotanique:prod ."
echo "   docker run -d --name rosebotanique --network shtraf_default -p 3000:3000 --restart unless-stopped -v /opt/rosebotanique/front/prisma_data:/app/prisma_data -v /opt/rosebotanique/front/src/data:/app/src/data -v /opt/rosebotanique/front/public/uploads:/app/public/uploads --env-file front/.env.production rosebotanique:prod"

