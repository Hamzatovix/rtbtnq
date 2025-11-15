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
      <p className="text-inkSoft/60 dark:text-muted-foreground">Загрузка…</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-inkSoft/60 dark:text-muted-foreground">
        <Link href="/backoffice" className="hover:text-sageTint dark:hover:text-primary transition-colors">Панель</Link>
        <span>/</span>
        <span className="text-inkSoft dark:text-foreground">Заказы</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-light text-inkSoft dark:text-foreground">Заказы</h1>
        <Link href="/backoffice" className="text-sageTint dark:text-primary hover:underline transition-colors">
          ← назад в панель
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-mistGray/20 dark:border-border">
              <th className="text-left py-3 px-4 text-inkSoft/80 dark:text-foreground/80">№</th>
              <th className="text-left py-3 px-4 text-inkSoft/80 dark:text-foreground/80">Клиент</th>
              <th className="text-left py-3 px-4 text-inkSoft/80 dark:text-foreground/80">Сумма</th>
              <th className="text-left py-3 px-4 text-inkSoft/80 dark:text-foreground/80">Статусы</th>
              <th className="text-left py-3 px-4 text-inkSoft/80 dark:text-foreground/80">Создан</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((o) => (
              <tr key={o.id} className="border-b border-mistGray/10 dark:border-border/50 hover:bg-mistGray/10 dark:hover:bg-muted/10 transition-colors">
                <td className="py-3 px-4 text-inkSoft dark:text-foreground">
                  <Link href={`/backoffice/orders/${o.id}`} className="text-sageTint dark:text-primary hover:underline transition-colors inline-flex items-center gap-2">
                    {o.number}
                    {o.orderStatus === 'new' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                        ● Новый
                      </span>
                    )}
                  </Link>
                </td>
                <td className="py-3 px-4 text-inkSoft/60 dark:text-muted-foreground">{o.customerName || o.customerEmail || '-'}</td>
                <td className="py-3 px-4 text-inkSoft/60 dark:text-muted-foreground">{o.total}</td>
                <td className="py-3 px-4 text-sm text-inkSoft/60 dark:text-muted-foreground">{o.paymentStatus} / {o.fulfillmentStatus} / {o.orderStatus}</td>
                <td className="py-3 px-4 text-inkSoft/60 dark:text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


