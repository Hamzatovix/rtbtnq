# Решение: Nginx для двух сайтов, когда порт 80 занят Docker

## Текущая ситуация
- Порт 80 занят `docker-proxy` (первый проект)
- Второй проект (rosebotanique) работает на порту 3000
- Нужно, чтобы оба сайта работали на порту 80

---

## Вариант 1: Nginx как основной прокси (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Найди Docker контейнер первого проекта

```bash
# Найди контейнер, который использует порт 80
docker ps | grep :80
# или
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep 80
```

Запиши имя контейнера (например, `first-project`).

### Шаг 2: Останови контейнер первого проекта

```bash
# Останови контейнер
docker stop <имя-контейнера>

# Или найди по порту
docker ps --filter "publish=80" --format "{{.Names}}"
docker stop $(docker ps --filter "publish=80" --format "{{.Names}}")
```

### Шаг 3: Запусти контейнер первого проекта на другом порту

```bash
# Узнай, как запущен контейнер
docker inspect <имя-контейнера> | grep -A 10 "Ports"

# Запусти контейнер на порту 8080 вместо 80
# (нужно знать команду запуска, обычно это docker run или docker-compose)
# Пример:
docker start <имя-контейнера>
# Или если нужно изменить порт:
docker stop <имя-контейнера>
docker rm <имя-контейнера>
# Затем запусти с новым портом (нужна команда запуска)
```

**Важно:** Нужно знать, как запущен первый проект. Проверь:
```bash
# Если используется docker-compose
ls -la /opt/*/docker-compose.yml
ls -la /opt/*/compose.yml

# Или проверь systemd сервисы
systemctl list-units | grep docker
```

### Шаг 4: Настрой Nginx для обоих сайтов

```bash
# 1. Создай конфигурацию для первого проекта
# (нужно знать домен первого проекта и порт, на котором он теперь работает)
cat > /etc/nginx/sites-available/first-project << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name <домен-первого-проекта> www.<домен-первого-проекта>;  # ЗАМЕНИ!

    access_log /var/log/nginx/first-project-access.log;
    error_log /var/log/nginx/first-project-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:8080;  # ЗАМЕНИ НА РЕАЛЬНЫЙ ПОРТ!
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

# 2. Активируй конфигурацию
ln -s /etc/nginx/sites-available/first-project /etc/nginx/sites-enabled/

# 3. Конфигурация для rosebotanique уже создана, проверь:
ls -la /etc/nginx/sites-enabled/ | grep rosebotanique

# 4. Проверь конфигурацию
nginx -t

# 5. Запусти Nginx
systemctl start nginx

# 6. Проверь статус
systemctl status nginx
```

---

## Вариант 2: Второй сайт на другом порту (БЕЗ изменения первого проекта)

Если первый проект нельзя трогать, можно запустить второй сайт на порту 8080:

### Шаг 1: Обнови конфигурацию Nginx для второго сайта

```bash
cat > /etc/nginx/sites-available/rosebotanique.store << 'EOF'
server {
    listen 8080;  # Другой порт!
    listen [::]:8080;
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
ln -s /etc/nginx/sites-available/rosebotanique.store /etc/nginx/sites-enabled/

# Проверь и запусти
nginx -t
systemctl start nginx
```

**Недостаток:** Сайт будет доступен по `http://rosebotanique.store:8080` (с портом).

---

## Рекомендация

**Лучше использовать Вариант 1**, но для этого нужно:
1. Узнать, как запущен первый проект (docker run, docker-compose, systemd)
2. Изменить порт первого проекта с 80 на 8080
3. Настроить Nginx для обоих доменов

**Если первый проект нельзя трогать** → используй Вариант 2, но сайт будет на порту 8080.

---

## Что нужно узнать для Варианта 1

Выполни на сервере:

```bash
# 1. Найди контейнер первого проекта
docker ps | grep :80

# 2. Проверь, как он запущен
docker inspect <имя-контейнера> | grep -A 20 "Config"

# 3. Проверь docker-compose файлы
find /opt -name "docker-compose.yml" -o -name "compose.yml" 2>/dev/null

# 4. Проверь systemd сервисы для Docker
systemctl list-units | grep docker
ls -la /etc/systemd/system/*.service | grep docker
```

Пришли вывод этих команд, и я помогу настроить оба сайта правильно.

