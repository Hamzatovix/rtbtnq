# Настройка Telegram бота на сервере

## ❌ Проблема
Переменные окружения `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` не установлены в Docker контейнере.

## ✅ Решение

### Вариант 1: Создать файл .env.production на сервере (Рекомендуется)

1. **Подключитесь к серверу:**
```bash
ssh root@176.57.213.174
```

2. **Перейдите в директорию проекта:**
```bash
cd /opt/rosebotanique
```

3. **Создайте или отредактируйте файл `.env.production`:**
```bash
nano front/.env.production
```

4. **Добавьте переменные Telegram:**
```bash
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHAT_ID=ваш_chat_id
```

5. **Сохраните файл** (Ctrl+O, Enter, Ctrl+X)

6. **Пересоздайте контейнер с переменными окружения:**
```bash
docker stop rosebotanique
docker rm rosebotanique
docker build -t rosebotanique:prod .
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

7. **Проверьте переменные:**
```bash
docker exec rosebotanique env | grep TELEGRAM
```

Должны увидеть:
```
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

### Вариант 2: Добавить переменные напрямую при запуске

```bash
docker stop rosebotanique
docker rm rosebotanique
docker build -t rosebotanique:prod .
docker run -d \
  --name rosebotanique \
  --network shtraf_default \
  -p 3000:3000 \
  --restart unless-stopped \
  -v /opt/rosebotanique/front/prisma_data:/app/prisma_data \
  -v /opt/rosebotanique/front/src/data:/app/src/data \
  -v /opt/rosebotanique/front/public/uploads:/app/public/uploads \
  -e TELEGRAM_BOT_TOKEN=ваш_токен_бота \
  -e TELEGRAM_CHAT_ID=ваш_chat_id \
  rosebotanique:prod
```

## 🔑 Как получить токен и Chat ID

### 1. Получение токена бота:
1. Откройте Telegram
2. Найдите бота [@BotFather](https://t.me/BotFather)
3. Отправьте команду `/newbot`
4. Следуйте инструкциям
5. Скопируйте токен (формат: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Получение Chat ID:
1. Откройте Telegram
2. Найдите бота [@userinfobot](https://t.me/userinfobot)
3. Отправьте любое сообщение
4. Бот ответит с вашим Chat ID (формат: `123456789`)

Или используйте [@RawDataBot](https://t.me/RawDataBot) для получения полной информации.

## ✅ Проверка работы

После настройки:

1. **Проверьте переменные:**
```bash
docker exec rosebotanique env | grep TELEGRAM
```

2. **Создайте тестовый заказ** на сайте

3. **Проверьте логи:**
```bash
docker logs rosebotanique --tail 50 | grep Telegram
```

Должны увидеть:
```
[Telegram] Проверка конфигурации: { hasToken: true, hasChatId: true, ... }
[Telegram] Сообщение успешно отправлено в Telegram
```

4. **Проверьте Telegram** - должно прийти уведомление о заказе

## 📝 Пример файла .env.production

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789

# Другие переменные окружения...
NEXT_PUBLIC_BASE_URL=https://rosebotanique.store
```

## ⚠️ Важно

- Не коммитьте файл `.env.production` в Git (он должен быть в `.gitignore`)
- Храните токены в безопасности
- После изменения `.env.production` нужно пересоздать контейнер

