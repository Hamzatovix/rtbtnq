'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

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
  const [categories, setCategories] = useState<Category[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [isPublished, setIsPublished] = useState(false)
  const [variants, setVariants] = useState<VariantDraft[]>([{ colorId: '', priceCents: 0, images: [] }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const body = {
      name, slug, description,
      categoryId: categoryId || undefined,
      isPublished,
      variants: variants.map((v,i)=> ({
        colorId: v.colorId,
        sku: v.sku || undefined,
        priceCents: Number(v.priceCents||0),
        currency: v.currency || 'EUR',
        stockQty: Number(v.stockQty||0),
        isDefault: v.isDefault || i===0,
        images: v.images,
      }))
    }
    const r = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    if (!r.ok){
      const j = await r.json().catch(()=> ({}))
      setError(j.error ? JSON.stringify(j.error) : 'Ошибка сохранения')
      setSaving(false)
      return
    }
    const created = await r.json()
    window.location.href = '/backoffice/products'
  }

  return (
    <div className="space-y-8">
      <h1 className="text-title-1 font-light">Создать товар</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Название</Label>
            <Input value={name} onChange={e=>setName(e.target.value)} required />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={e=>setSlug(e.target.value)} required />
          </div>
          <div className="md:col-span-2">
            <Label>Описание</Label>
            <Input value={description} onChange={e=>setDescription(e.target.value)} />
          </div>
          <div>
            <Label>Категория</Label>
            <select className="w-full h-10 border rounded-md px-3" value={categoryId} onChange={e=>setCategoryId(e.target.value)}>
              <option value="">—</option>
              {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="pub" type="checkbox" checked={isPublished} onChange={e=>setIsPublished(e.target.checked)} />
            <Label htmlFor="pub">Опубликовать</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-medium">Варианты</h2>
          {variants.map((v, idx)=> (
            <div key={idx} className="p-4 border rounded-2xl space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                <div className="md:col-span-2">
                  <Label>Цвет</Label>
                  <select className="w-full h-10 border rounded-md px-3" value={v.colorId} onChange={e=>updateVariant(idx, { colorId: e.target.value })}>
                    <option value="">—</option>
                    {colors.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={v.sku||''} onChange={e=>updateVariant(idx, { sku: e.target.value })} />
                </div>
                <div>
                  <Label>Цена (центов)</Label>
                  <Input type="number" value={v.priceCents} onChange={e=>updateVariant(idx, { priceCents: Number(e.target.value||0) })} />
                </div>
                <div>
                  <Label>В наличии</Label>
                  <Input type="number" value={v.stockQty||0} onChange={e=>updateVariant(idx, { stockQty: Number(e.target.value||0) })} />
                </div>
                <div className="flex items-end">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={!!v.isDefault} onChange={e=>updateVariant(idx, { isDefault: e.target.checked })} />
                    <span>Дефолтный</span>
                  </label>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Изображения (URL)</Label>
                <div className="space-y-2">
                  {(v.images||[]).map((img,i)=> (
                    <div key={i} className="flex gap-2">
                      <Input placeholder="https://..." value={img.url} onChange={e=>{
                        const next = [...v.images]; next[i] = { ...next[i], url: e.target.value }; updateVariant(idx, { images: next })
                      }} />
                      <Button type="button" variant="outline" onClick={()=>{
                        const next = (v.images||[]).filter((_,j)=> j!==i); updateVariant(idx, { images: next })
                      }}>Удалить</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={()=> updateVariant(idx, { images: [...(v.images||[]), { url:'' }] })}>+ добавить изображение</Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" onClick={()=>removeVariant(idx)}>Удалить вариант</Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addVariant}>+ добавить вариант</Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Сохранение…' : 'Создать'}</Button>
      </form>
    </div>
  )
}


