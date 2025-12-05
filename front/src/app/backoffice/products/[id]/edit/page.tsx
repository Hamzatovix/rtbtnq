'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

type Category = { id: string; slug: string; name: string }
type Color = { id: string; name: string; slug: string }

type VariantDraft = {
  colorId: string
  sku?: string
  priceCents: number
  currency?: string
  stockQty?: number
  isDefault?: boolean
  images: Array<{ url: string; position?: number }>
}

export default function BackofficeEditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string

  const [categories, setCategories] = useState<Category[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [materials, setMaterials] = useState('')
  const [care, setCare] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [isPublished, setIsPublished] = useState(false)
  const [variants, setVariants] = useState<VariantDraft[]>([{ colorId: '', priceCents: 0, images: [] }])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/categories', { cache: 'no-store' }).then(r => r.json()),
      fetch('/api/colors', { cache: 'no-store' }).then(r => r.json()),
    ]).then(([cats, cols]) => {
      setCategories(Array.isArray(cats) ? cats : cats.results || [])
      setColors(cols.results ?? cols)
    })
  }, [])

  useEffect(() => {
    if (!productId) return
    setLoading(true)
    fetch(`/api/products/${productId}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setName(data.name || '')
        setSlug(data.slug || '')
        setDescription(data.description || '')
        setMaterials(data.materials || '')
        setCare(data.care || '')
        setCategoryId(data.categoryId || '')
        setIsPublished(data.isPublished || false)
        setVariants(
          data.variants && data.variants.length > 0
            ? data.variants.map((v: any) => ({
                colorId: v.colorId || '',
                sku: v.sku || '',
                priceCents: v.priceCents || 0,
                currency: v.currency || 'EUR',
                stockQty: v.stockQty || 0,
                isDefault: v.isDefault || false,
                images: v.images || [],
              }))
            : [{ colorId: '', priceCents: 0, images: [] }]
        )
        setLoading(false)
      })
      .catch(err => {
        console.error('Ошибка загрузки товара:', err)
        setError('Не удалось загрузить товар')
        setLoading(false)
      })
  }, [productId])

  const updateVariant = (idx: number, patch: Partial<VariantDraft>) => {
    setVariants(v => v.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }

  const addVariant = () => setVariants(v => [...v, { colorId: '', priceCents: 0, images: [] }])
  const removeVariant = (idx: number) => setVariants(v => v.filter((_, i) => i !== idx))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('slug', slug)
    formData.append('description', description)
    formData.append('materials', materials)
    formData.append('care', care)
    formData.append('categoryId', categoryId || '')
    formData.append('isPublished', String(isPublished))
    formData.append(
      'variants',
      JSON.stringify(
        variants.map((v, i) => ({
          colorId: v.colorId,
          sku: v.sku || undefined,
          priceCents: Number(v.priceCents || 0),
          currency: v.currency || 'EUR',
          stockQty: Number(v.stockQty || 0),
          isDefault: v.isDefault || i === 0,
          images: v.images,
        }))
      )
    )

    const r = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      body: formData,
    })

    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      setError(j.error ? JSON.stringify(j.error) : 'Ошибка сохранения')
      setSaving(false)
      return
    }

    await r.json()
    router.push('/backoffice/products')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-fintage-graphite/60 dark:text-fintage-graphite/75 font-mono text-xs uppercase tracking-[0.15em]">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">
        <Link href="/backoffice" className="hover:text-accent dark:hover:text-accent transition-fintage">Панель</Link>
        <span>/</span>
        <Link href="/backoffice/products" className="hover:text-accent dark:hover:text-accent transition-fintage">Товары</Link>
        <span>/</span>
        <span className="text-fintage-charcoal dark:text-fintage-offwhite">Редактировать</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Редактировать товар</h1>
        <Link
          href="/backoffice/products"
          className="text-xs font-mono text-accent dark:text-accent hover:underline inline-flex items-center gap-2 transition-fintage uppercase tracking-[0.15em]"
        >
          <ArrowLeft className="h-4 w-4" />
          назад к товарам
        </Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Название</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={e => setSlug(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <Label>Описание</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Материалы</Label>
            <textarea
              value={materials}
              onChange={e=>setMaterials(e.target.value)}
              className="mt-2 w-full min-h-24 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/60 bg-fintage-offwhite dark:bg-fintage-graphite/30 px-3 py-2 text-sm text-fintage-charcoal dark:text-fintage-offwhite placeholder:text-fintage-graphite/60 dark:placeholder:text-fintage-graphite/50 outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.35)] hover:border-fintage-graphite/40 dark:hover:border-fintage-graphite/70 resize-none transition-fintage"
              placeholder="Напр.: 100% хлопок; подклад — полиэстер"
            />
          </div>
          <div className="md:col-span-2">
            <Label>Уход</Label>
            <textarea
              value={care}
              onChange={e=>setCare(e.target.value)}
              className="mt-2 w-full min-h-24 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/60 bg-fintage-offwhite dark:bg-fintage-graphite/30 px-3 py-2 text-sm text-fintage-charcoal dark:text-fintage-offwhite placeholder:text-fintage-graphite/60 dark:placeholder:text-fintage-graphite/50 outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.35)] hover:border-fintage-graphite/40 dark:hover:border-fintage-graphite/70 resize-none transition-fintage"
              placeholder="Напр.: деликатная стирка при 30°; не отбеливать"
            />
          </div>
          <div>
            <Label>Категория</Label>
            <select
              className="w-full h-11 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/60 bg-fintage-offwhite dark:bg-fintage-graphite/30 px-3 text-sm text-fintage-charcoal dark:text-fintage-offwhite outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.35)] hover:border-fintage-graphite/40 dark:hover:border-fintage-graphite/70 transition-fintage appearance-none cursor-pointer"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="" className="bg-fintage-offwhite dark:bg-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite">—</option>
              {categories.map(c => (
                <option key={c.id} value={c.id} className="bg-fintage-offwhite dark:bg-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="pub"
              type="checkbox"
              checked={isPublished}
              onChange={e => setIsPublished(e.target.checked)}
            />
            <Label htmlFor="pub">Опубликовать</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-medium">Варианты</h2>
          {variants.map((v, idx) => (
            <div key={idx} className="p-4 border border-fintage-graphite/20 dark:border-fintage-graphite/45 rounded-sm space-y-3 bg-fintage-graphite/5 dark:bg-fintage-graphite/10 shadow-fintage-sm">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <Label>Цвет</Label>
                  <select
                    className="w-full h-11 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/60 bg-fintage-offwhite dark:bg-fintage-graphite/30 px-3 text-sm text-fintage-charcoal dark:text-fintage-offwhite outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.35)] hover:border-fintage-graphite/40 dark:hover:border-fintage-graphite/70 transition-fintage appearance-none cursor-pointer"
                    value={v.colorId}
                    onChange={e => updateVariant(idx, { colorId: e.target.value })}
                  >
                    <option value="" className="bg-fintage-offwhite dark:bg-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite">—</option>
                    {colors.map(c => (
                      <option key={c.id} value={c.id} className="bg-fintage-offwhite dark:bg-fintage-graphite/30 text-fintage-charcoal dark:text-fintage-offwhite">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={v.sku || ''} onChange={e => updateVariant(idx, { sku: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-2 block">Цена (₽) *</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={
                        v.priceCents
                          ? (v.priceCents % 100 === 0
                              ? String(v.priceCents / 100)
                              : (v.priceCents / 100).toFixed(2).replace(/\.?0+$/, ''))
                          : ''
                      }
                      onChange={e => {
                        const input = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.')
                        if (input === '' || input === '.') {
                          updateVariant(idx, { priceCents: 0 })
                          return
                        }
                        const rubles = parseFloat(input)
                        if (!isNaN(rubles) && rubles >= 0) {
                          updateVariant(idx, { priceCents: Math.round(rubles * 100) })
                        }
                      }}
                      onBlur={(e) => {
                        const input = e.target.value
                        if (input && !isNaN(parseFloat(input))) {
                          const rubles = parseFloat(input)
                          if (rubles >= 0) {
                            updateVariant(idx, { priceCents: Math.round(rubles * 100) })
                          }
                        }
                      }}
                      placeholder="0"
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fintage-graphite/60 dark:text-fintage-graphite/75 text-sm pointer-events-none font-mono">
                      ₽
                    </span>
                  </div>
                  <p className="text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 mt-1 uppercase tracking-[0.15em]">
                    {v.priceCents
                      ? `= ${(v.priceCents / 100).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                      : 'Введите цену в рублях'
                    }
                  </p>
                </div>
                <div>
                  <Label>В наличии</Label>
                  <Input
                    type="number"
                    value={v.stockQty || 0}
                    onChange={e => updateVariant(idx, { stockQty: Number(e.target.value || 0) })}
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!v.isDefault}
                      onChange={e => updateVariant(idx, { isDefault: e.target.checked })}
                      className="rounded-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 text-accent dark:text-accent focus:ring-focus-ring focus:ring-2"
                    />
                    <span className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.1em]">Дефолтный</span>
                  </label>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Изображения</Label>
                <div className="space-y-3">
                  {(v.images || []).map((img, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      {img.url && (
                        <div className="w-20 h-20 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/40 overflow-hidden flex-shrink-0 bg-fintage-graphite/5 dark:bg-fintage-graphite/10">
                          <img 
                            src={img.url.startsWith('http') || img.url.startsWith('/') ? img.url : `/${img.url}`} 
                            alt={`Preview ${i+1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = '/placeholder/about_main_placeholder.svg'
                              console.warn('[Product Edit] Ошибка загрузки изображения:', img.url)
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 flex gap-2">
                        <Input
                          placeholder="URL или путь к файлу..."
                          value={img.url}
                          onChange={e => {
                            const next = [...v.images]
                            next[i] = { ...next[i], url: e.target.value }
                            updateVariant(idx, { images: next })
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const next = (v.images || []).filter((_, j) => j !== i)
                            updateVariant(idx, { images: next })
                          }}
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`file-upload-edit-${idx}`}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        const formData = new FormData()
                        formData.append('file', file)
                        
                        try {
                          const res = await fetch('/api/upload/image', {
                            method: 'POST',
                            body: formData,
                          })
                          const data = await res.json()
                          if (data.url) {
                            const next = [...(v.images || []), { url: data.url }]
                            updateVariant(idx, { images: next })
                          } else {
                            alert(data.error || 'Ошибка загрузки')
                          }
                        } catch (err) {
                          alert('Ошибка загрузки файла')
                        } finally {
                          e.target.value = ''
                        }
                      }}
                    />
                    <label
                      htmlFor={`file-upload-edit-${idx}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-fintage-graphite/30 dark:border-fintage-graphite/40 rounded-sm text-sm font-mono uppercase tracking-[0.15em] text-fintage-charcoal dark:text-fintage-offwhite bg-fintage-offwhite dark:bg-fintage-charcoal hover:bg-hover-bg dark:hover:bg-hover-bg cursor-pointer transition-fintage"
                    >
                      📁 Загрузить файл
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => updateVariant(idx, { images: [...(v.images || []), { url: '' }] })}
                    >
                      + добавить URL
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={() => removeVariant(idx)}>
                  Удалить вариант
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addVariant}>
            + добавить вариант
          </Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Сохранение…' : 'Сохранить'}
        </Button>
      </form>
    </div>
  )
}

