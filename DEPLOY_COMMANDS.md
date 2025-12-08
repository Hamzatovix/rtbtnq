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
  rosebotanique:prod
```

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
  rosebotanique:prod && \
docker ps | grep rosebotanique
```

