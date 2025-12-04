# Исправление проблемы отображения изображений

## Проблема
Загруженные фото в товарах и галерее отображаются как placeholder.

## Причина
В production режиме Next.js может не отдавать файлы из `/public/uploads/`, загруженные в runtime, если они находятся в Docker volume.

## Решение
Создан API route `/uploads/[...path]/route.ts`, который отдаёт файлы напрямую из файловой системы.

## Что было исправлено

1. **Создан API route для отдачи файлов** (`front/src/app/uploads/[...path]/route.ts`)
   - Отдаёт файлы из `/public/uploads/`
   - Правильно определяет MIME типы
   - Устанавливает заголовки кеширования
   - Защищён от path traversal атак

2. **Улучшена проверка сохранения файлов** (`front/src/app/api/upload/image/route.ts`)
   - Проверка существования файла после сохранения
   - Логирование размера файла

## Проверка на сервере

После обновления проекта проверь:

```bash
# 1. Проверь, что файлы сохраняются
docker exec rosebotanique ls -la /app/public/uploads/products/ | head -10

# 2. Проверь доступность через API
curl -I http://localhost:3000/uploads/products/1764889248846-2DF7xmG2xK.jpg

# 3. Проверь логи загрузки
docker logs rosebotanique | grep "\[Upload\]"

# 4. Проверь, что volume настроен
docker inspect rosebotanique | grep -A 10 Mounts
```

## Ожидаемое поведение

1. При загрузке изображения:
   - Файл сохраняется в `/app/public/uploads/{folder}/{filename}`
   - Возвращается URL `/uploads/{folder}/{filename}`
   - В логах видно: `[Upload] Изображение сохранено: ...`

2. При отображении изображения:
   - Запрос идёт на `/uploads/{folder}/{filename}`
   - API route читает файл и отдаёт его с правильным MIME типом
   - Изображение отображается в браузере

## Если проблема остаётся

1. Проверь права доступа к файлам:
```bash
docker exec rosebotanique ls -la /app/public/uploads/products/
```

2. Проверь, что volume смонтирован:
```bash
docker inspect rosebotanique | grep -A 5 "Mounts"
```

3. Проверь логи ошибок:
```bash
docker logs rosebotanique 2>&1 | grep -i "error\|upload\|image"
```

4. Проверь доступность файла напрямую:
```bash
docker exec rosebotanique cat /app/public/uploads/products/1764889248846-2DF7xmG2xK.jpg | head -c 100
```

