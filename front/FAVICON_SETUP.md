# Инструкция по настройке Favicon и Open Graph изображений

## Проблема
В Google поиске отображается черно-белый глобус вместо логотипа сайта.

## Что уже сделано
1. ✅ Добавлены `icons` в metadata (`layout.tsx`)
2. ✅ Создан `manifest.json` для PWA
3. ✅ Open Graph изображение настроено с абсолютным URL
4. ✅ Исправлен `baseUrl` на `rosebotanique.store`

## Что нужно сделать вручную

### 1. Создать favicon.ico
Нужно создать файл `favicon.ico` размером 16x16, 32x32 или 48x48 пикселей.

**Вариант 1: Использовать онлайн-конвертер**
1. Откройте `front/src/app/icon.svg` в браузере
2. Сделайте скриншот или экспортируйте как PNG
3. Используйте онлайн-конвертер: https://favicon.io/favicon-converter/
4. Загрузите PNG изображение
5. Скачайте `favicon.ico`
6. Поместите файл в `front/public/favicon.ico`

**Вариант 2: Использовать ImageMagick (если установлен)**
```bash
# Конвертировать SVG в PNG
convert -background none -resize 32x32 front/src/app/icon.svg front/public/favicon-32.png

# Создать ICO файл из PNG
convert front/public/favicon-32.png front/public/favicon.ico
```

### 2. Создать apple-touch-icon.png
Нужно создать файл `apple-touch-icon.png` размером 180x180 пикселей.

**Вариант 1: Использовать онлайн-конвертер**
1. Откройте `front/src/app/icon.svg` в браузере
2. Сделайте скриншот или экспортируйте как PNG
3. Используйте онлайн-редактор: https://www.iloveimg.com/resize-image
4. Измените размер до 180x180 пикселей
5. Сохраните как `apple-touch-icon.png`
6. Поместите файл в `front/public/apple-touch-icon.png`

**Вариант 2: Использовать ImageMagick**
```bash
convert -background none -resize 180x180 front/src/app/icon.svg front/public/apple-touch-icon.png
```

### 3. Проверить Open Graph изображение
Убедитесь, что файл `/images/about_h1.jpg.jpg` существует и доступен по URL:
- `https://rosebotanique.store/images/about_h1.jpg.jpg`

Если файл не существует, используйте другой существующий файл из `front/public/images/`:
- `about_h1.jpg.jpg`
- `about_h2.jpg.jpg`
- `about_m.png`
- `about_v1.jpg.jpg`
- `about_v2.jpg.jpg`

### 4. Проверить icon.svg
Next.js автоматически копирует `front/src/app/icon.svg` в `front/public/icon.svg`.
Убедитесь, что файл доступен по URL: `https://rosebotanique.store/icon.svg`

## Проверка после настройки

### 1. Проверить favicon локально
Откройте в браузере: `http://localhost:3000/favicon.ico`

### 2. Проверить Open Graph изображение
Используйте инструмент Facebook Sharing Debugger:
https://developers.facebook.com/tools/debug/

Введите URL: `https://rosebotanique.store`

### 3. Проверить в Google Search Console
1. Откройте Google Search Console
2. Используйте инструмент "Проверка URL"
3. Введите URL сайта
4. Проверьте, что изображение отображается правильно

### 4. Проверить в браузере
Откройте сайт и проверьте в DevTools (F12):
- Вкладка "Network" → найдите запросы к `/favicon.ico`, `/icon.svg`, `/apple-touch-icon.png`
- Вкладка "Elements" → найдите теги `<link rel="icon">` в `<head>`

## Альтернативное решение (если нет времени создавать файлы)

Можно временно использовать только SVG favicon, который уже есть:
- Next.js автоматически использует `icon.svg` как favicon
- Но для лучшей совместимости нужен `favicon.ico`

## Важно
После создания файлов нужно:
1. Перезапустить Next.js сервер
2. Очистить кеш браузера
3. Подождать несколько часов для обновления в Google (или использовать Google Search Console для принудительной переиндексации)

