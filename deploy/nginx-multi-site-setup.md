# Настройка Nginx для двух сайтов на одном сервере

## Проблема
Порт 80 занят другим проектом, но оба сайта должны работать одновременно.

## Решение: Виртуальные хосты Nginx

Nginx может обрабатывать несколько доменов на одном порту 80, маршрутизируя запросы по `server_name`.

---

## Шаг 1: Проверка текущей ситуации

На сервере выполни:

```bash
# 1. Найди, что занимает порт 80
netstat -tulpn | grep :80
# или
ss -tulpn | grep :80

# 2. Проверь существующие конфигурации Nginx
ls -la /etc/nginx/sites-enabled/
ls -la /etc/nginx/sites-available/

# 3. Проверь, запущен ли Nginx
systemctl status nginx

# 4. Проверь Docker контейнеры
docker ps
```

---

## Шаг 2: Настройка Nginx для обоих сайтов

### Вариант A: Если Nginx уже работает (рекомендуется)

Если Nginx уже запущен и обслуживает первый проект, просто добавь конфигурацию для второго:

```bash
# Конфигурация уже создана в /etc/nginx/sites-available/rosebotanique.store
# Просто перезагрузи Nginx
systemctl reload nginx
```

### Вариант B: Если порт 80 занят Docker или другим процессом

Нужно остановить процесс, который занимает порт 80, и запустить Nginx как основной прокси:

```bash
# 1. Найди процесс на порту 80
lsof -i :80
# или
fuser 80/tcp

# 2. Если это Docker контейнер, останови его
docker ps | grep :80
docker stop <container_id>

# 3. Или если это другой веб-сервер, останови его
systemctl stop apache2  # если Apache
# или другой сервис

# 4. Запусти Nginx
systemctl start nginx
```

---

## Шаг 3: Настройка конфигураций для обоих доменов

### 3.1. Проверь конфигурацию первого проекта

```bash
# Посмотри, какие домены уже настроены
cat /etc/nginx/sites-enabled/*
```

### 3.2. Убедись, что конфигурация для rosebotanique.store правильная

Конфигурация уже создана в `/etc/nginx/sites-available/rosebotanique.store`.

Проверь, что она активирована:
```bash
ls -la /etc/nginx/sites-enabled/ | grep rosebotanique
```

### 3.3. Пример конфигурации для первого проекта (если нужно)

Если у первого проекта нет конфигурации Nginx, создай её:

```bash
# Замени example.com на реальный домен первого проекта
cat > /etc/nginx/sites-available/first-project << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;  # ЗАМЕНИ НА РЕАЛЬНЫЙ ДОМЕН

    access_log /var/log/nginx/first-project-access.log;
    error_log /var/log/nginx/first-project-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8080;  # ЗАМЕНИ НА РЕАЛЬНЫЙ ПОРТ ПЕРВОГО ПРОЕКТА
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Активируй
ln -s /etc/nginx/sites-available/first-project /etc/nginx/sites-enabled/
```

---

## Шаг 4: Проверка и запуск

```bash
# 1. Проверь конфигурацию на ошибки
nginx -t

# 2. Если всё ОК, перезагрузи Nginx
systemctl reload nginx

# 3. Проверь статус
systemctl status nginx

# 4. Проверь, что оба сайта работают
curl -H "Host: rosebotanique.store" http://localhost
curl -H "Host: example.com" http://localhost  # замени на реальный домен
```

---

## Шаг 5: Настройка DNS

Убедись, что оба домена указывают на IP сервера `176.57.213.174`:

1. **Первый проект**: A-запись домена → `176.57.213.174`
2. **rosebotanique.store**: A-запись → `176.57.213.174`

---

## Как это работает

Nginx слушает порт 80 и маршрутизирует запросы по заголовку `Host`:

- Запрос к `rosebotanique.store` → проксируется на `localhost:3000`
- Запрос к другому домену → проксируется на соответствующий порт

Оба сайта работают на одном порту 80, но на разных доменах.

---

## Устранение проблем

### Проблема: Nginx не запускается
```bash
# Проверь логи
journalctl -xeu nginx.service
tail -f /var/log/nginx/error.log
```

### Проблема: Один из сайтов не работает
```bash
# Проверь конфигурацию
nginx -t

# Проверь логи конкретного сайта
tail -f /var/log/nginx/rosebotanique-error.log
tail -f /var/log/nginx/first-project-error.log
```

### Проблема: 502 Bad Gateway
- Убедись, что приложения запущены на нужных портах
- Проверь, что порты доступны: `netstat -tulpn | grep :3000`

