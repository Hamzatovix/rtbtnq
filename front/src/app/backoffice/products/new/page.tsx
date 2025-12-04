'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Info, AlertCircle, CheckCircle2 } from 'lucide-react'

type Category = { id:string; slug:string; name:string }
type Color = { id:string; name:string; slug:string }

type VariantDraft = {
  colorId: string
  sku?: string
  priceCents: number
  currency?: string
  stockQty?: number
  isDefault?: boolean
  images: Array<{ url: string; position?: number }>
}

export default function BackofficeNewProductPage(){
  const router = useRouter()
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
  const [error, setError] = useState<string | null>(null)
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({})

  // Автогенерация slug из названия
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  useEffect(()=>{
    Promise.all([
      fetch('/api/categories', { cache:'no-store' }).then(r=>r.json()),
      fetch('/api/colors', { cache:'no-store' }).then(r=>r.json()),
    ]).then(([cats, cols])=>{
      setCategories(Array.isArray(cats) ? cats : cats.results)
      setColors(cols.results ?? cols)
    })
  },[])

  const updateVariant = (idx:number, patch: Partial<VariantDraft>) => {
    setVariants(v => v.map((it,i)=> i===idx ? { ...it, ...patch } : it))
  }

  const addVariant = () => setVariants(v => [...v, { colorId:'', priceCents:0, images: [] }])
  const removeVariant = (idx:number) => setVariants(v => v.filter((_,i)=> i!==idx))

  // Валидация формы
  const validateForm = () => {
    if (!name.trim()) {
      setError('Название товара обязательно')
      return false
    }
    if (!slug.trim()) {
      setError('Slug обязателен')
      return false
    }
    if (variants.length === 0) {
      setError('Добавьте хотя бы один вариант')
      return false
    }
    for (let idx = 0; idx < variants.length; idx++) {
      const v = variants[idx]
      if (!v.colorId) {
        setError(`Вариант ${idx + 1}: выберите цвет`)
        return false
      }
      if (!v.priceCents || v.priceCents <= 0) {
        setError(`Вариант ${idx + 1}: укажите цену`)
        return false
      }
      if (!v.images || v.images.length === 0 || !v.images[0]?.url) {
        setError(`Вариант ${idx + 1}: добавьте хотя бы одно изображение`)
        return false
      }
    }
    return true
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    const body = {
      name: name.trim(), 
      slug: slug.trim(), 
      description: description.trim(),
      materials: materials.trim() || undefined,
      care: care.trim() || undefined,
      categoryId: categoryId || undefined,
      isPublished,
      variants: variants.map((v,i)=> ({
        colorId: v.colorId,
        sku: v.sku?.trim() || undefined,
        priceCents: Number(v.priceCents||0),
        currency: v.currency || 'RUB',
        stockQty: Number(v.stockQty||0),
        isDefault: v.isDefault || i===0,
        images: v.images.filter(img => img.url?.trim()),
      }))
    }
    try {
      const r = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
      if (!r.ok){
        const j = await r.json().catch(()=> ({}))
        const errorMsg = j.error || `Ошибка ${r.status}: ${r.statusText}`
        console.error('Error creating product:', errorMsg, j)
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg))
        setSaving(false)
        return
      }
      await r.json()
      router.push('/backoffice/products')
    } catch (fetchError: any) {
      console.error('Fetch error:', fetchError)
      setError(`Ошибка сети: ${fetchError.message || 'Не удалось отправить запрос'}`)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
        <Link href="/backoffice" className="hover:text-accent dark:hover:text-accent transition-fintage">Панель</Link>
        <span>/</span>
        <Link href="/backoffice/products" className="hover:text-accent dark:hover:text-accent transition-fintage">Товары</Link>
        <span>/</span>
        <span className="text-fintage-charcoal dark:text-fintage-offwhite">Создать</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-title-1 font-display-vintage font-black mb-2 md:mb-3 text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Создать товар</h1>
          <p className="text-[9px] sm:text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Заполните информацию о новом товаре</p>
        </div>
        <Link href="/backoffice/products" className="text-[10px] sm:text-xs font-mono text-accent dark:text-accent hover:underline inline-flex items-center gap-2 transition-fintage uppercase tracking-[0.15em] self-start sm:self-auto">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          назад к товарам
        </Link>
      </div>
      <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
        {/* Основная информация */}
        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 pb-3 sm:pb-4 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
            <h2 className="text-xs sm:text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.15em]">Основная информация</h2>
            <span className="text-[8px] sm:text-[9px] font-mono text-fintage-graphite/50 dark:text-fintage-graphite/50 bg-accent/15 dark:bg-accent/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-sm uppercase tracking-[0.15em]">Обязательно</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <Label className="mb-2">Название товара *</Label>
              <Input 
                value={name} 
                onChange={e=>{
                  setName(e.target.value)
                  // Автогенерация slug, если он пустой
                  if (!slug && e.target.value) {
                    setSlug(generateSlug(e.target.value))
                  }
                }} 
                placeholder="Например: Рюкзак Шторм"
                required 
              />
              <p className="mt-1 text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Название товара для витрины</p>
            </div>
            <div>
              <Label className="mb-2">Slug *</Label>
              <Input 
                value={slug} 
                onChange={e=>setSlug(e.target.value)} 
                placeholder="ryukzak-shtorm"
                required 
              />
              <p className="mt-1 text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">URL-адрес товара (генерируется автоматически)</p>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2">Описание</Label>
              <textarea
                value={description}
                onChange={e=>setDescription(e.target.value)}
                className="w-full min-h-32 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/50 bg-fintage-offwhite dark:bg-fintage-charcoal px-4 py-3 text-sm text-fintage-charcoal dark:text-fintage-offwhite placeholder:text-fintage-graphite/60 dark:placeholder:text-fintage-graphite/60 outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.25)] resize-none transition-fintage"
                placeholder="Подробное описание товара..."
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2">Материалы</Label>
              <textarea
                value={materials}
                onChange={e=>setMaterials(e.target.value)}
                className="w-full min-h-24 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/50 bg-fintage-offwhite dark:bg-fintage-charcoal px-4 py-3 text-sm text-fintage-charcoal dark:text-fintage-offwhite placeholder:text-fintage-graphite/60 dark:placeholder:text-fintage-graphite/60 outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.25)] resize-none transition-fintage"
                placeholder="Например: 100% хлопок; подклад — полиэстер"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2">Уход</Label>
              <textarea
                value={care}
                onChange={e=>setCare(e.target.value)}
                className="w-full min-h-24 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/50 bg-fintage-offwhite dark:bg-fintage-charcoal px-4 py-3 text-sm text-fintage-charcoal dark:text-fintage-offwhite placeholder:text-fintage-graphite/60 dark:placeholder:text-fintage-graphite/60 outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.25)] resize-none transition-fintage"
                placeholder="Например: деликатная стирка при 30°; не отбеливать"
              />
            </div>
            <div>
              <Label className="mb-2">Категория</Label>
              <select 
                className="w-full h-11 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/50 bg-fintage-offwhite dark:bg-fintage-charcoal px-4 text-sm text-fintage-charcoal dark:text-fintage-offwhite outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:border-focus-ring focus:shadow-[0_0_0_2px_hsl(var(--color-focus-ring)/0.25)] transition-fintage appearance-none cursor-pointer" 
                value={categoryId} 
                onChange={e=>setCategoryId(e.target.value)}
              >
                <option value="" className="bg-fintage-offwhite dark:bg-fintage-charcoal text-fintage-charcoal dark:text-fintage-offwhite">— Выберите категорию —</option>
                {categories.map(c=> <option key={c.id} value={c.id} className="bg-fintage-offwhite dark:bg-fintage-charcoal text-fintage-charcoal dark:text-fintage-offwhite">{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                id="pub" 
                type="checkbox" 
                checked={isPublished} 
                onChange={e=>setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 text-accent dark:text-accent focus:ring-focus-ring focus:ring-2"
              />
              <Label htmlFor="pub" className="cursor-pointer text-fintage-charcoal dark:text-fintage-offwhite">Опубликовать товар сразу</Label>
            </div>
          </div>
        </div>

        {/* Варианты товара */}
        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
            <div>
              <h2 className="text-xs sm:text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.15em]">Варианты товара</h2>
              <p className="text-[10px] sm:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 mt-1 uppercase tracking-[0.15em]">Цвета, размеры и другие характеристики</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addVariant}
              className="inline-flex items-center gap-2 self-start sm:self-auto text-xs sm:text-sm"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Добавить вариант
            </Button>
          </div>
          
          {variants.length === 0 && (
            <div className="flex items-center gap-3 p-4 bg-accent/10 dark:bg-accent/20 border border-accent/30 dark:border-accent/40 rounded-sm text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.1em]">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>Необходимо добавить хотя бы один вариант товара</span>
            </div>
          )}
          
          {variants.map((v, idx)=> {
            const hasColor = !!v.colorId
            const hasPrice = v.priceCents > 0
            const hasImages = v.images && v.images.length > 0 && v.images.some(img => img.url?.trim())
            const isComplete = hasColor && hasPrice && hasImages
            
            return (
            <div key={idx} className={`p-4 sm:p-6 border-2 rounded-sm space-y-3 sm:space-y-4 transition-fintage ${
              isComplete 
                ? 'border-accent/30 dark:border-accent/40 bg-accent/5 dark:bg-accent/10' 
                : 'border-fintage-graphite/30 dark:border-fintage-graphite/40 bg-fintage-graphite/5 dark:bg-fintage-graphite/10'
            }`}>
              <div className="flex items-center justify-between pb-2 sm:pb-3 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
                <div className="flex items-center gap-2 sm:gap-3">
                  <h3 className="text-xs sm:text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.15em]">Вариант {idx + 1}</h3>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-accent dark:text-accent bg-accent/15 dark:bg-accent/20 px-2 py-1 rounded-sm uppercase tracking-[0.1em] border border-accent/30 dark:border-accent/30">
                      <CheckCircle2 className="h-3 w-3" />
                      Готов
                    </span>
                  )}
                  {!isComplete && (
                    <span className="text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 bg-fintage-graphite/20 dark:bg-fintage-graphite/20 px-2 py-1 rounded-sm uppercase tracking-[0.1em] border border-fintage-graphite/30 dark:border-fintage-graphite/30">
                      Заполните поля
                    </span>
                  )}
                </div>
                {variants.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={()=>removeVariant(idx)}
                    className="text-fintage-punch dark:text-fintage-punch hover:text-fintage-punch dark:hover:text-fintage-punch hover:bg-fintage-punch/10 dark:hover:bg-fintage-punch/10 font-mono text-xs uppercase tracking-[0.1em]"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Удалить
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="md:col-span-2">
                  <Label className="mb-2 block">Цвет *</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {colors.map((c)=>{
                      const hex = (c as any).hex || (c as any).hex_code || '#cccccc'
                      const selected = v.colorId === String(c.id)
                      return (
                        <button
                          key={c.id}
                          type="button"
                          title={c.name}
                          onClick={()=> updateVariant(idx, { colorId: String(c.id) })}
                          className={`relative w-10 h-10 rounded-sm border-2 transition-fintage ${selected ? 'ring-2 ring-accent dark:ring-accent border-accent dark:border-accent scale-110' : 'border-fintage-graphite/40 dark:border-fintage-graphite/50 hover:border-fintage-graphite/60 dark:hover:border-fintage-graphite/60 hover:scale-105'}`}
                          style={{ backgroundColor: hex }}
                        >
                          {selected && (
                            <span className="absolute inset-0 rounded-sm border-2 border-fintage-offwhite dark:border-fintage-charcoal pointer-events-none" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
                    {v.colorId ? `Выбран: ${colors.find(c=> String(c.id) === String(v.colorId))?.name || '—'}` : 'Выберите цвет'}
                  </p>
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
                      onChange={e=>{
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
                      onBlur={(e)=>{
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fintage-graphite/60 dark:text-fintage-graphite/50 text-sm pointer-events-none font-mono">
                      ₽
                    </span>
                  </div>
                  <p className="text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 mt-1 uppercase tracking-[0.15em]">
                    {v.priceCents 
                      ? `= ${(v.priceCents / 100).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                      : 'Введите цену в рублях'
                    }
                  </p>
                </div>
                <div>
                  <Label className="mb-2 block">В наличии</Label>
                  <Input 
                    type="number" 
                    value={v.stockQty||0} 
                    onChange={e=>updateVariant(idx, { stockQty: Number(e.target.value||0) })} 
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block">SKU (артикул)</Label>
                  <Input 
                    value={v.sku||''} 
                    onChange={e=>updateVariant(idx, { sku: e.target.value })} 
                    placeholder="Автоматически сгенерируется"
                  />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={!!v.isDefault} 
                      onChange={e=>updateVariant(idx, { isDefault: e.target.checked })}
                      className="w-4 h-4 rounded-sm border-fintage-graphite/30 dark:border-fintage-graphite/40 text-accent dark:text-accent focus:ring-focus-ring focus:ring-2"
                    />
                    <span className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.1em]">Вариант по умолчанию</span>
                  </label>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Изображения</Label>
                <div className="space-y-3">
                  {(v.images||[]).map((img,i)=> (
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
                              console.warn('[Product New] Ошибка загрузки изображения:', img.url)
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 flex gap-2">
                        <Input 
                          placeholder="URL или путь к файлу..." 
                          value={img.url} 
                          onChange={e=>{
                            const next = [...v.images]; next[i] = { ...next[i], url: e.target.value }; updateVariant(idx, { images: next })
                          }} 
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={()=>{
                            const next = (v.images||[]).filter((_,j)=> j!==i); updateVariant(idx, { images: next })
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
                      id={`file-upload-${idx}`}
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
                            const next = [...(v.images||[]), { url: data.url }]
                            updateVariant(idx, { images: next })
                          } else {
                            alert(data.error || 'Ошибка загрузки')
                          }
                        } catch (err) {
                          alert('Ошибка загрузки файла')
                        } finally {
                          // Сбрасываем input
                          e.target.value = ''
                        }
                      }}
                    />
                    <label
                      htmlFor={`file-upload-${idx}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-fintage-graphite/30 dark:border-fintage-graphite/40 rounded-sm text-sm font-mono uppercase tracking-[0.15em] text-fintage-charcoal dark:text-fintage-offwhite bg-fintage-offwhite dark:bg-fintage-charcoal hover:bg-hover-bg dark:hover:bg-hover-bg cursor-pointer transition-fintage"
                    >
                      📁 Загрузить файл
                    </label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={()=> updateVariant(idx, { images: [...(v.images||[]), { url:'' }] })}
                    >
                      + добавить URL
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )})}
          
          {variants.length > 0 && (
            <div className="pt-4 border-t border-fintage-graphite/20 dark:border-fintage-graphite/30">
              <Button 
                type="button" 
                variant="outline" 
                onClick={addVariant}
                className="inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Добавить ещё вариант
              </Button>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm p-4 sm:p-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-fintage-punch/10 dark:bg-fintage-punch/20 border border-fintage-punch/30 dark:border-fintage-punch/40 rounded-sm text-sm font-mono text-fintage-punch dark:text-fintage-punch mb-4 uppercase tracking-[0.1em]">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Ошибка при создании товара</p>
                <p>{error}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <Link href="/backoffice/products" className="w-full sm:w-auto">
              <Button type="button" variant="outline" disabled={saving} className="w-full sm:w-auto">
                Отмена
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={saving}
              className="min-w-[180px] w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Сохранение…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Создать товар
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}


