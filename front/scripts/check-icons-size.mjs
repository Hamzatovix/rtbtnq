/**
 * Скрипт для проверки размеров иконок
 * Запуск: node scripts/check-icons-size.mjs
 */

import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicPath = path.join(__dirname, '../public')

// Список иконок для проверки
const icons = [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
]

async function checkIconSizes() {
  console.log('🔍 Проверка размеров иконок:\n')
  
  for (const iconName of icons) {
    const iconPath = path.join(publicPath, iconName)
    
    if (!fs.existsSync(iconPath)) {
      console.log(`⚠️  ${iconName}: файл не найден\n`)
      continue
    }
    
    try {
      const metadata = await sharp(iconPath).metadata()
      const fileSize = fs.statSync(iconPath).size
      
      // Вычисляем процент изображения (примерно, если знаем что должно быть 70%)
      const expectedSize = metadata.width || metadata.height || 0
      const imageSize = Math.floor(expectedSize * 0.7)
      const padding = Math.floor((expectedSize - imageSize) / 2)
      
      console.log(`✅ ${iconName}`)
      console.log(`   Размер: ${metadata.width || '?'}x${metadata.height || '?'} пикселей`)
      console.log(`   Формат: ${metadata.format || '?'}`)
      console.log(`   Размер файла: ${(fileSize / 1024).toFixed(2)} KB`)
      console.log(`   Ожидаемый размер изображения: ~${imageSize}px (70% от ${expectedSize}px)`)
      console.log(`   Ожидаемый padding: ~${padding}px с каждой стороны (30%)\n`)
    } catch (error) {
      console.log(`❌ ${iconName}: ошибка чтения - ${error.message}\n`)
    }
  }
  
  console.log('\n💡 Для визуальной проверки:')
  console.log('   1. Откройте файлы напрямую в браузере:')
  console.log('      file:///' + publicPath.replace(/\\/g, '/') + '/favicon-32x32.png')
  console.log('   2. Или запустите локальный сервер и откройте /favicon-32x32.png')
  console.log('   3. Используйте инструменты разработчика браузера (F12) для проверки')
}

checkIconSizes().catch(console.error)

