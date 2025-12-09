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

  // Формируем текст для Telegram с ссылкой
  const telegramText = `🌸 ${productName}${productPrice ? ` — ${productPrice.toLocaleString('ru-RU')} ₽` : ''}\n\n🔗 ${productUrl}`

  // Создать изображение для Telegram в стиле карточки товара (квадратный формат)
  const createTelegramImage = async (): Promise<File> => {
    if (!productImageUrl) {
      throw new Error('Изображение товара недоступно')
    }

    // Создаем canvas для генерации изображения Telegram (1200x1200px - квадратный формат)
    const canvas = document.createElement('canvas')
    canvas.width = 1200
    canvas.height = 1200
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

    // Фон карточки (Off-White как в карточке)
    ctx.fillStyle = '#F5F5F3'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Рисуем изображение товара (занимает верхнюю часть, как в карточке)
    const imageHeight = Math.floor(canvas.height * 0.65) // ~780px
    const imageWidth = canvas.width
    const imageX = 0
    const imageY = 0

    // Рисуем изображение с сохранением пропорций (cover как в карточке)
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

    // Нижняя часть карточки с информацией (Off-White фон)
    const contentY = imageHeight
    const contentHeight = canvas.height - imageHeight
    ctx.fillStyle = '#F5F5F3'
    ctx.fillRect(0, contentY, canvas.width, contentHeight)

    // Отступы как в карточке
    const padding = 50
    const contentStartY = contentY + padding

    // Название товара (как в карточке - font-display-vintage, font-black, uppercase)
    ctx.fillStyle = '#0F0F0F' // Charcoal Black
    ctx.font = 'bold 52px "Cormorant Garamond", serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    const titleY = contentStartY
    const maxTitleWidth = canvas.width - padding * 2
    const titleLines = wrapText(ctx, productName.toUpperCase(), maxTitleWidth, 52)
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, padding, titleY + index * 60, maxTitleWidth)
    })

    const titleHeight = titleLines.length * 60

    // Цена (если есть) - как в карточке
    if (productPrice) {
      ctx.fillStyle = '#0F0F0F' // Charcoal Black
      ctx.font = 'bold 44px "Inter", sans-serif'
      const priceY = titleY + titleHeight + 25
      ctx.fillText(
        `${productPrice.toLocaleString('ru-RU')} ₽`,
        padding,
        priceY,
        maxTitleWidth
      )
    }

    // Кнопка-ссылка внизу (в стиле карточки)
    const linkPadding = 35
    const linkHeight = 75
    const linkY = canvas.height - linkHeight - padding
    const shortUrl = productUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    
    // Измеряем ширину текста ссылки
    ctx.font = 'bold 36px "Inter", sans-serif'
    ctx.textAlign = 'left'
    const linkTextMetrics = ctx.measureText(shortUrl)
    const linkWidth = linkTextMetrics.width + linkPadding * 2
    const linkX = (canvas.width - linkWidth) / 2
    
    // Рисуем фон кнопки (в стиле проекта - Charcoal Black)
    ctx.fillStyle = '#0F0F0F'
    ctx.fillRect(linkX, linkY, linkWidth, linkHeight)
    
    // Рисуем текст ссылки (Off-White)
    ctx.fillStyle = '#F5F5F3'
    ctx.font = 'bold 36px "Inter", sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(shortUrl, linkX + linkPadding, linkY + linkHeight / 2)
    
    // Добавляем иконку стрелки справа от текста
    const arrowSize = 24
    const arrowX = linkX + linkWidth - linkPadding - arrowSize
    const arrowY = linkY + linkHeight / 2
    ctx.strokeStyle = '#F5F5F3'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(arrowX, arrowY - arrowSize / 3)
    ctx.lineTo(arrowX + arrowSize / 2, arrowY)
    ctx.lineTo(arrowX, arrowY + arrowSize / 3)
    ctx.stroke()

    // Конвертируем canvas в File
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Не удалось создать изображение'))
          return
        }
        const file = new File([blob], `${productName.replace(/[^a-zа-я0-9]/gi, '_')}_telegram.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        })
        resolve(file)
      }, 'image/jpeg', 0.95)
    })
  }

  // Создать изображение для поделиться в стиле карточки товара (Stories формат)
  const createShareImage = async (): Promise<File> => {
    if (!productImageUrl) {
      throw new Error('Изображение товара недоступно')
    }

    // Создаем canvas для генерации изображения Stories (1080x1920px)
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

    // Фон карточки (Off-White как в карточке)
    ctx.fillStyle = '#F5F5F3'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Рисуем изображение товара (занимает верхнюю часть, как в карточке - соотношение 3:4)
    // В Stories формате изображение занимает примерно 60% высоты
    const imageHeight = Math.floor(canvas.height * 0.6) // ~1152px
    const imageWidth = canvas.width
    const imageX = 0
    const imageY = 0

    // Рисуем изображение с сохранением пропорций (cover как в карточке)
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

    // Нижняя часть карточки с информацией (Off-White фон)
    const contentY = imageHeight
    const contentHeight = canvas.height - imageHeight
    ctx.fillStyle = '#F5F5F3'
    ctx.fillRect(0, contentY, canvas.width, contentHeight)

    // Отступы как в карточке (пропорционально увеличены для Stories)
    const padding = 60
    const contentStartY = contentY + padding

    // Название товара (как в карточке - font-display-vintage, font-black, uppercase, tracking-tighter)
    ctx.fillStyle = '#0F0F0F' // Charcoal Black
    ctx.font = 'bold 72px "Cormorant Garamond", serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    
    const titleY = contentStartY
    const maxTitleWidth = canvas.width - padding * 2
    const titleLines = wrapText(ctx, productName.toUpperCase(), maxTitleWidth, 72)
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, padding, titleY + index * 80, maxTitleWidth)
    })

    const titleHeight = titleLines.length * 80

    // Цена (если есть) - как в карточке
    if (productPrice) {
      ctx.fillStyle = '#0F0F0F' // Charcoal Black
      ctx.font = 'bold 60px "Inter", sans-serif'
      const priceY = titleY + titleHeight + 40
      ctx.fillText(
        `${productPrice.toLocaleString('ru-RU')} ₽`,
        padding,
        priceY,
        maxTitleWidth
      )
    }

    // Кнопка-ссылка внизу (в стиле карточки)
    const linkPadding = 40
    const linkHeight = 90
    const linkY = canvas.height - linkHeight - padding
    const shortUrl = productUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    
    // Измеряем ширину текста ссылки
    ctx.font = 'bold 40px "Inter", sans-serif'
    ctx.textAlign = 'left'
    const linkTextMetrics = ctx.measureText(shortUrl)
    const linkWidth = linkTextMetrics.width + linkPadding * 2
    const linkX = (canvas.width - linkWidth) / 2
    
    // Рисуем фон кнопки (в стиле проекта - Charcoal Black)
    ctx.fillStyle = '#0F0F0F'
    ctx.fillRect(linkX, linkY, linkWidth, linkHeight)
    
    // Рисуем текст ссылки (Off-White)
    ctx.fillStyle = '#F5F5F3'
    ctx.font = 'bold 40px "Inter", sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(shortUrl, linkX + linkPadding, linkY + linkHeight / 2)
    
    // Добавляем иконку стрелки справа от текста
    const arrowSize = 28
    const arrowX = linkX + linkWidth - linkPadding - arrowSize
    const arrowY = linkY + linkHeight / 2
    ctx.strokeStyle = '#F5F5F3'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.moveTo(arrowX, arrowY - arrowSize / 3)
    ctx.lineTo(arrowX + arrowSize / 2, arrowY)
    ctx.lineTo(arrowX, arrowY + arrowSize / 3)
    ctx.stroke()

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
        const imageFile = await createTelegramImage() // Используем специальный формат для Telegram
        
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
            text: `🌸 ${productName}${productPrice ? ` — ${productPrice.toLocaleString('ru-RU')} ₽` : ''}\n\n🔗 ${productUrl}`,
            url: productUrl,
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

