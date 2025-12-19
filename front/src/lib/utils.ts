import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getColorValue(color: string): string {
  const colorMap: Record<string, string> = {
    linen: "#F5F5DC",
    natural: "#F5F5DC",
    cream: "#FFFDD0",
    sage: "#9CAF88",
    "muted green": "#8FBC8F",
    canvas: "#F0E68C",
    stone: "#708090",
    gray: "#9CA3AF",
    hemp: "#B8B8A3",
    cloud: "#F5DEB3",
    "off-white": "#FAFAFA",
    cotton: "#F5F5F5",
    "stone gray": "#708090",
    tonal: "#A8A8A8",
    "storm gray": "#6B6B6B",
    pistachio: "#93C572",
    "черный": "#000000",
    "black": "#000000",
    "reed": "#DC143C",
    "red": "#DC143C",
    // Fallback colors
    sand: "#F3E5AB",
    olive: "#808000",
    charcoal: "#36454F",
    tan: "#D2B48C",
    burgundy: "#800020",
    beige: "#F5F5DC",
    terracotta: "#E2725B",
    forest: "#228B22",
    midnight: "#191970",
    moss: "#8A9A5B",
    camel: "#C19A6B",
    navy: "#000080",
    rust: "#B7410E",
    earth: "#8B4513",
    sunset: "#FD5E53",
    moonlight: "#C0C0C0",
    cognac: "#9F4636",
    slate: "#708090"
  }
  return colorMap[color] || "#9CA3AF"
}

export function getColorDisplayName(color: string, locale: 'ru' | 'en' = 'ru'): string {
  if (locale === 'en') return color
  const map: Record<string, string> = {
    linen: 'лен',
    natural: 'натуральный',
    cream: 'сливочный',
    sage: 'шалфей',
    'muted green': 'приглушённый зелёный',
    canvas: 'холст',
    stone: 'камень',
    gray: 'серый',
    hemp: 'конопляный',
    cloud: 'облако',
    'off-white': 'молочный',
    cotton: 'хлопок',
    'stone gray': 'серый камень',
    tonal: 'тон‑в‑тон',
    'storm gray': 'штормовой серый',
    pistachio: 'фисташка',
    black: 'чёрный',
    reed: 'тростник',
    red: 'красный',
  }
  return map[color] || color
}

/**
 * Преобразует название цвета в английское для отображения в бэк-офисе
 * Использует обратный маппинг русских названий в английские
 */
export function getColorEnglishName(colorName: string, colorSlug?: string): string {
  // Обратный маппинг русских названий в английские
  const reverseMap: Record<string, string> = {
    'лен': 'Linen',
    'натуральный': 'Natural',
    'сливочный': 'Cream',
    'шалфей': 'Sage',
    'приглушённый зелёный': 'Muted Green',
    'холст': 'Canvas',
    'камень': 'Stone',
    'серый': 'Gray',
    'конопляный': 'Hemp',
    'облако': 'Cloud',
    'молочный': 'Off-White',
    'хлопок': 'Cotton',
    'серый камень': 'Stone Gray',
    'тон‑в‑тон': 'Tonal',
    'штормовой серый': 'Storm Gray',
    'фисташка': 'Pistachio',
    'чёрный': 'Black',
    'черный': 'Black',
    'тростник': 'Reed',
    'красный': 'Red',
    'нежно-розовый': 'Soft Pink',
    'тёмно-коричневый': 'Dark Brown',
    'темно-коричневый': 'Dark Brown',
    'оливковый': 'Olive',
    'тёплый офф-вайт': 'Warm Off-White',
    'теплый офф-вайт': 'Warm Off-White',
    'глухой синий': 'Muted Blue',
  }
  
  // Если название уже на английском, возвращаем как есть
  if (reverseMap[colorName.toLowerCase()]) {
    return reverseMap[colorName.toLowerCase()]
  }
  
  // Если название похоже на английское (нет кириллицы), возвращаем с заглавной буквы
  if (!/[а-яё]/i.test(colorName)) {
    return colorName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
  }
  
  // Если есть slug, используем его для генерации английского названия
  if (colorSlug) {
    return colorSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  
  // Fallback: возвращаем оригинальное название
  return colorName
}

export function formatPriceWithLocale(price: number, _locale: 'ru' | 'en'): string {
  // Всегда показываем рубли независимо от языка
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

