# Команды для деплоя на сервер

## 1. Подключение к серверу по SSH
```bash
ssh root@your-server-ip
```

## 2. Переход в директорию проекта
```bash
cd /opt/rosebotanique
```

## 3. Получение последних изменений из Git
```bash
git pull
```

## 4. Остановка и удаление старого контейнера
```bash
docker stop rosebotanique
docker rm rosebotanique
```

## 5. Пересборка Docker образа
```bash
docker build -t rosebotanique:prod .
```

## 6. Запуск нового контейнера
```bash
docker run -d \
  --name rosebotanique \
  --network shtraf_default \
  -p 3000:3000 \
  --restart unless-stopped \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  --env-file front/.env.production \
  rosebotanique:prod
```

**Важно:** Убедитесь, что файл `front/.env.production` существует и содержит необходимые переменные окружения:
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `TELEGRAM_CHAT_ID` - Chat ID для уведомлений
- `NEXT_PUBLIC_BASE_URL` - базовый URL сайта

## 7. Проверка статуса контейнера
```bash
docker ps | grep rosebotanique
```

## 8. Просмотр логов (опционально)
```bash
docker logs --tail 50 rosebotanique
```

---

## Все команды одной строкой (после SSH подключения):
```bash
cd /opt/rosebotanique && \
git pull && \
docker stop rosebotanique && \
docker rm rosebotanique && \
docker build -t rosebotanique:prod . && \
docker run -d \
  --name rosebotanique \
  --network shtraf_default \
  -p 3000:3000 \
  --restart unless-stopped \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  --env-file front/.env.production \
  rosebotanique:prod && \
docker ps | grep rosebotanique
```

