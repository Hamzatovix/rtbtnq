'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Category = { id:string; slug:string; name:string; position:number }

export default function BackofficeCategoriesPage(){
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [position, setPosition] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  const load = async ()=>{
    setLoading(true)
    const r = await fetch('/api/categories', { cache:'no-store' })
    const data = await r.json()
    setCats(Array.isArray(data) ? data : data.results ?? [])
    setLoading(false)
  }
  useEffect(()=>{ load() }, [])

  const onCreate = async (e: React.FormEvent)=>{
    e.preventDefault()
    setError(null)
    const r = await fetch('/api/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ slug, name, position }) })
    if (!r.ok){
      const j = await r.json().catch(()=> ({}))
      setError(j.error ? JSON.stringify(j.error) : 'Ошибка сохранения')
      return
    }
    setSlug(''); setName(''); setPosition(0)
    await load()
  }

  if (loading) return <div className="py-10">Загрузка…</div>

  return (
    <div className="space-y-8">
      <h1 className="text-title-1 font-light">Категории</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-2xl bg-roseBeige/30">
          <h2 className="mb-4 font-medium">Создать категорию</h2>
          <form onSubmit={onCreate} className="space-y-4">
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={e=>setSlug(e.target.value)} required />
            </div>
            <div>
              <Label>Название</Label>
              <Input value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div>
              <Label>Позиция</Label>
              <Input type="number" value={position} onChange={e=>setPosition(Number(e.target.value||0))} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit">Сохранить</Button>
          </form>
        </div>

        <div className="p-6 border rounded-2xl">
          <h2 className="mb-4 font-medium">Список</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Позиция</th>
                <th className="text-left py-2 px-2">Slug</th>
                <th className="text-left py-2 px-2">Название</th>
              </tr>
            </thead>
            <tbody>
              {cats.map(c=> (
                <tr key={c.id} className="border-b">
                  <td className="py-2 px-2">{c.position}</td>
                  <td className="py-2 px-2">{c.slug}</td>
                  <td className="py-2 px-2">{c.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

