'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function OrdersListPage() {
  const [data, setData] = useState<{ results: any[]; meta: any } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/orders?markViewed=true')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-inkSoft/60">Загрузка…</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-inkSoft/60">
        <Link href="/backoffice" className="hover:text-sageTint transition-colors">Панель</Link>
        <span>/</span>
        <span className="text-inkSoft">Заказы</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-light">Заказы</h1>
        <Link href="/backoffice" className="text-sageTint hover:underline transition-colors">
          ← назад в панель
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-mistGray/20">
              <th className="text-left py-3 px-4">№</th>
              <th className="text-left py-3 px-4">Клиент</th>
              <th className="text-left py-3 px-4">Сумма</th>
              <th className="text-left py-3 px-4">Статусы</th>
              <th className="text-left py-3 px-4">Создан</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((o) => (
              <tr key={o.id} className="border-b border-mistGray/10 hover:bg-mistGray/10">
                <td className="py-3 px-4">
                  <Link href={`/backoffice/orders/${o.id}`} className="text-sageTint hover:underline transition-colors inline-flex items-center gap-2">
                    {o.number}
                    {o.orderStatus === 'new' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                        ● Новый
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-3 px-4">{o.customerName || o.customerEmail || '-'}</td>
                <td className="py-3 px-4">{o.total}</td>
                <td className="py-3 px-4 text-sm">{o.paymentStatus} / {o.fulfillmentStatus} / {o.orderStatus}</td>
                <td className="py-3 px-4">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


