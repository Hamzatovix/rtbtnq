# 🚀 Быстрый старт: Финализация проекта rosebotanique.store

## ✅ Текущий статус

- ✅ DNS-записи настроены правильно в REG.RU
- ✅ Контейнер работает на сервере
- ✅ Nginx настроен и проксирует запросы
- ⏳ DNS распространяется (15-60 минут)

---

## 📋 Что делать СЕЙЧАС (пока DNS распространяется)

### Шаг 1: Обновить переменные окружения

```bash
# Подключись к серверу
ssh root@176.57.213.174

# Отредактируй .env.production
cd /opt/rosebotanique
nano front/.env.production
```

**Убедись, что указано:**
```env
NEXT_PUBLIC_BASE_URL=https://rosebotanique.store
```

**Сохрани:** `Ctrl+O`, `Enter`, `Ctrl+X`

**Перезапусти контейнер:**
```bash
docker restart rosebotanique
```

---

### Шаг 2: Проверить DNS (через 30-60 минут)

**Онлайн-проверка:**
- https://dnschecker.org/
- Введи: `rosebotanique.store`
- Тип: `A`
- Должно быть: `176.57.213.174` везде ✅

**Или через PowerShell:**
```powershell
nslookup rosebotanique.store
# Должно показать: Address: 176.57.213.174
```

---

## 📋 Что делать ПОСЛЕ распространения DNS

### Шаг 3: Получить SSL-сертификат

```bash
# На сервере
apt update
apt install -y certbot python3-certbot-nginx

# Получи сертификат (standalone режим, так как Nginx в Docker)
certbot certonly --standalone \
  --preferred-challenges http \
  -d rosebotanique.store \
  -d www.rosebotanique.store \
  --non-interactive \
  --agree-tos \
  --email admin@rosebotanique.store
```

---

### Шаг 4: Скопировать сертификаты для Docker

```bash
# Создай директорию
mkdir -p /root/Shtraf/nginx/ssl/rosebotanique

# Скопируй сертификаты
cp /etc/letsencrypt/live/rosebotanique.store/fullchain.pem /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
cp /etc/letsencrypt/live/rosebotanique.store/privkey.pem /root/Shtraf/nginx/ssl/rosebotanique/certificate.key

# Установи права
chmod 644 /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
chmod 600 /root/Shtraf/nginx/ssl/rosebotanique/certificate.key
```

---

### Шаг 5: Обновить docker-compose.yml

```bash
cd /root/Shtraf
nano docker-compose.yml
```

**Найди секцию `volumes` для `nginx` и добавь:**
```yaml
volumes:
  - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
  - ./nginx/certificate.crt:/etc/ssl/certs/shtraftest.ru.crt:ro
  - ./nginx/certificate.key:/etc/ssl/private/shtraftest.ru.key:ro
  # Добавь эти две строки:
  - ./nginx/ssl/rosebotanique/certificate.crt:/etc/ssl/certs/rosebotanique.store.crt:ro
  - ./nginx/ssl/rosebotanique/certificate.key:/etc/ssl/private/rosebotanique.store.key:ro
```

**Сохрани:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Шаг 6: Раскомментировать SSL в nginx.conf

```bash
nano /root/Shtraf/nginx/nginx.conf
```

**Найди блок для `rosebotanique.store` (около строки 897-905) и раскомментируй:**

**Было:**
```nginx
# --- SSL (временно без сертификата, нужно настроить Let's Encrypt) ---
# ssl_certificate     /etc/ssl/certs/rosebotanique.store.crt;
# ssl_certificate_key /etc/ssl/private/rosebotanique.store.key;
# ssl_protocols TLSv1.2 TLSv1.3;
# ssl_ciphers 'EECDH+AESGCM:EECDH+CHACHA20:EDH+AESGCM';
# ssl_prefer_server_ciphers off;
# ssl_session_cache shared:SSL:10m;
# ssl_session_timeout 1d;
# ssl_session_tickets off;
```

**Должно быть (убери `#` в начале каждой строки):**
```nginx
# --- SSL ---
ssl_certificate     /etc/ssl/certs/rosebotanique.store.crt;
ssl_certificate_key /etc/ssl/private/rosebotanique.store.key;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'EECDH+AESGCM:EECDH+CHACHA20:EDH+AESGCM';
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1d;
ssl_session_tickets off;
```

**Сохрани:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Шаг 7: Перезапустить Nginx

```bash
cd /root/Shtraf
docker compose restart nginx
sleep 2
docker exec shtrafnett_nginx nginx -s reload
```

---

### Шаг 8: Проверить работу

```bash
# Проверка HTTP (должен редиректить на HTTPS)
curl -I http://rosebotanique.store

# Проверка HTTPS (должен возвращать 200)
curl -I https://rosebotanique.store
```

**Открой в браузере:**
- `https://rosebotanique.store`
- Должен быть зелёный замочек 🔒
- Сайт должен открываться

---

## 🎯 Итоговый чек-лист

- [ ] Обновлён `NEXT_PUBLIC_BASE_URL` в `.env.production`
- [ ] Контейнер `rosebotanique` перезапущен
- [ ] DNS распространился (проверено через dnschecker.org)
- [ ] SSL-сертификат получен через Certbot
- [ ] Сертификаты скопированы в `/root/Shtraf/nginx/ssl/rosebotanique/`
- [ ] `docker-compose.yml` обновлён (добавлены volumes для сертификатов)
- [ ] `nginx.conf` обновлён (раскомментированы SSL-директивы)
- [ ] Nginx перезапущен
- [ ] Сайт открывается по `https://rosebotanique.store` с зелёным замочком

---

## 🐛 Если что-то не работает

### Проблема: Certbot не может получить сертификат

**Решение:**
- Убедись, что DNS распространился: https://dnschecker.org/
- Проверь, что домен указывает на `176.57.213.174`
- Убедись, что порт 80 доступен извне

### Проблема: SSL-сертификат не работает

**Решение:**
- Проверь пути к сертификатам в `docker-compose.yml`
- Убедись, что файлы существуют: `ls -la /root/Shtraf/nginx/ssl/rosebotanique/`
- Проверь логи Nginx: `docker logs shtrafnett_nginx`

### Проблема: Сайт не открывается по домену

**Решение:**
- Проверь DNS: `nslookup rosebotanique.store`
- Проверь работу по IP: `curl -I -H "Host: rosebotanique.store" https://176.57.213.174 -k`

---

**Готово! Следуй шагам по порядку** 🚀

