// Одноразовый скрипт: делает второстепенный текст (подписи, метки, счётчики) в тёмной теме
// таким же ярким, как основной текст (offwhite), вместо приглушённого text-fintage-graphite/XX.
// Пропускает строки, где graphite используется как индикатор состояния (неактивная вкладка,
// "нет в наличии"), а не как декоративная подпись - там приглушение сделано намеренно.
import fs from 'fs'

const files = [
  'src/app/gallery/page.tsx',
  'src/app/product/[id]/page.tsx',
  'src/app/checkout/page.tsx',
  'src/app/brand/page.tsx',
  'src/app/catalog/CatalogClient.tsx',
  'src/app/order/success/page.tsx',
  'src/app/about/page.tsx',
  'src/components/cart/cart-drawer.tsx',
  'src/components/settings-panel.tsx',
  'src/components/sections/hero.tsx',
  'src/components/product/product-share-buttons.tsx',
  'src/components/ui/toast.tsx',
  'src/components/ui/error-boundary.tsx',
  'src/components/sections/featured-products.tsx',
  'src/components/product/product-card.tsx',
  'src/components/ui/Swatches.tsx',
  'src/components/favorites/favorites-drawer.tsx',
  'src/components/ui/CareIcons.tsx',
  'src/components/sections/about.tsx',
  'src/components/product/product-card-swatches.tsx',
  'src/components/ui/card.tsx',
  'src/components/layout/footer.tsx',
  'src/components/layout/SiteHeader.client.tsx',
  'src/components/product/product-card-cart-button.tsx',
]

// Строки с этими маркерами трогать нельзя - там graphite означает состояние (не выбрано / нет в наличии)
const skipMarkers = [
  "hover:text-fintage-charcoal dark:hover:text-fintage-offwhite hover:border-fintage-graphite",
  "isOutOfStock",
]

const pattern = /text-fintage-graphite(\/\d+)?(\s+)dark:text-fintage-graphite(\/\d+)?/g

let totalChanges = 0
for (const rel of files) {
  const path = new URL(`../${rel}`, import.meta.url)
  let content = fs.readFileSync(path, 'utf8')
  const lines = content.split('\n')
  let fileChanges = 0
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (skipMarkers.some(m => line.includes(m))) continue
    if (!pattern.test(line)) { pattern.lastIndex = 0; continue }
    pattern.lastIndex = 0
    lines[i] = line.replace(pattern, (m, lightOpacity, ws) => `text-fintage-graphite${lightOpacity || ''}${ws}dark:text-fintage-offwhite`)
    if (lines[i] !== line) fileChanges++
  }
  if (fileChanges > 0) {
    fs.writeFileSync(path, lines.join('\n'))
    console.log(`${rel}: ${fileChanges} замен`)
    totalChanges += fileChanges
  }
}
console.log(`\nВсего изменений: ${totalChanges}`)
