'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [order, setOrder] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/orders/${id}`, { cache:'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('failed')))
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleAction = async (action: 'confirm' | 'cancel' | 'payment', data?: any) => {
    setActionLoading(action)
    try {
      const endpoint = action === 'payment' 
        ? `/api/orders/${id}/payments`
        : `/api/orders/${id}/${action}`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined
      })
      if (res.ok) {
        // Перезагружаем данные
        const updated = await fetch(`/api/orders/${id}`, { cache:'no-store' }).then(r=>r.json())
        setOrder(updated)
      }
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.15em]">Загрузка…</p>
    </div>
  )
  if (!order) return (
    <div className="space-y-4">
      <Link href="/backoffice/orders" className="text-xs font-mono text-accent dark:text-accent hover:underline inline-flex items-center gap-2 transition-fintage uppercase tracking-[0.15em]">
        <ArrowLeft className="h-4 w-4" />
        назад к заказам
      </Link>
      <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.15em]">Заказ не найден</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">
        <Link href="/backoffice" className="hover:text-accent dark:hover:text-accent transition-fintage">Панель</Link>
        <span>/</span>
        <Link href="/backoffice/orders" className="hover:text-accent dark:hover:text-accent transition-fintage">Заказы</Link>
        <span>/</span>
        <span className="text-fintage-charcoal dark:text-fintage-offwhite">{order.number}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Заказ {order.number}</h1>
        <Link href="/backoffice/orders" className="text-xs font-mono text-accent dark:text-accent hover:underline inline-flex items-center gap-2 transition-fintage uppercase tracking-[0.15em]">
          <ArrowLeft className="h-4 w-4" />
          назад к заказам
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Клиент */}
          <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm bg-fintage-graphite/5 dark:bg-fintage-graphite/10 shadow-fintage-sm">
            <h2 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-4 uppercase tracking-[0.15em]">Клиент</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Имя:</span> {order.customerName || '-'}</div>
              <div><span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Телефон:</span> {order.customerPhone || '-'}</div>
            </div>
          </div>

          {/* Доставка */}
          {order.addresses && order.addresses.length > 0 && (
            <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm bg-fintage-graphite/5 dark:bg-fintage-graphite/10 shadow-fintage-sm">
              <h2 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-4 uppercase tracking-[0.15em]">Доставка</h2>
              <div className="space-y-2 text-sm">
                {order.addresses.map((addr: any, idx: number) => (
                  <div key={addr.id || idx} className="space-y-2">
                    {addr.country && (
                      <div>
                        <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Страна:</span> {addr.country}
                      </div>
                    )}
                    {addr.city && (
                      <div>
                        <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Город:</span> {addr.city}
                      </div>
                    )}
                    {(addr.line1 || addr.address) && (
                      <div>
                        <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Адрес:</span> {addr.line1 || addr.address || '-'}
                      </div>
                    )}
                    {(addr.line2 || addr.pickupPoint) && (
                      <div>
                        <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Пункт выдачи:</span> {addr.line2 || addr.pickupPoint || '-'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Комментарий */}
          {order.note && (
            <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm bg-fintage-graphite/5 dark:bg-fintage-graphite/10 shadow-fintage-sm">
              <h2 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-4 uppercase tracking-[0.15em]">Комментарий</h2>
              <p className="text-sm text-fintage-charcoal dark:text-fintage-offwhite whitespace-pre-line">{order.note}</p>
            </div>
          )}

          {/* Состав заказа */}
          <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm bg-fintage-graphite/5 dark:bg-fintage-graphite/10 shadow-fintage-sm">
            <h2 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-4 uppercase tracking-[0.15em]">Состав заказа</h2>
            <div className="space-y-4">
              {(order.items || []).map((it:any)=> (
                <div key={it.id || it.sku} className="flex gap-4 items-start pb-4 border-b border-fintage-graphite/20 dark:border-fintage-graphite/30 last:border-0 last:pb-0">
                  {it.image && (
                    <div className="w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 border border-fintage-graphite/20 dark:border-fintage-graphite/30">
                      <img 
                        src={it.image.startsWith('http') || it.image.startsWith('/') ? it.image : `/${it.image}`}
                        alt={it.name || it.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder/about_main_placeholder.svg'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium mb-1 text-fintage-charcoal dark:text-fintage-offwhite">{it.name || it.productName}</div>
                    {it.color && (
                      <div className="text-sm text-fintage-graphite/60 dark:text-fintage-graphite/50 mb-1">Цвет: {it.color}</div>
                    )}
                    <div className="text-sm text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono">{it.sku || '-'}</div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="text-sm text-fintage-graphite/70 dark:text-fintage-graphite/60">{it.qty || it.quantity} × {it.price || it.unitPrice} ₽</div>
                    <div className="text-sm font-medium mt-1 text-fintage-charcoal dark:text-fintage-offwhite">{it.total || (it.qty * it.price)} ₽</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* События */}
          {order.events && order.events.length > 0 && (
            <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm shadow-fintage-sm">
              <h2 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-4 uppercase tracking-[0.15em]">История событий</h2>
              <ul className="space-y-2 text-sm">
                {order.events.map((e:any)=> (
                  <li key={e.id} className="flex justify-between">
                    <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs">{new Date(e.createdAt).toLocaleString()}</span>
                    <span className="text-fintage-charcoal dark:text-fintage-offwhite">{e.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Статусы и суммы */}
          <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm shadow-fintage-sm">
            <h2 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-4 uppercase tracking-[0.15em]">Информация</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Сумма:</span>
                <span className="font-medium text-fintage-charcoal dark:text-fintage-offwhite">{order.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Платёж:</span>
                <span className="text-fintage-charcoal dark:text-fintage-offwhite">{order.paymentStatus || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Доставка:</span>
                <span className="text-fintage-charcoal dark:text-fintage-offwhite">{order.fulfillmentStatus || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-fintage-graphite/60 dark:text-fintage-graphite/50">Статус:</span>
                <span className="text-fintage-charcoal dark:text-fintage-offwhite">{order.orderStatus || '-'}</span>
              </div>
            </div>
          </div>

          {/* Операции */}
          <div className="p-6 border border-fintage-graphite/20 dark:border-fintage-graphite/30 rounded-sm shadow-fintage-sm">
            <h2 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-4 uppercase tracking-[0.15em]">Операции</h2>
            <div className="space-y-2">
              <Button 
                onClick={() => handleAction('confirm')} 
                className="w-full"
                disabled={actionLoading !== null}
              >
                {actionLoading === 'confirm' ? 'Подтверждение…' : 'Подтвердить'}
              </Button>
              <Button 
                onClick={() => handleAction('cancel')} 
                variant="outline" 
                className="w-full"
                disabled={actionLoading !== null}
              >
                {actionLoading === 'cancel' ? 'Отмена…' : 'Отменить'}
              </Button>
              <Button 
                onClick={() => handleAction('payment', { amount: order.total, method: 'MANUAL' })} 
                variant="outline" 
                className="w-full"
                disabled={actionLoading !== null}
              >
                {actionLoading === 'payment' ? 'Добавление…' : 'Добавить платёж'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
