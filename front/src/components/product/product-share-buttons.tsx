'use client'

import { Send, Instagram } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn, getColorValue, getColorDisplayName, getColorEnglishName } from '@/lib/utils'

interface ProductShareButtonsProps {
  productName: string
  productUrl: string
  productImageUrl?: string
  productPrice?: number
  productColor?: { name: string; hex?: string; hex_code?: string; slug?: string } | null
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

  // Формируем текст для Telegram с кликабельной ссылкой на товар
  // Ссылка в тексте будет автоматически кликабельной в Telegram
  const telegramText = `🌸 ${productName}${productPrice ? ` — ${productPrice.toLocaleString('ru-RU')} ₽` : ''}\n\n🔗 ${productUrl}`

  // Создать изображение для Telegram (такой же формат как для Instagram Stories)
  const createTelegramImage = async (): Promise<File> => {
    if (!productImageUrl) {
      throw new Error('Изображение товара недоступно')
    }

    // Создаем canvas для генерации изображения Telegram (1080x1920px - такой же как для Stories)
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

    // Премиальный фон с легким градиентом (Off-White из палитры проекта)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#F5F5F3') // Off-White сверху
    gradient.addColorStop(1, '#FAFAF8') // Чуть светлее снизу для глубины
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Изображение с увеличенными отступами для большего воздуха
    // Адаптивный размер изображения в зависимости от длины названия
    const titleLength = productName.length
    let imageHeightPercent = 0.52 // Базовый процент высоты canvas для изображения
    
    // Если название длинное, уменьшаем размер изображения для большего пространства под текстом
    if (titleLength > 20) {
      imageHeightPercent = 0.48 // Уменьшаем на 4% для длинных названий
    } else if (titleLength > 15) {
      imageHeightPercent = 0.50 // Уменьшаем на 2% для средних названий
    }
    
    const imagePadding = 100 // Увеличено с 80px для большего воздуха
    const topPadding = 140 // Увеличено с 120px для лучшего баланса
    const imageHeight = Math.floor(canvas.height * imageHeightPercent)
    const imageWidth = canvas.width - imagePadding * 2
    const imageX = imagePadding
    const imageY = topPadding

    // Рисуем изображение с сохранением пропорций
    const imgAspect = img.width / img.height
    const targetAspect = imageWidth / imageHeight
    
    let drawWidth = imageWidth
    let drawHeight = imageHeight
    let drawX = imageX
    let drawY = imageY

    if (imgAspect > targetAspect) {
      // Изображение шире - подгоняем по высоте и центрируем по горизонтали
      drawWidth = imageHeight * imgAspect
      drawX = imageX - (drawWidth - imageWidth) / 2
    } else {
      // Изображение выше - подгоняем по ширине и центрируем по вертикали
      drawHeight = imageWidth / imgAspect
      drawY = imageY - (drawHeight - imageHeight) / 2
      // Ограничиваем сверху, чтобы не выходить за верхнюю границу
      if (drawY < imageY) {
        drawY = imageY
      }
    }

    // Рисуем изображение
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Определяем фактическую нижнюю границу изображения (учитываем возможное обрезание при cover)
    const actualImageBottom = Math.max(
      imageY + imageHeight, // Нижняя граница области изображения
      drawY + drawHeight    // Фактическая нижняя граница изображения (если выходит за область)
    )
    
    // Контент внизу - центрируем относительно изображения
    // Увеличиваем отступ для большего воздуха
    const contentY = actualImageBottom + 120 // Увеличенный отступ после изображения
    const contentHeight = canvas.height - contentY
    const contentPadding = imagePadding

    // Премиальная линия-разделитель с градиентом
    const dividerY = contentY + 50
    const dividerPadding = contentPadding + 60 // Уменьшаем длину линии для элегантности
    
    // Градиент для разделителя
    const dividerGradient = ctx.createLinearGradient(dividerPadding, dividerY, canvas.width - dividerPadding, dividerY)
    dividerGradient.addColorStop(0, 'rgba(102, 102, 102, 0)')
    dividerGradient.addColorStop(0.5, 'rgba(102, 102, 102, 0.3)')
    dividerGradient.addColorStop(1, 'rgba(102, 102, 102, 0)')
    
    ctx.strokeStyle = dividerGradient
    ctx.lineWidth = 1 // Немного толще для лучшей видимости
    ctx.beginPath()
    ctx.moveTo(dividerPadding, dividerY)
    ctx.lineTo(canvas.width - dividerPadding, dividerY)
    ctx.stroke()

    // Определяем максимальную ширину текста
    const maxTitleWidth = canvas.width - contentPadding * 2

    // Название товара - премиальная типографика с адаптивным размером
    // ВАЖНО: название всегда на одной строке, без переноса
    const titleY = dividerY + 80 // Увеличенный отступ для большего воздуха
    ctx.fillStyle = '#0F0F0F' // Charcoal Black из палитры
    
    // Адаптивный размер шрифта - уменьшаем до тех пор, пока название не поместится на одну строку
    const titleText = productName.toUpperCase()
    let titleFontSize = 80 // Базовый размер
    let displayText = titleText
    
    // Устанавливаем начальный шрифт
    ctx.font = `900 ${titleFontSize}px "Cormorant Garamond", serif`
    ctx.letterSpacing = '-0.03em'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Измеряем ширину текста и уменьшаем размер шрифта, пока он не поместится
    let textWidth = ctx.measureText(displayText).width
    const minFontSize = 40 // Минимальный размер шрифта
    
    while (textWidth > maxTitleWidth && titleFontSize > minFontSize) {
      titleFontSize -= 2 // Уменьшаем на 2px за раз
      ctx.font = `900 ${titleFontSize}px "Cormorant Garamond", serif`
      textWidth = ctx.measureText(displayText).width
    }
    
    // Если даже при минимальном размере не помещается, обрезаем текст с многоточием
    if (textWidth > maxTitleWidth) {
      let truncatedText = displayText
      while (ctx.measureText(truncatedText + '...').width > maxTitleWidth && truncatedText.length > 0) {
        truncatedText = truncatedText.slice(0, -1)
      }
      displayText = truncatedText + '...'
    }
    
    // Рисуем название на одной строке с легкой тенью для глубины
    ctx.shadowColor = 'rgba(15, 15, 15, 0.08)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    ctx.fillText(displayText, canvas.width / 2, titleY, maxTitleWidth)
    
    // Сбрасываем тень
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    const titleHeight = titleFontSize * 1.15 // Высота одной строки

    // Цвет товара (если есть) - премиальное отображение с тенью
    // Цвет идет сразу после названия
    let colorY = titleY + titleHeight + 45 // Уменьшенный отступ после названия
    let colorBottomY = colorY // Нижняя граница цвета (для расчета следующего элемента)
    
    if (productColor) {
      const colorHex = productColor.hex || productColor.hex_code || getColorValue(productColor.name)
      const colorName = getColorEnglishName(productColor.name, productColor.slug || undefined)
      
      // Улучшенная типографика для цвета
      const colorFontSize = 32 // Увеличено с 30px
      ctx.font = `400 ${colorFontSize}px "Courier New", monospace`
      ctx.letterSpacing = '0.18em' // Увеличенный tracking для элегантности
      
      // Увеличенный индикатор цвета для лучшей видимости
      const colorIndicatorSize = 36 // Увеличено с 32px
      const borderRadius = 3 // Немного больше скругление
      const colorTextWidth = ctx.measureText(colorName.toUpperCase()).width
      const totalColorWidth = colorIndicatorSize + 20 + colorTextWidth // Увеличенный отступ между индикатором и текстом
      const colorStartX = (canvas.width - totalColorWidth) / 2
      const colorIndicatorX = colorStartX
      const colorIndicatorY = colorY + 14 - colorIndicatorSize / 2
      
      // Рисуем квадратный индикатор с закругленными углами и тонкой обводкой
      const x = colorIndicatorX
      const y = colorIndicatorY
      const w = colorIndicatorSize
      const h = colorIndicatorSize
      const r = borderRadius
      
      // Тень для индикатора
      ctx.shadowColor = 'rgba(15, 15, 15, 0.12)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      // Рисуем закругленный прямоугольник
      ctx.fillStyle = colorHex
      ctx.beginPath()
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
      
      // Тонкая обводка для премиального вида
      ctx.strokeStyle = 'rgba(15, 15, 15, 0.08)'
      ctx.lineWidth = 0.5
      ctx.stroke()
      
      // Сбрасываем тень
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Название цвета - улучшенная типографика
      ctx.fillStyle = '#2A2A2A' // Soft Graphite - темнее для лучшей читаемости
      ctx.font = `400 ${colorFontSize}px "Courier New", monospace`
      ctx.letterSpacing = '0.18em'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      
      // Легкая тень для текста
      ctx.shadowColor = 'rgba(42, 42, 42, 0.08)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      ctx.fillText(colorName.toUpperCase(), colorStartX + colorIndicatorSize + 20, colorIndicatorY + colorIndicatorSize / 2, maxTitleWidth)
      
      // Сбрасываем тень
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      
      // Рассчитываем фактическую нижнюю границу цвета (индикатор 36px + отступ)
      // Индикатор центрирован относительно colorY, его нижняя граница: colorY + 14 + 18 = colorY + 32
      // Текст имеет высоту 32px и выровнен по середине индикатора
      // Фактическая нижняя граница: максимальная из индикатора и текста
      colorBottomY = Math.max(
        colorIndicatorY + colorIndicatorSize, // Нижняя граница индикатора
        colorIndicatorY + colorIndicatorSize / 2 + colorFontSize / 2 // Нижняя граница текста (middle baseline)
      )
    }

    // Цена товара (если есть) - премиальное отображение
    // Цена идет после цвета (или после названия, если цвета нет)
    let priceY = colorBottomY + 50 // Уменьшенный отступ после цвета (или после названия, если цвета нет)
    let priceBottomY = priceY // Нижняя граница цены (для расчета следующего элемента)
    
    if (productPrice && productPrice > 0) {
      // Более заметная цена с улучшенной типографикой
      ctx.fillStyle = '#2A2A2A' // Soft Graphite - темнее для лучшей читаемости
      const priceFontSize = 48 // Увеличено с 42px для большего визуального веса
      ctx.font = `600 ${priceFontSize}px "Cormorant Garamond", serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.letterSpacing = '0.08em' // Увеличенный tracking для элегантности
      
      const priceText = `${productPrice.toLocaleString('ru-RU')} ₽`
      
      // Легкая тень для глубины
      ctx.shadowColor = 'rgba(42, 42, 42, 0.1)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      ctx.fillText(priceText, canvas.width / 2, priceY, maxTitleWidth)
      
      // Сбрасываем тень
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      
      // Рассчитываем фактическую нижнюю границу цены
      const priceMetrics = ctx.measureText(priceText)
      priceBottomY = priceY + priceFontSize + 10 // Высота текста + небольшой отступ
    }

    // Премиальный брендинг внизу - ВСЕГДА рисуем брендинг
    // Убеждаемся, что брендинг не налезает на предыдущие элементы - минимум 60px от последнего элемента
    const lastElementBottom = priceBottomY // Последний элемент - цена (или цвет, если цены нет)
    const brandFontSize = 26 // Увеличено с 24px
    const brandText = 'rosebotanique.store'
    const underlineHeight = 8 // Высота подчеркивания
    const bottomPadding = 20 // Отступ снизу
    
    // Минимальная позиция брендинга: минимум 60px от последнего элемента (уменьшено для экономии места)
    const minBrandY = lastElementBottom + 60
    
    // Максимальная позиция брендинга: не ближе bottomPadding от низа canvas
    // Учитываем высоту текста + подчеркивание + отступ
    const maxBrandY = canvas.height - brandFontSize - underlineHeight - bottomPadding
    
    // Брендинг должен быть минимум на 60px ниже последнего элемента
    // Но не должен выходить за границы canvas
    // Если контент слишком большой и брендинг не помещается, используем максимальную позицию
    let brandY = Math.min(minBrandY, maxBrandY)
    
    // Если minBrandY больше maxBrandY, значит контент слишком большой
    // В этом случае используем фиксированную позицию снизу с достаточным отступом
    if (minBrandY > maxBrandY) {
      brandY = maxBrandY
    }
    
    // Убеждаемся, что brandY в допустимых пределах
    brandY = Math.max(0, Math.min(brandY, canvas.height - brandFontSize - 10))
    
    // Если брендинг все еще слишком близко к контенту, уменьшаем отступы между элементами
    if (brandY - lastElementBottom < 40) {
      // Уменьшаем отступы между элементами для экономии места
      // Это уже обработано выше через уменьшение minBrandY
    }
    
    // ВСЕГДА рисуем брендинг, если он помещается на canvas
    ctx.fillStyle = '#0F0F0F' // Charcoal Black - темный цвет на светлом фоне
    // Используем fallback шрифты на случай, если Inter не загружен
    ctx.font = `300 ${brandFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
    ctx.letterSpacing = '0.12em' // Увеличенный tracking для элегантности
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Измеряем ширину текста для подчеркивания
    const brandTextMetrics = ctx.measureText(brandText)
    const brandTextWidth = brandTextMetrics.width
    const brandTextX = (canvas.width - brandTextWidth) / 2
    
    // Рисуем текст брендинга с легкой тенью для лучшей видимости
    ctx.shadowColor = 'rgba(15, 15, 15, 0.15)' // Увеличена непрозрачность тени
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    ctx.fillText(brandText, canvas.width / 2, brandY, maxTitleWidth)
    
    // Сбрасываем тень
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    
    // Элегантное подчеркивание с градиентом
    const underlineY = brandY + brandFontSize + 8
    
    // Убеждаемся, что подчеркивание не выходит за границы canvas
    if (underlineY < canvas.height - 5) {
      const underlinePadding = 40 // Отступы для подчеркивания
      const underlineStartX = Math.max(0, brandTextX - underlinePadding)
      const underlineEndX = Math.min(canvas.width, brandTextX + brandTextWidth + underlinePadding)
      
      const underlineGradient = ctx.createLinearGradient(
        underlineStartX, 
        underlineY, 
        underlineEndX, 
        underlineY
      )
      underlineGradient.addColorStop(0, 'rgba(15, 15, 15, 0)')
      underlineGradient.addColorStop(0.3, 'rgba(15, 15, 15, 0.4)') // Увеличена непрозрачность
      underlineGradient.addColorStop(0.7, 'rgba(15, 15, 15, 0.4)') // Увеличена непрозрачность
      underlineGradient.addColorStop(1, 'rgba(15, 15, 15, 0)')
      
      ctx.strokeStyle = underlineGradient
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(underlineStartX, underlineY)
      ctx.lineTo(underlineEndX, underlineY)
      ctx.stroke()
    }

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

    // Премиальный фон с легким градиентом (Off-White из палитры проекта)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#F5F5F3') // Off-White сверху
    gradient.addColorStop(1, '#FAFAF8') // Чуть светлее снизу для глубины
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Изображение с увеличенными отступами для большего воздуха
    // Адаптивный размер изображения в зависимости от длины названия
    const titleLength = productName.length
    let imageHeightPercent = 0.52 // Базовый процент высоты canvas для изображения
    
    // Если название длинное, уменьшаем размер изображения для большего пространства под текстом
    if (titleLength > 20) {
      imageHeightPercent = 0.48 // Уменьшаем на 4% для длинных названий
    } else if (titleLength > 15) {
      imageHeightPercent = 0.50 // Уменьшаем на 2% для средних названий
    }
    
    const imagePadding = 100 // Увеличено с 80px для большего воздуха
    const topPadding = 140 // Увеличено с 120px для лучшего баланса
    const imageHeight = Math.floor(canvas.height * imageHeightPercent)
    const imageWidth = canvas.width - imagePadding * 2
    const imageX = imagePadding
    const imageY = topPadding

    // Рисуем изображение с сохранением пропорций
    const imgAspect = img.width / img.height
    const targetAspect = imageWidth / imageHeight
    
    let drawWidth = imageWidth
    let drawHeight = imageHeight
    let drawX = imageX
    let drawY = imageY

    if (imgAspect > targetAspect) {
      // Изображение шире - подгоняем по высоте и центрируем по горизонтали
      drawWidth = imageHeight * imgAspect
      drawX = imageX - (drawWidth - imageWidth) / 2
    } else {
      // Изображение выше - подгоняем по ширине и центрируем по вертикали
      drawHeight = imageWidth / imgAspect
      drawY = imageY - (drawHeight - imageHeight) / 2
      // Ограничиваем сверху, чтобы не выходить за верхнюю границу
      if (drawY < imageY) {
        drawY = imageY
      }
    }

    // Рисуем изображение
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

    // Определяем фактическую нижнюю границу изображения (учитываем возможное обрезание при cover)
    const actualImageBottom = Math.max(
      imageY + imageHeight, // Нижняя граница области изображения
      drawY + drawHeight    // Фактическая нижняя граница изображения (если выходит за область)
    )
    
    // Контент внизу - центрируем относительно изображения
    // Увеличиваем отступ для большего воздуха
    const contentY = actualImageBottom + 120 // Увеличенный отступ после изображения
    const contentHeight = canvas.height - contentY
    const contentPadding = imagePadding

    // Премиальная линия-разделитель с градиентом
    const dividerY = contentY + 50
    const dividerPadding = contentPadding + 60 // Уменьшаем длину линии для элегантности
    
    // Градиент для разделителя
    const dividerGradient = ctx.createLinearGradient(dividerPadding, dividerY, canvas.width - dividerPadding, dividerY)
    dividerGradient.addColorStop(0, 'rgba(102, 102, 102, 0)')
    dividerGradient.addColorStop(0.5, 'rgba(102, 102, 102, 0.3)')
    dividerGradient.addColorStop(1, 'rgba(102, 102, 102, 0)')
    
    ctx.strokeStyle = dividerGradient
    ctx.lineWidth = 1 // Немного толще для лучшей видимости
    ctx.beginPath()
    ctx.moveTo(dividerPadding, dividerY)
    ctx.lineTo(canvas.width - dividerPadding, dividerY)
    ctx.stroke()

    // Определяем максимальную ширину текста
    const maxTitleWidth = canvas.width - contentPadding * 2

    // Название товара - премиальная типографика с адаптивным размером
    // ВАЖНО: название всегда на одной строке, без переноса
    const titleY = dividerY + 80 // Увеличенный отступ для большего воздуха
    ctx.fillStyle = '#0F0F0F' // Charcoal Black из палитры
    
    // Адаптивный размер шрифта - уменьшаем до тех пор, пока название не поместится на одну строку
    const titleText = productName.toUpperCase()
    let titleFontSize = 80 // Базовый размер
    let displayText = titleText
    
    // Устанавливаем начальный шрифт
    ctx.font = `900 ${titleFontSize}px "Cormorant Garamond", serif`
    ctx.letterSpacing = '-0.03em'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Измеряем ширину текста и уменьшаем размер шрифта, пока он не поместится
    let textWidth = ctx.measureText(displayText).width
    const minFontSize = 40 // Минимальный размер шрифта
    
    while (textWidth > maxTitleWidth && titleFontSize > minFontSize) {
      titleFontSize -= 2 // Уменьшаем на 2px за раз
      ctx.font = `900 ${titleFontSize}px "Cormorant Garamond", serif`
      textWidth = ctx.measureText(displayText).width
    }
    
    // Если даже при минимальном размере не помещается, обрезаем текст с многоточием
    if (textWidth > maxTitleWidth) {
      let truncatedText = displayText
      while (ctx.measureText(truncatedText + '...').width > maxTitleWidth && truncatedText.length > 0) {
        truncatedText = truncatedText.slice(0, -1)
      }
      displayText = truncatedText + '...'
    }
    
    // Рисуем название на одной строке с легкой тенью для глубины
    ctx.shadowColor = 'rgba(15, 15, 15, 0.08)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    ctx.fillText(displayText, canvas.width / 2, titleY, maxTitleWidth)
    
    // Сбрасываем тень
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0

    const titleHeight = titleFontSize * 1.15 // Высота одной строки

    // Цвет товара (если есть) - премиальное отображение с тенью
    // Цвет идет сразу после названия
    let colorY = titleY + titleHeight + 45 // Уменьшенный отступ после названия
    let colorBottomY = colorY // Нижняя граница цвета (для расчета следующего элемента)
    
    if (productColor) {
      const colorHex = productColor.hex || productColor.hex_code || getColorValue(productColor.name)
      const colorName = getColorEnglishName(productColor.name, productColor.slug || undefined)
      
      // Улучшенная типографика для цвета
      const colorFontSize = 32 // Увеличено с 30px
      ctx.font = `400 ${colorFontSize}px "Courier New", monospace`
      ctx.letterSpacing = '0.18em' // Увеличенный tracking для элегантности
      
      // Увеличенный индикатор цвета для лучшей видимости
      const colorIndicatorSize = 36 // Увеличено с 32px
      const borderRadius = 3 // Немного больше скругление
      const colorTextWidth = ctx.measureText(colorName.toUpperCase()).width
      const totalColorWidth = colorIndicatorSize + 20 + colorTextWidth // Увеличенный отступ между индикатором и текстом
      const colorStartX = (canvas.width - totalColorWidth) / 2
      const colorIndicatorX = colorStartX
      const colorIndicatorY = colorY + 14 - colorIndicatorSize / 2
      
      // Рисуем квадратный индикатор с закругленными углами и тонкой обводкой
      const x = colorIndicatorX
      const y = colorIndicatorY
      const w = colorIndicatorSize
      const h = colorIndicatorSize
      const r = borderRadius
      
      // Тень для индикатора
      ctx.shadowColor = 'rgba(15, 15, 15, 0.12)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 2
      
      // Рисуем закругленный прямоугольник
      ctx.fillStyle = colorHex
      ctx.beginPath()
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
      
      // Тонкая обводка для премиального вида
      ctx.strokeStyle = 'rgba(15, 15, 15, 0.08)'
      ctx.lineWidth = 0.5
      ctx.stroke()
      
      // Сбрасываем тень
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Название цвета - улучшенная типографика
      ctx.fillStyle = '#2A2A2A' // Soft Graphite - темнее для лучшей читаемости
      ctx.font = `400 ${colorFontSize}px "Courier New", monospace`
      ctx.letterSpacing = '0.18em'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      
      // Легкая тень для текста
      ctx.shadowColor = 'rgba(42, 42, 42, 0.08)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      ctx.fillText(colorName.toUpperCase(), colorStartX + colorIndicatorSize + 20, colorIndicatorY + colorIndicatorSize / 2, maxTitleWidth)
      
      // Сбрасываем тень
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      
      // Рассчитываем фактическую нижнюю границу цвета (индикатор 36px + отступ)
      // Индикатор центрирован относительно colorY, его нижняя граница: colorY + 14 + 18 = colorY + 32
      // Текст имеет высоту 32px и выровнен по середине индикатора
      // Фактическая нижняя граница: максимальная из индикатора и текста
      colorBottomY = Math.max(
        colorIndicatorY + colorIndicatorSize, // Нижняя граница индикатора
        colorIndicatorY + colorIndicatorSize / 2 + colorFontSize / 2 // Нижняя граница текста (middle baseline)
      )
    }

    // Цена товара (если есть) - премиальное отображение
    // Цена идет после цвета (или после названия, если цвета нет)
    let priceY = colorBottomY + 50 // Уменьшенный отступ после цвета (или после названия, если цвета нет)
    let priceBottomY = priceY // Нижняя граница цены (для расчета следующего элемента)
    
    if (productPrice && productPrice > 0) {
      // Более заметная цена с улучшенной типографикой
      ctx.fillStyle = '#2A2A2A' // Soft Graphite - темнее для лучшей читаемости
      const priceFontSize = 48 // Увеличено с 42px для большего визуального веса
      ctx.font = `600 ${priceFontSize}px "Cormorant Garamond", serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.letterSpacing = '0.08em' // Увеличенный tracking для элегантности
      
      const priceText = `${productPrice.toLocaleString('ru-RU')} ₽`
      
      // Легкая тень для глубины
      ctx.shadowColor = 'rgba(42, 42, 42, 0.1)'
      ctx.shadowBlur = 3
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 1
      ctx.fillText(priceText, canvas.width / 2, priceY, maxTitleWidth)
      
      // Сбрасываем тень
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      
      // Рассчитываем фактическую нижнюю границу цены
      const priceMetrics = ctx.measureText(priceText)
      priceBottomY = priceY + priceFontSize + 10 // Высота текста + небольшой отступ
    }

    // Премиальный брендинг внизу - ВСЕГДА рисуем брендинг
    // Убеждаемся, что брендинг не налезает на предыдущие элементы - минимум 60px от последнего элемента
    const lastElementBottom = priceBottomY // Последний элемент - цена (или цвет, если цены нет)
    const brandFontSize = 26 // Увеличено с 24px
    const brandText = 'rosebotanique.store'
    const underlineHeight = 8 // Высота подчеркивания
    const bottomPadding = 20 // Отступ снизу
    
    // Минимальная позиция брендинга: минимум 60px от последнего элемента (уменьшено для экономии места)
    const minBrandY = lastElementBottom + 60
    
    // Максимальная позиция брендинга: не ближе bottomPadding от низа canvas
    // Учитываем высоту текста + подчеркивание + отступ
    const maxBrandY = canvas.height - brandFontSize - underlineHeight - bottomPadding
    
    // Брендинг должен быть минимум на 60px ниже последнего элемента
    // Но не должен выходить за границы canvas
    // Если контент слишком большой и брендинг не помещается, используем максимальную позицию
    let brandY = Math.min(minBrandY, maxBrandY)
    
    // Если minBrandY больше maxBrandY, значит контент слишком большой
    // В этом случае используем фиксированную позицию снизу с достаточным отступом
    if (minBrandY > maxBrandY) {
      brandY = maxBrandY
    }
    
    // Убеждаемся, что brandY в допустимых пределах
    brandY = Math.max(0, Math.min(brandY, canvas.height - brandFontSize - 10))
    
    // Если брендинг все еще слишком близко к контенту, уменьшаем отступы между элементами
    if (brandY - lastElementBottom < 40) {
      // Уменьшаем отступы между элементами для экономии места
      // Это уже обработано выше через уменьшение minBrandY
    }
    
    // ВСЕГДА рисуем брендинг, если он помещается на canvas
    ctx.fillStyle = '#0F0F0F' // Charcoal Black - темный цвет на светлом фоне
    // Используем fallback шрифты на случай, если Inter не загружен
    ctx.font = `300 ${brandFontSize}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
    ctx.letterSpacing = '0.12em' // Увеличенный tracking для элегантности
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    // Измеряем ширину текста для подчеркивания
    const brandTextMetrics = ctx.measureText(brandText)
    const brandTextWidth = brandTextMetrics.width
    const brandTextX = (canvas.width - brandTextWidth) / 2
    
    // Рисуем текст брендинга с легкой тенью для лучшей видимости
    ctx.shadowColor = 'rgba(15, 15, 15, 0.15)' // Увеличена непрозрачность тени
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    ctx.fillText(brandText, canvas.width / 2, brandY, maxTitleWidth)
    
    // Сбрасываем тень
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    
    // Элегантное подчеркивание с градиентом
    const underlineY = brandY + brandFontSize + 8
    
    // Убеждаемся, что подчеркивание не выходит за границы canvas
    if (underlineY < canvas.height - 5) {
      const underlinePadding = 40 // Отступы для подчеркивания
      const underlineStartX = Math.max(0, brandTextX - underlinePadding)
      const underlineEndX = Math.min(canvas.width, brandTextX + brandTextWidth + underlinePadding)
      
      const underlineGradient = ctx.createLinearGradient(
        underlineStartX, 
        underlineY, 
        underlineEndX, 
        underlineY
      )
      underlineGradient.addColorStop(0, 'rgba(15, 15, 15, 0)')
      underlineGradient.addColorStop(0.3, 'rgba(15, 15, 15, 0.4)') // Увеличена непрозрачность
      underlineGradient.addColorStop(0.7, 'rgba(15, 15, 15, 0.4)') // Увеличена непрозрачность
      underlineGradient.addColorStop(1, 'rgba(15, 15, 15, 0)')
      
      ctx.strokeStyle = underlineGradient
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(underlineStartX, underlineY)
      ctx.lineTo(underlineEndX, underlineY)
      ctx.stroke()
    }

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
          // Для Telegram важно передать ссылку и в text, и в url для максимальной совместимости
          await navigator.share({
            files: [imageFile],
            title: `${productName} - rosebotanique.store`,
            text: telegramText, // Текст с ссылкой для отображения
            url: productUrl, // Ссылка для кликабельности
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
            title: `${productName} - rosebotanique.store`,
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

      // Показываем инструкцию с информацией о ссылке
      alert(`Изображение для Stories сохранено!\n\nОткройте Instagram и загрузите его в Stories.\n\nДля добавления активной ссылки:\n1. Загрузите изображение в Stories\n2. Нажмите на иконку стикера (📎)\n3. Выберите "Ссылка"\n4. Вставьте: ${productUrl}`)
    } catch (error) {
      console.error('Ошибка при создании изображения для Stories:', error)
      setIsGeneratingStory(false)
      alert('Не удалось создать изображение для Stories. Попробуйте позже.')
    }
  }

  // Функция для переноса текста на несколько строк с обработкой длинных слов
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number, maxLines: number = 4): string[] => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (let i = 0; i < words.length; i++) {
      // Проверяем лимит строк перед обработкой нового слова
      if (lines.length >= maxLines) {
        // Если уже достигли максимума, обрезаем последнюю строку и возвращаем
        if (lines.length > 0) {
          const lastLine = lines[lines.length - 1]
          const truncated = lastLine.length > 25 ? lastLine.substring(0, 22) + '...' : lastLine + '...'
          lines[lines.length - 1] = truncated
        }
        return lines
      }

      const word = words[i]
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const width = ctx.measureText(testLine).width

      if (width <= maxWidth && currentLine) {
        // Слово помещается на текущую строку
        currentLine = testLine
      } else {
        // Слово не помещается или это первое слово
        if (currentLine) {
          lines.push(currentLine)
          // Проверяем лимит после добавления строки
          if (lines.length >= maxLines) {
            return lines
          }
        }
        
        // Проверяем, помещается ли одно слово на строку
        const wordWidth = ctx.measureText(word).width
        if (wordWidth > maxWidth) {
          // Слово слишком длинное - разбиваем по символам
          let charLine = ''
          for (let j = 0; j < word.length; j++) {
            // Проверяем лимит перед обработкой каждого символа
            if (lines.length >= maxLines) {
              if (charLine) {
                lines.push(charLine)
              }
              return lines
            }

            const char = word[j]
            const testCharLine = charLine + char
            const charWidth = ctx.measureText(testCharLine).width
            
            if (charWidth <= maxWidth) {
              charLine = testCharLine
            } else {
              if (charLine) {
                lines.push(charLine)
                // Проверяем лимит после добавления строки
                if (lines.length >= maxLines) {
                  return lines
                }
              }
              charLine = char
            }
          }
          // Добавляем последнюю часть длинного слова, если есть место
          if (charLine && lines.length < maxLines) {
            currentLine = charLine
          } else {
            currentLine = ''
          }
        } else {
          currentLine = word
        }
      }
    }

    // Добавляем последнюю строку, если есть место
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine)
    }

    return lines
  }

  if (variant === 'card') {
    // Компактный вариант для карточки товара - улучшенный дизайн
    return (
      <div className={cn('flex gap-1.5', className)}>
        <button
          onClick={handleShareTelegram}
          className="group relative inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-sm md:backdrop-blur-md shadow-fintage-sm bg-fintage-offwhite/90 dark:bg-fintage-charcoal/90 border border-fintage-graphite/20 dark:border-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite hover:border-[#0088cc]/40 dark:hover:border-[#0088cc]/50 hover:bg-[#0088cc]/5 dark:hover:bg-[#0088cc]/10 hover:scale-110 active:scale-105 transition-all duration-300"
          aria-label="Поделиться в Telegram с изображением"
          title="Поделиться в Telegram с изображением"
        >
          <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover:text-[#0088cc] dark:group-hover:text-[#0088cc] transition-colors duration-300" />
        </button>
        {productImageUrl && (
          <button
            onClick={handleShareInstagramStory}
            disabled={isGeneratingStory}
            className="group relative inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-sm md:backdrop-blur-md shadow-fintage-sm bg-fintage-offwhite/90 dark:bg-fintage-charcoal/90 border border-fintage-graphite/20 dark:border-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite hover:border-[#dc2743]/40 dark:hover:border-[#dc2743]/50 hover:bg-gradient-to-br hover:from-[#f09433]/10 hover:via-[#e6683c]/10 hover:to-[#dc2743]/10 dark:hover:from-[#f09433]/15 dark:hover:via-[#e6683c]/15 dark:hover:to-[#dc2743]/15 hover:scale-110 active:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Поделиться в Instagram Stories"
            title="Поделиться в Instagram Stories"
          >
            <Instagram className="h-3 w-3 sm:h-3.5 sm:w-3.5 group-hover:opacity-80 transition-opacity duration-300" 
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            />
          </button>
        )}
      </div>
    )
  }

  // Полный вариант для страницы товара
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Заголовок "Поделиться" */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-[0.15em] text-fintage-graphite dark:text-fintage-graphite/70">
          Поделиться
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-fintage-graphite/20 via-fintage-graphite/30 to-transparent dark:from-fintage-graphite/30 dark:via-fintage-graphite/40" />
      </div>
      
      {/* Кнопки с иконками */}
      <div className="flex gap-3">
        {/* Telegram кнопка - только иконка */}
        <Button
          variant="outline"
          onClick={handleShareTelegram}
          size="icon"
          className="group relative h-12 w-12 rounded-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 bg-transparent hover:bg-[#0088cc]/5 dark:hover:bg-[#0088cc]/10 hover:border-[#0088cc]/30 dark:hover:border-[#0088cc]/40 transition-all duration-300 overflow-hidden"
        >
          {/* Фоновый эффект при hover */}
          <span className="absolute inset-0 bg-gradient-to-r from-[#0088cc]/0 via-[#0088cc]/5 to-[#0088cc]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <Send className="h-5 w-5 relative z-10 text-fintage-charcoal dark:text-fintage-offwhite group-hover:text-[#0088cc] dark:group-hover:text-[#0088cc] group-hover:scale-110 transition-all duration-300" />
        </Button>
        
        {productImageUrl && (
          /* Instagram кнопка - только иконка */
          <Button
            variant="outline"
            onClick={handleShareInstagramStory}
            disabled={isGeneratingStory}
            size="icon"
            className="group relative h-12 w-12 rounded-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 bg-transparent hover:bg-gradient-to-r hover:from-[#f09433]/10 hover:via-[#e6683c]/10 hover:to-[#dc2743]/10 dark:hover:from-[#f09433]/15 dark:hover:via-[#e6683c]/15 dark:hover:to-[#dc2743]/15 hover:border-[#dc2743]/30 dark:hover:border-[#dc2743]/40 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Градиентный фон при hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-[#f09433]/0 via-[#e6683c]/5 to-[#dc2743]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Instagram 
              className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform duration-300" 
              style={{
                background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            />
          </Button>
        )}
      </div>
    </div>
  )
}

