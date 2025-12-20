# Команды для деплоя на сервер

## 🚀 Быстрые способы обновления

### Вариант 1: Использование готовых скриптов (рекомендуется)

#### На сервере (после SSH подключения):
```bash
# Полное обновление с пересборкой образа
cd /opt/rosebotanique
chmod +x DEPLOY_FULL.sh
./DEPLOY_FULL.sh

# Или быстрое обновление без пересборки
chmod +x DEPLOY_QUICK.sh
./DEPLOY_QUICK.sh
```

#### С Windows (PowerShell):
```powershell
# Полное обновление
.\deploy.ps1 full

# Быстрое обновление
.\deploy.ps1 quick
```

### Вариант 2: Ручное выполнение команд

## 1. Подключение к серверу по SSH
```bash
ssh root@176.57.213.174
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

