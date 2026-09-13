'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Search } from 'lucide-react'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

type OrderStatus = 'new' | 'in_progress' | 'completed' | 'cancelled'
type TabKey = 'all' | OrderStatus

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'in_progress', label: 'В работе' },
  { key: 'completed', label: 'Завершены' },
  { key: 'cancelled', label: 'Отменены' },
]

function getQuickActions(o: any): Array<{ label: string; updates: any; destructive?: boolean }> {
  const actions: Array<{ label: string; updates: any; destructive?: boolean }> = []

  if (o.orderStatus === 'new') {
    actions.push({ label: 'Взять в работу', updates: { orderStatus: 'in_progress' } })
  }
  if (o.orderStatus !== 'completed' && o.orderStatus !== 'cancelled') {
    if (o.fulfillmentStatus !== 'fulfilled') {
      actions.push({ label: 'Отметить отправленным', updates: { fulfillmentStatus: 'fulfilled' } })
    }
    actions.push({ label: 'Завершить', updates: { orderStatus: 'completed' } })
    actions.push({
      label: 'Отменить',
      updates: { orderStatus: 'cancelled', fulfillmentStatus: 'cancelled' },
      destructive: true,
    })
  }
  return actions
}

export default function OrdersListPage() {
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [search, setSearch] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchOrders = () =>
    fetch('/api/orders?limit=500')
      .then((r) => r.json())
      .then((d) => setAllOrders(d?.results || []))

  useEffect(() => {
    setLoading(true)
    fetchOrders().finally(() => setLoading(false))
  }, [])

  // Живое обновление списка, когда OrderNotifications (SSE) сообщает о новом
  // заказе — без перезагрузки страницы и без повторного показа спиннера
  useEffect(() => {
    const handleNewOrder = () => {
      fetchOrders().catch(() => {
        // фоновое обновление — молча пропускаем, список обновится в следующий раз
      })
    }
    window.addEventListener('rb:new-order', handleNewOrder)
    return () => window.removeEventListener('rb:new-order', handleNewOrder)
  }, [])

  const counts = useMemo(() => {
    const result: Record<TabKey, number> = { all: allOrders.length, new: 0, in_progress: 0, completed: 0, cancelled: 0 }
    for (const o of allOrders) {
      if (o.orderStatus in result) result[o.orderStatus as OrderStatus]++
    }
    return result
  }, [allOrders])

  const filtered = useMemo(() => {
    let list = allOrders
    if (activeTab !== 'all') {
      list = list.filter((o) => o.orderStatus === activeTab)
    }
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((o) =>
        String(o.number || '').toLowerCase().includes(q) ||
        String(o.customerName || '').toLowerCase().includes(q) ||
        String(o.customerPhone || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [allOrders, activeTab, search])

  const handleQuickAction = async (orderId: string, updates: any, label: string) => {
    setActionLoadingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        const updated = await res.json()
        setAllOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
        toast.success(label)
      } else {
        toast.error('Не удалось обновить заказ', `Сервер ответил ${res.status}`)
      }
    } catch {
      toast.error('Не удалось обновить заказ', 'Проверьте соединение и попробуйте ещё раз')
    } finally {
      setActionLoadingId(null)
    }
  }

  const QuickActionsMenu = ({ order }: { order: any }) => {
    const actions = getQuickActions(order)
    if (actions.length === 0) return null
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            disabled={actionLoadingId === order.id}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm hover:bg-fintage-graphite/10 dark:hover:bg-fintage-graphite/20 transition-fintage disabled:opacity-40"
            aria-label="Быстрые действия"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((a) => (
            <DropdownMenuItem
              key={a.label}
              onClick={() => handleQuickAction(order.id, a.updates, a.label)}
              className={cn('cursor-pointer', a.destructive && 'text-fintage-punch dark:text-fintage-punch')}
            >
              {a.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-fintage-graphite/60 dark:text-fintage-graphite/75 font-mono text-xs uppercase tracking-[0.15em]">Загрузка…</p>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">
        <Link href="/backoffice" className="hover:text-accent dark:hover:text-accent transition-fintage">Панель</Link>
        <span>/</span>
        <span className="text-fintage-charcoal dark:text-fintage-offwhite">Заказы</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Заказы</h1>
        <Link href="/backoffice" className="min-h-[44px] flex items-center text-xs sm:text-xs font-mono text-accent dark:text-accent hover:underline transition-fintage uppercase tracking-[0.15em]">
          ← назад в панель
        </Link>
      </div>

      {/* Вкладки по статусу */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-[0.1em] border transition-fintage',
              activeTab === tab.key
                ? 'bg-accent/10 dark:bg-accent/25 text-accent dark:text-accent border-accent/30 dark:border-accent/45'
                : 'text-fintage-graphite/70 dark:text-fintage-graphite/75 border-fintage-graphite/20 dark:border-fintage-graphite/45 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/15'
            )}
          >
            {tab.label}
            <span className="text-[10px] opacity-70">{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Поиск */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fintage-graphite/50 dark:text-fintage-graphite/60 pointer-events-none" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, телефону, номеру заказа..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-fintage-graphite/60 dark:text-fintage-graphite/75 font-mono text-xs uppercase tracking-[0.15em] py-8 text-center">
          Заказы не найдены
        </p>
      )}

      {/* Мобильный карточный вид */}
      {isMobile ? (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="relative bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/45 p-4 space-y-2 hover:bg-fintage-graphite/10 dark:hover:bg-fintage-graphite/18 transition-fintage"
            >
              <Link href={`/backoffice/orders/${o.id}`} className="block">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-medium text-accent dark:text-accent">#{o.number}</h3>
                      {o.orderStatus === 'new' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-mono uppercase tracking-[0.15em] bg-fintage-punch/15 dark:bg-fintage-punch/30 text-fintage-punch dark:text-fintage-punch border border-fintage-punch/30 dark:border-fintage-punch/45">
                          ● Новый
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-fintage-graphite/60 dark:text-fintage-graphite/75 mt-1">
                      {o.customerName || o.customerEmail || '-'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 pr-8">
                    <p className="text-sm font-medium text-fintage-charcoal dark:text-fintage-offwhite">{o.total}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-fintage-graphite/10 dark:border-fintage-graphite/25">
                  <p className="text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.1em]">
                    {o.paymentStatus} / {o.fulfillmentStatus} / {o.orderStatus}
                  </p>
                  <p className="text-xs text-fintage-graphite/60 dark:text-fintage-graphite/75 mt-1">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
              </Link>
              <div className="absolute top-3 right-3">
                <QuickActionsMenu order={o} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Десктопный табличный вид */
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="min-w-[700px] sm:min-w-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-fintage-graphite/20 dark:border-fintage-graphite/45">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">№</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em] hidden sm:table-cell">Клиент</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">Сумма</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em] hidden sm:table-cell">Статусы</th>
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em] hidden md:table-cell">Создан</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-fintage-graphite/10 dark:border-fintage-graphite/35 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/18 transition-fintage">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-charcoal dark:text-fintage-offwhite">
                      <Link href={`/backoffice/orders/${o.id}`} className="text-accent dark:text-accent hover:underline transition-fintage inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        {o.number}
                        {o.orderStatus === 'new' && (
                          <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-sm text-[8px] sm:text-[9px] font-mono uppercase tracking-[0.15em] bg-fintage-punch/15 dark:bg-fintage-punch/30 text-fintage-punch dark:text-fintage-punch border border-fintage-punch/30 dark:border-fintage-punch/45">
                            ● Новый
                          </span>
                        )}
                      </Link>
                      <div className="sm:hidden text-[9px] text-fintage-graphite/60 dark:text-fintage-graphite/75 mt-1">
                        {o.customerName || o.customerEmail || '-'}
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-graphite/60 dark:text-fintage-graphite/75 hidden sm:table-cell text-xs sm:text-sm">{o.customerName || o.customerEmail || '-'}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-graphite/60 dark:text-fintage-graphite/75 text-xs sm:text-sm">{o.total}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.1em] hidden sm:table-cell">{o.paymentStatus} / {o.fulfillmentStatus} / {o.orderStatus}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-graphite/60 dark:text-fintage-graphite/75 hidden md:table-cell text-[9px] sm:text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <QuickActionsMenu order={o} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
