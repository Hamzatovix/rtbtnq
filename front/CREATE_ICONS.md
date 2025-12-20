# Создание иконок для iOS и Android из icon-source.PNG

## Быстрый способ

В проекте уже есть скрипт `generate-icons.mjs`, который создает все нужные иконки из `icon-source.PNG`.

### Запуск скрипта:

1. Откройте терминал в папке `front`
2. Запустите команду:

```bash
node scripts/generate-icons.mjs
```

### Что будет создано:

- ✅ `apple-touch-icon.png` (180x180 для iOS)
- ✅ `android-chrome-192x192.png` (для Android PWA)
- ✅ `android-chrome-512x512.png` (для Android PWA высокого разрешения)
- ✅ `icon-192x192.png` (для обратной совместимости)
- ✅ `icon-512x512.png` (для обратной совместимости)

### Альтернативный способ (если скрипт не работает):

Можно использовать онлайн-конвертеры:
1. https://realfavicongenerator.net/ - загрузите `icon-source.PNG` и скачайте готовые иконки
2. https://www.pwabuilder.com/imageGenerator - для PWA иконок

### Проверка результата:

После создания иконок проверьте:
1. Файлы должны быть в `front/public/`
2. При добавлении сайта на главный экран iOS/Android должны использоваться новые иконки

