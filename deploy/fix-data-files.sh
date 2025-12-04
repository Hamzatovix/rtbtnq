#!/bin/bash
# Исправление проблемы с файлами данных

echo "🔧 Исправление проблемы с файлами данных"
echo "=========================================="
echo ""

# Проверка существования файлов
echo "1️⃣  Проверка файлов данных на сервере..."
echo ""

DATA_DIR="/opt/rosebotanique/front/src/data"

if [ ! -d "$DATA_DIR" ]; then
    echo "❌ Директория $DATA_DIR не найдена"
    exit 1
fi

echo "Файлы в директории:"
ls -la "$DATA_DIR" | grep -E "\.json$" || echo "JSON файлы не найдены"
echo ""

# Проверка конкретных файлов
for file in categories.json colors.json products.json; do
    if [ -f "$DATA_DIR/$file" ]; then
        echo "✅ $file существует"
    else
        echo "❌ $file не найден"
    fi
done

echo ""

# Вариант 1: Скопировать файлы в контейнер
echo "2️⃣  Копирование файлов в контейнер..."
echo ""

if docker ps | grep -q "rosebotanique"; then
    # Создаём директорию в контейнере
    docker exec rosebotanique mkdir -p /app/src/data
    
    # Копируем файлы
    for file in categories.json colors.json products.json orders.json gallery.json; do
        if [ -f "$DATA_DIR/$file" ]; then
            echo "Копирую $file..."
            docker cp "$DATA_DIR/$file" rosebotanique:/app/src/data/ 2>/dev/null && echo "✅ $file скопирован" || echo "❌ Ошибка копирования $file"
        fi
    done
    
    echo ""
    echo "3️⃣  Проверка файлов в контейнере..."
    docker exec rosebotanique ls -la /app/src/data/ 2>/dev/null || echo "Директория не найдена"
    
    echo ""
    echo "4️⃣  Перезапуск контейнера..."
    docker restart rosebotanique
    sleep 3
    
    echo ""
    echo "5️⃣  Проверка логов..."
    docker logs rosebotanique | tail -10 | grep -E "Error|Ready|data" || echo "Логи проверены"
    
    echo ""
    echo "✅ Готово! Файлы скопированы в контейнер."
    echo ""
    echo "⚠️  ВАЖНО: Это временное решение. При пересборке образа файлы исчезнут."
    echo "Для постоянного решения используй volume (см. ниже)"
else
    echo "❌ Контейнер rosebotanique не запущен"
fi

echo ""
echo "=========================================="
echo "💡 Рекомендация: Используй volume для файлов данных"
echo ""
echo "Добавь в команду docker run:"
echo "  -v /opt/rosebotanique/front/src/data:/app/src/data \\"
echo ""
echo "Или пересобери образ с правильным Dockerfile"

