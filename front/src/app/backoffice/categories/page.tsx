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

  if (loading) return <div className="py-10 text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.15em]">Загрузка…</div>

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
        <Link href="/backoffice" className="hover:text-accent dark:hover:text-accent transition-fintage">Панель</Link>
        <span>/</span>
        <span className="text-fintage-charcoal dark:text-fintage-offwhite">Категории</span>
      </div>

      <h1 className="text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Категории</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm bg-fintage-graphite/5 dark:bg-fintage-graphite/10 shadow-fintage-sm">
          <h2 className="mb-4 text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.15em]">Создать категорию</h2>
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
            {error && <p className="text-sm font-mono text-fintage-punch dark:text-fintage-punch uppercase tracking-[0.1em]">{error}</p>}
            <Button type="submit">Сохранить</Button>
          </form>
        </div>

        <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm shadow-fintage-sm">
          <h2 className="mb-4 text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.15em]">Список</h2>
          {error && <p className="text-sm font-mono text-fintage-punch dark:text-fintage-punch mb-4 uppercase tracking-[0.1em]">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
                  <th className="text-left py-2 px-2 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Позиция</th>
                  <th className="text-left py-2 px-2 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Slug</th>
                  <th className="text-left py-2 px-2 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Название</th>
                  <th className="text-left py-2 px-2 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Публикация</th>
                  <th className="text-right py-2 px-2 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Действия</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c=> (
                  <tr key={c.id} className="border-b border-fintage-graphite/10 dark:border-fintage-graphite/20 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/10 transition-fintage">
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
                          <button onClick={()=>togglePublish(c)} className={`px-3 py-1 rounded-sm border text-xs font-mono uppercase tracking-[0.1em] transition-fintage ${c.is_active ? 'bg-accent/15 dark:bg-accent/20 border-accent/30 dark:border-accent/30 text-fintage-charcoal dark:text-fintage-offwhite' : 'bg-fintage-graphite/20 dark:bg-fintage-graphite/20 border-fintage-graphite/30 dark:border-fintage-graphite/30 text-fintage-graphite/60 dark:text-fintage-graphite/50'}`}>
                            {c.is_active ? 'Опубликована' : 'Черновик'}
                          </button>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={saveEdit}
                              className="p-1.5 hover:bg-accent/10 dark:hover:bg-accent/10 rounded-sm transition-fintage text-accent dark:text-accent"
                              title="Сохранить"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 hover:bg-fintage-punch/10 dark:hover:bg-fintage-punch/10 rounded-sm transition-fintage text-fintage-punch dark:text-fintage-punch"
                              title="Отменить"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-2 text-fintage-charcoal dark:text-fintage-offwhite">{c.position}</td>
                        <td className="py-2 px-2 text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs">{c.slug}</td>
                        <td className="py-2 px-2 text-fintage-charcoal dark:text-fintage-offwhite">{c.name}</td>
                        <td className="py-2 px-2">
                          <button onClick={()=>togglePublish(c)} className={`px-3 py-1 rounded-sm border text-xs font-mono uppercase tracking-[0.1em] transition-fintage ${c.is_active !== false ? 'bg-accent/15 dark:bg-accent/20 border-accent/30 dark:border-accent/30 text-fintage-charcoal dark:text-fintage-offwhite' : 'bg-fintage-graphite/20 dark:bg-fintage-graphite/20 border-fintage-graphite/30 dark:border-fintage-graphite/30 text-fintage-graphite/60 dark:text-fintage-graphite/50'}`}>
                            {c.is_active !== false ? 'Опубликована' : 'Черновик'}
                          </button>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => startEdit(c)}
                              className="p-1.5 hover:bg-accent/10 dark:hover:bg-accent/10 rounded-sm transition-fintage text-accent dark:text-accent"
                              title="Редактировать"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
                              disabled={deletingId === c.id}
                              className="p-1.5 hover:bg-fintage-punch/10 dark:hover:bg-fintage-punch/10 rounded-sm transition-fintage text-fintage-punch dark:text-fintage-punch disabled:opacity-50 disabled:cursor-not-allowed"
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

