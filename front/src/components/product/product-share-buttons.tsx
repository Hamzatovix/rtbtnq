'use client'

import { Send, Instagram } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProductShareButtonsProps {
  productName: string
  productUrl: string
  productImageUrl?: string
  productPrice?: number
  variant?: 'card' | 'page'
  className?: string
}

export function ProductShareButtons({
  productName,
  productUrl,
  productImageUrl,
  productPrice,
  variant = 'page',
  className,
}: ProductShareButtonsProps) {
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)

  // Формируем текст для Telegram
  const telegramText = `🌸 ${productName}${productPrice ? ` — ${productPrice.toLocaleString('ru-RU')} ₽` : ''}\n\n${productUrl}`

  // Создать изображение для поделиться
  const createShareImage = async (): Promise<File> => {
    if (!productImageUrl) {
      throw new Error('Изображение товара недоступно')
    }

    // Создаем canvas для генерации изображения (1080x1920px для Stories, или 1200x1200 для обычного)
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
      img.src = productImageUrl
    })

    // Фон (градиент или цвет)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(1, '#f5f5f5')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Рисуем изображение товара (центрируем, занимает ~60% высоты)
    const imageHeight = Math.floor(canvas.height * 0.6)
    const imageWidth = Math.floor(canvas.width * 0.9)
    const imageX = (canvas.width - imageWidth) / 2
    const imageY = 200

    // Белая рамка вокруг изображения
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(imageX - 10, imageY - 10, imageWidth + 20, imageHeight + 20)

    // Рисуем изображение с сохранением пропорций
    const imgAspect = img.width / img.height
    const targetAspect = imageWidth / imageHeight
    
    let drawWidth = imageWidth
    let drawHeight = imageHeight
    let drawX = imageX
    let drawY = imageY

    if (imgAspect > targetAspect) {
      // Изображение шире - подгоняем по высоте
      drawWidth = imageHeight * imgAspect
      drawX = imageX - (drawWidth - imageWidth) / 2
    } else {
      // Изображение выше - подгоняем по ширине
      drawHeight = imageWidth / imgAspect
      drawY = imageY - (drawHeight - imageHeight) / 2
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Название товара
    ctx.fillStyle = '#1a1a1a'
    ctx.font = 'bold 64px "Cormorant Garamond", serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    const titleY = imageY + imageHeight + 80
    const maxTitleWidth = canvas.width - 120
    const titleLines = wrapText(ctx, productName, maxTitleWidth, 64)
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, titleY + index * 80, maxTitleWidth)
    })

    // Цена (если есть)
    if (productPrice) {
      ctx.fillStyle = '#666666'
      ctx.font = '48px "Inter", sans-serif'
      const priceY = titleY + titleLines.length * 80 + 40
      ctx.fillText(
        `${productPrice.toLocaleString('ru-RU')} ₽`,
        canvas.width / 2,
        priceY,
        maxTitleWidth
      )
    }

    // Логотип/бренд внизу
    ctx.fillStyle = '#999999'
    ctx.font = '36px "Inter", sans-serif'
    ctx.fillText('ROSEBOTANIQUE', canvas.width / 2, canvas.height - 150, maxTitleWidth)

    // URL внизу (маленьким шрифтом)
    ctx.fillStyle = '#cccccc'
    ctx.font = '28px "Inter", sans-serif'
    ctx.fillText('rosebotanique.store', canvas.width / 2, canvas.height - 100, maxTitleWidth)

    // Конвертируем canvas в File
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Не удалось создать изображение'))
          return
        }
        const file = new File([blob], `${productName.replace(/[^a-zа-я0-9]/gi, '_')}_share.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        resolve(file)
      }, 'image/jpeg', 0.95)
    })
  }

  // Поделиться в Telegram с изображением
  const handleShareTelegram = async () => {
    if (!productImageUrl) {
      // Если нет изображения, используем старый способ
      const encodedText = encodeURIComponent(telegramText)
      const encodedUrl = encodeURIComponent(productUrl)
      const telegramWebUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
      window.open(telegramWebUrl, '_blank', 'noopener,noreferrer')
      return
    }

    // Проверяем поддержку Web Share API
    if (navigator.share && navigator.canShare) {
      try {
        setIsGeneratingStory(true)
        const imageFile = await createShareImage()
        
        // Проверяем, можно ли поделиться файлом
        if (navigator.canShare({ files: [imageFile] })) {
          await navigator.share({
            files: [imageFile],
            title: productName,
            text: telegramText,
            url: productUrl,
          })
          setIsGeneratingStory(false)
          return
        }
      } catch (error: any) {
        // Если пользователь отменил или произошла ошибка, используем fallback
        if (error.name !== 'AbortError') {
          console.error('Ошибка при использовании Web Share API:', error)
        }
        setIsGeneratingStory(false)
      }
    }

    // Fallback: открываем Telegram с текстом
    const encodedText = encodeURIComponent(telegramText)
    const encodedUrl = encodeURIComponent(productUrl)
    const telegramWebUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
    window.open(telegramWebUrl, '_blank', 'noopener,noreferrer')
  }

  // Поделиться в Instagram Stories с изображением
  const handleShareInstagramStory = async () => {
    if (!productImageUrl) {
      alert('Изображение товара недоступно')
      return
    }

    setIsGeneratingStory(true)

    try {
      const imageFile = await createShareImage()

      // Проверяем поддержку Web Share API
      if (navigator.share && navigator.canShare) {
        try {
          // Проверяем, можно ли поделиться файлом
          if (navigator.canShare({ files: [imageFile] })) {
            await navigator.share({
              files: [imageFile],
              title: `${productName} - ROSEBOTANIQUE`,
              text: `🌸 ${productName}${productPrice ? ` — ${productPrice.toLocaleString('ru-RU')} ₽` : ''}\n\n${productUrl}`,
            })
            setIsGeneratingStory(false)
            return
          }
        } catch (error: any) {
          // Если пользователь отменил, просто выходим
          if (error.name === 'AbortError') {
            setIsGeneratingStory(false)
            return
          }
          // Если произошла другая ошибка, продолжаем с fallback
          console.error('Ошибка при использовании Web Share API:', error)
        }
      }

      // Fallback: скачиваем изображение
      const url = URL.createObjectURL(imageFile)
      const link = document.createElement('a')
      link.href = url
      link.download = `${productName.replace(/[^a-zа-я0-9]/gi, '_')}_story.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setIsGeneratingStory(false)

      // Показываем инструкцию
      alert('Изображение для Stories сохранено! Откройте Instagram и загрузите его в Stories.')
    } catch (error) {
      console.error('Ошибка при создании изображения для Stories:', error)
      setIsGeneratingStory(false)
      alert('Не удалось создать изображение для Stories. Попробуйте позже.')
    }
  }

  // Функция для переноса текста на несколько строк
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = ctx.measureText(currentLine + ' ' + word).width
      if (width < maxWidth) {
        currentLine += ' ' + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  if (variant === 'card') {
    // Компактный вариант для карточки товара
    return (
      <div className={cn('flex gap-1.5', className)}>
        <button
          onClick={handleShareTelegram}
          className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-sm md:backdrop-blur-md shadow-fintage-sm bg-fintage-offwhite/90 dark:bg-fintage-charcoal/90 border border-fintage-graphite/20 dark:border-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg hover:scale-110 active:scale-105 transition-all duration-300"
          aria-label="Поделиться в Telegram с изображением"
          title="Поделиться в Telegram с изображением"
        >
          <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </button>
        {productImageUrl && (
          <button
            onClick={handleShareInstagramStory}
            disabled={isGeneratingStory}
            className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-sm md:backdrop-blur-md shadow-fintage-sm bg-fintage-offwhite/90 dark:bg-fintage-charcoal/90 border border-fintage-graphite/20 dark:border-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite hover:bg-hover-bg dark:hover:bg-hover-bg hover:scale-110 active:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Поделиться в Instagram Stories"
            title="Поделиться в Instagram Stories"
          >
            <Instagram className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        )}
      </div>
    )
  }

  // Полный вариант для страницы товара
  return (
    <div className={cn('flex gap-3', className)}>
      <Button
        variant="outline"
        onClick={handleShareTelegram}
        className="flex items-center gap-2 px-4 h-12 text-sm rounded-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:bg-hover-bg dark:hover:bg-hover-bg"
      >
        <Send className="h-4 w-4" />
        <span>Telegram</span>
      </Button>
      {productImageUrl && (
        <Button
          variant="outline"
          onClick={handleShareInstagramStory}
          disabled={isGeneratingStory}
          className="flex items-center gap-2 px-4 h-12 text-sm rounded-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:bg-hover-bg dark:hover:bg-hover-bg disabled:opacity-50"
        >
          <Instagram className="h-4 w-4" />
          <span>{isGeneratingStory ? 'Отправка...' : 'Instagram Stories'}</span>
        </Button>
      )}
    </div>
  )
}

