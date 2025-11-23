import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const inputDir = path.join(process.cwd(), 'public', 'images')
const outputDir = inputDir // Сохраняем в ту же папку, заменяя оригиналы

// Настройки сжатия JPG
const JPG_OPTIONS = {
  quality: 85, // Качество (1-100, 85 - хороший баланс)
  mozjpeg: true, // Использовать mozjpeg для лучшего сжатия
}

// Максимальная ширина для изображений (сохраняет пропорции)
const MAX_WIDTH = 1920

// Файлы для обработки (исправляем опечатку в названиях)
const FILES_TO_PROCESS = [
  'about_c1.jpg',
  'about_c2.jpg',
  'about_c3.jpg',
  'about_c4.jpg',
  'about_c5.jpg',
  'about_sc.jpg',
  'about_scw.jpg',
]

async function getFileSize(filePath) {
  const stats = await fs.stat(filePath)
  return stats.size
}

async function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

async function optimizeImage(inputPath, outputPath) {
  try {
    const originalSize = await getFileSize(inputPath)
    
    // Читаем метаданные
    const metadata = await sharp(inputPath).metadata()
    const { width, height } = metadata
    
    // Вычисляем новую ширину (если нужно уменьшить)
    let targetWidth = width
    if (width > MAX_WIDTH) {
      targetWidth = MAX_WIDTH
    }
    
    // Оптимизируем изображение
    await sharp(inputPath)
      .resize({ 
        width: targetWidth, 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg(JPG_OPTIONS)
      .toFile(outputPath)
    
    const newSize = await getFileSize(outputPath)
    const saved = originalSize - newSize
    const savedPercent = ((saved / originalSize) * 100).toFixed(1)
    
    return {
      success: true,
      originalSize,
      newSize,
      saved,
      savedPercent,
      dimensions: `${metadata.width}x${metadata.height} → ${targetWidth}x${Math.round(height * (targetWidth / width))}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

async function main() {
  console.log('🖼️  Оптимизация изображений About секции...\n')
  
  let totalOriginalSize = 0
  let totalNewSize = 0
  let processedCount = 0
  let errorCount = 0
  
  for (const fileName of FILES_TO_PROCESS) {
    const inputPath = path.join(inputDir, fileName)
    const tempPath = path.join(inputDir, `${fileName}.tmp`)
    
    // Проверяем, существует ли файл
    try {
      await fs.access(inputPath)
    } catch {
      console.log(`⚠️  Пропущен: ${fileName} (файл не найден)`)
      continue
    }
    
    console.log(`📸 Обработка: ${fileName}...`)
    
    const result = await optimizeImage(inputPath, tempPath)
    
    if (result.success) {
      // Заменяем оригинальный файл оптимизированным
      await fs.rename(tempPath, inputPath)
      
      totalOriginalSize += result.originalSize
      totalNewSize += result.newSize
      processedCount++
      
      console.log(`   ✅ Успешно!`)
      console.log(`   📏 Размеры: ${result.dimensions}`)
      console.log(`   💾 Было: ${await formatFileSize(result.originalSize)}`)
      console.log(`   💾 Стало: ${await formatFileSize(result.newSize)}`)
      console.log(`   📉 Сжато: ${await formatFileSize(result.saved)} (${result.savedPercent}%)\n`)
    } else {
      // Удаляем временный файл при ошибке
      try {
        await fs.unlink(tempPath)
      } catch {}
      
      errorCount++
      console.log(`   ❌ Ошибка: ${result.error}\n`)
    }
  }
  
  // Итоговая статистика
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Итоговая статистика:')
  console.log(`   ✅ Обработано: ${processedCount} файлов`)
  if (errorCount > 0) {
    console.log(`   ❌ Ошибок: ${errorCount}`)
  }
  console.log(`   💾 Общий размер до: ${await formatFileSize(totalOriginalSize)}`)
  console.log(`   💾 Общий размер после: ${await formatFileSize(totalNewSize)}`)
  
  if (processedCount > 0) {
    const totalSaved = totalOriginalSize - totalNewSize
    const totalSavedPercent = ((totalSaved / totalOriginalSize) * 100).toFixed(1)
    console.log(`   📉 Всего сжато: ${await formatFileSize(totalSaved)} (${totalSavedPercent}%)`)
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch((error) => {
  console.error('❌ Критическая ошибка:', error)
  process.exit(1)
})

