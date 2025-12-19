#!/bin/bash
# Пошаговая настройка SSL и финализация проекта rosebotanique.store

set -e

echo "🚀 Настройка SSL и финализация проекта rosebotanique.store"
echo "============================================================"
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Шаг 1: Проверка DNS
echo "1️⃣  Проверка DNS..."
echo ""

DOMAIN="rosebotanique.store"
EXPECTED_IP="176.57.213.174"

# Проверка основной записи
MAIN_IP=$(dig +short $DOMAIN A 2>/dev/null | head -1 || echo "")
if [ -z "$MAIN_IP" ]; then
    MAIN_IP=$(host $DOMAIN 2>/dev/null | grep -oP 'has address \K[0-9.]+' | head -1 || echo "")
fi

if [ "$MAIN_IP" = "$EXPECTED_IP" ]; then
    echo -e "${GREEN}✅ DNS основной записи работает: $MAIN_IP${NC}"
else
    echo -e "${YELLOW}⚠️  DNS основной записи ещё не распространился${NC}"
    echo "   Ожидаемый IP: $EXPECTED_IP"
    echo "   Текущий IP: ${MAIN_IP:-не найден}"
    echo ""
    echo "   Подожди 15-60 минут и запусти скрипт снова"
    echo "   Или проверь онлайн: https://dnschecker.org/"
    exit 1
fi

# Проверка www-поддомена
WWW_IP=$(dig +short www.$DOMAIN A 2>/dev/null | head -1 || echo "")
if [ -z "$WWW_IP" ]; then
    WWW_IP=$(host www.$DOMAIN 2>/dev/null | grep -oP 'has address \K[0-9.]+' | head -1 || echo "")
fi

if [ "$WWW_IP" = "$EXPECTED_IP" ]; then
    echo -e "${GREEN}✅ DNS www-поддомена работает: $WWW_IP${NC}"
else
    echo -e "${YELLOW}⚠️  DNS www-поддомена ещё не распространился${NC}"
    echo "   Это не критично, можно продолжить"
fi

echo ""

# Шаг 2: Обновление переменных окружения
echo "2️⃣  Обновление переменных окружения..."
echo ""

ENV_FILE="/opt/rosebotanique/front/.env.production"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Файл $ENV_FILE не найден${NC}"
    exit 1
fi

# Проверка и обновление NEXT_PUBLIC_BASE_URL
if grep -q "NEXT_PUBLIC_BASE_URL" "$ENV_FILE"; then
    # Обновляем существующую запись
    sed -i 's|NEXT_PUBLIC_BASE_URL=.*|NEXT_PUBLIC_BASE_URL=https://rosebotanique.store|g' "$ENV_FILE"
    echo -e "${GREEN}✅ Обновлён NEXT_PUBLIC_BASE_URL${NC}"
else
    # Добавляем новую запись
    echo "" >> "$ENV_FILE"
    echo "NEXT_PUBLIC_BASE_URL=https://rosebotanique.store" >> "$ENV_FILE"
    echo -e "${GREEN}✅ Добавлен NEXT_PUBLIC_BASE_URL${NC}"
fi

echo ""

# Шаг 3: Перезапуск контейнера
echo "3️⃣  Перезапуск контейнера rosebotanique..."
echo ""

if docker ps -a | grep -q "rosebotanique"; then
    docker restart rosebotanique
    echo -e "${GREEN}✅ Контейнер перезапущен${NC}"
    sleep 3
else
    echo -e "${YELLOW}⚠️  Контейнер rosebotanique не найден${NC}"
fi

echo ""

# Шаг 4: Установка Certbot
echo "4️⃣  Проверка установки Certbot..."
echo ""

if ! command -v certbot &> /dev/null; then
    echo "Установка Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot установлен${NC}"
else
    echo -e "${GREEN}✅ Certbot уже установлен${NC}"
fi

echo ""

# Шаг 5: Получение SSL-сертификата
echo "5️⃣  Получение SSL-сертификата..."
echo ""

CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
if [ -d "$CERT_DIR" ]; then
    echo -e "${YELLOW}⚠️  Сертификат уже существует в $CERT_DIR${NC}"
    echo "   Пропускаем получение нового сертификата"
    echo "   Если нужно обновить, удали директорию: rm -rf $CERT_DIR"
else
    echo "Получение сертификата для $DOMAIN и www.$DOMAIN..."
    echo ""
    
    # Используем standalone режим, так как Nginx в Docker
    certbot certonly --standalone \
        --preferred-challenges http \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN || {
        echo -e "${RED}❌ Ошибка при получении сертификата${NC}"
        echo "   Убедись, что:"
        echo "   1. DNS распространился (проверь через https://dnschecker.org/)"
        echo "   2. Порт 80 доступен извне"
        echo "   3. Домен указывает на правильный IP: $EXPECTED_IP"
        exit 1
    }
    
    echo -e "${GREEN}✅ SSL-сертификат получен${NC}"
fi

echo ""

# Шаг 6: Копирование сертификатов
echo "6️⃣  Копирование сертификатов для Docker..."
echo ""

SSL_DIR="/root/Shtraf/nginx/ssl/rosebotanique"
mkdir -p "$SSL_DIR"

if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
    cp "$CERT_DIR/fullchain.pem" "$SSL_DIR/certificate.crt"
    cp "$CERT_DIR/privkey.pem" "$SSL_DIR/certificate.key"
    
    chmod 644 "$SSL_DIR/certificate.crt"
    chmod 600 "$SSL_DIR/certificate.key"
    
    echo -e "${GREEN}✅ Сертификаты скопированы в $SSL_DIR${NC}"
else
    echo -e "${RED}❌ Файлы сертификатов не найдены${NC}"
    exit 1
fi

echo ""

# Шаг 7: Обновление docker-compose.yml
echo "7️⃣  Обновление docker-compose.yml..."
echo ""

COMPOSE_FILE="/root/Shtraf/docker-compose.yml"

if [ -f "$COMPOSE_FILE" ]; then
    # Проверяем, есть ли уже монтирование сертификатов
    if ! grep -q "rosebotanique/certificate.crt" "$COMPOSE_FILE"; then
        echo "Добавление монтирования сертификатов в docker-compose.yml..."
        # Это нужно сделать вручную, так как структура YAML сложная
        echo -e "${YELLOW}⚠️  Нужно вручную добавить в docker-compose.yml:${NC}"
        echo ""
        echo "   volumes:"
        echo "     - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro"
        echo "     - ./nginx/certificate.crt:/etc/ssl/certs/shtraftest.ru.crt:ro"
        echo "     - ./nginx/certificate.key:/etc/ssl/private/shtraftest.ru.key:ro"
        echo "     - ./nginx/ssl/rosebotanique/certificate.crt:/etc/ssl/certs/rosebotanique.store.crt:ro"
        echo "     - ./nginx/ssl/rosebotanique/certificate.key:/etc/ssl/private/rosebotanique.store.key:ro"
        echo ""
    else
        echo -e "${GREEN}✅ Монтирование сертификатов уже настроено${NC}"
    fi
else
    echo -e "${RED}❌ Файл $COMPOSE_FILE не найден${NC}"
    exit 1
fi

echo ""

# Шаг 8: Обновление nginx.conf
echo "8️⃣  Обновление nginx.conf..."
echo ""

NGINX_CONF="/root/Shtraf/nginx/nginx.conf"

if [ -f "$NGINX_CONF" ]; then
    # Раскомментируем SSL-директивы для rosebotanique.store
    sed -i '/# --- SSL (временно без сертификата, нужно настроить Let'\''s Encrypt) ---/,/# ssl_session_tickets off;/s/^# //' "$NGINX_CONF"
    
    # Убираем комментарии с SSL-директив
    sed -i '/rosebotanique.store/,/ssl_session_tickets off;/s/^# //' "$NGINX_CONF"
    
    echo -e "${GREEN}✅ SSL-директивы раскомментированы в nginx.conf${NC}"
else
    echo -e "${RED}❌ Файл $NGINX_CONF не найден${NC}"
    exit 1
fi

echo ""

# Шаг 9: Перезапуск Nginx
echo "9️⃣  Перезапуск Nginx..."
echo ""

cd /root/Shtraf
docker compose restart nginx
sleep 2
docker exec shtrafnett_nginx nginx -s reload

echo -e "${GREEN}✅ Nginx перезапущен${NC}"

echo ""

# Шаг 10: Финальная проверка
echo "🔟 Финальная проверка..."
echo ""

echo "Проверка HTTP (должен редиректить на HTTPS):"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $DOMAIN" http://$EXPECTED_IP)
if [ "$HTTP_STATUS" = "301" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo -e "${GREEN}✅ HTTP редирект работает (код: $HTTP_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP вернул код: $HTTP_STATUS${NC}"
fi

echo ""

echo "Проверка HTTPS:"
HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $DOMAIN" https://$EXPECTED_IP -k)
if [ "$HTTPS_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ HTTPS работает (код: $HTTPS_STATUS)${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS вернул код: $HTTPS_STATUS${NC}"
fi

echo ""

echo "============================================================"
echo -e "${GREEN}✅ Настройка завершена!${NC}"
echo ""
echo "Следующие шаги:"
echo "1. Проверь DNS через https://dnschecker.org/"
echo "2. Открой сайт в браузере: https://rosebotanique.store"
echo "3. Проверь SSL-сертификат (должен быть зелёный замочек)"
echo ""
echo "Если DNS ещё не распространился, подожди 15-60 минут"
echo "и проверь снова через: https://dnschecker.org/"
echo "============================================================"

