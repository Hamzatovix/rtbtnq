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
      <p className="text-inkSoft/60">Загрузка…</p>
    </div>
  )
  if (!order) return (
    <div className="space-y-4">
      <Link href="/backoffice/orders" className="text-sageTint hover:underline inline-flex items-center gap-2 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        назад к заказам
      </Link>
      <p className="text-inkSoft/60">Заказ не найден</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-inkSoft/60">
        <Link href="/backoffice" className="hover:text-sageTint transition-colors">Панель</Link>
        <span>/</span>
        <Link href="/backoffice/orders" className="hover:text-sageTint transition-colors">Заказы</Link>
        <span>/</span>
        <span className="text-inkSoft">{order.number}</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-title-1 font-light">Заказ {order.number}</h1>
        <Link href="/backoffice/orders" className="text-sageTint hover:underline inline-flex items-center gap-2 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          назад к заказам
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Клиент */}
          <div className="p-6 border rounded-2xl bg-roseBeige/20">
            <h2 className="font-medium mb-4">Клиент</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-inkSoft/60">Имя:</span> {order.customerName || '-'}</div>
              <div><span className="text-inkSoft/60">Телефон:</span> {order.customerPhone || '-'}</div>
            </div>
          </div>

          {/* Доставка */}
          {order.addresses && order.addresses.length > 0 && (
            <div className="p-6 border rounded-2xl bg-roseBeige/20">
              <h2 className="font-medium mb-4">Доставка</h2>
              <div className="space-y-2 text-sm">
                {order.addresses.map((addr: any, idx: number) => (
                  <div key={addr.id || idx} className="space-y-2">
                    {addr.country && (
                      <div>
                        <span className="text-inkSoft/60">Страна:</span> {addr.country}
                      </div>
                    )}
                    {addr.city && (
                      <div>
                        <span className="text-inkSoft/60">Город:</span> {addr.city}
                      </div>
                    )}
                    {(addr.line1 || addr.address) && (
                      <div>
                        <span className="text-inkSoft/60">Адрес:</span> {addr.line1 || addr.address || '-'}
                      </div>
                    )}
                    {(addr.line2 || addr.pickupPoint) && (
                      <div>
                        <span className="text-inkSoft/60">Пункт выдачи:</span> {addr.line2 || addr.pickupPoint || '-'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Комментарий */}
          {order.note && (
            <div className="p-6 border rounded-2xl bg-roseBeige/20">
              <h2 className="font-medium mb-4">Комментарий</h2>
              <p className="text-sm text-inkSoft whitespace-pre-line">{order.note}</p>
            </div>
          )}

          {/* Состав заказа */}
          <div className="p-6 border rounded-2xl bg-roseBeige/20">
            <h2 className="font-medium mb-4">Состав заказа</h2>
            <div className="space-y-4">
              {(order.items || []).map((it:any)=> (
                <div key={it.id || it.sku} className="flex gap-4 items-start pb-4 border-b border-mistGray/20 last:border-0 last:pb-0">
                  {it.image && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-mistGray/20">
                      <img 
                        src={it.image.startsWith('http') || it.image.startsWith('/') ? it.image : `/${it.image}`}
                        alt={it.name || it.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder/about_main_placeholder.webp'
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium mb-1">{it.name || it.productName}</div>
                    {it.color && (
                      <div className="text-sm text-inkSoft/60 mb-1">Цвет: {it.color}</div>
                    )}
                    <div className="text-sm text-inkSoft/60">{it.sku || '-'}</div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="text-sm text-inkSoft/70">{it.qty || it.quantity} × {it.price || it.unitPrice} ₽</div>
                    <div className="text-sm font-medium mt-1">{it.total || (it.qty * it.price)} ₽</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* События */}
          {order.events && order.events.length > 0 && (
            <div className="p-6 border rounded-2xl">
              <h2 className="font-medium mb-4">История событий</h2>
              <ul className="space-y-2 text-sm">
                {order.events.map((e:any)=> (
                  <li key={e.id} className="flex justify-between">
                    <span className="text-inkSoft/60">{new Date(e.createdAt).toLocaleString()}</span>
                    <span>{e.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Статусы и суммы */}
          <div className="p-6 border rounded-2xl">
            <h2 className="font-medium mb-4">Информация</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-inkSoft/60">Сумма:</span>
                <span className="font-medium">{order.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inkSoft/60">Платёж:</span>
                <span>{order.paymentStatus || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inkSoft/60">Доставка:</span>
                <span>{order.fulfillmentStatus || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-inkSoft/60">Статус:</span>
                <span>{order.orderStatus || '-'}</span>
              </div>
            </div>
          </div>

          {/* Операции */}
          <div className="p-6 border rounded-2xl">
            <h2 className="font-medium mb-4">Операции</h2>
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
