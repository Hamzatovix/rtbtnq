import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Изображения для товара "Linen Tote Bag"
const images = [
  path.join(__dirname, 'public', 'images', 'about_c.jpg'),
  path.join(__dirname, 'public', 'images', 'about-two.png'),
  path.join(__dirname, 'public', 'images', 'about_c3.jpg'), // второй вариант цвета
]

async function checkSizes() {
  console.log('Проверка размеров изображений для "Linen Tote Bag":\n')
  
  for (const imgPath of images) {
    const fileName = path.basename(imgPath)
    if (fs.existsSync(imgPath)) {
      try {
        const metadata = await sharp(imgPath).metadata()
        console.log(`✅ ${fileName}`)
        console.log(`   Ширина: ${metadata.width} пикселей`)
        console.log(`   Высота: ${metadata.height} пикселей`)
        console.log(`   Формат: ${metadata.format}`)
        console.log(`   Размер файла: ${(fs.statSync(imgPath).size / 1024).toFixed(2)} KB\n`)
      } catch (error) {
        console.log(`❌ ${fileName}: ошибка чтения - ${error.message}\n`)
      }
    } else {
      console.log(`⚠️  ${fileName}: файл не найден в public/images/\n`)
    }
  }
}

checkSizes().catch(console.error)

