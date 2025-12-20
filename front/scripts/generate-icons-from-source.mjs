/**
 * Скрипт для генерации иконок для iOS и Android из icon-source.PNG
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicPath = path.join(__dirname, '../public')
const sourcePath = path.join(publicPath, 'icon-source.PNG')

// Проверяем наличие исходного файла
if (!fs.existsSync(sourcePath)) {
  console.error(`❌ Файл не найден: ${sourcePath}`)
  console.log('\n💡 Убедитесь, что файл icon-source.PNG находится в front/public/')
  process.exit(1)
}

console.log('🎨 Генерация иконок для iOS и Android из icon-source.PNG...')
console.log(`📁 Исходный файл: ${sourcePath}`)

/**
 * Создает иконку нужного размера с безопасной зоной
 */
async function createIcon(size, safeAreaPercent = 0.55) {
  const sourceBuffer = fs.readFileSync(sourcePath)
  
  // Вычисляем размер изображения с учетом safe-area
  const imageSize = Math.floor(size * safeAreaPercent)
  
  // Масштабируем изображение до нужного размера с сохранением пропорций
  const resized = await sharp(sourceBuffer)
    .resize(imageSize, imageSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 } // Белый фон
    })
    .toBuffer()
  
  // Добавляем padding (безопасную зону) вокруг изображения
  const padding = Math.floor((size - imageSize) / 2)
  
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

async function generateIcons() {
  try {
    // Apple Touch Icon (180x180 для iOS)
    console.log('\n📦 Создание apple-touch-icon.png (180x180 для iOS)...')
    const appleIcon = await createIcon(180, 0.55)
    fs.writeFileSync(path.join(publicPath, 'apple-touch-icon.png'), appleIcon)
    console.log('✅ apple-touch-icon.png создан (180x180, 55% изображение + 45% padding)')

    // Android PWA иконки
    console.log('\n📦 Создание иконок для Android PWA...')
    
    // 192x192 для Android (стандартный размер)
    const icon192 = await createIcon(192, 0.55)
    fs.writeFileSync(path.join(publicPath, 'android-chrome-192x192.png'), icon192)
    console.log('✅ android-chrome-192x192.png создан (для Android PWA, 55% изображение + 45% padding)')

    // 512x512 для Android (высокое разрешение)
    const icon512 = await createIcon(512, 0.55)
    fs.writeFileSync(path.join(publicPath, 'android-chrome-512x512.png'), icon512)
    console.log('✅ android-chrome-512x512.png создан (для Android PWA высокого разрешения, 55% изображение + 45% padding)')

    // Также создаем icon-192x192.png и icon-512x512.png для обратной совместимости
    fs.writeFileSync(path.join(publicPath, 'icon-192x192.png'), icon192)
    fs.writeFileSync(path.join(publicPath, 'icon-512x512.png'), icon512)
    console.log('✅ icon-192x192.png и icon-512x512.png созданы (для обратной совместимости)')

    console.log('\n✨ Готово! Все иконки для iOS и Android созданы!')
    console.log('\n📋 Созданные файлы:')
    console.log('   - apple-touch-icon.png (180x180 для iOS)')
    console.log('   - android-chrome-192x192.png (для Android PWA)')
    console.log('   - android-chrome-512x512.png (для Android PWA высокого разрешения)')
    console.log('   - icon-192x192.png (для обратной совместимости)')
    console.log('   - icon-512x512.png (для обратной совместимости)')
    console.log('\n💡 Эти иконки будут использоваться при добавлении сайта на главный экран iOS и Android!')
    
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

generateIcons()

