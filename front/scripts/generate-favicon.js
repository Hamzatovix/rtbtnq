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
    
    // 1. Генерируем favicon.ico (512x512 для максимального размера и видимости)
    // Используем padding для избежания обрезки и видимых границ
    console.log('\n📦 Создание favicon.ico (512x512 для максимального размера в браузере)...')
    const favicon512ico = await sharp(svgBuffer)
      .resize(384, 384, { // Уменьшаем размер на 25% для добавления padding
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: 64,
        bottom: 64,
        left: 64,
        right: 64,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон с padding
      })
      .png()
      .toBuffer()
    
    // Конвертируем PNG в ICO (простой формат)
    // Для полноценного ICO нужна специальная библиотека, но PNG тоже работает
    // Используем максимальный размер для лучшей видимости в браузере
    fs.writeFileSync(path.join(publicPath, 'favicon.ico'), favicon512ico)
    console.log('✅ favicon.ico создан (512x512 PNG в формате ICO с белым фоном)')
    
    // 1.1. Создаем дополнительные размеры для разных браузеров
    console.log('\n📦 Создание дополнительных размеров favicon для разных браузеров...')
    
    // Размеры для разных браузеров и устройств
    // Используем padding для избежания обрезки и видимых границ
    const faviconSizes = [
      { size: 16, name: 'favicon-16x16.png', desc: '16x16 для старых браузеров', padding: 2 },
      { size: 32, name: 'favicon-32x32.png', desc: '32x32 для стандартных браузеров', padding: 4 },
      { size: 48, name: 'favicon-48x48.png', desc: '48x48 для Windows', padding: 6 },
      { size: 64, name: 'favicon-64x64.png', desc: '64x64 для высокого разрешения', padding: 8 },
      { size: 96, name: 'favicon-96x96.png', desc: '96x96 для Android', padding: 12 },
      { size: 128, name: 'favicon-128x128.png', desc: '128x128 для Chrome', padding: 16 },
      { size: 256, name: 'favicon-256x256.png', desc: '256x256 для высокого разрешения', padding: 32 },
    ]
    
    for (const { size, name, desc, padding } of faviconSizes) {
      const logoSize = size - (padding * 2) // Размер логотипа с учетом padding
      const faviconPng = await sharp(svgBuffer)
        .resize(logoSize, logoSize, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон с padding
        })
        .png()
        .toBuffer()
      
      fs.writeFileSync(path.join(publicPath, name), faviconPng)
      console.log(`✅ ${name} создан (${desc} с padding ${padding}px)`)
    }
    
    // 2. Генерируем apple-touch-icon.png (180x180 для iOS) с padding
    console.log('\n📦 Создание apple-touch-icon.png (180x180 для iOS)...')
    const appleIcon180 = await sharp(svgBuffer)
      .resize(140, 140, { // Уменьшаем на ~22% для padding
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон с padding
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'apple-touch-icon.png'), appleIcon180)
    console.log('✅ apple-touch-icon.png создан (180x180)')
    
    // 3. Генерируем иконки для Android PWA
    console.log('\n📦 Создание иконок для Android PWA...')
    
    // 192x192 для Android (стандартный размер) с padding
    const icon192 = await sharp(svgBuffer)
      .resize(144, 144, { // Уменьшаем на 25% для padding
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: 24,
        bottom: 24,
        left: 24,
        right: 24,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон с padding
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'icon-192x192.png'), icon192)
    console.log('✅ icon-192x192.png создан (для Android PWA с padding)')
    
    // 512x512 для Android (высокое разрешение) с padding
    const icon512 = await sharp(svgBuffer)
      .resize(384, 384, { // Уменьшаем на 25% для padding
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: 64,
        bottom: 64,
        left: 64,
        right: 64,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон с padding
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'icon-512x512.png'), icon512)
    console.log('✅ icon-512x512.png создан (для Android PWA высокого разрешения с padding)')
    
    // 4. Создаем оптимизированный SVG favicon
    console.log('\n📦 Создание оптимизированного favicon.svg...')
    
    // Читаем исходный SVG
    const svgContent = fs.readFileSync(logoPath, 'utf8')
    
    // Оптимизируем SVG: убираем лишние пробелы и переносы строк
    const optimizedSvg = svgContent
      .replace(/\s+/g, ' ') // Заменяем множественные пробелы на один
      .replace(/>\s+</g, '><') // Убираем пробелы между тегами
      .replace(/<!--[\s\S]*?-->/g, '') // Удаляем комментарии
      .trim()
    
    // Просто копируем оптимизированную версию (без добавления белого фона в SVG, 
    // так как браузеры могут использовать прозрачный фон)
    fs.writeFileSync(faviconSvgPath, optimizedSvg)
    console.log('✅ favicon.svg создан (оптимизированная версия)')
    
    console.log('\n✨ Готово! Все favicon файлы созданы в front/public/')
    console.log('\n📋 Созданные файлы:')
    console.log('   - favicon.svg (оптимизированный SVG для современных браузеров)')
    console.log('   - favicon.ico (512x512 для максимального размера в браузере с белым фоном)')
    console.log('   - favicon-16x16.png (16x16 для старых браузеров)')
    console.log('   - favicon-32x32.png (32x32 для стандартных браузеров)')
    console.log('   - favicon-48x48.png (48x48 для Windows)')
    console.log('   - favicon-64x64.png (64x64 для высокого разрешения)')
    console.log('   - favicon-96x96.png (96x96 для Android)')
    console.log('   - favicon-128x128.png (128x128 для Chrome)')
    console.log('   - favicon-256x256.png (256x256 для высокого разрешения)')
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
