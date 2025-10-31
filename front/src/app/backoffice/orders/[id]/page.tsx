'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function OrderDetailsPage() {
  const params = useParams()
  const id = params?.id as string
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/orders/${id}`)
      .then(r => r.json())
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container mx-auto px-6 md:px-12 lg:px-24 py-10">Загрузка…</div>
  if (!order) return <div className="container mx-auto px-6 md:px-12 lg:px-24 py-10">Не найдено</div>

  return (
    <div className="container mx-auto px-6 md:px-12 lg:px-24 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-light">Заказ {order.number}</h1>
        <div className="flex gap-2">
          <Button onClick={async ()=>{ await fetch(`/api/orders/${id}/confirm`, { method: 'POST' }); location.reload() }}>Подтвердить</Button>
          <Button variant="outline" onClick={async ()=>{ await fetch(`/api/orders/${id}/cancel`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reason: 'manual' }) }); location.reload() }}>Отменить</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-2xl">
          <h2 className="font-medium mb-2">Клиент</h2>
          <div className="text-sm">{order.customerName} {order.customerEmail}</div>
        </div>
        <div className="p-4 border rounded-2xl">
          <h2 className="font-medium mb-2">Суммы</h2>
          <div className="text-sm">Итого: {order.total}</div>
          <div className="text-sm">Статусы: {order.paymentStatus} / {order.fulfillmentStatus} / {order.orderStatus}</div>
        </div>
      </div>

      <div className="p-4 border rounded-2xl">
        <h2 className="font-medium mb-3">Товары</h2>
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-2">SKU</th><th className="text-left">Название</th><th>Qty</th><th>Сумма</th></tr></thead>
          <tbody>
            {order.items?.map((i:any)=> (
              <tr key={i.id} className="border-b">
                <td className="py-2">{i.sku}</td>
                <td>{i.name}</td>
                <td className="text-center">{i.qty}</td>
                <td className="text-right">{i.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border rounded-2xl">
        <h2 className="font-medium mb-3">Платежи</h2>
        <div className="space-y-2">
          {order.payments?.map((p:any)=> (
            <div key={p.id} className="text-sm">{p.status} {p.amount} {p.method}</div>
          ))}
        </div>
        <div className="mt-3">
          <Button variant="outline" onClick={async ()=>{ await fetch(`/api/orders/${id}/payments`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ amount: order.total, method: 'MANUAL' }) }); location.reload() }}>Добавить платёж</Button>
        </div>
      </div>

      <div className="p-4 border rounded-2xl">
        <h2 className="font-medium mb-3">События</h2>
        <ul className="text-sm list-disc pl-6">
          {order.events?.map((e:any)=> (
            <li key={e.id}>{new Date(e.createdAt).toLocaleString()} — {e.type}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}


