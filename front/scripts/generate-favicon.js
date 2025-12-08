/**
 * Скрипт для генерации favicon.ico и apple-touch-icon.png из logo_day.svg
 * 
 * Требования:
 * - Node.js 18+
 * - Установить зависимости: npm install sharp
 * 
 * Запуск:
 * node scripts/generate-favicon.js
 */

const fs = require('fs')
const path = require('path')

// Проверяем наличие sharp
let sharp
try {
  sharp = require('sharp')
} catch (e) {
  console.error('❌ Ошибка: библиотека "sharp" не установлена.')
  console.log('\n📦 Установите зависимости:')
  console.log('   npm install sharp')
  console.log('\nИли используйте онлайн-конвертер:')
  console.log('   1. Откройте front/public/logo/logo_day.svg в браузере')
  console.log('   2. Используйте https://favicon.io/favicon-converter/ для favicon.ico')
  console.log('   3. Используйте https://www.iloveimg.com/resize-image для apple-touch-icon.png (180x180)')
  process.exit(1)
}

const logoPath = path.join(__dirname, '../public/logo/logo_day.svg')
const publicPath = path.join(__dirname, '../public')

// Также копируем logo_day.svg как favicon.svg для использования в браузере
const faviconSvgPath = path.join(publicPath, 'favicon.svg')

// Проверяем наличие исходного файла
if (!fs.existsSync(logoPath)) {
  console.error(`❌ Файл не найден: ${logoPath}`)
  process.exit(1)
}

console.log('🎨 Генерация favicon из логотипа...')
console.log(`📁 Исходный файл: ${logoPath}`)

async function generateFavicons() {
  try {
    // Читаем SVG
    const svgBuffer = fs.readFileSync(logoPath)
    
    // 1. Генерируем favicon.ico (128x128 для лучшей видимости в Chrome)
    console.log('\n📦 Создание favicon.ico (128x128 для лучшей видимости в Chrome)...')
    const favicon128 = await sharp(svgBuffer)
      .resize(128, 128, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 0 } // Прозрачный фон
      })
      .png()
      .toBuffer()
    
    // Конвертируем PNG в ICO (простой формат)
    // Для полноценного ICO нужна специальная библиотека, но PNG тоже работает
    fs.writeFileSync(path.join(publicPath, 'favicon.ico'), favicon128)
    console.log('✅ favicon.ico создан (128x128 PNG в формате ICO)')
    
    // 1.1. Создаем дополнительные размеры для лучшей видимости в Chrome
    console.log('\n📦 Создание дополнительных размеров favicon для Chrome...')
    
    // 128x128 для Chrome (стандартный размер)
    const favicon128png = await sharp(svgBuffer)
      .resize(128, 128, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 0 }
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'favicon-128x128.png'), favicon128png)
    console.log('✅ favicon-128x128.png создан')
    
    // 256x256 для Chrome (высокое разрешение)
    const favicon256 = await sharp(svgBuffer)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 0 }
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'favicon-256x256.png'), favicon256)
    console.log('✅ favicon-256x256.png создан')
    
    // 2. Генерируем apple-touch-icon.png (180x180 для iOS)
    console.log('\n📦 Создание apple-touch-icon.png (180x180 для iOS)...')
    const appleIcon180 = await sharp(svgBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 1 } // Белый фон для Apple
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'apple-touch-icon.png'), appleIcon180)
    console.log('✅ apple-touch-icon.png создан (180x180)')
    
    // 3. Генерируем иконки для Android PWA
    console.log('\n📦 Создание иконок для Android PWA...')
    
    // 192x192 для Android (стандартный размер)
    const icon192 = await sharp(svgBuffer)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 1 }
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'icon-192x192.png'), icon192)
    console.log('✅ icon-192x192.png создан (для Android PWA)')
    
    // 512x512 для Android (высокое разрешение)
    const icon512 = await sharp(svgBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 1 }
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'icon-512x512.png'), icon512)
    console.log('✅ icon-512x512.png создан (для Android PWA высокого разрешения)')
    
    // Копируем logo_day.svg как favicon.svg для использования в браузере
    // SVG масштабируется автоматически и будет выглядеть четко на любом размере
    console.log('\n📦 Создание favicon.svg из логотипа...')
    fs.copyFileSync(logoPath, faviconSvgPath)
    console.log('✅ favicon.svg создан (копия logo_day.svg - масштабируется автоматически)')
    
    console.log('\n✨ Готово! Все favicon файлы созданы в front/public/')
    console.log('\n📋 Созданные файлы:')
    console.log('   - favicon.svg (SVG для современных браузеров - масштабируется)')
    console.log('   - favicon.ico (128x128 для лучшей видимости в Chrome)')
    console.log('   - favicon-128x128.png (128x128 для Chrome)')
    console.log('   - favicon-256x256.png (256x256 для Chrome высокого разрешения)')
    console.log('   - apple-touch-icon.png (180x180 для iOS)')
    console.log('   - icon-192x192.png (для Android PWA)')
    console.log('   - icon-512x512.png (для Android PWA высокого разрешения)')
    console.log('\n💡 Совет: Перезапустите Next.js сервер для применения изменений')
    console.log('💡 Совет: Очистите кеш браузера (Ctrl+Shift+Delete) для обновления favicon')
    console.log('💡 Совет: На мобильных устройствах очистите кеш приложения или переустановите PWA')
    
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error.message)
    console.error('\n📝 Альтернативный способ:')
    console.log('   1. Откройте front/public/logo/logo_day.svg в браузере')
    console.log('   2. Сделайте скриншот или экспортируйте как PNG')
    console.log('   3. Используйте онлайн-конвертер:')
    console.log('      - https://favicon.io/favicon-converter/ (для favicon.ico)')
    console.log('      - https://www.iloveimg.com/resize-image (для apple-touch-icon.png)')
    process.exit(1)
  }
}

generateFavicons()
