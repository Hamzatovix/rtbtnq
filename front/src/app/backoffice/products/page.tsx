'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type Product = { id:string; slug:string; name:string; isPublished:boolean; variants: Array<{ id:string }> }

export default function BackofficeProductsPage(){
  const [data, setData] = useState<{ results: Product[]; meta?: any } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    setLoading(true)
    fetch('/api/products', { cache:'no-store' })
      .then(r=>r.json())
      .then(setData)
      .finally(()=> setLoading(false))
  }, [])

  if (loading) return <div className="py-10">Загрузка…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-light">Товары</h1>
        <Link href="/backoffice/products/new" className="text-sageTint">+ создать</Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">Название</th>
              <th className="text-left py-2 px-2">Slug</th>
              <th className="text-left py-2 px-2">Статус</th>
              <th className="text-left py-2 px-2">Варианты</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map(p=> (
              <tr key={p.id} className="border-b hover:bg-mistGray/10">
                <td className="py-2 px-2">{p.name}</td>
                <td className="py-2 px-2">{p.slug}</td>
                <td className="py-2 px-2">{p.isPublished ? 'Опубликован' : 'Черновик'}</td>
                <td className="py-2 px-2">{p.variants?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


