'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit2, Trash2, X, Check } from 'lucide-react'

type Category = { id:string; slug:string; name:string; position:number; is_active?: boolean }

export default function BackofficeCategoriesPage(){
  const [cats, setCats] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [position, setPosition] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ slug: string; name: string; position: number }>({ slug: '', name: '', position: 0 })
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const togglePublish = async (cat: Category) => {
    const next = !cat.is_active
    const r = await fetch(`/api/categories/${cat.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ is_active: next }) })
    if (r.ok) {
      setCats(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: next } : c))
    }
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditForm({ slug: cat.slug, name: cat.name, position: cat.position })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ slug: '', name: '', position: 0 })
  }

  const saveEdit = async () => {
    if (!editingId) return
    setError(null)
    
    const r = await fetch(`/api/categories/${editingId}`, { 
      method:'PUT', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify(editForm) 
    })
    
    if (!r.ok) {
      const j = await r.json().catch(()=> ({}))
      setError(j.error ? JSON.stringify(j.error) : 'Ошибка сохранения')
      return
    }
    
    await load()
    setEditingId(null)
    setEditForm({ slug: '', name: '', position: 0 })
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Вы уверены, что хотите удалить категорию "${cat.name}"?`)) {
      return
    }
    
    setDeletingId(cat.id)
    setError(null)
    
    try {
      const r = await fetch(`/api/categories/${cat.id}`, { method:'DELETE' })
      if (!r.ok) {
        const j = await r.json().catch(()=> ({}))
        setError(j.error ? JSON.stringify(j.error) : 'Ошибка удаления')
        setDeletingId(null)
        return
      }
      await load()
    } catch (err) {
      setError('Ошибка удаления категории')
      setDeletingId(null)
    }
  }

  if (loading) return <div className="py-10">Загрузка…</div>

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-inkSoft/60">
        <Link href="/backoffice" className="hover:text-sageTint transition-colors">Панель</Link>
        <span>/</span>
        <span className="text-inkSoft">Категории</span>
      </div>

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
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Позиция</th>
                  <th className="text-left py-2 px-2">Slug</th>
                  <th className="text-left py-2 px-2">Название</th>
                  <th className="text-left py-2 px-2">Публикация</th>
                  <th className="text-right py-2 px-2">Действия</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c=> (
                  <tr key={c.id} className="border-b hover:bg-roseBeige/10 transition-colors">
                    {editingId === c.id ? (
                      <>
                        <td className="py-2 px-2">
                          <Input 
                            type="number" 
                            value={editForm.position} 
                            onChange={e=>setEditForm({...editForm, position: Number(e.target.value)})}
                            className="w-20 h-8 text-sm"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input 
                            value={editForm.slug} 
                            onChange={e=>setEditForm({...editForm, slug: e.target.value})}
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input 
                            value={editForm.name} 
                            onChange={e=>setEditForm({...editForm, name: e.target.value})}
                            className="h-8 text-sm"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <button onClick={()=>togglePublish(c)} className={`px-3 py-1 rounded-full border text-xs ${c.is_active ? 'bg-sageTint/15 border-sageTint/30 text-inkSoft' : 'bg-mistGray/20 border-mistGray/30 text-inkSoft/60'}`}>
                            {c.is_active ? 'Опубликована' : 'Черновик'}
                          </button>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 hover:bg-green-50 rounded transition-colors text-green-600"
                              title="Сохранить"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600"
                              title="Отменить"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-2">{c.position}</td>
                        <td className="py-2 px-2">{c.slug}</td>
                        <td className="py-2 px-2">{c.name}</td>
                        <td className="py-2 px-2">
                          <button onClick={()=>togglePublish(c)} className={`px-3 py-1 rounded-full border text-xs ${c.is_active !== false ? 'bg-sageTint/15 border-sageTint/30 text-inkSoft' : 'bg-mistGray/20 border-mistGray/30 text-inkSoft/60'}`}>
                            {c.is_active !== false ? 'Опубликована' : 'Черновик'}
                          </button>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(c)}
                              className="p-1.5 hover:bg-sageTint/20 rounded transition-colors text-sageTint"
                              title="Редактировать"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              disabled={deletingId === c.id}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Удалить"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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

