#!/bin/bash
# Скрипт для обновления проекта на сервере

set -e

echo "🔄 Обновление проекта Rose Botanique"
echo "===================================="
echo ""

cd /opt/rosebotanique

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}1️⃣  Обновляем код из репозитория...${NC}"
if git pull; then
    echo -e "${GREEN}✅ Код обновлён${NC}"
else
    echo -e "${RED}❌ Ошибка при обновлении кода${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}2️⃣  Останавливаем контейнер...${NC}"
docker stop rosebotanique 2>/dev/null || echo "Контейнер не запущен"
docker rm rosebotanique 2>/dev/null || echo "Контейнер не существует"

echo ""
echo -e "${YELLOW}3️⃣  Собираем новый образ...${NC}"
if docker build -t rosebotanique:prod .; then
    echo -e "${GREEN}✅ Образ собран${NC}"
else
    echo -e "${RED}❌ Ошибка при сборке образа${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}4️⃣  Создаём директории для данных на хосте...${NC}"
mkdir -p /opt/rosebotanique/front/prisma_data
mkdir -p /opt/rosebotanique/front/src/data
mkdir -p /opt/rosebotanique/front/public/uploads/products
mkdir -p /opt/rosebotanique/front/public/uploads/gallery
chmod -R 755 /opt/rosebotanique/front/public/uploads
echo -e "${GREEN}✅ Директории созданы${NC}"

echo ""
echo -e "${YELLOW}5️⃣  Проверяем наличие .env.production...${NC}"
if [ ! -f "front/.env.production" ]; then
    echo -e "${RED}⚠️  Файл front/.env.production не найден!${NC}"
    echo "Создайте файл перед запуском контейнера"
    exit 1
fi
echo -e "${GREEN}✅ Файл .env.production найден${NC}"

echo ""
echo -e "${YELLOW}6️⃣  Запускаем контейнер с volumes...${NC}"
if docker run -d \
  --name rosebotanique \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  --env-file front/.env.production \
  rosebotanique:prod; then
    echo -e "${GREEN}✅ Контейнер запущен${NC}"
else
    echo -e "${RED}❌ Ошибка при запуске контейнера${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}7️⃣  Подключаем к сети nginx...${NC}"
SHITRAF_NETWORK=$(docker inspect shtrafnett_nginx --format '{{range $key, $value := .NetworkSettings.Networks}}{{$key}}{{end}}' 2>/dev/null || echo "shtraf_default")
if docker network connect $SHITRAF_NETWORK rosebotanique 2>/dev/null; then
    echo -e "${GREEN}✅ Подключён к сети: $SHITRAF_NETWORK${NC}"
else
    echo -e "${YELLOW}⚠️  Уже подключён к сети или сеть не найдена${NC}"
fi

echo ""
echo -e "${YELLOW}8️⃣  Ждём запуска контейнера...${NC}"
sleep 5

echo ""
echo -e "${YELLOW}9️⃣  Проверяем статус...${NC}"
if docker ps | grep -q rosebotanique; then
    echo -e "${GREEN}✅ Контейнер работает${NC}"
    docker ps | grep rosebotanique
else
    echo -e "${RED}❌ Контейнер не запущен${NC}"
    echo "Проверь логи:"
    echo "  docker logs rosebotanique"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Обновление завершено успешно!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📝 Полезные команды:"
echo "  # Логи контейнера:"
echo "  docker logs rosebotanique --tail 50"
echo ""
echo "  # Логи в реальном времени:"
echo "  docker logs rosebotanique -f"
echo ""
echo "  # Перезапуск контейнера:"
echo "  docker restart rosebotanique"
echo ""
echo "  # Проверка статуса:"
echo "  docker ps | grep rosebotanique"
echo ""

