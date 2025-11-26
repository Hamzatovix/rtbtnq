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

  if (loading) return <div className="py-10 text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.15em]">Загрузка…</div>

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
        <Link href="/backoffice" className="hover:text-accent dark:hover:text-accent transition-fintage">Панель</Link>
        <span>/</span>
        <span className="text-fintage-charcoal dark:text-fintage-offwhite">Товары</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Товары</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <Input
            placeholder="Поиск…"
            value={search}
            onChange={e=>{ setSearch(e.target.value); setPage(1) }}
            className="w-full sm:w-48 text-xs sm:text-sm"
          />
          <Link href="/backoffice/products/new" className="text-[10px] sm:text-xs font-mono text-accent dark:text-accent hover:underline transition-fintage uppercase tracking-[0.15em] whitespace-nowrap">
            + создать
          </Link>
        </div>
      </div>
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="min-w-[800px] sm:min-w-0">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
                <th className="text-left py-2 px-2 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Название</th>
                <th className="text-left py-2 px-2 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em] hidden md:table-cell">Slug</th>
                <th className="text-left py-2 px-2 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Статус</th>
                <th className="text-left py-2 px-2 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em] hidden md:table-cell">Варианты</th>
                <th className="text-left py-2 px-2 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(p=> (
                <tr key={p.id} className="border-b border-fintage-graphite/10 dark:border-fintage-graphite/20 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/10 transition-fintage">
                  <td className="py-2 px-2 text-fintage-charcoal dark:text-fintage-offwhite">
                    <div className="text-xs sm:text-sm">{p.name}</div>
                    <div className="md:hidden text-[9px] text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono mt-0.5">{p.slug}</div>
                  </td>
                  <td className="py-2 px-2 text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs hidden md:table-cell">{p.slug}</td>
                  <td className="py-2 px-2">
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-sm text-[9px] sm:text-xs font-mono uppercase tracking-[0.1em] ${p.isPublished ? 'bg-accent/15 dark:bg-accent/20 text-fintage-charcoal dark:text-fintage-offwhite border border-accent/30 dark:border-accent/30' : 'bg-fintage-graphite/20 dark:bg-fintage-graphite/20 text-fintage-graphite/60 dark:text-fintage-graphite/50 border border-fintage-graphite/30 dark:border-fintage-graphite/30'}`}>
                      {p.isPublished ? 'Опубликован' : 'Черновик'}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-fintage-graphite/60 dark:text-fintage-graphite/50 hidden md:table-cell text-xs">{p.variants?.length ?? 0}</td>
                  <td className="py-2 px-2">
                    <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                      <button onClick={()=>togglePublish(p)} className={`px-2 sm:px-3 py-1 rounded-sm border text-[9px] sm:text-xs font-mono uppercase tracking-[0.1em] transition-fintage ${p.isPublished ? 'bg-fintage-graphite/10 dark:bg-fintage-graphite/20 border-fintage-graphite/30 dark:border-fintage-graphite/30 text-fintage-graphite/80 dark:text-fintage-offwhite hover:bg-fintage-graphite/20 dark:hover:bg-fintage-graphite/30' : 'bg-accent/15 dark:bg-accent/20 border-accent/30 dark:border-accent/30 text-fintage-charcoal dark:text-fintage-offwhite hover:bg-accent/20 dark:hover:bg-accent/30'}`}>
                        {p.isPublished ? 'снять' : 'опубликовать'}
                      </button>
                      <Link href={`/backoffice/products/${p.id}/edit`} className="text-[9px] sm:text-xs font-mono text-accent dark:text-accent hover:underline transition-fintage uppercase tracking-[0.1em] text-center sm:text-left">редактировать</Link>
                      <button onClick={()=>handleDelete(p.id)} className="text-[9px] sm:text-xs font-mono text-fintage-punch dark:text-fintage-punch hover:underline transition-fintage uppercase tracking-[0.1em] text-center sm:text-left">удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2 sm:gap-3 justify-end">
          <button 
            disabled={page<=1} 
            onClick={()=>setPage(p=>Math.max(1,p-1))} 
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:bg-hover-bg dark:hover:bg-hover-bg disabled:opacity-50 disabled:cursor-not-allowed transition-fintage text-fintage-charcoal dark:text-fintage-offwhite font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em]"
          >
            Назад
          </button>
          <span className="text-[10px] sm:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">{page} / {totalPages}</span>
          <button 
            disabled={page>=totalPages} 
            onClick={()=>setPage(p=>Math.min(totalPages,p+1))} 
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-sm border border-fintage-graphite/30 dark:border-fintage-graphite/40 hover:bg-hover-bg dark:hover:bg-hover-bg disabled:opacity-50 disabled:cursor-not-allowed transition-fintage text-fintage-charcoal dark:text-fintage-offwhite font-mono text-[10px] sm:text-xs uppercase tracking-[0.1em]"
          >
            Вперёд
          </button>
        </div>
      )}
    </div>
  )
}


