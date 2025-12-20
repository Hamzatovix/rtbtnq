#!/usr/bin/env node
/**
 * Скрипт для генерации базовых OG изображений
 * Запуск: node scripts/generate-og-images.mjs
 */

import { writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

const OG_WIDTH = 1200
const OG_HEIGHT = 630

/**
 * Генерирует базовое OG изображение для главной страницы
 */
async function generateDefaultOG() {
  console.log('🎨 Генерация базового OG изображения...')

  // Создаем canvas с фоном
  let canvas = sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: { r: 245, g: 245, b: 243 } // #F5F5F3 - Off-White
    }
  })

  // Создаем SVG с текстом
  const titleSVG = `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
          .title {
            font-family: 'Cormorant Garamond', serif;
            font-weight: 700;
            font-size: 72px;
            fill: #0F0F0F;
            text-anchor: middle;
            letter-spacing: -0.02em;
          }
          .subtitle {
            font-family: 'Cormorant Garamond', serif;
            font-weight: 400;
            font-size: 32px;
            fill: #666666;
            text-anchor: middle;
            letter-spacing: 0.05em;
          }
        </style>
      </defs>
      <text x="${OG_WIDTH / 2}" y="${OG_HEIGHT / 2 - 40}" class="title">ROSEBOTANIQUE</text>
      <text x="${OG_WIDTH / 2}" y="${OG_HEIGHT / 2 + 60}" class="subtitle">Сумки ручной работы</text>
    </svg>
  `

  const titleBuffer = Buffer.from(titleSVG)

  // Композиция: фон + текст
  canvas = canvas.composite([
    {
      input: titleBuffer,
      blend: 'over'
    }
  ])

  // Сохраняем
  const outputDir = join(rootDir, 'public', 'og')
  await mkdir(outputDir, { recursive: true })
  
  const outputPath = join(outputDir, 'default.png')
  await canvas.png().toFile(outputPath)

  console.log(`✅ Базовое OG изображение сохранено: ${outputPath}`)
  return outputPath
}

async function main() {
  try {
    await generateDefaultOG()
    console.log('\n✨ Генерация OG изображений завершена!')
  } catch (error) {
    console.error('❌ Ошибка при генерации:', error)
    process.exit(1)
  }
}

main()


