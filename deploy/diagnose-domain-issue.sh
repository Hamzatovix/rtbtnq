#!/bin/bash
# Полная диагностика проблемы с доменом rosebotanique.store

echo "🔍 Диагностика проблемы с доменом rosebotanique.store"
echo "======================================================"
echo ""

# Цвета
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="rosebotanique.store"
EXPECTED_IP="176.57.213.174"

echo -e "${BLUE}1️⃣  Проверка DNS записей${NC}"
echo "-----------------------------------"
echo "Проверка через nslookup:"
nslookup $DOMAIN 2>/dev/null | grep -A 2 "Name:" || echo -e "${RED}❌ DNS не резолвится${NC}"
echo ""

echo "Проверка через dig:"
dig +short $DOMAIN 2>/dev/null || echo -e "${RED}❌ DNS не резолвится${NC}"
echo ""

echo -e "${BLUE}2️⃣  Проверка Nginx на хосте${NC}"
echo "-----------------------------------"
if systemctl is-active --quiet nginx 2>/dev/null; then
    echo -e "${GREEN}✅ Nginx запущен на хосте${NC}"
    systemctl status nginx --no-pager | head -5
else
    echo -e "${YELLOW}⚠️  Nginx не запущен на хосте${NC}"
fi
echo ""

echo "Проверка конфигурации на хосте:"
if [ -f "/etc/nginx/sites-available/rosebotanique.store" ]; then
    echo -e "${GREEN}✅ Конфигурация найдена: /etc/nginx/sites-available/rosebotanique.store${NC}"
    if [ -L "/etc/nginx/sites-enabled/rosebotanique.store" ]; then
        echo -e "${GREEN}✅ Конфигурация активирована${NC}"
    else
        echo -e "${RED}❌ Конфигурация НЕ активирована!${NC}"
        echo "   Выполни: ln -s /etc/nginx/sites-available/rosebotanique.store /etc/nginx/sites-enabled/"
    fi
else
    echo -e "${RED}❌ Конфигурация не найдена${NC}"
fi
echo ""

echo -e "${BLUE}3️⃣  Проверка Nginx в Docker${NC}"
echo "-----------------------------------"
if docker ps | grep -q shtrafnett_nginx; then
    echo -e "${GREEN}✅ Контейнер shtrafnett_nginx запущен${NC}"
    
    echo "Проверка конфигурации в контейнере:"
    if docker exec shtrafnett_nginx cat /etc/nginx/conf.d/default.conf 2>/dev/null | grep -q "rosebotanique.store"; then
        echo -e "${GREEN}✅ Конфигурация найдена в контейнере${NC}"
        echo "Содержимое:"
        docker exec shtrafnett_nginx cat /etc/nginx/conf.d/default.conf 2>/dev/null | grep -A 20 "rosebotanique.store" | head -25
    else
        echo -e "${RED}❌ Конфигурация НЕ найдена в контейнере${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Контейнер shtrafnett_nginx не запущен${NC}"
fi
echo ""

echo -e "${BLUE}4️⃣  Проверка порта 80${NC}"
echo "-----------------------------------"
echo "Что слушает порт 80:"
netstat -tulpn 2>/dev/null | grep :80 || ss -tulpn 2>/dev/null | grep :80 || echo "Не удалось проверить"
echo ""

echo -e "${BLUE}5️⃣  Проверка контейнера rosebotanique${NC}"
echo "-----------------------------------"
if docker ps | grep -q rosebotanique; then
    echo -e "${GREEN}✅ Контейнер rosebotanique запущен${NC}"
    docker ps | grep rosebotanique
    
    echo ""
    echo "IP контейнера:"
    ROSE_IP=$(docker inspect rosebotanique --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' 2>/dev/null)
    echo "IP: ${ROSE_IP:-не найден}"
    
    echo ""
    echo "Проверка доступности контейнера:"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ Контейнер доступен на localhost:3000${NC}"
    else
        echo -e "${RED}❌ Контейнер недоступен на localhost:3000${NC}"
    fi
else
    echo -e "${RED}❌ Контейнер rosebotanique не запущен${NC}"
fi
echo ""

echo -e "${BLUE}6️⃣  Проверка доступности по IP с Host заголовком${NC}"
echo "-----------------------------------"
echo "Тест HTTP запроса с Host заголовком:"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $DOMAIN" http://$EXPECTED_IP 2>/dev/null)
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "301" ] || [ "$RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ Сайт доступен по IP с Host заголовком (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}❌ Сайт недоступен (HTTP $RESPONSE)${NC}"
fi
echo ""

echo -e "${BLUE}7️⃣  Проверка логов Nginx${NC}"
echo "-----------------------------------"
if [ -f "/var/log/nginx/rosebotanique-error.log" ]; then
    echo "Последние ошибки:"
    tail -10 /var/log/nginx/rosebotanique-error.log 2>/dev/null || echo "Лог пуст"
elif docker ps | grep -q shtrafnett_nginx; then
    echo "Ошибки из контейнера:"
    docker exec shtrafnett_nginx tail -10 /var/log/nginx/error.log 2>/dev/null || echo "Лог пуст"
else
    echo "Логи не найдены"
fi
echo ""

echo -e "${BLUE}8️⃣  Рекомендации${NC}"
echo "-----------------------------------"
echo "Если DNS не резолвится:"
echo "  1. Проверь настройки DNS в REG.RU"
echo "  2. Подожди распространения DNS (до 24 часов)"
echo "  3. Проверь через https://dnschecker.org/"
echo ""
echo "Если Nginx не настроен:"
echo "  1. Создай конфигурацию: /etc/nginx/sites-available/rosebotanique.store"
echo "  2. Активируй: ln -s /etc/nginx/sites-available/rosebotanique.store /etc/nginx/sites-enabled/"
echo "  3. Проверь: nginx -t"
echo "  4. Перезагрузи: systemctl reload nginx"
echo ""
echo "Если Nginx в Docker:"
echo "  1. Проверь конфигурацию в /root/Shtraf/nginx/nginx.conf"
echo "  2. Перезапусти контейнер: docker restart shtrafnett_nginx"
echo ""

