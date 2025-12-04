# Настройка Nginx для rosebotanique.store

## Шаг 1: Настройка DNS в REG.RU

1. Зайди в панель управления REG.RU
2. Найди домен `rosebotanique.store`
3. Перейди в раздел **DNS-записи** или **Управление DNS**
4. Добавь/измени A-запись:
   - **Тип**: A
   - **Имя**: @ (или оставь пустым для корневого домена)
   - **Значение**: `176.57.213.174`
   - **TTL**: 3600 (или автоматически)

5. Также добавь для www:
   - **Тип**: A
   - **Имя**: www
   - **Значение**: `176.57.213.174`
   - **TTL**: 3600

**Важно**: Изменения DNS могут распространяться от 5 минут до 24 часов.

---

## Шаг 2: Установка конфигурации Nginx на сервере

### 2.1. Подключись к серверу
```bash
ssh root@176.57.213.174
```

### 2.2. Скопируй конфигурацию
```bash
cd /opt/rosebotanique
# Скопируй содержимое deploy/nginx-rosebotanique.conf в:
nano /etc/nginx/sites-available/rosebotanique.store
```

Или создай файл напрямую:
```bash
cat > /etc/nginx/sites-available/rosebotanique.store << 'EOF'
# Конфигурация Nginx для rosebotanique.store
server {
    listen 80;
    listen [::]:80;
    server_name rosebotanique.store www.rosebotanique.store;

    access_log /var/log/nginx/rosebotanique-access.log;
    error_log /var/log/nginx/rosebotanique-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_buffering off;
    }

    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 24h;
        add_header Cache-Control "public, max-age=86400";
    }
}
EOF
```

### 2.3. Активируй конфигурацию
```bash
# Создай символическую ссылку
ln -s /etc/nginx/sites-available/rosebotanique.store /etc/nginx/sites-enabled/

# Проверь конфигурацию на ошибки
nginx -t

# Если всё ОК, перезагрузи Nginx
systemctl reload nginx
```

---

## Шаг 3: Настройка SSL (HTTPS) - опционально, но рекомендуется

### 3.1. Установи Certbot (если ещё не установлен)
```bash
apt update
apt install certbot python3-certbot-nginx -y
```

### 3.2. Получи SSL сертификат
```bash
certbot --nginx -d rosebotanique.store -d www.rosebotanique.store
```

Certbot автоматически:
- Получит сертификат от Let's Encrypt
- Обновит конфигурацию Nginx для HTTPS
- Настроит автоматическое обновление сертификата

### 3.3. Проверь автоматическое обновление
```bash
certbot renew --dry-run
```

---

## Шаг 4: Проверка работы

### 4.1. Проверь DNS
```bash
# На локальном компьютере
nslookup rosebotanique.store
# Должен вернуть: 176.57.213.174
```

### 4.2. Проверь доступность сайта
```bash
# На сервере
curl -I http://rosebotanique.store

# Или открой в браузере:
# http://rosebotanique.store
# https://rosebotanique.store (после настройки SSL)
```

### 4.3. Проверь логи Nginx
```bash
tail -f /var/log/nginx/rosebotanique-access.log
tail -f /var/log/nginx/rosebotanique-error.log
```

---

## Шаг 5: Обновление переменных окружения (если нужно)

Если домен изменился, обнови `.env.production`:
```bash
cd /opt/rosebotanique
nano front/.env.production
```

Убедись, что:
```env
NEXT_PUBLIC_BASE_URL=https://rosebotanique.store
```

После изменения перезапусти контейнер:
```bash
docker restart rosebotanique
```

---

## Устранение проблем

### Проблема: Nginx не запускается
```bash
# Проверь конфигурацию
nginx -t

# Проверь, не занят ли порт 80
netstat -tulpn | grep :80
```

### Проблема: 502 Bad Gateway
- Убедись, что Docker контейнер запущен: `docker ps | grep rosebotanique`
- Проверь логи контейнера: `docker logs rosebotanique`
- Проверь, что порт 3000 доступен: `curl http://localhost:3000`

### Проблема: DNS не работает
- Подожди до 24 часов для распространения DNS
- Проверь DNS через разные сервисы: https://dnschecker.org/

---

## Готово! 🎉

После выполнения всех шагов сайт будет доступен по адресу:
- **HTTP**: http://rosebotanique.store
- **HTTPS**: https://rosebotanique.store (после настройки SSL)

