#!/bin/bash
# Скрипт для резервного копирования данных перед обновлением
# Использование: ./BACKUP_DATA.sh

set -e

BACKUP_DIR="/opt/rosebotanique/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/backup_${TIMESTAMP}"

echo "💾 Создание резервной копии данных..."
echo "======================================"
echo ""

# Создать директорию для бэкапов если её нет
mkdir -p "$BACKUP_DIR"

# Создать директорию для текущего бэкапа
mkdir -p "$BACKUP_PATH"

# Копировать важные файлы
echo "📦 Копирование файлов..."

if [ -f "front/src/data/products.json" ]; then
    cp "front/src/data/products.json" "${BACKUP_PATH}/products.json"
    echo "✅ products.json скопирован"
else
    echo "⚠️  products.json не найден"
fi

if [ -f "front/src/data/gallery.json" ]; then
    cp "front/src/data/gallery.json" "${BACKUP_PATH}/gallery.json"
    echo "✅ gallery.json скопирован"
fi

if [ -d "front/prisma_data" ]; then
    cp -r "front/prisma_data" "${BACKUP_PATH}/prisma_data"
    echo "✅ prisma_data скопирована"
fi

# Сохранить информацию о git stash
if git stash list | grep -q .; then
    git stash list > "${BACKUP_PATH}/stash_list.txt"
    echo "✅ Список stash сохранен"
fi

# Сохранить текущий статус git
git status > "${BACKUP_PATH}/git_status.txt" 2>&1 || true
echo "✅ Статус git сохранен"

# Удалить старые бэкапы (оставить только последние 10)
echo ""
echo "🧹 Очистка старых бэкапов (оставляем последние 10)..."
cd "$BACKUP_DIR"
ls -t | tail -n +11 | xargs rm -rf 2>/dev/null || true

echo ""
echo "✅ Резервная копия создана: $BACKUP_PATH"
echo ""
echo "📋 Список последних бэкапов:"
ls -lt "$BACKUP_DIR" | head -n 6 | tail -n +2 | awk '{print "  - " $9}'

