import { Product, Category } from '@/types'

export const mockProducts: Product[] = [
  {
    id: 1,
    title: "Tote — Linen Calm",
    description: "Crafted from unbleached linen with a gentle weave, Linen Calm embodies quiet simplicity. Its neutral tone and soft structure capture the essence of natural restraint and everyday grace.",
    price: 4200,
    category: "tote bags",
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
    title: "Tote — Sage Field",
    description: "Washed cotton canvas in muted sage tint — Sage Field reflects the serenity of open air and the warmth of hand-made work. A timeless shape that feels both grounded and light.",
    price: 4200,
    category: "tote bags",
    image: "/collection/tote-sage.jpg.png",
    colors: ["sage"],
    inStock: true
  },
  {
    id: 3,
    title: "Tote — Stone Haze",
    description: "Structured yet tactile, Stone Haze is made of dense gray hemp canvas. Its soft matte finish and subtle stitching evoke a sense of calm permanence and northern clarity.",
    price: 4200,
    category: "tote bags",
    image: "/collection/tote-stone.jpg.png",
    colors: ["stone"],
    inStock: true
  },
  {
    id: 4,
    title: "Tote — Cloud Canvas",
    description: "In off-white organic cotton, Cloud Canvas carries light itself. Minimal, weightless, and effortless — a quiet companion for everyday movement.",
    price: 4200,
    category: "tote bags",
    image: "/collection/tote-cloud.jpg.png",
    colors: ["cloud"],
    inStock: true
  },
  {
    id: 5,
    title: "Weekender Sling",
    description: "Crafted for calm departures, Weekender Sling pairs structure with softness. In stone-gray canvas with tonal details, it carries the ease of a short escape — steady, grounded, and timeless.",
    price: 5800,
    category: "shoulder bags",
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
    title: "Storm Shell Duffel",
    description: "Built from matte waterproof fabric, Storm Shell Duffel endures the weather with quiet confidence. Minimal, resilient, and composed — a nordic approach to performance and permanence.",
    price: 6500,
    category: "duffel bags",
    image: "/collection/storm-shell-duffel.jpg.png",
    colors: ["storm gray", "pistachio"],
    colorImages: {
      "storm gray": "/collection/storm-shell-duffel-gray.jpg.png",
      "pistachio": "/collection/storm-shell-duffel.jpg.png"
    },
    inStock: true
  }
]

export const mockCategories: Category[] = [
  { id: "all", name: "All products", slug: "all" },
  { id: "shoulder bags", name: "Shoulder bags", slug: "shoulder-bags" },
  { id: "tote bags", name: "Tote bags", slug: "tote-bags" },
  { id: "duffel bags", name: "Duffel bags", slug: "duffel-bags" },
  { id: "crossbody bags", name: "Crossbody bags", slug: "crossbody-bags" },
  { id: "market bags", name: "Market bags", slug: "market-bags" },
  { id: "backpacks", name: "Backpacks", slug: "backpacks" },
  { id: "things", name: "Things", slug: "things" }
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


