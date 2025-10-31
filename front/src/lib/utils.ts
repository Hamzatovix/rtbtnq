import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
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


