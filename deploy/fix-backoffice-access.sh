#!/bin/bash
# Скрипт для исправления доступа к бэк-офису

set -e

echo "🔧 Исправление доступа к бэк-офису"
echo "===================================="
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENV_FILE="/opt/rosebotanique/front/.env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Файл $ENV_FILE не найден${NC}"
    exit 1
fi

echo "1️⃣  Проверка текущих настроек..."
echo ""

# Проверяем, что указано в .env.production
ADMIN_USERNAME=$(grep "^ADMIN_USERNAME=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' || echo "")
ADMIN_PASSWORD_HASH=$(grep "^ADMIN_PASSWORD_HASH=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' || echo "")

echo "Текущие значения:"
echo "  ADMIN_USERNAME: ${ADMIN_USERNAME:-не задано (будет использовано: rosebotanique)}"
echo "  ADMIN_PASSWORD_HASH: ${ADMIN_PASSWORD_HASH:+задано (длина: ${#ADMIN_PASSWORD_HASH})}"
echo ""

# Хеш пароля по умолчанию для RoseBot2024!
DEFAULT_HASH='$2b$10$Ex0xi5EKce2dULLmluenFu53fIdTxe49nlFGoQvuK/Dk5X.aWMLze'

echo "2️⃣  Генерация правильного хеша для пароля 'RoseBot2024!'..."
echo ""

cd /opt/rosebotanique/front

# Генерируем хеш
NEW_HASH=$(node -e "console.log(require('bcryptjs').hashSync('RoseBot2024!', 10))" 2>/dev/null)

if [ -z "$NEW_HASH" ]; then
    echo -e "${RED}❌ Ошибка при генерации хеша${NC}"
    echo "Используем хеш по умолчанию из кода"
    NEW_HASH="$DEFAULT_HASH"
else
    echo -e "${GREEN}✅ Хеш сгенерирован${NC}"
fi

echo ""

echo "3️⃣  Обновление .env.production..."
echo ""

# Создаём резервную копию
cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

# Обновляем или добавляем ADMIN_USERNAME
if grep -q "^ADMIN_USERNAME=" "$ENV_FILE"; then
    sed -i "s|^ADMIN_USERNAME=.*|ADMIN_USERNAME=rosebotanique|" "$ENV_FILE"
else
    echo "ADMIN_USERNAME=rosebotanique" >> "$ENV_FILE"
fi

# Обновляем или добавляем ADMIN_PASSWORD_HASH
if grep -q "^ADMIN_PASSWORD_HASH=" "$ENV_FILE"; then
    # Экранируем специальные символы для sed
    ESCAPED_HASH=$(echo "$NEW_HASH" | sed 's/[[\.*^$()+?{|]/\\&/g')
    sed -i "s|^ADMIN_PASSWORD_HASH=.*|ADMIN_PASSWORD_HASH=$ESCAPED_HASH|" "$ENV_FILE"
else
    echo "ADMIN_PASSWORD_HASH=$NEW_HASH" >> "$ENV_FILE"
fi

echo -e "${GREEN}✅ .env.production обновлён${NC}"
echo ""

echo "4️⃣  Проверка обновлённых значений..."
echo ""

UPDATED_USERNAME=$(grep "^ADMIN_USERNAME=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"')
UPDATED_HASH=$(grep "^ADMIN_PASSWORD_HASH=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"')

echo "Обновлённые значения:"
echo "  ADMIN_USERNAME: $UPDATED_USERNAME"
echo "  ADMIN_PASSWORD_HASH: ${UPDATED_HASH:0:20}... (длина: ${#UPDATED_HASH})"
echo ""

echo "5️⃣  Перезапуск контейнера..."
echo ""

if docker ps | grep -q "rosebotanique"; then
    docker restart rosebotanique
    echo -e "${GREEN}✅ Контейнер перезапущен${NC}"
    sleep 3
else
    echo -e "${YELLOW}⚠️  Контейнер rosebotanique не запущен${NC}"
fi

echo ""

echo "6️⃣  Проверка работы API логина..."
echo ""

CONTAINER_IP=$(docker inspect rosebotanique --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null || echo "172.17.0.2")

echo "Тестирую логин через API..."
RESPONSE=$(curl -s -X POST http://$CONTAINER_IP:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rosebotanique","password":"RoseBot2024!"}' 2>&1)

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Логин работает!${NC}"
    echo ""
    echo "Данные для входа:"
    echo "  Логин: rosebotanique"
    echo "  Пароль: RoseBot2024!"
    echo ""
    echo "URL бэк-офиса:"
    echo "  http://176.57.213.174:3000/backoffice/login"
    echo "  или"
    echo "  https://rosebotanique.store/backoffice/login (после настройки DNS)"
elif echo "$RESPONSE" | grep -q "Неверное имя пользователя или пароль"; then
    echo -e "${RED}❌ Неверные учётные данные${NC}"
    echo ""
    echo "Ответ API:"
    echo "$RESPONSE" | head -3
    echo ""
    echo "Проверь:"
    echo "1. Переменные окружения в контейнере"
    echo "2. Логи контейнера: docker logs rosebotanique | tail -20"
else
    echo -e "${YELLOW}⚠️  Неожиданный ответ от API${NC}"
    echo "Ответ:"
    echo "$RESPONSE" | head -5
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ Настройка завершена!${NC}"
echo ""
echo "Если логин не работает, проверь:"
echo "1. Логи контейнера: docker logs rosebotanique | tail -30"
echo "2. Переменные окружения: docker exec rosebotanique env | grep ADMIN"
echo "3. Резервная копия: ${ENV_FILE}.backup.*"

