# Обновление кода на сервере

## Быстрое обновление (если контейнер уже настроен)

```bash
# 1. Подключиться к серверу
ssh root@176.57.213.174

# 2. Перейти в директорию проекта
cd /opt/rosebotanique

# 3. Обновить код из Git
git pull

# 4. Перезапустить контейнер (применяет изменения)
docker restart rosebotanique

# 5. Проверить логи (опционально)
docker logs rosebotanique --tail 50
```

## Полное обновление (если нужно пересобрать образ)

```bash
# 1. Подключиться к серверу
ssh root@176.57.213.174

# 2. Перейти в директорию проекта
cd /opt/rosebotanique

# 3. Обновить код из Git
git pull

# 4. Остановить и удалить старый контейнер
docker stop rosebotanique
docker rm rosebotanique

# 5. Пересобрать образ
docker build -t rosebotanique:prod .

# 6. Запустить новый контейнер с переменными окружения
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

# 7. Проверить статус контейнера
docker ps | grep rosebotanique

# 8. Проверить логи
docker logs rosebotanique --tail 50
```

## Проверка после обновления

```bash
# Проверить переменные Telegram в контейнере
docker exec rosebotanique env | grep TELEGRAM

# Проверить логи Telegram
docker logs rosebotanique --tail 100 | grep Telegram

# Проверить, что сайт работает
curl -I http://localhost:3000
```

## Если что-то пошло не так

```bash
# Посмотреть логи ошибок
docker logs rosebotanique --tail 100

# Перезапустить контейнер
docker restart rosebotanique

# Если контейнер не запускается, проверить образ
docker images | grep rosebotanique
```

