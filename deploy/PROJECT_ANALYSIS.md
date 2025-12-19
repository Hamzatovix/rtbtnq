# 🔍 Детальный анализ проекта Rose Botanique

## 📋 Обзор проекта

**Технологический стек:**
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **Стилизация:** Tailwind CSS, кастомная дизайн-система "Fintage"
- **Анимации:** Framer Motion
- **State Management:** Zustand (корзина, избранное)
- **Data Fetching:** SWR (клиент), Server Actions (сервер)
- **i18n:** next-intl (ru/en)
- **База данных:** SQLite через Prisma ORM
- **Хранилище изображений:** Vercel Blob Storage
- **Уведомления:** Telegram Bot API

---

## 🎨 Архитектура каталога

### 1. Загрузка данных каталога

**Файл:** `front/src/server/catalog/catalog.service.ts`

**Процесс загрузки:**

```typescript
// 1. Параллельная загрузка всех данных
const [rawProducts, rawCategories, rawColors] = await Promise.all([
  loadProducts(),      // из src/data/products.json
  loadCategories(),    // из src/data/categories.json
  loadColors(),       // из src/data/colors.json
])

// 2. Маппинг и фильтрация
const categories = mapCategories(rawCategories)  // фильтрует is_active !== false
const colors = mapColors(rawColors)              // просто маппинг

// 3. Построение карточек товаров
const products = rawProducts
  .map(product => buildProductListItem(product, categories, colors))
  .filter(product => product.isPublished)  // только опубликованные

// 4. ⚠️ КРИТИЧЕСКИЙ МОМЕНТ: Фильтрация цветов
// Показываются только цвета, которые есть в опубликованных товарах
const availableColors = colors.filter(color =>
  publishedProductColorIds.has(color.id)
)
```

**Проблема:** Если нет опубликованных товаров с цветами, цвета не отображаются в фильтрах!

---

### 2. Почему пропадают цвета и категории?

#### ❌ Причина 1: Фильтрация цветов по товарам

**Код:** `catalog.service.ts:136-140`

```typescript
// Фильтруем цвета, оставляя только те, которые есть в опубликованных товарах
const availableColors = colors.filter((color) =>
  publishedProductColorIds.has(color.id),
)
```

**Проблема:**
- Если товар не опубликован (`isPublished: false`) → его цвета не учитываются
- Если у товара нет вариантов с цветами → цвета не учитываются
- Если `variant.colorId` не совпадает с ID цвета в базе → цвет не учитывается

#### ❌ Причина 2: Несоответствие ID цветов

**Код:** `catalog.service.ts:58-64`

```typescript
const productColors = variants
  .map((variant: any) => {
    const color = colors.find((c) => String(c.id) === String(variant.colorId))
    if (!color) return null  // ⚠️ Если цвет не найден - возвращается null
    return color
  })
  .filter((color: CatalogColor | null): color is CatalogColor => Boolean(color))
```

**Проблема:**
- Если `variant.colorId` не совпадает с `color.id` из базы → цвет не добавляется
- Типы ID могут не совпадать (число vs строка)

#### ❌ Причина 3: Категории фильтруются по is_active

**Код:** `catalog.service.ts:16-24`

```typescript
function mapCategories(rawCategories: any[]): Category[] {
  return rawCategories
    .filter((cat) => cat?.is_active !== false)  // ⚠️ Фильтрует неактивные
    .map((cat) => ({ ... }))
}
```

**Проблема:**
- Если категория имеет `is_active: false` → она не показывается
- Если категория не привязана ни к одному товару → она всё равно показывается (в отличие от цветов)

---

## 📸 Загрузка изображений

### Процесс загрузки изображения

**1. Клиентская часть** (`backoffice/products/new/page.tsx:468-493`)

```typescript
// Пользователь выбирает файл
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Создаём FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // Отправляем на API
    const res = await fetch('/api/upload/image', {
      method: 'POST',
      body: formData,
    })
    
    const data = await res.json()
    if (data.url) {
      // Добавляем URL в массив изображений варианта
      const next = [...(v.images||[]), { url: data.url }]
      updateVariant(idx, { images: next })
    }
  }}
/>
```

**2. Серверная часть** (`api/upload/image/route.ts`)

```typescript
export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  
  // Валидация
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Файл должен быть изображением' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Файл слишком большой. Максимум 5MB' }, { status: 400 })
  }
  
  // Генерация имени файла
  const ext = file.name.split('.').pop() || 'png'
  const filename = `${Date.now()}-${nanoid(10)}.${ext}`
  const folder = (formData.get('folder') as string) || 'products'
  
  // Загрузка в Vercel Blob
  const arrayBuffer = await file.arrayBuffer()
  const { url } = await put(`${folder}/${filename}`, Buffer.from(arrayBuffer), {
    access: 'public',
    contentType: file.type,
  })
  
  return NextResponse.json({ url, filename })
}
```

**3. Хранение URL в товаре**

После загрузки изображения URL сохраняется в варианте товара:

```typescript
variants: [
  {
    colorId: "1",
    priceCents: 500000,
    images: [
      { url: "https://xxx.public.blob.vercel-storage.com/products/123-abc.png" }
    ]
  }
]
```

---

## 🛍️ Создание карточки товара

### Процесс создания товара

**1. Форма создания** (`backoffice/products/new/page.tsx`)

```typescript
// Состояние формы
const [name, setName] = useState('')
const [slug, setSlug] = useState('')
const [description, setDescription] = useState('')
const [categoryId, setCategoryId] = useState<string>('')
const [variants, setVariants] = useState<VariantDraft[]>([
  { colorId: '', priceCents: 0, images: [] }
])

// Загрузка категорий и цветов
useEffect(() => {
  Promise.all([
    fetch('/api/categories', { cache:'no-store' }).then(r => r.json()),
    fetch('/api/colors', { cache:'no-store' }).then(r => r.json()),
  ]).then(([cats, cols]) => {
    setCategories(Array.isArray(cats) ? cats : cats.results)
    setColors(cols.results ?? cols)
  })
}, [])
```

**2. Валидация и отправка** (`backoffice/products/new/page.tsx:68-96`)

```typescript
const validateForm = () => {
  if (!name || !slug) return false
  if (!categoryId) return false
  if (variants.length === 0) return false
  if (variants.some(v => !v.colorId || v.priceCents <= 0)) return false
  if (variants.some(v => !v.images || v.images.length === 0)) return false
  return true
}

const handleSave = async () => {
  if (!validateForm()) {
    alert('Заполните все обязательные поля')
    return
  }
  
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      slug,
      description,
      categoryId,
      variants,
      isPublished: isPublished,
    }),
  })
  
  // ...
}
```

**3. Сохранение на сервере** (`api/products/route.ts:28-131`)

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, slug, description, categoryId, variants, isPublished } = body
  
  // Загружаем существующие товары
  const products = await loadProducts()
  
  // Проверяем уникальность slug
  if (products.some(prod => prod.slug === slug)) {
    return NextResponse.json({ error: 'Товар с таким slug уже существует' }, { status: 400 })
  }
  
  // Создаём новый товар
  const newProduct = {
    id: Date.now().toString(),
    slug,
    name,
    description,
    categoryId,
    isPublished: !!isPublished,
    variants: variants.map((variant, idx) => ({
      ...variant,
      sku: variant.sku || `${newId}-${variant.colorId || idx}`,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // Сохраняем
  products.push(newProduct)
  await saveProducts(products, 'wrapped')
  
  return NextResponse.json(newProduct, { status: 201 })
}
```

**4. Построение карточки для каталога** (`catalog.service.ts:41-87`)

```typescript
function buildProductListItem(product, categories, colors) {
  // Фильтруем только опубликованные
  if (!product?.isPublished) return null
  
  // Находим категорию
  const productCategory = categories.find(c => String(c.id) === String(product.categoryId))
  
  // Находим цвета из вариантов
  const productColors = product.variants
    .map(variant => {
      const color = colors.find(c => String(c.id) === String(variant.colorId))
      return color
    })
    .filter(Boolean)
  
  // Собираем изображения по цветам
  const variantImages = product.variants.reduce((acc, variant) => {
    if (variant.colorId && variant.images?.[0]?.url) {
      acc[String(variant.colorId)] = variant.images[0].url
    }
    return acc
  }, {})
  
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: productCategory,
    thumbnail: product.variants[0]?.images?.[0]?.url ?? null,
    price: product.variants[0]?.priceCents / 100,
    colors: productColors,
    colorImages: variantImages,
  }
}
```

---

## 🐛 Проблемы и решения

### Проблема 1: Цвета пропадают из каталога

**Причины:**
1. Нет опубликованных товаров с цветами
2. `variant.colorId` не совпадает с `color.id` (типы или значения)
3. Цвета фильтруются только из опубликованных товаров

**Решение:**
```typescript
// В catalog.service.ts:136-140
// Вместо фильтрации только из товаров, показывать все цвета:
const availableColors = colors  // Убрать фильтрацию

// ИЛИ показывать цвета, которые есть хотя бы в одном товаре (опубликованном или нет):
const allProductColorIds = new Set<string>()
rawProducts.forEach((product) => {
  product.variants?.forEach((variant: any) => {
    if (variant.colorId) {
      allProductColorIds.add(String(variant.colorId))
    }
  })
})
const availableColors = colors.filter((color) =>
  allProductColorIds.has(color.id)
)
```

### Проблема 2: Категории пропадают

**Причины:**
1. `is_active: false` в categories.json
2. Категория не привязана к товарам (но это не должно скрывать категорию)

**Решение:**
- Проверить `src/data/categories.json` - все категории должны иметь `is_active: true`
- Убедиться, что категории загружаются правильно

### Проблема 3: Изображения не отображаются

**Причины:**
1. Не загружены в Vercel Blob (нет `BLOB_READ_WRITE_TOKEN`)
2. URL неправильный
3. Изображения не привязаны к вариантам

**Решение:**
- Проверить переменную окружения `BLOB_READ_WRITE_TOKEN`
- Убедиться, что изображения загружаются через `/api/upload/image`
- Проверить структуру `variants[].images[]` в products.json

---

## 📊 Структура данных

### Товар (Product)
```json
{
  "id": "1234567890",
  "slug": "product-name",
  "name": "Название товара",
  "description": "Описание",
  "categoryId": "1",
  "isPublished": true,
  "variants": [
    {
      "colorId": "1",
      "priceCents": 500000,
      "sku": "1234567890-1",
      "images": [
        { "url": "https://xxx.public.blob.vercel-storage.com/products/123-abc.png" }
      ]
    }
  ]
}
```

### Цвет (Color)
```json
{
  "id": 1,
  "name": "Linen",
  "slug": "linen",
  "hex_code": "#F5F5DC",
  "hex": "#F5F5DC"
}
```

### Категория (Category)
```json
{
  "id": "1",
  "name": "Сумки",
  "slug": "bags",
  "position": 1,
  "is_active": true
}
```

---

## 🔧 Рекомендации по исправлению

### 1. Исправить фильтрацию цветов

**Файл:** `front/src/server/catalog/catalog.service.ts`

```typescript
// Строки 125-140
// Вместо фильтрации только из опубликованных товаров,
// показывать все цвета из базы, или хотя бы из всех товаров

// Вариант 1: Показывать все цвета
const availableColors = colors

// Вариант 2: Показывать цвета из всех товаров (не только опубликованных)
const allProductColorIds = new Set<string>()
rawProducts.forEach((product) => {
  if (Array.isArray(product.variants)) {
    product.variants.forEach((variant: any) => {
      if (variant.colorId) {
        allProductColorIds.add(String(variant.colorId))
      }
    })
  }
})
const availableColors = colors.filter((color) =>
  allProductColorIds.has(color.id)
)
```

### 2. Проверить соответствие ID

**Проблема:** Типы ID могут не совпадать (число vs строка)

**Решение:** Унифицировать типы ID

```typescript
// В catalog.service.ts:60
// Убедиться, что сравнение идёт как строки
const color = colors.find((c) => String(c.id) === String(variant.colorId))
```

### 3. Добавить логирование

```typescript
// В catalog.service.ts после загрузки данных
console.log('Loaded:', {
  products: rawProducts.length,
  categories: rawCategories.length,
  colors: rawColors.length,
  publishedProducts: products.length,
  availableColors: availableColors.length,
})
```

---

## 📝 Чек-лист проверки

- [ ] Проверить `src/data/colors.json` - есть ли цвета
- [ ] Проверить `src/data/categories.json` - все ли `is_active: true`
- [ ] Проверить `src/data/products.json` - есть ли опубликованные товары
- [ ] Проверить соответствие `variant.colorId` и `color.id` в товарах
- [ ] Проверить переменную `BLOB_READ_WRITE_TOKEN` в `.env.production`
- [ ] Проверить логи сервера на ошибки загрузки данных

---

**Готово!** Этот анализ поможет понять, почему пропадают цвета и категории, и как работает загрузка изображений и создание товаров.

