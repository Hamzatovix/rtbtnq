#!/bin/bash
# Скрипт для восстановления данных из резервной копии
# Использование: ./RESTORE_BACKUP.sh [номер_бэкапа или latest]

BACKUP_DIR="/opt/rosebotanique/backups"

if [ -z "$1" ]; then
    echo "📋 Доступные резервные копии:"
    echo "=============================="
    ls -lt "$BACKUP_DIR" | grep "^d" | tail -n +2 | nl -v 1 | awk '{print "  " $1 ". " $10}'
    echo ""
    echo "Использование: ./RESTORE_BACKUP.sh [номер или latest]"
    echo "Пример: ./RESTORE_BACKUP.sh latest"
    echo "Пример: ./RESTORE_BACKUP.sh 1"
    exit 1
fi

if [ "$1" = "latest" ]; then
    BACKUP_PATH=$(ls -td "$BACKUP_DIR"/backup_* 2>/dev/null | head -n 1)
else
    BACKUP_NAME=$(ls -t "$BACKUP_DIR" | grep "^backup_" | sed -n "${1}p")
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
fi

if [ -z "$BACKUP_PATH" ] || [ ! -d "$BACKUP_PATH" ]; then
    echo "❌ Резервная копия не найдена!"
    exit 1
fi

echo "🔄 Восстановление из: $BACKUP_PATH"
echo "=================================="
echo ""

# Восстановить products.json
if [ -f "$BACKUP_PATH/products.json" ]; then
    cp "$BACKUP_PATH/products.json" "front/src/data/products.json"
    echo "✅ products.json восстановлен"
else
    echo "⚠️  products.json не найден в бэкапе"
fi

# Восстановить gallery.json
if [ -f "$BACKUP_PATH/gallery.json" ]; then
    cp "$BACKUP_PATH/gallery.json" "front/src/data/gallery.json"
    echo "✅ gallery.json восстановлен"
fi

# Восстановить prisma_data
if [ -d "$BACKUP_PATH/prisma_data" ]; then
    cp -r "$BACKUP_PATH/prisma_data"/* "front/prisma_data/" 2>/dev/null || true
    echo "✅ prisma_data восстановлена"
fi

echo ""
echo "✅ Восстановление завершено!"
echo ""
echo "⚠️  Не забудьте перезапустить контейнер:"
echo "   docker restart rosebotanique"

