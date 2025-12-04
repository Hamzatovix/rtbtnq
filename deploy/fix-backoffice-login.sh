#!/bin/bash
# Диагностика и исправление проблемы входа в бэк-офис

echo "🔍 Диагностика проблемы входа в бэк-офис"
echo "========================================"
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENV_FILE="/opt/rosebotanique/front/.env.production"

echo "1️⃣  Проверка переменных окружения..."
echo ""

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Файл $ENV_FILE не найден${NC}"
    exit 1
fi

echo "Содержимое .env.production:"
echo "----------------------------"
grep -E "ADMIN_USERNAME|ADMIN_PASSWORD_HASH|JWT_SECRET" "$ENV_FILE" || echo "Переменные не найдены"
echo ""

# Проверка, заданы ли переменные
ADMIN_USERNAME=$(grep "^ADMIN_USERNAME=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' || echo "")
ADMIN_PASSWORD_HASH=$(grep "^ADMIN_PASSWORD_HASH=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' || echo "")
JWT_SECRET=$(grep "^JWT_SECRET=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"' || echo "")

echo "2️⃣  Текущие значения:"
echo "   ADMIN_USERNAME: ${ADMIN_USERNAME:-не задано (будет использовано: rosebotanique)}"
echo "   ADMIN_PASSWORD_HASH: ${ADMIN_PASSWORD_HASH:+задано (длина: ${#ADMIN_PASSWORD_HASH})}"
echo "   JWT_SECRET: ${JWT_SECRET:+задано (длина: ${#JWT_SECRET})}"
echo ""

# Проверка хеша пароля RoseBot2024!
echo "3️⃣  Проверка хеша пароля по умолчанию..."
echo ""

DEFAULT_HASH='$2b$10$Ex0xi5EKce2dULLmluenFu53fIdTxe49nlFGoQvuK/Dk5X.aWMLze'
DEFAULT_PASSWORD='RoseBot2024!'

if [ -n "$ADMIN_PASSWORD_HASH" ] && [ "$ADMIN_PASSWORD_HASH" != "$DEFAULT_HASH" ]; then
    echo -e "${YELLOW}⚠️  Используется кастомный хеш пароля${NC}"
    echo "   Хеш в .env.production НЕ совпадает с хешем пароля по умолчанию"
    echo "   Это значит, что пароль 'RoseBot2024!' НЕ подойдёт!"
    echo ""
    echo "   Решение:"
    echo "   1. Либо узнай оригинальный пароль для этого хеша"
    echo "   2. Либо сгенерируй новый хеш для пароля 'RoseBot2024!'"
    echo ""
else
    echo -e "${GREEN}✅ Используется хеш по умолчанию${NC}"
    echo "   Пароль 'RoseBot2024!' должен работать"
fi

echo ""

# Проверка контейнера
echo "4️⃣  Проверка контейнера..."
echo ""

if docker ps | grep -q "rosebotanique"; then
    echo -e "${GREEN}✅ Контейнер rosebotanique запущен${NC}"
    
    # Проверка переменных окружения в контейнере
    echo ""
    echo "Переменные окружения в контейнере:"
    docker exec rosebotanique env | grep -E "ADMIN_USERNAME|ADMIN_PASSWORD_HASH|JWT_SECRET" || echo "Не найдены"
else
    echo -e "${RED}❌ Контейнер rosebotanique не запущен${NC}"
fi

echo ""

# Проверка API логина
echo "5️⃣  Тест API логина..."
echo ""

CONTAINER_IP=$(docker inspect rosebotanique --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null || echo "172.17.0.2")

echo "Тестирую логин через API..."
RESPONSE=$(curl -s -X POST http://$CONTAINER_IP:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rosebotanique","password":"RoseBot2024!"}' 2>&1)

echo "Ответ API:"
echo "$RESPONSE" | head -5

if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Логин работает!${NC}"
elif echo "$RESPONSE" | grep -q "Неверное имя пользователя или пароль"; then
    echo -e "${RED}❌ Неверные учётные данные${NC}"
    echo ""
    echo "Возможные причины:"
    echo "1. В .env.production указан другой ADMIN_USERNAME"
    echo "2. В .env.production указан ADMIN_PASSWORD_HASH, который не соответствует 'RoseBot2024!'"
    echo ""
    echo "Решение:"
    echo "1. Проверь ADMIN_USERNAME в .env.production"
    echo "2. Либо удали ADMIN_PASSWORD_HASH из .env.production (чтобы использовать хеш по умолчанию)"
    echo "3. Либо сгенерируй новый хеш для пароля 'RoseBot2024!'"
else
    echo -e "${YELLOW}⚠️  Неожиданный ответ от API${NC}"
fi

echo ""
echo "========================================"
echo "Рекомендации:"
echo ""
echo "1. Если используешь кастомный хеш - узнай оригинальный пароль"
echo "2. Если хочешь использовать 'RoseBot2024!' - удали ADMIN_PASSWORD_HASH из .env.production"
echo "3. Или сгенерируй новый хеш:"
echo "   cd /opt/rosebotanique/front"
echo "   node -e \"console.log(require('bcryptjs').hashSync('RoseBot2024!', 10))\""
echo ""

