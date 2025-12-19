# Настройка SSL-сертификата для rosebotanique.store

## Шаг 1: Загрузить сертификат на сервер

У тебя должен быть два файла:
- **Сертификат** (обычно `.crt` или `.pem`) - содержит сертификат и цепочку
- **Приватный ключ** (обычно `.key` или `private.key`) - секретный ключ

### Вариант A: Если файлы на локальном компьютере

```bash
# На локальном компьютере (PowerShell)
# Скопируй файлы на сервер
scp путь/к/сертификату.crt root@176.57.213.174:/tmp/rosebotanique.crt
scp путь/к/ключу.key root@176.57.213.174:/tmp/rosebotanique.key
```

### Вариант B: Если файлы уже на сервере

Перемести их в нужную директорию (см. Шаг 2).

---

## Шаг 2: Подготовить директорию для сертификатов

```bash
# На сервере
mkdir -p /root/Shtraf/nginx/ssl/rosebotanique

# Скопируй сертификаты
# Если файлы в /tmp:
cp /tmp/rosebotanique.crt /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
cp /tmp/rosebotanique.key /root/Shtraf/nginx/ssl/rosebotanique/certificate.key

# Или если файлы уже есть, скопируй их:
# cp /путь/к/сертификату.crt /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
# cp /путь/к/ключу.key /root/Shtraf/nginx/ssl/rosebotanique/certificate.key

# Установи правильные права
chmod 644 /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
chmod 600 /root/Shtraf/nginx/ssl/rosebotanique/certificate.key

# Проверь, что файлы на месте
ls -la /root/Shtraf/nginx/ssl/rosebotanique/
```

---

## Шаг 3: Добавить монтирование в docker-compose.yml

```bash
# На сервере
cd /root/Shtraf
nano docker-compose.yml
```

**Найди секцию `volumes` для контейнера `nginx` и добавь:**

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

## Шаг 4: Раскомментировать SSL в nginx.conf

```bash
# На сервере
nano /root/Shtraf/nginx/nginx.conf
```

**Найди блок для `rosebotanique.store HTTPS` (около строки 995-1008) и раскомментируй SSL директивы:**

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

**Должно стать:**
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

## Шаг 5: Изменить HTTP блок на редирект на HTTPS

```bash
# На сервере
nano /root/Shtraf/nginx/nginx.conf
```

**Найди HTTP блок для `rosebotanique.store` (около строки 987-993) и измени:**

**Было:**
```nginx
# --- Rosebotanique.store HTTP ---
server {
    listen 80;
    listen [::]:80;
    server_name rosebotanique.store www.rosebotanique.store;
    
    location / {
        proxy_pass http://rosebotanique:3000;
        ...
    }
}
```

**Должно стать:**
```nginx
# --- Rosebotanique.store HTTP (редирект на HTTPS) ---
server {
    listen 80;
    listen [::]:80;
    server_name rosebotanique.store www.rosebotanique.store;
    return 301 https://$host$request_uri;
}
```

**Сохрани:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## Шаг 6: Перезапустить контейнер Nginx

```bash
# На сервере
cd /root/Shtraf

# Перезапустить контейнер (чтобы применить новые volumes)
docker-compose restart nginx

# Или если контейнер запущен не через docker-compose:
docker restart shtrafnett_nginx

# Проверить конфигурацию
docker exec shtrafnett_nginx nginx -t

# Если всё ОК, перезагрузить Nginx
docker exec shtrafnett_nginx nginx -s reload
```

---

## Шаг 7: Проверка

```bash
# На сервере
# Проверка HTTPS
curl -I https://rosebotanique.store -k

# Проверка редиректа с HTTP на HTTPS
curl -I http://rosebotanique.store

# Должен вернуть: HTTP/1.1 301 Moved Permanently
# Location: https://rosebotanique.store/
```

**В браузере:**
- Открой: `https://rosebotanique.store`
- Должен быть зелёный замочек 🔒

---

## Шаг 8: Обновить переменные окружения

```bash
# На сервере
cd /opt/rosebotanique
nano front/.env.production
```

**Измени:**
```env
NEXT_PUBLIC_BASE_URL=https://rosebotanique.store
```

**Сохрани и перезапусти контейнер:**
```bash
docker restart rosebotanique
```

---

## Важные моменты

1. **Формат сертификата:**
   - Если у тебя `.pem` файлы - переименуй их в `.crt` и `.key`
   - Если у тебя `.cer` или `.crt` - используй как есть
   - Если у тебя цепочка сертификатов - объедини их в один файл

2. **Цепочка сертификатов:**
   - Если у тебя отдельный файл с промежуточными сертификатами, объедини:
   ```bash
   cat сертификат.crt промежуточный.crt > /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt
   ```

3. **Проверка сертификата:**
   ```bash
   # Проверь содержимое сертификата
   openssl x509 -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt -text -noout
   
   # Проверь, что домен совпадает
   openssl x509 -in /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt -text -noout | grep "Subject:"
   ```

---

## Устранение проблем

### Проблема: "SSL certificate file not found"
- Проверь, что файлы существуют: `ls -la /root/Shtraf/nginx/ssl/rosebotanique/`
- Проверь, что volumes добавлены в docker-compose.yml
- Перезапусти контейнер: `docker restart shtrafnett_nginx`

### Проблема: "SSL certificate doesn't match domain"
- Проверь, что сертификат выдан для `rosebotanique.store` и `www.rosebotanique.store`
- Проверь содержимое: `openssl x509 -in certificate.crt -text -noout | grep "Subject:"`

### Проблема: "SSL certificate expired"
- Проверь срок действия: `openssl x509 -in certificate.crt -text -noout | grep "Not After"`
- Если истёк - нужно обновить сертификат

---

## Готово! 🎉

После выполнения всех шагов:
- ✅ HTTP редиректит на HTTPS
- ✅ HTTPS работает с SSL-сертификатом
- ✅ Сайт доступен по `https://rosebotanique.store`

