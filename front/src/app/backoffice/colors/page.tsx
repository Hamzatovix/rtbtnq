'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Color = { id:string; name:string; slug:string; hex:string }

export default function BackofficeColorsPage(){
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [hex, setHex] = useState('#000000')
  const [error, setError] = useState<string | null>(null)

  const load = async ()=>{
    setLoading(true)
    const res = await fetch('/api/colors', { cache:'no-store' })
    const data = await res.json()
    setColors(data.results ?? data)
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const onCreate = async (e: React.FormEvent)=>{
    e.preventDefault()
    setError(null)
    const r = await fetch('/api/colors', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ name, slug, hex }) })
    if (!r.ok){
      const j = await r.json().catch(()=> ({}))
      setError(j.error ? JSON.stringify(j.error) : 'Ошибка сохранения')
      return
    }
    setName(''); setSlug(''); setHex('#000000')
    await load()
  }

  if (loading) return <div className="py-10">Загрузка…</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-light">Цвета</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border rounded-2xl bg-roseBeige/30">
          <h2 className="mb-4 font-medium">Создать цвет</h2>
          <form onSubmit={onCreate} className="space-y-4">
            <div>
              <Label>Название</Label>
              <Input value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={slug} onChange={e=>setSlug(e.target.value)} required />
            </div>
            <div>
              <Label>HEX</Label>
              <Input value={hex} onChange={e=>setHex(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit">Сохранить</Button>
          </form>
        </div>

        <div className="p-6 border rounded-2xl">
          <h2 className="mb-4 font-medium">Список</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Цвет</th>
                  <th className="text-left py-2 px-2">Название</th>
                  <th className="text-left py-2 px-2">Slug</th>
                  <th className="text-left py-2 px-2">HEX</th>
                </tr>
              </thead>
              <tbody>
                {colors.map(c=> (
                  <tr key={c.id} className="border-b">
                    <td className="py-2 px-2"><span className="inline-block w-6 h-6 rounded border" style={{ backgroundColor: c.hex }} /></td>
                    <td className="py-2 px-2">{c.name}</td>
                    <td className="py-2 px-2">{c.slug}</td>
                    <td className="py-2 px-2 font-mono">{c.hex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


