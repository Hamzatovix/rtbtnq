#!/bin/bash
# Скрипт для проверки DNS-записей rosebotanique.store

echo "🔍 Проверка DNS-записей для rosebotanique.store"
echo "================================================"
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="rosebotanique.store"
EXPECTED_IP="176.57.213.174"

# Функция проверки DNS
check_dns() {
    local hostname=$1
    local expected_ip=$2
    
    echo "Проверка: $hostname"
    echo "Ожидаемый IP: $expected_ip"
    
    # Получаем IP через dig (если доступен)
    if command -v dig &> /dev/null; then
        RESULT=$(dig +short $hostname A 2>/dev/null | head -1)
    # Или через host
    elif command -v host &> /dev/null; then
        RESULT=$(host $hostname 2>/dev/null | grep -oP 'has address \K[0-9.]+' | head -1)
    # Или через nslookup
    elif command -v nslookup &> /dev/null; then
        RESULT=$(nslookup $hostname 2>/dev/null | grep -A 1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
    else
        echo -e "${RED}❌ Не найдены утилиты для проверки DNS (dig, host, nslookup)${NC}"
        return 1
    fi
    
    if [ -z "$RESULT" ]; then
        echo -e "${RED}❌ DNS-запись не найдена или ещё не распространилась${NC}"
        echo ""
        return 1
    fi
    
    echo "Текущий IP: $RESULT"
    
    if [ "$RESULT" = "$expected_ip" ]; then
        echo -e "${GREEN}✅ DNS настроен правильно!${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ DNS указывает на другой IP: $RESULT${NC}"
        echo -e "${YELLOW}⚠️  Ожидается: $expected_ip${NC}"
        echo ""
        return 1
    fi
}

# Проверка основной записи
echo "1️⃣  Проверка основной записи (@):"
check_dns "$DOMAIN" "$EXPECTED_IP"
MAIN_OK=$?

# Проверка www-поддомена
echo "2️⃣  Проверка www-поддомена:"
check_dns "www.$DOMAIN" "$EXPECTED_IP"
WWW_OK=$?

# Итоговый результат
echo "================================================"
if [ $MAIN_OK -eq 0 ] && [ $WWW_OK -eq 0 ]; then
    echo -e "${GREEN}✅ Все DNS-записи настроены правильно!${NC}"
    echo ""
    echo "Следующие шаги:"
    echo "1. Получи SSL-сертификат через Certbot"
    echo "2. Обнови NEXT_PUBLIC_BASE_URL в .env.production"
    echo "3. Перезапусти контейнер rosebotanique"
    exit 0
else
    echo -e "${YELLOW}⚠️  Некоторые DNS-записи ещё не настроены или не распространились${NC}"
    echo ""
    echo "Что делать:"
    echo "1. Проверь настройки DNS в панели REG.RU"
    echo "2. Подожди 15-60 минут для распространения DNS"
    echo "3. Проверь через онлайн-сервис: https://dnschecker.org/"
    exit 1
fi

