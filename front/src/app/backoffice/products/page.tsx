'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'

type Product = { id:string; slug:string; name:string; isPublished:boolean; variants: Array<{ id:string }> }

export default function BackofficeProductsPage(){
  const [data, setData] = useState<{ results: Product[]; meta?: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(()=>{
    setLoading(true)
    fetch('/api/products', { cache:'no-store' })
      .then(r=>r.json())
      .then(setData)
      .finally(()=> setLoading(false))
  }, [])

  const filtered = useMemo(()=>{
    const all = data?.results ?? []
    if (!search.trim()) return all
    const s = search.toLowerCase()
    return all.filter(p => p.name.toLowerCase().includes(s) || p.slug.toLowerCase().includes(s))
  }, [data, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((page-1)*pageSize, page*pageSize)

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить товар?')) return
    const res = await fetch(`/api/products/${id}`, { method:'DELETE' })
    if (res.ok){
      setData(prev => prev ? { ...prev, results: prev.results.filter(p=> p.id !== id) } : prev)
    } else {
      alert('Не удалось удалить')
    }
  }

  const togglePublish = async (p: Product) => {
    const next = !p.isPublished
    const res = await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: next }),
    })
    if (res.ok) {
      setData(prev => prev ? { ...prev, results: prev.results.map(it => it.id === p.id ? { ...it, isPublished: next } : it) } : prev)
    } else {
      alert('Не удалось изменить статус публикации')
    }
  }

  if (loading) return <div className="py-10 text-inkSoft/60 dark:text-muted-foreground">Загрузка…</div>

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-inkSoft/60 dark:text-muted-foreground">
        <Link href="/backoffice" className="hover:text-sageTint dark:hover:text-primary transition-colors">Панель</Link>
        <span>/</span>
        <span className="text-inkSoft dark:text-foreground">Товары</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-title-1 font-light text-inkSoft dark:text-foreground">Товары</h1>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Поиск…"
            value={search}
            onChange={e=>{ setSearch(e.target.value); setPage(1) }}
            className="w-48"
          />
          <Link href="/backoffice/products/new" className="text-sageTint dark:text-primary hover:underline transition-colors">
            + создать
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mistGray/20 dark:border-border">
              <th className="text-left py-2 px-2 text-inkSoft/80 dark:text-foreground/80">Название</th>
              <th className="text-left py-2 px-2 text-inkSoft/80 dark:text-foreground/80">Slug</th>
              <th className="text-left py-2 px-2 text-inkSoft/80 dark:text-foreground/80">Статус</th>
              <th className="text-left py-2 px-2 text-inkSoft/80 dark:text-foreground/80">Варианты</th>
              <th className="text-left py-2 px-2 text-inkSoft/80 dark:text-foreground/80">Действия</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(p=> (
              <tr key={p.id} className="border-b border-mistGray/10 dark:border-border/50 hover:bg-mistGray/10 dark:hover:bg-muted/10 transition-colors">
                <td className="py-2 px-2 text-inkSoft dark:text-foreground">{p.name}</td>
                <td className="py-2 px-2 text-inkSoft/60 dark:text-muted-foreground">{p.slug}</td>
                <td className="py-2 px-2 text-inkSoft dark:text-foreground">{p.isPublished ? 'Опубликован' : 'Черновик'}</td>
                <td className="py-2 px-2 text-inkSoft/60 dark:text-muted-foreground">{p.variants?.length ?? 0}</td>
                <td className="py-2 px-2">
                  <button onClick={()=>togglePublish(p)} className={`mr-3 px-3 py-1 rounded-full border text-xs transition-colors ${p.isPublished ? 'bg-mistGray/10 dark:bg-muted/20 border-mistGray/30 dark:border-border text-inkSoft/80 dark:text-foreground hover:bg-mistGray/20 dark:hover:bg-muted/30' : 'bg-sageTint/15 dark:bg-primary/20 border-sageTint/30 dark:border-primary/30 text-inkSoft dark:text-foreground hover:bg-sageTint/20 dark:hover:bg-primary/30'}`}>
                    {p.isPublished ? 'снять с публикации' : 'опубликовать'}
                  </button>
                  <Link href={`/backoffice/products/${p.id}/edit`} className="text-sageTint dark:text-primary hover:underline mr-3 transition-colors">редактировать</Link>
                  <button onClick={()=>handleDelete(p.id)} className="text-red-500 dark:text-red-400 hover:underline transition-colors">удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-3 justify-end">
          <button 
            disabled={page<=1} 
            onClick={()=>setPage(p=>Math.max(1,p-1))} 
            className="px-4 py-2 rounded-xl border border-mistGray/30 dark:border-border hover:bg-mistGray/10 dark:hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-inkSoft dark:text-foreground"
          >
            Назад
          </button>
          <span className="text-sm text-inkSoft/60 dark:text-muted-foreground">{page} / {totalPages}</span>
          <button 
            disabled={page>=totalPages} 
            onClick={()=>setPage(p=>Math.min(totalPages,p+1))} 
            className="px-4 py-2 rounded-xl border border-mistGray/30 dark:border-border hover:bg-mistGray/10 dark:hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-inkSoft dark:text-foreground"
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  )
}


