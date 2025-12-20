'use client'

import { useState } from 'react'
import { ProductShareButtons } from '@/components/product/product-share-buttons'
import { Button } from '@/components/ui/button'

/**
 * Тестовая страница для проверки генерации изображений Stories
 * Доступна по адресу: /test/share-preview
 */
export default function SharePreviewTestPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Тестовые данные
  const testProduct = {
    name: 'Сумка "Элегантность"',
    url: 'https://rosebotanique.store/product/test-sumka',
    imageUrl: '/uploads/products/1765251091607-_K8Z6rKbOR.jpeg', // Замените на реальное изображение
    price: 15000,
    color: {
      name: 'Черный',
      hex: '#000000',
      hex_code: '#000000'
    }
  }

  const handlePreview = async () => {
    setIsGenerating(true)
    
    try {
      // Создаем canvas для генерации изображения
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Не удалось создать canvas')
      }

      // Загружаем изображение товара
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = testProduct.imageUrl.startsWith('http') 
          ? testProduct.imageUrl 
          : `${window.location.origin}${testProduct.imageUrl}`
      })

      // Фон
      ctx.fillStyle = '#F5F5F3'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Изображение
      const imagePadding = 80
      const topPadding = 120
      const imageHeight = Math.floor(canvas.height * 0.55)
      const imageWidth = canvas.width - imagePadding * 2
      const imageX = imagePadding
      const imageY = topPadding

      const imgAspect = img.width / img.height
      const targetAspect = imageWidth / imageHeight
      
      let drawWidth = imageWidth
      let drawHeight = imageHeight
      let drawX = imageX
      let drawY = imageY

      if (imgAspect > targetAspect) {
        drawWidth = imageHeight * imgAspect
        drawX = imageX - (drawWidth - imageWidth) / 2
      } else {
        drawHeight = imageWidth / imgAspect
        drawY = Math.max(imageY, imageY - (drawHeight - imageHeight) / 2)
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

      // Разделитель
      const contentY = Math.max(imageY + imageHeight, drawY + drawHeight) + 100
      const dividerY = contentY + 35
      ctx.strokeStyle = 'rgba(102, 102, 102, 0.2)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(imagePadding, dividerY)
      ctx.lineTo(canvas.width - imagePadding, dividerY)
      ctx.stroke()

      // Название товара
      const titleY = dividerY + 60
      ctx.fillStyle = '#0F0F0F'
      ctx.font = '900 64px "Cormorant Garamond", serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.letterSpacing = '-0.02em'
      ctx.fillText(testProduct.name.toUpperCase(), canvas.width / 2, titleY, canvas.width - imagePadding * 2)

      // Брендинг
      const brandY = canvas.height - 140
      ctx.fillStyle = '#0F0F0F'
      ctx.font = '300 24px "Inter", sans-serif'
      ctx.letterSpacing = '0.1em'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('ROSEBOTANIQUE', canvas.width / 2, brandY)

      // Подчеркивание
      const brandTextMetrics = ctx.measureText('ROSEBOTANIQUE')
      const brandTextWidth = brandTextMetrics.width
      const brandTextX = (canvas.width - brandTextWidth) / 2
      const underlineY = brandY + 24 + 6
      ctx.strokeStyle = '#0F0F0F'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(brandTextX, underlineY)
      ctx.lineTo(brandTextX + brandTextWidth, underlineY)
      ctx.stroke()

      // Конвертируем в URL для предпросмотра
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)
      setPreviewUrl(dataUrl)
    } catch (error) {
      console.error('Ошибка при генерации:', error)
      alert('Ошибка при генерации изображения. Проверьте консоль.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-fintage-offwhite p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Тест генерации Stories изображений</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Тестовые данные:</h2>
          <ul className="space-y-2 text-sm">
            <li><strong>Название:</strong> {testProduct.name}</li>
            <li><strong>Цена:</strong> {testProduct.price.toLocaleString('ru-RU')} ₽</li>
            <li><strong>Цвет:</strong> {testProduct.color.name}</li>
            <li><strong>Изображение:</strong> {testProduct.imageUrl}</li>
          </ul>
        </div>

        <div className="flex gap-4 mb-8">
          <Button onClick={handlePreview} disabled={isGenerating}>
            {isGenerating ? 'Генерация...' : 'Сгенерировать превью'}
          </Button>
          
          <ProductShareButtons
            productName={testProduct.name}
            productUrl={testProduct.url}
            productImageUrl={testProduct.imageUrl.startsWith('http') 
              ? testProduct.imageUrl 
              : `${window.location.origin}${testProduct.imageUrl}`}
            productPrice={testProduct.price}
            productColor={testProduct.color}
            variant="page"
          />
        </div>

        {previewUrl && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Превью (1080x1920px):</h2>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden inline-block">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full h-auto"
                style={{ maxHeight: '600px' }}
              />
            </div>
            <div className="mt-4">
              <a 
                href={previewUrl} 
                download={`${testProduct.name.replace(/[^a-zа-я0-9]/gi, '_')}_preview.jpg`}
                className="text-blue-600 hover:underline"
              >
                Скачать изображение
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Примечание:</h3>
          <p className="text-sm">
            Убедитесь, что изображение товара существует по пути: <code>{testProduct.imageUrl}</code>
            <br />
            Если изображение не загружается, замените путь в коде на реальное изображение товара.
          </p>
        </div>
      </div>
    </div>
  )
}


