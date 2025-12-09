'use client'

import { Send, Instagram } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn, getColorValue, getColorDisplayName } from '@/lib/utils'

interface ProductShareButtonsProps {
  productName: string
  productUrl: string
  productImageUrl?: string
  productPrice?: number
  productColor?: { name: string; hex?: string; hex_code?: string } | null
  productCategory?: string
  variant?: 'card' | 'page'
  className?: string
}

export function ProductShareButtons({
  productName,
  productUrl,
  productImageUrl,
  productPrice,
  productColor,
  productCategory,
  variant = 'page',
  className,
}: ProductShareButtonsProps) {
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)

  // Формируем текст для Telegram с ссылкой на товар
  const telegramText = `🌸 ${productName}${productPrice ? ` — ${productPrice.toLocaleString('ru-RU')} ₽` : ''}\n\n🔗 ${productUrl}`

  // Создать изображение для Telegram (квадратный формат)
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

    // Фон (Off-White из палитры проекта)
    ctx.fillStyle = '#F5F5F3'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Изображение с отступами по бокам, сверху и снизу (как в предыдущем варианте)
    const imagePadding = 60 // Отступы по бокам и сверху/снизу
    const topPadding = 80 // Отступ сверху (больше для визуального баланса)
    const imageHeight = Math.floor(canvas.height * 0.60) // ~720px для контента остается ~480px
    const imageWidth = canvas.width - imagePadding * 2 // С отступами по бокам
    const imageX = imagePadding
    const imageY = topPadding // Отступ сверху

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
      // Изображение выше - подгоняем по ширине, но не выходим за верхнюю границу
      drawHeight = imageWidth / imgAspect
      const maxDrawY = imageY // Максимальная позиция сверху
      drawY = Math.max(maxDrawY, imageY - (drawHeight - imageHeight) / 2)
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Определяем фактическую нижнюю границу изображения (учитываем возможное обрезание при cover)
    const actualImageBottom = Math.max(
      imageY + imageHeight, // Нижняя граница области изображения
      drawY + drawHeight    // Фактическая нижняя граница изображения (если выходит за область)
    )
    
    // Контент внизу - центрируем относительно изображения
    // Увеличиваем отступ, чтобы текст не налезал на фото
    const contentY = actualImageBottom + 80 // Увеличенный отступ после изображения
    const contentHeight = canvas.height - contentY
    const contentPadding = imagePadding // Используем те же отступы, что и у изображения

    // Тонкая линия-разделитель (в стиле Stone Island/Nike)
    const dividerY = contentY + 25
    ctx.strokeStyle = 'rgba(102, 102, 102, 0.2)' // Graphite с прозрачностью
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(contentPadding, dividerY)
    ctx.lineTo(canvas.width - contentPadding, dividerY)
    ctx.stroke()

    // Определяем максимальную ширину текста
    const maxTitleWidth = canvas.width - contentPadding * 2

    // Название товара - центрируем относительно изображения
    // Увеличиваем отступ от линии-разделителя, чтобы текст не налезал на фото
    const titleY = dividerY + 45 // Отступ после линии-разделителя
    ctx.fillStyle = '#0F0F0F' // Charcoal Black из палитры
    ctx.font = '900 52px "Cormorant Garamond", serif' // font-black = 900
    ctx.textAlign = 'center' // Центрируем
    ctx.textBaseline = 'top'
    ctx.letterSpacing = '-0.02em' // tracking-tighter
    const titleText = productName.toUpperCase() // uppercase
    const titleLines = wrapText(ctx, titleText, maxTitleWidth, 52)
    const lineHeight = 52 * 0.95 // leading-[0.95]
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, titleY + index * lineHeight, maxTitleWidth)
    })

    const titleHeight = titleLines.length * lineHeight

    // Цвет товара (если есть) - центрируем относительно изображения
    let colorY = titleY + titleHeight + 28 // space-y
    if (productColor) {
      const colorHex = productColor.hex || productColor.hex_code || getColorValue(productColor.name)
      const colorName = getColorDisplayName(productColor.name, 'ru')
      
      // Устанавливаем шрифт для измерения текста цвета
      ctx.font = '400 24px "Courier New", monospace'
      ctx.letterSpacing = '0.15em'
      
      // Центрируем цветной индикатор и текст
      // Квадратный индикатор как в карточке товара (rounded-sm, без бордера)
      const colorIndicatorSize = 20
      const borderRadius = 2 // rounded-sm = 2px
      const colorTextWidth = ctx.measureText(colorName.toUpperCase()).width
      const totalColorWidth = colorIndicatorSize + 12 + colorTextWidth
      const colorStartX = (canvas.width - totalColorWidth) / 2
      const colorIndicatorX = colorStartX
      const colorIndicatorY = colorY + 10 - colorIndicatorSize / 2
      
      // Рисуем квадратный индикатор с закругленными углами (без обводки)
      ctx.fillStyle = colorHex
      ctx.beginPath()
      // Рисуем закругленный прямоугольник вручную
      const x = colorIndicatorX
      const y = colorIndicatorY
      const w = colorIndicatorSize
      const h = colorIndicatorSize
      const r = borderRadius
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fill()

      // Название цвета (font-mono, tracking-[0.15em], uppercase) - справа от индикатора
      ctx.fillStyle = '#666666' // Graphite из палитры
      ctx.font = '400 24px "Courier New", monospace' // font-mono
      ctx.letterSpacing = '0.15em' // tracking-[0.15em]
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(colorName.toUpperCase(), colorStartX + colorIndicatorSize + 12, colorIndicatorY + colorIndicatorSize / 2, maxTitleWidth)
      
      colorY += 40
    }

    // Брендинг внизу как кликабельная ссылка (элегантно, минималистично)
    const brandY = canvas.height - 120
    ctx.fillStyle = '#0F0F0F' // Charcoal Black - более заметный цвет для ссылки
    ctx.font = '300 18px "Inter", sans-serif' // font-light
    ctx.letterSpacing = '0.1em'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Измеряем ширину текста для подчеркивания
    const brandText = 'ROSEBOTANIQUE'
    const brandTextMetrics = ctx.measureText(brandText)
    const brandTextWidth = brandTextMetrics.width
    const brandTextX = (canvas.width - brandTextWidth) / 2
    
    // Рисуем текст брендинга
    ctx.fillText(brandText, canvas.width / 2, brandY, maxTitleWidth)
    
    // Подчеркиваем текст как ссылку (минималистично)
    const underlineY = brandY + 18 + 4 // font-size + небольшой отступ
    ctx.strokeStyle = '#0F0F0F'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(brandTextX, underlineY)
    ctx.lineTo(brandTextX + brandTextWidth, underlineY)
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

  // Создать изображение для Instagram Stories (Stories формат)
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

    // Фон (Off-White из палитры проекта)
    ctx.fillStyle = '#F5F5F3'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Изображение с отступами по бокам, сверху и снизу (как в предыдущем варианте)
    const imagePadding = 80 // Отступы по бокам (увеличены для Stories)
    const topPadding = 120 // Отступ сверху (больше для визуального баланса)
    const imageHeight = Math.floor(canvas.height * 0.55) // ~1056px для контента остается ~864px
    const imageWidth = canvas.width - imagePadding * 2 // С отступами по бокам
    const imageX = imagePadding
    const imageY = topPadding // Отступ сверху

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
      // Изображение выше - подгоняем по ширине, но не выходим за верхнюю границу
      drawHeight = imageWidth / imgAspect
      const maxDrawY = imageY // Максимальная позиция сверху
      drawY = Math.max(maxDrawY, imageY - (drawHeight - imageHeight) / 2)
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Определяем фактическую нижнюю границу изображения (учитываем возможное обрезание при cover)
    const actualImageBottom = Math.max(
      imageY + imageHeight, // Нижняя граница области изображения
      drawY + drawHeight    // Фактическая нижняя граница изображения (если выходит за область)
    )
    
    // Контент внизу - центрируем относительно изображения
    // Увеличиваем отступ, чтобы текст не налезал на фото
    const contentY = actualImageBottom + 100 // Увеличенный отступ после изображения
    const contentHeight = canvas.height - contentY
    const contentPadding = imagePadding // Используем те же отступы, что и у изображения

    // Тонкая линия-разделитель (в стиле Stone Island/Nike)
    const dividerY = contentY + 35
    ctx.strokeStyle = 'rgba(102, 102, 102, 0.2)' // Graphite с прозрачностью
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(contentPadding, dividerY)
    ctx.lineTo(canvas.width - contentPadding, dividerY)
    ctx.stroke()

    // Определяем максимальную ширину текста
    const maxTitleWidth = canvas.width - contentPadding * 2

    // Название товара - центрируем относительно изображения
    // Увеличиваем отступ от линии-разделителя, чтобы текст не налезал на фото
    const titleY = dividerY + 60 // Отступ после линии-разделителя
    ctx.fillStyle = '#0F0F0F' // Charcoal Black из палитры
    ctx.font = '900 64px "Cormorant Garamond", serif' // font-black = 900
    ctx.textAlign = 'center' // Центрируем
    ctx.textBaseline = 'top'
    ctx.letterSpacing = '-0.02em' // tracking-tighter
    const titleText = productName.toUpperCase() // uppercase
    const titleLines = wrapText(ctx, titleText, maxTitleWidth, 64)
    const lineHeight = 64 * 0.95 // leading-[0.95]
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, canvas.width / 2, titleY + index * lineHeight, maxTitleWidth)
    })

    const titleHeight = titleLines.length * lineHeight

    // Цвет товара (если есть) - центрируем относительно изображения
    let colorY = titleY + titleHeight + 36 // space-y
    if (productColor) {
      const colorHex = productColor.hex || productColor.hex_code || getColorValue(productColor.name)
      const colorName = getColorDisplayName(productColor.name, 'ru')
      
      // Устанавливаем шрифт для измерения текста цвета
      ctx.font = '400 28px "Courier New", monospace'
      ctx.letterSpacing = '0.15em'
      
      // Центрируем цветной индикатор и текст
      // Квадратный индикатор как в карточке товара (rounded-sm, без бордера)
      const colorIndicatorSize = 24
      const borderRadius = 2 // rounded-sm = 2px
      const colorTextWidth = ctx.measureText(colorName.toUpperCase()).width
      const totalColorWidth = colorIndicatorSize + 16 + colorTextWidth
      const colorStartX = (canvas.width - totalColorWidth) / 2
      const colorIndicatorX = colorStartX
      const colorIndicatorY = colorY + 12 - colorIndicatorSize / 2
      
      // Рисуем квадратный индикатор с закругленными углами (без обводки)
      ctx.fillStyle = colorHex
      ctx.beginPath()
      // Рисуем закругленный прямоугольник вручную
      const x = colorIndicatorX
      const y = colorIndicatorY
      const w = colorIndicatorSize
      const h = colorIndicatorSize
      const r = borderRadius
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.fill()

      // Название цвета (font-mono, tracking-[0.15em], uppercase) - справа от индикатора
      ctx.fillStyle = '#666666' // Graphite из палитры
      ctx.font = '400 28px "Courier New", monospace' // font-mono
      ctx.letterSpacing = '0.15em' // tracking-[0.15em]
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(colorName.toUpperCase(), colorStartX + colorIndicatorSize + 16, colorIndicatorY + colorIndicatorSize / 2, maxTitleWidth)
      
      colorY += 48
    }

    // Брендинг внизу как кликабельная ссылка (элегантно, минималистично)
    const brandY = canvas.height - 140
    ctx.fillStyle = '#0F0F0F' // Charcoal Black - более заметный цвет для ссылки
    ctx.font = '300 24px "Inter", sans-serif' // font-light
    ctx.letterSpacing = '0.1em'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Измеряем ширину текста для подчеркивания
    const brandText = 'ROSEBOTANIQUE'
    const brandTextMetrics = ctx.measureText(brandText)
    const brandTextWidth = brandTextMetrics.width
    const brandTextX = (canvas.width - brandTextWidth) / 2
    
    // Рисуем текст брендинга
    ctx.fillText(brandText, canvas.width / 2, brandY, maxTitleWidth)
    
    // Подчеркиваем текст как ссылку (минималистично)
    const underlineY = brandY + 24 + 6 // font-size + небольшой отступ
    ctx.strokeStyle = '#0F0F0F'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(brandTextX, underlineY)
    ctx.lineTo(brandTextX + brandTextWidth, underlineY)
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
            url: productUrl, // Ссылка на конкретный товар
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
            text: `🌸 ${productName}\n\n🔗 ${productUrl}`,
            url: productUrl, // Ссылка на конкретный товар
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

