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
    
    // 1. Генерируем favicon.ico (32x32)
    console.log('\n📦 Создание favicon.ico (32x32)...')
    const favicon32 = await sharp(svgBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 0 } // Прозрачный фон
      })
      .png()
      .toBuffer()
    
    // Конвертируем PNG в ICO (простой формат)
    // Для полноценного ICO нужна специальная библиотека, но PNG тоже работает
    fs.writeFileSync(path.join(publicPath, 'favicon.ico'), favicon32)
    console.log('✅ favicon.ico создан (32x32 PNG в формате ICO)')
    
    // 2. Генерируем apple-touch-icon.png (180x180)
    console.log('\n📦 Создание apple-touch-icon.png (180x180)...')
    const appleIcon = await sharp(svgBuffer)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 1 } // Белый фон для Apple
      })
      .png()
      .toBuffer()
    
    fs.writeFileSync(path.join(publicPath, 'apple-touch-icon.png'), appleIcon)
    console.log('✅ apple-touch-icon.png создан (180x180)')
    
    // 3. Также создаем дополнительные размеры для лучшей поддержки
    console.log('\n📦 Создание дополнительных размеров...')
    
    // 16x16 для старых браузеров
    const favicon16 = await sharp(svgBuffer)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 0 }
      })
      .png()
      .toBuffer()
    
    // 48x48 для лучшего качества
    const favicon48 = await sharp(svgBuffer)
      .resize(48, 48, {
        fit: 'contain',
        background: { r: 245, g: 245, b: 240, alpha: 0 }
      })
      .png()
      .toBuffer()
    
    console.log('✅ Дополнительные размеры созданы')
    
    // Копируем logo_day.svg как favicon.svg для использования в браузере
    console.log('\n📦 Создание favicon.svg из логотипа...')
    fs.copyFileSync(logoPath, faviconSvgPath)
    console.log('✅ favicon.svg создан (копия logo_day.svg)')
    
    console.log('\n✨ Готово! Все favicon файлы созданы в front/public/')
    console.log('\n📋 Созданные файлы:')
    console.log('   - favicon.svg (SVG для современных браузеров)')
    console.log('   - favicon.ico (32x32 для старых браузеров)')
    console.log('   - apple-touch-icon.png (180x180 для iOS)')
    console.log('\n💡 Совет: Перезапустите Next.js сервер для применения изменений')
    
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

