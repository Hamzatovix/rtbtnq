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
      <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.15em]">Загрузка…</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
        <Link href="/backoffice" className="hover:text-accent dark:hover:text-accent transition-fintage">Панель</Link>
        <span>/</span>
        <span className="text-fintage-charcoal dark:text-fintage-offwhite">Заказы</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Заказы</h1>
        <Link href="/backoffice" className="text-xs font-mono text-accent dark:text-accent hover:underline transition-fintage uppercase tracking-[0.15em]">
          ← назад в панель
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
              <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">№</th>
              <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Клиент</th>
              <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Сумма</th>
              <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Статусы</th>
              <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Создан</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((o) => (
              <tr key={o.id} className="border-b border-fintage-graphite/10 dark:border-fintage-graphite/20 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/10 transition-fintage">
                <td className="py-3 px-4 text-fintage-charcoal dark:text-fintage-offwhite">
                  <Link href={`/backoffice/orders/${o.id}`} className="text-accent dark:text-accent hover:underline transition-fintage inline-flex items-center gap-2">
                    {o.number}
                    {o.orderStatus === 'new' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[9px] font-mono uppercase tracking-[0.15em] bg-fintage-punch/15 dark:bg-fintage-punch/20 text-fintage-punch dark:text-fintage-punch border border-fintage-punch/30 dark:border-fintage-punch/40">
                        ● Новый
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">{o.customerName || o.customerEmail || '-'}</td>
                <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">{o.total}</td>
                <td className="py-3 px-4 text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.1em]">{o.paymentStatus} / {o.fulfillmentStatus} / {o.orderStatus}</td>
                <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


