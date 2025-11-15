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
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-inkSoft/60 dark:text-muted-foreground">
        <Link href="/backoffice" className="hover:text-sageTint dark:hover:text-primary transition-colors">Панель</Link>
        <span>/</span>
        <Link href="/backoffice/products" className="hover:text-sageTint dark:hover:text-primary transition-colors">Товары</Link>
        <span>/</span>
        <span className="text-inkSoft dark:text-foreground">Создать</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-title-1 font-light mb-2 text-inkSoft dark:text-foreground">Создать товар</h1>
          <p className="text-sm text-inkSoft/60 dark:text-muted-foreground">Заполните информацию о новом товаре</p>
        </div>
        <Link href="/backoffice/products" className="text-sageTint dark:text-primary hover:underline inline-flex items-center gap-2 transition-colors self-start sm:self-auto">
          <ArrowLeft className="h-4 w-4" />
          назад к товарам
        </Link>
      </div>
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Основная информация */}
        <div className="bg-white dark:bg-card rounded-2xl border border-mistGray/20 dark:border-border shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-mistGray/20 dark:border-border">
            <h2 className="text-lg font-medium text-inkSoft dark:text-foreground">Основная информация</h2>
            <span className="text-xs text-inkSoft/40 dark:text-muted-foreground/60 bg-roseBeige/30 dark:bg-primary/20 px-2 py-1 rounded-full">Обязательно</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <p className="mt-1 text-xs text-inkSoft/60 dark:text-muted-foreground">Название товара для витрины</p>
            </div>
            <div>
              <Label className="mb-2">Slug *</Label>
              <Input 
                value={slug} 
                onChange={e=>setSlug(e.target.value)} 
                placeholder="ryukzak-shtorm"
                required 
              />
              <p className="mt-1 text-xs text-inkSoft/60 dark:text-muted-foreground">URL-адрес товара (генерируется автоматически)</p>
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2">Описание</Label>
              <textarea
                value={description}
                onChange={e=>setDescription(e.target.value)}
                className="w-full min-h-32 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-background px-4 py-3 text-sm text-inkSoft dark:text-foreground outline-none focus:ring-2 focus:ring-sageTint dark:focus:ring-primary focus:border-sageTint dark:focus:border-primary resize-none"
                placeholder="Подробное описание товара..."
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2">Материалы</Label>
              <textarea
                value={materials}
                onChange={e=>setMaterials(e.target.value)}
                className="w-full min-h-24 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-background px-4 py-3 text-sm text-inkSoft dark:text-foreground outline-none focus:ring-2 focus:ring-sageTint dark:focus:ring-primary focus:border-sageTint dark:focus:border-primary resize-none"
                placeholder="Например: 100% хлопок; подклад — полиэстер"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="mb-2">Уход</Label>
              <textarea
                value={care}
                onChange={e=>setCare(e.target.value)}
                className="w-full min-h-24 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-background px-4 py-3 text-sm text-inkSoft dark:text-foreground outline-none focus:ring-2 focus:ring-sageTint dark:focus:ring-primary focus:border-sageTint dark:focus:border-primary resize-none"
                placeholder="Например: деликатная стирка при 30°; не отбеливать"
              />
            </div>
            <div>
              <Label className="mb-2">Категория</Label>
              <select 
                className="w-full h-11 rounded-2xl border border-mistGray/30 dark:border-border bg-white dark:bg-background px-4 text-sm text-inkSoft dark:text-foreground outline-none focus:ring-2 focus:ring-sageTint dark:focus:ring-primary focus:border-sageTint dark:focus:border-primary" 
                value={categoryId} 
                onChange={e=>setCategoryId(e.target.value)}
              >
                <option value="">— Выберите категорию —</option>
                {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                id="pub" 
                type="checkbox" 
                checked={isPublished} 
                onChange={e=>setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-mistGray/30 dark:border-border text-sageTint dark:text-primary focus:ring-sageTint dark:focus:ring-primary focus:ring-2"
              />
              <Label htmlFor="pub" className="cursor-pointer text-inkSoft dark:text-foreground">Опубликовать товар сразу</Label>
            </div>
          </div>
        </div>

        {/* Варианты товара */}
        <div className="bg-white dark:bg-card rounded-2xl border border-mistGray/20 dark:border-border shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-mistGray/20 dark:border-border">
            <div>
              <h2 className="text-lg font-medium text-inkSoft dark:text-foreground">Варианты товара</h2>
              <p className="text-sm text-inkSoft/60 dark:text-muted-foreground mt-1">Цвета, размеры и другие характеристики</p>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addVariant}
              className="inline-flex items-center gap-2 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              Добавить вариант
            </Button>
          </div>
          
          {variants.length === 0 && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-800 dark:text-amber-400">
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
            <div key={idx} className={`p-6 border-2 rounded-2xl space-y-4 transition-all ${
              isComplete 
                ? 'border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-950/20' 
                : 'border-mistGray/30 dark:border-border bg-roseBeige/20 dark:bg-muted/10'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-mistGray/20 dark:border-border">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-inkSoft dark:text-foreground">Вариант {idx + 1}</h3>
                  {isComplete && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/30 px-2 py-1 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      Готов
                    </span>
                  )}
                  {!isComplete && (
                    <span className="text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 px-2 py-1 rounded-full">
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
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Удалить
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          className={`relative w-10 h-10 rounded-full border-2 transition-all ${selected ? 'ring-2 ring-sageTint dark:ring-primary border-sageTint dark:border-primary scale-110' : 'border-mistGray/40 dark:border-border/60 hover:border-mistGray/60 dark:hover:border-border hover:scale-105'}`}
                          style={{ backgroundColor: hex }}
                        >
                          {selected && (
                            <span className="absolute inset-0 rounded-full border-2 border-white dark:border-background pointer-events-none" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-inkSoft/60 dark:text-muted-foreground">
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-inkSoft/60 dark:text-muted-foreground text-sm pointer-events-none">
                      ₽
                    </span>
                  </div>
                  <p className="text-xs text-inkSoft/60 dark:text-muted-foreground mt-1">
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
                      className="w-4 h-4 rounded border-mistGray/30 dark:border-border text-sageTint dark:text-primary focus:ring-sageTint dark:focus:ring-primary focus:ring-2"
                    />
                    <span className="text-sm text-inkSoft dark:text-foreground">Вариант по умолчанию</span>
                  </label>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Изображения</Label>
                <div className="space-y-3">
                  {(v.images||[]).map((img,i)=> (
                    <div key={i} className="flex gap-2 items-start">
                      {img.url && (
                        <div className="w-20 h-20 rounded-lg border border-mistGray/30 dark:border-border overflow-hidden flex-shrink-0">
                          <img 
                            src={img.url.startsWith('http') || img.url.startsWith('/') ? img.url : `/${img.url}`} 
                            alt={`Preview ${i+1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none'
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
                      className="inline-flex items-center justify-center px-4 py-2 border border-mistGray/30 dark:border-border rounded-xl text-sm font-medium text-inkSoft dark:text-foreground bg-white dark:bg-card hover:bg-mistGray/10 dark:hover:bg-muted/20 cursor-pointer transition-colors"
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
            <div className="pt-4 border-t border-mistGray/20 dark:border-border">
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
        <div className="bg-white dark:bg-card rounded-2xl border border-mistGray/20 dark:border-border shadow-sm dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)] p-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-sm text-red-700 dark:text-red-400 mb-4">
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


