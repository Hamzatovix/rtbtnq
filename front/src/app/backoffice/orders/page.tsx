'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function OrdersListPage() {
  const [data, setData] = useState<{ results: any[]; meta: any } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/orders')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="container mx-auto px-6 md:px-12 lg:px-24 py-10">Загрузка…</div>

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-24 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-title-1 font-light">Заказы</h1>
        <Button asChild>
          <Link href="/backoffice">В админ-дэшборд</Link>
        </Button>
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
                <td className="py-3 px-4"><Link href={`/backoffice/orders/${o.id}`} className="text-sageTint">{o.number}</Link></td>
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


