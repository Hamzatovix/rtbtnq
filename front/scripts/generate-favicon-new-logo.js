/**
 * Генерация всех иконок из public/new-logo.PNG
 * Заменяет: public/logo/logo_day.png (хедер/футер), favicon-*.png, favicon.ico,
 * apple-touch-icon.png, android-chrome-*.png, icon-*.png
 *
 * Запуск: node scripts/generate-favicon-new-logo.js
 */

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const publicPath = path.join(__dirname, '../public')
const sourcePath = path.join(publicPath, 'new-logo.PNG')

const PAD_RATIO = 0.125 // 12.5% padding, как в старом пайплайне

async function main() {
  const srcBuffer = fs.readFileSync(sourcePath)

  // 1. Обрезаем прозрачные поля вокруг рисунка
  const { data: trimmedBuffer, info: trimmedInfo } = await sharp(srcBuffer)
    .trim()
    .png()
    .toBuffer({ resolveWithObject: true })

  console.log(`✂️  Обрезано до ${trimmedInfo.width}x${trimmedInfo.height}`)

  // 2. Мастер для хедера/футера — сохраняем пропорции, прозрачный фон,
  //    не квадратим (Logo-компонент сам подгоняет высоту через CSS)
  const headerLogoPath = path.join(publicPath, 'logo', 'logo_day.png')
  await sharp(trimmedBuffer)
    .resize({ height: 800, withoutEnlargement: true })
    .png()
    .toFile(headerLogoPath)
  console.log(`✅ public/logo/logo_day.png создан (мастер для хедера/футера)`)

  // 3. Квадратный мастер с белым фоном и паддингом — основа для всех иконок
  const squareSize = 1024
  const core = Math.round(squareSize * (1 - PAD_RATIO * 2))
  const pad = Math.round((squareSize - core) / 2)

  const squareMaster = await sharp(trimmedBuffer)
    .resize(core, core, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .extend({
      top: pad,
      bottom: pad,
      left: pad,
      right: pad,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    // Важно: у исходника (вышивка крестиком) есть прозрачные промежутки МЕЖДУ стежками
    // внутри самого рисунка, не только по краям. resize/extend с background заливают только
    // добавленные поля, а не эти внутренние дыры - без flatten() сквозь них будут просвечивать
    // обои телефона (тёмные на тёмных обоях). flatten прибивает вообще всю прозрачность к белому.
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer()

  // 4. Все PNG-иконки нужных размеров из квадратного мастера
  const targets = [
    'favicon-16x16.png',
    'favicon-32x32.png',
    'favicon-48x48.png',
    'favicon-64x64.png',
    'favicon-96x96.png',
    'favicon-128x128.png',
    'favicon-256x256.png',
    'apple-touch-icon.png', // 180x180 отдельно ниже
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'icon-192x192.png',
    'icon-512x512.png',
  ]

  const sizeMap = {
    'favicon-16x16.png': 16,
    'favicon-32x32.png': 32,
    'favicon-48x48.png': 48,
    'favicon-64x64.png': 64,
    'favicon-96x96.png': 96,
    'favicon-128x128.png': 128,
    'favicon-256x256.png': 256,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512,
    'icon-192x192.png': 192,
    'icon-512x512.png': 512,
  }

  for (const name of targets) {
    const size = sizeMap[name]
    await sharp(squareMaster)
      .resize(size, size)
      .png()
      .toFile(path.join(publicPath, name))
    console.log(`✅ ${name} (${size}x${size})`)
  }

  // 5. favicon.ico — в этом проекте исторически это PNG 512x512, переименованный в .ico
  //    (см. старый scripts/generate-favicon.js), сохраняем тот же подход для совместимости
  const favicon512 = await sharp(squareMaster).resize(512, 512).png().toBuffer()
  fs.writeFileSync(path.join(publicPath, 'favicon.ico'), favicon512)
  console.log('✅ favicon.ico создан (512x512 PNG с белым фоном, как в существующем пайплайне)')

  console.log('\n✨ Готово!')
}

main().catch((err) => {
  console.error('❌ Ошибка:', err)
  process.exit(1)
})
