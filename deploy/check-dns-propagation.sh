#!/bin/bash
# Проверка распространения DNS для rosebotanique.store

echo "🔍 Проверка распространения DNS для rosebotanique.store"
echo "========================================================"
echo ""

DOMAIN="rosebotanique.store"
EXPECTED_IP="176.57.213.174"

echo "1️⃣  Проверка через Google DNS (8.8.8.8):"
GOOGLE_RESULT=$(dig @8.8.8.8 +short $DOMAIN 2>/dev/null)
if [ -n "$GOOGLE_RESULT" ]; then
    echo "   ✅ $GOOGLE_RESULT"
    if [ "$GOOGLE_RESULT" = "$EXPECTED_IP" ]; then
        echo "   ✅ IP совпадает!"
    else
        echo "   ⚠️  IP не совпадает (ожидалось: $EXPECTED_IP)"
    fi
else
    echo "   ❌ DNS не резолвится"
fi
echo ""

echo "2️⃣  Проверка через Cloudflare DNS (1.1.1.1):"
CF_RESULT=$(dig @1.1.1.1 +short $DOMAIN 2>/dev/null)
if [ -n "$CF_RESULT" ]; then
    echo "   ✅ $CF_RESULT"
    if [ "$CF_RESULT" = "$EXPECTED_IP" ]; then
        echo "   ✅ IP совпадает!"
    else
        echo "   ⚠️  IP не совпадает (ожидалось: $EXPECTED_IP)"
    fi
else
    echo "   ❌ DNS не резолвится"
fi
echo ""

echo "3️⃣  Проверка через REG.RU DNS (ns1.hosting.reg.ru):"
REG_RESULT=$(dig @ns1.hosting.reg.ru +short $DOMAIN 2>/dev/null)
if [ -n "$REG_RESULT" ]; then
    echo "   ✅ $REG_RESULT"
    if [ "$REG_RESULT" = "$EXPECTED_IP" ]; then
        echo "   ✅ IP совпадает!"
    else
        echo "   ⚠️  IP не совпадает (ожидалось: $EXPECTED_IP)"
    fi
else
    echo "   ❌ DNS не резолвится"
fi
echo ""

echo "4️⃣  Проверка www поддомена через Google DNS:"
WWW_RESULT=$(dig @8.8.8.8 +short www.$DOMAIN 2>/dev/null)
if [ -n "$WWW_RESULT" ]; then
    echo "   ✅ www.$DOMAIN → $WWW_RESULT"
    if [ "$WWW_RESULT" = "$EXPECTED_IP" ]; then
        echo "   ✅ IP совпадает!"
    else
        echo "   ⚠️  IP не совпадает (ожидалось: $EXPECTED_IP)"
    fi
else
    echo "   ❌ DNS не резолвится"
fi
echo ""

echo "5️⃣  Проверка локального DNS на сервере:"
LOCAL_RESULT=$(dig +short $DOMAIN 2>/dev/null)
if [ -n "$LOCAL_RESULT" ]; then
    echo "   ✅ $LOCAL_RESULT"
else
    echo "   ❌ Локальный DNS не резолвит (это нормально, если DNS только что настроен)"
fi
echo ""

echo "6️⃣  Проверка доступности через IP с Host заголовком:"
HTTP_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: $DOMAIN" http://$EXPECTED_IP 2>/dev/null)
if [ "$HTTP_RESULT" = "200" ]; then
    echo "   ✅ Сайт доступен через IP (HTTP $HTTP_RESULT)"
else
    echo "   ⚠️  HTTP $HTTP_RESULT"
fi
echo ""

echo "📋 Рекомендации:"
echo "================"
if [ -n "$GOOGLE_RESULT" ] && [ "$GOOGLE_RESULT" = "$EXPECTED_IP" ]; then
    echo "✅ DNS распространился! Сайт должен быть доступен."
    echo ""
    echo "Если не работает, проверь:"
    echo "  1. Очисти кеш DNS на локальном компьютере:"
    echo "     Windows: ipconfig /flushdns"
    echo "     Linux: sudo systemd-resolve --flush-caches"
    echo ""
    echo "  2. Попробуй открыть в режиме инкогнито"
    echo ""
    echo "  3. Проверь онлайн: https://dnschecker.org/"
else
    echo "⏳ DNS ещё не распространился."
    echo ""
    echo "Что делать:"
    echo "  1. Подожди 15-60 минут (DNS распространяется не мгновенно)"
    echo ""
    echo "  2. Проверь настройки DNS в REG.RU:"
    echo "     - Убедись, что A-запись для @ указывает на $EXPECTED_IP"
    echo "     - Убедись, что A-запись для www указывает на $EXPECTED_IP"
    echo ""
    echo "  3. Проверь онлайн: https://dnschecker.org/"
    echo "     Введи: $DOMAIN, тип: A"
    echo "     Должно быть: $EXPECTED_IP"
fi
echo ""

