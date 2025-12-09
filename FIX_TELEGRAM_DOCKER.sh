#!/bin/bash
# Скрипт для проверки и исправления переменных Telegram в Docker контейнере

echo "🔍 Проверка переменных Telegram в Docker контейнере"
echo "===================================================="
echo ""

cd /opt/rosebotanique

# Проверяем переменные в контейнере
echo "1️⃣  Проверяем переменные в контейнере:"
echo "--------------------------------------"
if docker ps | grep -q rosebotanique; then
    echo "✅ Контейнер запущен"
    echo ""
    echo "Переменные Telegram в контейнере:"
    TELEGRAM_VARS=$(docker exec rosebotanique env | grep -E "^(TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID)")
    
    if [ -z "$TELEGRAM_VARS" ]; then
        echo "❌ Переменные Telegram НЕ найдены в контейнере!"
        echo ""
        echo "⚠️  Нужно пересоздать контейнер с флагом --env-file"
        echo ""
        echo "2️⃣  Пересоздаем контейнер..."
        echo "----------------------------"
        
        # Останавливаем и удаляем старый контейнер
        echo "Останавливаем контейнер..."
        docker stop rosebotanique
        
        echo "Удаляем контейнер..."
        docker rm rosebotanique
        
        echo ""
        echo "3️⃣  Запускаем новый контейнер с --env-file:"
        echo "--------------------------------------------"
        
        docker run -d \
          --name rosebotanique \
          --network shtraf_default \
          -p 3000:3000 \
          --restart unless-stopped \
          -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
          -v /opt/rosebotanique/front/src/data:/app/src/data \
          -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
          --env-file front/.env.production \
          rosebotanique:prod
        
        echo ""
        echo "⏳ Ждем 5 секунд для запуска..."
        sleep 5
        
        echo ""
        echo "4️⃣  Проверяем переменные в новом контейнере:"
        echo "---------------------------------------------"
        docker exec rosebotanique env | grep -E "^(TELEGRAM_BOT_TOKEN|TELEGRAM_CHAT_ID)"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Переменные успешно загружены в контейнер!"
        else
            echo ""
            echo "❌ Что-то пошло не так..."
        fi
        
    else
        echo "✅ Переменные найдены в контейнере:"
        echo "$TELEGRAM_VARS"
        echo ""
        echo "✅ Все в порядке, контейнер настроен правильно!"
    fi
else
    echo "❌ Контейнер не запущен"
    echo ""
    echo "Запускаем контейнер с --env-file:"
    docker run -d \
      --name rosebotanique \
      --network shtraf_default \
      -p 3000:3000 \
      --restart unless-stopped \
      -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
      -v /opt/rosebotanique/front/src/data:/app/src/data \
      -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
      --env-file front/.env.production \
      rosebotanique:prod
fi

echo ""
echo "✅ Готово!"
echo ""
echo "📋 Проверка логов (последние 20 строк):"
docker logs rosebotanique --tail 20 | grep -E "(Telegram|Order)" || echo "(нет записей о Telegram)"

