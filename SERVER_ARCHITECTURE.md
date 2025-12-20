# Архитектура сервера: Rose Botanique + Shtra проекты

## 📋 Общая структура

На сервере работают **два проекта одновременно**:
1. **Shtra проект** (shtraftest.ru) - основной проект
2. **Rose Botanique** (rosebotanique.store) - дополнительный проект

Оба проекта работают через **один Nginx контейнер**, который проксирует запросы на разные Docker контейнеры.

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    Интернет (80/443)                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│         Nginx контейнер (shtrafnett_nginx)              │
│  - Порт 80 (HTTP)                                       │
│  - Порт 443 (HTTPS)                                     │
│  - Конфиг: /root/Shtraf/nginx/nginx.conf               │
│                                                          │
│  Маршрутизация по доменам:                              │
│  ├─ shtraftest.ru → Shtra проект                        │
│  └─ rosebotanique.store → Rose Botanique               │
└───────────────┬──────────────────────┬──────────────────┘
                │                      │
                ▼                      ▼
    ┌───────────────────┐   ┌──────────────────────┐
    │  Shtra проект     │   │  Rose Botanique      │
    │  (контейнеры)     │   │  (контейнер)         │
    │                    │   │  - Имя: rosebotanique│
    │                    │   │  - Порт: 3000        │
    │                    │   │  - Сеть: shtraf_... │
    └────────────────────┘   └──────────────────────┘
```

---

## 🔧 Компоненты системы

### 1. Docker сеть

**Сеть:** `shtraf_default` (или `shtraf_*`)

Все контейнеры подключены к одной Docker сети для взаимодействия:

```bash
# Проверить сеть
docker network ls | grep shtraf

# Проверить контейнеры в сети
docker network inspect shtraf_default
```

**Контейнеры в сети:**
- `shtrafnett_nginx` - Nginx прокси
- `rosebotanique` - Rose Botanique приложение
- Контейнеры Shtra проекта

---

### 2. Nginx контейнер (shtrafnett_nginx)

**Назначение:** Единая точка входа для обоих проектов

**Порты:**
- `80` - HTTP (редирект на HTTPS)
- `443` - HTTPS

**Конфигурация:**
- Файл: `/root/Shtraf/nginx/nginx.conf` (на хосте)
- Монтируется в: `/etc/nginx/conf.d/default.conf` (в контейнере)

**Volumes (тома):**
```bash
# Конфигурация Nginx
-v /root/Shtraf/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro

# SSL сертификаты для Shtra
-v /root/Shtraf/nginx/certificate.crt:/etc/ssl/certs/shtraftest.ru.crt:ro
-v /root/Shtraf/nginx/certificate.key:/etc/ssl/private/shtraftest.ru.key:ro

# SSL сертификаты для Rose Botanique
-v /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt:/etc/ssl/certs/rosebotanique.store.crt:ro
-v /root/Shtraf/nginx/ssl/rosebotanique/certificate.key:/etc/ssl/private/rosebotanique.store.key:ro

# Volumes для Shtra проекта
-v shtraf_frontend_dist:/var/www/frontend:rw
-v shtraf_static_volume:/app/productionfiles:rw
-v shtraf_media_volume:/app/media:rw
```

**Команда запуска:**
```bash
docker run -d \
  --name shtrafnett_nginx \
  --network shtraf_default \
  -p 80:80 -p 443:443 \
  -v /root/Shtraf/nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /root/Shtraf/nginx/certificate.crt:/etc/ssl/certs/shtraftest.ru.crt:ro \
  -v /root/Shtraf/nginx/certificate.key:/etc/ssl/private/shtraftest.ru.key:ro \
  -v /root/Shtraf/nginx/ssl/rosebotanique/certificate.crt:/etc/ssl/certs/rosebotanique.store.crt:ro \
  -v /root/Shtraf/nginx/ssl/rosebotanique/certificate.key:/etc/ssl/private/rosebotanique.store.key:ro \
  -v shtraf_frontend_dist:/var/www/frontend:rw \
  -v shtraf_static_volume:/app/productionfiles:rw \
  -v shtraf_media_volume:/app/media:rw \
  nginx:1.25-alpine
```

---

### 3. Rose Botanique контейнер

**Имя:** `rosebotanique`

**Порт:** `3000` (внутренний, не публикуется наружу)

**Сеть:** Подключен к `shtraf_default` для доступа из Nginx

**Volumes (тома):**
```bash
# База данных SQLite
-v /opt/rosebotanique/front/prisma_data:/app/prisma_data

# JSON файлы данных (категории, цвета)
-v /opt/rosebotanique/front/src/data:/app/src/data

# Загруженные изображения
-v /opt/rosebotanique/front/public/uploads:/app/public/uploads
```

**Переменные окружения:**
- Файл: `front/.env.production`
- Монтируется через `--env-file`

**Команда запуска:**
```bash
docker run -d \
  --name rosebotanique \
  --network shtraf_default \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  --env-file front/.env.production \
  rosebotanique:prod
```

**Важно:** Порт 3000 публикуется (`-p 3000:3000`), но это не обязательно, так как Nginx обращается к контейнеру по имени через Docker сеть.

---

## 🌐 Маршрутизация запросов

### Nginx конфигурация (`/root/Shtraf/nginx/nginx.conf`)

Nginx определяет, какой проект обслуживать, по заголовку `Host`:

```nginx
# Для shtraftest.ru
server {
    listen 443 ssl;
    server_name shtraftest.ru www.shtraftest.ru;
    
    ssl_certificate /etc/ssl/certs/shtraftest.ru.crt;
    ssl_certificate_key /etc/ssl/private/shtraftest.ru.key;
    
    # Проксирование на Shtra проект
    location / {
        proxy_pass http://shtra-backend:8000;  # или другой контейнер
        # ...
    }
}

# Для rosebotanique.store
server {
    listen 443 ssl;
    server_name rosebotanique.store www.rosebotanique.store;
    
    ssl_certificate /etc/ssl/certs/rosebotanique.store.crt;
    ssl_certificate_key /etc/ssl/private/rosebotanique.store.key;
    
    # Проксирование на Rose Botanique
    location / {
        proxy_pass http://rosebotanique:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # ...
    }
}

# HTTP редирект на HTTPS
server {
    listen 80;
    server_name shtraftest.ru www.shtraftest.ru rosebotanique.store www.rosebotanique.store;
    
    return 301 https://$host$request_uri;
}
```

---

## 📁 Структура директорий на сервере

```
/opt/rosebotanique/          # Rose Botanique проект
├── front/                   # Исходники фронтенда
│   ├── prisma_data/         # SQLite база данных (volume)
│   ├── src/data/            # JSON файлы (volume)
│   ├── public/uploads/      # Загруженные изображения (volume)
│   └── .env.production      # Переменные окружения
├── Dockerfile               # Docker образ
└── deploy/                  # Скрипты развертывания

/root/Shtraf/                # Shtra проект
└── nginx/
    ├── nginx.conf           # Конфигурация Nginx
    ├── certificate.crt      # SSL для shtraftest.ru
    ├── certificate.key      # SSL ключ для shtraftest.ru
    └── ssl/
        └── rosebotanique/
            ├── certificate.crt  # SSL для rosebotanique.store
            └── certificate.key  # SSL ключ для rosebotanique.store
```

---

## 🔄 Процесс обновления Rose Botanique

### Автоматический скрипт (`deploy/update-project.sh`)

```bash
cd /opt/rosebotanique
./deploy/update-project.sh
```

**Что делает скрипт:**
1. Обновляет код из Git (`git pull`)
2. Останавливает старый контейнер (`docker stop rosebotanique`)
3. Удаляет старый контейнер (`docker rm rosebotanique`)
4. Собирает новый образ (`docker build`)
5. Запускает новый контейнер с volumes
6. Подключает к сети `shtraf_default`
7. Проверяет статус

### Ручное обновление

```bash
# 1. Перейти в директорию проекта
cd /opt/rosebotanique/front

# 2. Обновить код из Git
git pull origin main

# 3. Перейти в корневую директорию проекта
cd /opt/rosebotanique

# 4. Остановить и удалить старый контейнер
docker stop rosebotanique
docker rm rosebotanique

# 5. Пересобрать образ
docker build -t rosebotanique:prod .

# 6. Запустить новый контейнер
docker run -d \
  --name rosebotanique \
  --network shtraf_default \
  --restart unless-stopped \
  -p 3000:3000 \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  --env-file front/.env.production \
  rosebotanique:prod

# 7. Проверить статус
docker ps | grep rosebotanique
docker logs rosebotanique --tail 50
```

---

## 🔍 Проверка работы

### Проверить контейнеры

```bash
# Все контейнеры
docker ps

# Только Rose Botanique
docker ps | grep rosebotanique

# Только Nginx
docker ps | grep shtrafnett_nginx
```

### Проверить сеть

```bash
# Список сетей
docker network ls

# Детали сети
docker network inspect shtraf_default

# Проверить, подключен ли rosebotanique к сети
docker network inspect shtraf_default | grep rosebotanique
```

### Проверить логи

```bash
# Логи Rose Botanique
docker logs rosebotanique --tail 50

# Логи Nginx
docker logs shtrafnett_nginx --tail 50

# Логи в реальном времени
docker logs rosebotanique -f
```

### Проверить доступность

```bash
# Изнутри Nginx контейнера проверить доступность Rose Botanique
docker exec shtrafnett_nginx ping -c 1 rosebotanique

# Проверить HTTP ответ
curl -H "Host: rosebotanique.store" http://localhost
```

---

## 🛠️ Устранение проблем

### Проблема: Rose Botanique недоступен через Nginx

**Решение:**
1. Проверить, что контейнер запущен: `docker ps | grep rosebotanique`
2. Проверить, что контейнер в сети: `docker network inspect shtraf_default | grep rosebotanique`
3. Если не в сети, подключить: `docker network connect shtraf_default rosebotanique`
4. Проверить конфигурацию Nginx: `docker exec shtrafnett_nginx nginx -t`
5. Перезагрузить Nginx: `docker exec shtrafnett_nginx nginx -s reload`

### Проблема: Порт 3000 занят

**Решение:**
```bash
# Найти процесс на порту 3000
lsof -i :3000
# или
netstat -tulpn | grep :3000

# Остановить контейнер
docker stop rosebotanique
```

### Проблема: Контейнер не запускается

**Решение:**
```bash
# Проверить логи
docker logs rosebotanique

# Проверить образ
docker images | grep rosebotanique

# Пересобрать образ
docker build -t rosebotanique:prod .
```

---

## 📝 Важные моменты

1. **Одна сеть для всех:** Все контейнеры должны быть в одной Docker сети (`shtraf_default`)

2. **Nginx как единая точка входа:** Все запросы идут через Nginx, который маршрутизирует по доменам

3. **Volumes сохраняют данные:** База данных, изображения и JSON файлы хранятся на хосте через volumes

4. **SSL сертификаты:** Каждый домен имеет свой SSL сертификат, монтируемый в Nginx контейнер

5. **Автозапуск:** Контейнеры запускаются с флагом `--restart unless-stopped` для автоматического перезапуска

6. **Порты:** 
   - Nginx: 80, 443 (публичные)
   - Rose Botanique: 3000 (внутренний, через Docker сеть)

---

## 🚀 Добавление нового проекта

Чтобы добавить третий проект:

1. **Создать Docker контейнер** для нового проекта
2. **Подключить к сети** `shtraf_default`
3. **Добавить SSL сертификат** в `/root/Shtraf/nginx/ssl/newproject/`
4. **Добавить конфигурацию** в `/root/Shtraf/nginx/nginx.conf`:
   ```nginx
   server {
       listen 443 ssl;
       server_name newproject.com www.newproject.com;
       
       ssl_certificate /etc/ssl/certs/newproject.com.crt;
       ssl_certificate_key /etc/ssl/private/newproject.com.key;
       
       location / {
           proxy_pass http://newproject-container:port;
           # ...
       }
   }
   ```
5. **Монтировать SSL** в Nginx контейнер через volumes
6. **Перезагрузить Nginx**: `docker exec shtrafnett_nginx nginx -s reload`

---

## 📚 Полезные команды

```bash
# Статус всех контейнеров
docker ps -a

# Использование ресурсов
docker stats

# Информация о контейнере
docker inspect rosebotanique

# Войти в контейнер
docker exec -it rosebotanique sh

# Проверить конфигурацию Nginx
docker exec shtrafnett_nginx nginx -t

# Перезагрузить Nginx
docker exec shtrafnett_nginx nginx -s reload

# Просмотр логов Nginx на хосте
tail -f /var/log/nginx/rosebotanique-access.log
tail -f /var/log/nginx/rosebotanique-error.log
```

---

**Последнее обновление:** 2024

