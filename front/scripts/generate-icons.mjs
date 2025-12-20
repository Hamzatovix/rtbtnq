/**
 * Скрипт для генерации всех иконок из icon-source.png
 * 
 * Требования:
 * - Node.js 18+
 * - sharp (уже в devDependencies)
 * 
 * Запуск:
 * npm run icons:generate
 * или
 * node scripts/generate-icons.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Проверяем наличие sharp
if (!sharp) {
  console.error('❌ Ошибка: библиотека "sharp" не установлена.')
  console.log('\n📦 Установите зависимости:')
  console.log('   npm install sharp')
  process.exit(1)
}

// Определяем пути относительно скрипта
const publicPath = path.join(__dirname, '../public')
const defaultSourcePath = path.join(publicPath, 'icon-source.PNG')

// Альтернативные имена файла (на случай разных регистров)
const alternativeNames = ['icon-source.PNG', 'icon-source.png', 'icon-source.jpg', 'icon-source.jpeg']

// Ищем исходный файл (проверяем разные варианты имени)
let sourcePath = defaultSourcePath
if (!fs.existsSync(sourcePath)) {
  // Пробуем найти файл с другим регистром
  const files = fs.readdirSync(publicPath)
  const found = files.find(f => alternativeNames.some(name => f.toLowerCase() === name.toLowerCase()))
  if (found) {
    sourcePath = path.join(publicPath, found)
    console.log(`ℹ️  Найден файл с другим регистром: ${found}`)
  }
}

// Проверяем наличие исходного файла
if (!fs.existsSync(sourcePath)) {
  console.error(`❌ Файл не найден: ${defaultSourcePath}`)
  console.log(`\n💡 Проверяемые пути:`)
  alternativeNames.forEach(name => console.log(`   - ${path.join(publicPath, name)}`))
  console.log('\n💡 Убедитесь, что файл icon-source.PNG находится в front/public/')
  process.exit(1)
}

console.log('🎨 Генерация иконок из исходного файла...')
console.log(`📁 Исходный файл: ${sourcePath}`)

/**
 * Обрезает белые поля и добавляет безопасную зону
 */
async function prepareImage(inputBuffer, targetSize, safeAreaPercent = 0.55) {
  // Сначала обрезаем белые поля (trim), чтобы цветок занимал максимум места
  const trimmed = await sharp(inputBuffer)
    .trim({
      threshold: 10, // Порог для определения "белого"
    })
    .toBuffer()

  // Вычисляем размер изображения с учетом safe-area
  // safeAreaPercent определяет, какую часть занимает само изображение (55% изображение + 45% padding)
  const imageSize = Math.floor(targetSize * safeAreaPercent)
  
  // Масштабируем обрезанное изображение до нужного размера с сохранением пропорций
  const resized = await sharp(trimmed)
    .resize(imageSize, imageSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон
    })
    .toBuffer()

  // Добавляем padding (безопасную зону) вокруг изображения
  const padding = Math.floor((targetSize - imageSize) / 2)
  
  const final = await sharp(resized)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон
    })
    .png()
    .toBuffer()

  return final
}

/**
 * Создает favicon.ico с несколькими размерами внутри
 */
async function createFaviconIco(sizes) {
  // Для простоты создаем ICO как PNG (большинство браузеров поддерживают)
  // Для полноценного ICO нужна библиотека to-ico, но PNG работает в большинстве случаев
  // Используем 32x32 как оптимальный размер для favicon.ico (Google и Яндекс предпочитают этот размер)
  const sourceBuffer = fs.readFileSync(sourcePath)
  const icoBuffer = await prepareImage(sourceBuffer, 32, 0.55) // 55% изображение + 45% padding
  
  return icoBuffer
}

async function generateIcons() {
  try {
    const sourceBuffer = fs.readFileSync(sourcePath)
    
    console.log('\n📦 Подготовка изображения (trim + масштабирование с safe-area 55%)...')
    
    // Размеры для favicon (используем 55% изображение + 45% padding для всех размеров)
    const faviconSizes = [
      { size: 16, name: 'favicon-16x16.png', desc: '16x16 для старых браузеров', safeArea: 0.55 },
      { size: 32, name: 'favicon-32x32.png', desc: '32x32 для стандартных браузеров и поисковых систем', safeArea: 0.55 },
      { size: 48, name: 'favicon-48x48.png', desc: '48x48 для Windows', safeArea: 0.55 },
    ]

    console.log('\n📦 Создание favicon файлов...')
    
    // Генерируем PNG favicon файлы
    for (const { size, name, desc, safeArea } of faviconSizes) {
      const buffer = await prepareImage(sourceBuffer, size, safeArea)
      fs.writeFileSync(path.join(publicPath, name), buffer)
      console.log(`✅ ${name} создан (${desc})`)
    }

    // Создаем favicon.ico (используем 32x32 как оптимальный размер для Google и Яндекс)
    console.log('\n📦 Создание favicon.ico для Google и Яндекс...')
    const icoBuffer = await createFaviconIco([16, 32, 48])
    fs.writeFileSync(path.join(publicPath, 'favicon.ico'), icoBuffer)
    console.log('✅ favicon.ico создан (32x32, 55% изображение + 45% padding)')

    // Apple Touch Icon (180x180)
    console.log('\n📦 Создание apple-touch-icon.png (180x180 для iOS)...')
    const appleIcon = await prepareImage(sourceBuffer, 180, 0.55)
    fs.writeFileSync(path.join(publicPath, 'apple-touch-icon.png'), appleIcon)
    console.log('✅ apple-touch-icon.png создан (180x180, 55% изображение + 45% padding)')

    // Android PWA иконки
    console.log('\n📦 Создание иконок для Android PWA...')
    
    // 192x192 для Android (стандартный размер)
    const icon192 = await prepareImage(sourceBuffer, 192, 0.55)
    fs.writeFileSync(path.join(publicPath, 'android-chrome-192x192.png'), icon192)
    console.log('✅ android-chrome-192x192.png создан (для Android PWA, 55% изображение + 45% padding)')

    // 512x512 для Android (высокое разрешение)
    const icon512 = await prepareImage(sourceBuffer, 512, 0.55)
    fs.writeFileSync(path.join(publicPath, 'android-chrome-512x512.png'), icon512)
    console.log('✅ android-chrome-512x512.png создан (для Android PWA высокого разрешения, 55% изображение + 45% padding)')

    // Также создаем icon-192x192.png и icon-512x512.png для обратной совместимости
    fs.writeFileSync(path.join(publicPath, 'icon-192x192.png'), icon192)
    fs.writeFileSync(path.join(publicPath, 'icon-512x512.png'), icon512)
    console.log('✅ icon-192x192.png и icon-512x512.png созданы (для обратной совместимости)')

    // Создаем site.webmanifest
    console.log('\n📦 Создание site.webmanifest...')
    const manifest = {
      name: 'Rosebotanique - Сумки ручной работы',
      short_name: 'Rosebotanique',
      description: 'Откройте для себя коллекцию сумок ручной работы Rosebotanique',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#aeb6af',
      orientation: 'portrait-primary',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    }
    
    fs.writeFileSync(
      path.join(publicPath, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    )
    console.log('✅ site.webmanifest создан')

    console.log('\n✨ Готово! Все иконки созданы в front/public/')
    console.log('\n📋 Созданные файлы:')
    console.log('   - favicon.ico (содержит 16/32/48px)')
    console.log('   - favicon-16x16.png')
    console.log('   - favicon-32x32.png')
    console.log('   - favicon-48x48.png')
    console.log('   - apple-touch-icon.png (180x180 для iOS)')
    console.log('   - android-chrome-192x192.png (для Android PWA)')
    console.log('   - android-chrome-512x512.png (для Android PWA высокого разрешения)')
    console.log('   - icon-192x192.png (для обратной совместимости)')
    console.log('   - icon-512x512.png (для обратной совместимости)')
    console.log('   - site.webmanifest')
    console.log('\n💡 Следующие шаги:')
    console.log('   1. Обновите ссылки в front/src/app/layout.tsx')
    console.log('   2. Обновите ссылки в front/public/manifest.json')
    console.log('   3. Перезапустите Next.js сервер')
    console.log('   4. Очистите кеш браузера (Ctrl+Shift+Delete)')
    
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

generateIcons()

