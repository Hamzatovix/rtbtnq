#!/bin/bash
# Быстрое обновление без пересборки образа
# Использование: ./DEPLOY_QUICK.sh

set -e

echo "⚡ Быстрое обновление проекта rosebotanique"
echo "============================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 0. Резервное копирование данных
info "Создание резервной копии данных..."
if [ -f "BACKUP_DATA.sh" ]; then
    chmod +x BACKUP_DATA.sh
    ./BACKUP_DATA.sh || info "Не удалось создать резервную копию (продолжаем...)"
fi
echo ""

# 1. Сохранение локальных изменений
info "Сохранение локальных изменений..."
if git status --porcelain | grep -q "front/src/data/products.json\|front/src/data/gallery.json"; then
    git stash push -m "Автоматический stash перед быстрым обновлением $(date +%Y-%m-%d_%H:%M:%S)" front/src/data/products.json front/src/data/gallery.json 2>/dev/null || true
fi
echo ""

# 2. Обновление кода из Git
info "Обновление кода из Git..."
git pull
success "Код обновлен"
echo ""

# 2.5. Восстановление данных
info "Восстановление данных..."
if git stash list | grep -q "Автоматический stash перед быстрым обновлением"; then
    git stash pop 2>/dev/null || info "Данные восстановлены"
fi
echo ""

# 3. Перезапуск контейнера
info "Перезапуск контейнера..."
docker restart rosebotanique
success "Контейнер перезапущен"
echo ""

# 4. Ожидание запуска
info "Ожидание запуска (5 секунд)..."
sleep 5

# 5. Проверка статуса
info "Проверка статуса:"
docker ps | grep rosebotanique || echo "⚠️  Контейнер не найден в списке запущенных"

echo ""
success "Быстрое обновление завершено!"
echo ""
info "Для просмотра логов: docker logs rosebotanique --tail 50"

