/**
 * Генератор Open Graph изображений для социальных сетей
 * Создает профессиональные карточки с брендингом Rosebotanique
 */

import { join } from 'path'
import { readFile } from 'fs/promises'

const OG_WIDTH = 1200
const OG_HEIGHT = 630
const OG_RATIO = OG_WIDTH / OG_HEIGHT // 1.91:1 - оптимальный формат для соцсетей

interface OGImageOptions {
  title: string
  description?: string
  imageUrl?: string
  type?: 'default' | 'product'
  productName?: string
  productPrice?: number
}

/**
 * Генерирует базовое OG изображение для главной страницы
 */
export async function generateDefaultOGImage(): Promise<Buffer> {
  const sharp = (await import('sharp')).default
  const canvas = sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: { r: 245, g: 245, b: 243 } // #F5F5F3 - Off-White из палитры
    }
  })

  // Загружаем логотип если он есть
  const logoPath = join(process.cwd(), 'public', 'logo', 'logo_day.svg')
  let logoBuffer: Buffer | null = null
  
  try {
    logoBuffer = await readFile(logoPath)
  } catch (error) {
    console.warn('[OG Image] Логотип не найден, используем текстовый вариант')
  }

  // Создаем SVG с текстом для заголовка
  const titleSVG = `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}">
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

  // Композиция: фон + логотип (если есть) + текст
  let composite = canvas
  
  if (logoBuffer) {
    // Логотип слева, уменьшенный
    const sharpInstance = (await import('sharp')).default
    const logoResized = await sharpInstance(logoBuffer)
      .resize(200, 200, { fit: 'inside' })
      .toBuffer()
    
    composite = composite.composite([
      {
        input: logoResized,
        left: 100,
        top: OG_HEIGHT / 2 - 100,
        blend: 'over'
      }
    ])
  }

  // Добавляем текст поверх
  composite = composite.composite([
    {
      input: titleBuffer,
      blend: 'over'
    }
  ])

  return await composite.png().toBuffer()
}

/**
 * Генерирует OG изображение для продукта
 */
export async function generateProductOGImage(options: OGImageOptions): Promise<Buffer> {
  const { productName, productPrice, imageUrl } = options
  const sharp = (await import('sharp')).default

  // Создаем базовый canvas
  let canvas = sharp({
    create: {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      channels: 3,
      background: { r: 245, g: 245, b: 243 } // #F5F5F3
    }
  })

  const composites: any[] = []

  // Если есть изображение продукта, добавляем его справа
  if (imageUrl) {
    try {
      let productImage: Buffer
      
      // Загружаем изображение (может быть URL или путь)
      if (imageUrl.startsWith('http')) {
        const response = await fetch(imageUrl)
        productImage = Buffer.from(await response.arrayBuffer())
      } else {
        const imagePath = imageUrl.startsWith('/') 
          ? join(process.cwd(), 'public', imageUrl)
          : join(process.cwd(), 'public', imageUrl)
        productImage = await readFile(imagePath)
      }

      // Изображение занимает правую половину
      const imageWidth = Math.floor(OG_WIDTH * 0.5)
      const imageHeight = OG_HEIGHT
      
      const sharpInstance = (await import('sharp')).default
      const resizedImage = await sharpInstance(productImage)
        .resize(imageWidth, imageHeight, {
          fit: 'cover',
          position: 'center'
        })
        .toBuffer()

      composites.push({
        input: resizedImage,
        left: OG_WIDTH - imageWidth,
        top: 0,
        blend: 'over'
      })
    } catch (error) {
      console.warn('[OG Image] Не удалось загрузить изображение продукта:', error)
    }
  }

  // Текстовая часть слева
  const textAreaWidth = imageUrl ? Math.floor(OG_WIDTH * 0.5) : OG_WIDTH
  const textSVG = `
    <svg width="${textAreaWidth}" height="${OG_HEIGHT}">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap');
          .product-name {
            font-family: 'Cormorant Garamond', serif;
            font-weight: 700;
            font-size: 56px;
            fill: #0F0F0F;
            text-anchor: middle;
            letter-spacing: -0.02em;
          }
          .price {
            font-family: 'Cormorant Garamond', serif;
            font-weight: 600;
            font-size: 36px;
            fill: #666666;
            text-anchor: middle;
            letter-spacing: 0.05em;
          }
          .brand {
            font-family: 'Cormorant Garamond', serif;
            font-weight: 400;
            font-size: 24px;
            fill: #999999;
            text-anchor: middle;
            letter-spacing: 0.1em;
          }
        </style>
      </defs>
      <text x="${textAreaWidth / 2}" y="${OG_HEIGHT / 2 - 80}" class="product-name">${escapeXml(productName || '')}</text>
      ${productPrice ? `<text x="${textAreaWidth / 2}" y="${OG_HEIGHT / 2 + 20}" class="price">${productPrice.toLocaleString('ru-RU')} ₽</text>` : ''}
      <text x="${textAreaWidth / 2}" y="${OG_HEIGHT / 2 + 100}" class="brand">ROSEBOTANIQUE</text>
    </svg>
  `

  composites.push({
    input: Buffer.from(textSVG),
    left: 0,
    top: 0,
    blend: 'over'
  })

  // Применяем все композиции
  canvas = canvas.composite(composites)

  return await canvas.png().toBuffer()
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case '\'': return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

/**
 * Сохраняет OG изображение в файл
 */
export async function saveOGImage(buffer: Buffer, filename: string): Promise<string> {
  const { writeFile, mkdir } = await import('fs/promises')
  const { join } = await import('path')
  
  const ogDir = join(process.cwd(), 'public', 'og')
  await mkdir(ogDir, { recursive: true })
  
  const filePath = join(ogDir, filename)
  await writeFile(filePath, buffer)
  
  return `/og/${filename}`
}

