# Настройка чистого URL: https://rosebotanique.store

## Цель
Сайт должен быть доступен по `https://rosebotanique.store` без порта в URL.

## Что нужно сделать

1. **Остановить docker-proxy на порту 80** (первый проект)
2. **Запустить Nginx на порту 80** как основной прокси
3. **Настроить Nginx для обоих доменов** (виртуальные хосты)
4. **Настроить SSL сертификат** (Let's Encrypt) для HTTPS
5. **Переключить первый проект на другой порт** (например, 8080)

---

## Шаг 1: Найди контейнер первого проекта

```bash
# Найди контейнер, который использует порт 80
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep 80

# Или
docker ps | grep :80
```

Запиши имя контейнера (например, `first-project`).

---

## Шаг 2: Узнай, как запущен первый проект

```bash
# Проверь docker-compose файлы
find /opt -name "docker-compose.yml" -o -name "compose.yml" 2>/dev/null

# Проверь systemd сервисы
systemctl list-units | grep docker

# Проверь, как запущен контейнер
docker inspect <имя-контейнера> | grep -A 10 "Ports"
```

**Важно:** Нужно знать команду запуска первого проекта, чтобы переключить его на другой порт.

---

## Шаг 3: Останови контейнер первого проекта

```bash
# Останови контейнер
docker stop <имя-контейнера>

# Проверь, что порт 80 свободен
ss -tulpn | grep :80
```

---

## Шаг 4: Запусти контейнер первого проекта на порту 8080

**Вариант A: Если используется docker run**

```bash
# Узнай команду запуска
docker inspect <имя-контейнера> | grep -A 20 "Config"

# Запусти с новым портом (пример)
docker run -d \
  --name <имя-контейнера> \
  -p 8080:80 \  # Изменил с 80:80 на 8080:80
  <образ>
```

**Вариант B: Если используется docker-compose**

```bash
# Найди docker-compose.yml
find /opt -name "docker-compose.yml" 2>/dev/null

# Отредактируй файл
nano /path/to/docker-compose.yml
```

Измени порт:
```yaml
services:
  app:
    ports:
      - "8080:80"  # Было "80:80", стало "8080:80"
```

Затем:
```bash
cd /path/to/docker-compose
docker-compose up -d
```

---

## Шаг 5: Настрой Nginx для обоих доменов

### 5.1. Конфигурация для первого проекта

```bash
# Создай конфигурацию (замени <домен-первого-проекта> на реальный домен)
cat > /etc/nginx/sites-available/first-project << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name <домен-первого-проекта> www.<домен-первого-проекта>;  # ЗАМЕНИ!

    access_log /var/log/nginx/first-project-access.log;
    error_log /var/log/nginx/first-project-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8080;  # Порт, на котором теперь работает первый проект
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Активируй
ln -s /etc/nginx/sites-available/first-project /etc/nginx/sites-enabled/
```

### 5.2. Конфигурация для rosebotanique.store

```bash
# Обнови конфигурацию на порт 80
cat > /etc/nginx/sites-available/rosebotanique.store << 'EOF'
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
}
EOF

# Активируй
ln -sf /etc/nginx/sites-available/rosebotanique.store /etc/nginx/sites-enabled/
```

### 5.3. Проверь и запусти Nginx

```bash
# Проверь конфигурацию
nginx -t

# Запусти Nginx
systemctl start nginx

# Проверь статус
systemctl status nginx
```

---

## Шаг 6: Настрой SSL (HTTPS) с Let's Encrypt

```bash
# Установи Certbot (если ещё не установлен)
apt update
apt install certbot python3-certbot-nginx -y

# Получи SSL сертификат для rosebotanique.store
certbot --nginx -d rosebotanique.store -d www.rosebotanique.store

# Получи SSL сертификат для первого проекта (если нужно)
certbot --nginx -d <домен-первого-проекта> -d www.<домен-первого-проекта>
```

Certbot автоматически:
- Получит сертификат от Let's Encrypt
- Обновит конфигурацию Nginx для HTTPS
- Настроит автоматическое обновление сертификата

---

## Шаг 7: Обнови переменную окружения

```bash
cd /opt/rosebotanique

# Отредактируй .env.production
nano front/.env.production
```

Измени:
```env
NEXT_PUBLIC_BASE_URL=https://rosebotanique.store
```

Перезапусти контейнер:
```bash
docker restart rosebotanique
```

---

## Шаг 8: Проверка

```bash
# Проверь HTTP
curl -I http://rosebotanique.store

# Проверь HTTPS
curl -I https://rosebotanique.store

# Открой в браузере:
# https://rosebotanique.store
```

---

## Важно

- **Первый проект будет работать через Nginx** на порту 80/443
- **Оба сайта будут доступны по чистым URL** без портов
- **SSL сертификаты будут автоматически обновляться**

---

## Если что-то пошло не так

### Откат изменений

```bash
# Останови Nginx
systemctl stop nginx

# Запусти первый проект обратно на порту 80
# (используй оригинальную команду запуска)
```

---

## Что нужно знать для начала

Выполни на сервере и пришли вывод:

```bash
# 1. Найди контейнер первого проекта
docker ps | grep :80

# 2. Проверь docker-compose файлы
find /opt -name "docker-compose.yml" -o -name "compose.yml" 2>/dev/null

# 3. Проверь systemd сервисы
systemctl list-units | grep docker
```

С этой информацией я помогу настроить всё правильно.

