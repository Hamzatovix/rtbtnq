import { Product, Category } from '@/types'

export const mockProducts: any[] = [
  {
    id: 1,
    slug: "tote-linen-calm",
    title_ru: "тоут — linen calm",
    title_en: "Tote — Linen Calm",
    description_ru: "сшит из небелёного льна с мягким плетением — linen calm про простую тишину. нейтральный тон и мягкая форма передают сдержанность и спокойную повседневность.",
    description_en: "Crafted from unbleached linen with a gentle weave, Linen Calm embodies quiet simplicity. Its neutral tone and soft structure capture the essence of natural restraint and everyday grace.",
    price: 4200,
    category_id: "tote-bags",
    image: "/collection/tote-linen.jpg.png",
    colors: ["linen", "black"],
    colorImages: {
      "linen": "/collection/tote-linen.jpg.png",
      "black": "/collection/linen-back.png"
    },
    inStock: true
  },
  {
    id: 2,
    slug: "tote-sage-field",
    title_ru: "тоут — sage field",
    title_en: "Tote — Sage Field",
    description_ru: "хлопковый холст с выстиранной фактурой в приглушённом оттенке шалфея — sage field про спокойствие открытого воздуха и тепло ручной работы. форма вне времени — устойчиво и легко.",
    description_en: "Washed cotton canvas in muted sage tint — Sage Field reflects the serenity of open air and the warmth of hand-made work. A timeless shape that feels both grounded and light.",
    price: 4200,
    category_id: "tote-bags",
    image: "/collection/tote-sage.jpg.png",
    colors: ["sage"],
    inStock: true
  },
  {
    id: 3,
    slug: "tote-stone-haze",
    title_ru: "тоут — stone haze",
    title_en: "Tote — Stone Haze",
    description_ru: "структурный и тактильный — stone haze из плотного серого конопляного холста. мягкий матовый финиш и сдержанная отстрочка передают ощущение спокойной устойчивости и северной ясности.",
    description_en: "Structured yet tactile, Stone Haze is made of dense gray hemp canvas. Its soft matte finish and subtle stitching evoke a sense of calm permanence and northern clarity.",
    price: 4200,
    category_id: "tote-bags",
    image: "/collection/tote-stone.jpg.png",
    colors: ["stone"],
    inStock: true
  },
  {
    id: 4,
    slug: "tote-cloud-canvas",
    title_ru: "тоут — cloud canvas",
    title_en: "Tote — Cloud Canvas",
    description_ru: "из органического хлопка оттенка off‑white — cloud canvas несёт в себе свет. минимально, невесомо, без усилий — тихий спутник на каждый день.",
    description_en: "In off-white organic cotton, Cloud Canvas carries light itself. Minimal, weightless, and effortless — a quiet companion for everyday movement.",
    price: 4200,
    category_id: "tote-bags",
    image: "/collection/tote-cloud.jpg.png",
    colors: ["cloud"],
    inStock: true
  },
  {
    id: 5,
    slug: "weekender-sling",
    title_ru: "weekender sling",
    title_en: "Weekender Sling",
    description_ru: "для спокойных отъездов — weekender sling сочетает структуру и мягкость. каменно‑серый холст с тон‑в‑тон деталями несёт лёгкость короткого побега — устойчиво, уверенно, вне времени.",
    description_en: "Crafted for calm departures, Weekender Sling pairs structure with softness. In stone-gray canvas with tonal details, it carries the ease of a short escape — steady, grounded, and timeless.",
    price: 5800,
    category_id: "shoulder-bags",
    image: "/collection/weekender-sling.jpg.png",
    colors: ["stone gray", "red"],
    colorImages: {
      "stone gray": "/collection/weekender-sling.jpg.png",
      "red": "/collection/weekender-sling-reed.jpg.png"
    },
    inStock: true
  },
  {
    id: 6,
    slug: "storm-shell-duffel",
    title_ru: "storm shell duffel",
    title_en: "Storm Shell Duffel",
    description_ru: "матовая водостойкая ткань — storm shell duffel спокойно держит погоду. минимально, стойко, собранно — северный взгляд на практичность и долговечность.",
    description_en: "Built from matte waterproof fabric, Storm Shell Duffel endures the weather with quiet confidence. Minimal, resilient, and composed — a nordic approach to performance and permanence.",
    price: 6500,
    category_id: "duffel-bags",
    image: "/collection/storm-shell-duffel.jpg.png",
    colors: ["storm gray", "pistachio"],
    colorImages: {
      "storm gray": "/collection/storm-shell-duffel-gray.jpg.png",
      "pistachio": "/collection/storm-shell-duffel.jpg.png"
    },
    inStock: true
  }
]

export const mockCategories: Array<{ id: string; slug: string; name_ru: string; name_en: string }> = [
  { id: "all", slug: "all", name_ru: "все товары", name_en: "All products" },
  { id: "shoulder-bags", slug: "shoulder-bags", name_ru: "сумки на плечо", name_en: "Shoulder bags" },
  { id: "tote-bags", slug: "tote-bags", name_ru: "тоуты", name_en: "Tote bags" },
  { id: "duffel-bags", slug: "duffel-bags", name_ru: "дорожные сумки", name_en: "Duffel bags" },
  { id: "crossbody-bags", slug: "crossbody-bags", name_ru: "кросс-боди", name_en: "Crossbody bags" },
  { id: "market-bags", slug: "market-bags", name_ru: "сумки для рынка", name_en: "Market bags" },
  { id: "backpacks", slug: "backpacks", name_ru: "рюкзаки", name_en: "Backpacks" },
  { id: "things", slug: "things", name_ru: "вещи", name_en: "Things" },
]

export const colorMap: Record<string, string> = {
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
  "red": "#DC143C"
}


