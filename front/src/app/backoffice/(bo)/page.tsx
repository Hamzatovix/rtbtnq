'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BackofficeProduct as Product, BackofficeCategory as Category, BackofficeColor as Color } from '@/types/backoffice'

type OrdersList = { results: Array<{ id: string; number: string; total: number; createdAt: string; customerName?: string | null; customerEmail?: string | null; paymentStatus: string; fulfillmentStatus: string; orderStatus: string }>; meta: any }

export default function BackofficeDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrdersList | null>(null)
  const newOrdersCount = (orders?.results || []).filter(o => o.orderStatus === 'new').length

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, cats, cols] = await Promise.all([
          fetch('/api/products', { cache: 'no-store' }).then(r=>r.json()),
          fetch('/api/categories', { cache: 'no-store' }).then(r=>r.json()),
          fetch('/api/colors', { cache: 'no-store' }).then(r=>r.json()),
        ])
        setProducts(productsRes.results)
        setCategories(cats)
        setColors(cols.results ?? cols)
        // fetch orders summary (без сброса флага "new")
        try {
          const res = await fetch('/api/orders')
          if (res.ok) {
            const data = (await res.json()) as OrdersList
            setOrders(data)
          }
        } catch {}
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-fintage-graphite/60 dark:text-fintage-graphite/75 font-mono text-xs uppercase tracking-[0.15em]">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-display-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite mb-3 sm:mb-4 md:mb-5 tracking-tighter uppercase">
          Панель управления
        </h1>
        <p className="text-[9px] sm:text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em] mb-2 md:mb-3">
          Системы управления RSBTNQ
        </p>
        <div className="mt-3 sm:mt-4">
          <Link href="/backoffice/products/new">
            <Button className="inline-flex items-center gap-2 whitespace-nowrap text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Добавить товар</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/45 shadow-fintage-sm p-5 md:p-6">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="text-xs sm:text-sm md:text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.15em]">Товары</h3>
            <Link href="/backoffice/products/new">
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Добавить
              </Button>
            </Link>
          </div>
          <p className="text-2xl sm:text-3xl md:text-3xl font-black text-fintage-charcoal dark:text-fintage-offwhite mb-2 md:mb-3">{products.length}</p>
          <Link href="/backoffice/products" className="text-[10px] sm:text-xs md:text-xs font-mono text-accent dark:text-accent hover:underline inline-block uppercase tracking-[0.15em]">
            Управление →
          </Link>
        </div>

        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/45 shadow-fintage-sm p-5 md:p-6">
          <h3 className="text-xs sm:text-sm md:text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-2 md:mb-3 uppercase tracking-[0.15em]">Категории</h3>
          <p className="text-2xl sm:text-3xl md:text-3xl font-black text-fintage-charcoal dark:text-fintage-offwhite mb-2 md:mb-3">{categories.length}</p>
          <Link href="/backoffice/categories" className="text-[10px] sm:text-xs md:text-xs font-mono text-accent dark:text-accent hover:underline mt-2 inline-block uppercase tracking-[0.15em]">
            Управление →
          </Link>
        </div>

        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/45 shadow-fintage-sm p-5 md:p-6">
          <h3 className="text-xs sm:text-sm md:text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-2 md:mb-3 uppercase tracking-[0.15em]">Новые заказы</h3>
          <p className="text-2xl sm:text-3xl md:text-3xl font-black text-fintage-charcoal dark:text-fintage-offwhite mb-2 md:mb-3">{newOrdersCount > 0 ? `+${newOrdersCount}` : '0'}</p>
          <Link href="/backoffice/orders" className="text-[10px] sm:text-xs md:text-xs font-mono text-accent dark:text-accent hover:underline mt-2 inline-block uppercase tracking-[0.15em]">
            Управление →
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/45 shadow-fintage-sm p-4 sm:p-5 md:p-6">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite mb-4 sm:mb-5 md:mb-6 tracking-tighter uppercase">Последние товары</h2>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="min-w-[600px] sm:min-w-0">
            <table className="w-full">
              <thead>
              <tr className="border-b border-fintage-graphite/20 dark:border-fintage-graphite/45">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">Название</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em] hidden sm:table-cell">Категория</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em]">Статус</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.15em] hidden sm:table-cell">Варианты</th>
              </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id} className="border-b border-fintage-graphite/10 dark:border-fintage-graphite/35 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/18 transition-fintage">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-charcoal dark:text-fintage-offwhite">
                      <Link href={`/backoffice/products/${product.slug}`} className="hover:text-accent dark:hover:text-accent transition-fintage text-xs sm:text-sm">
                        {product.name}
                      </Link>
                      <div className="sm:hidden text-[10px] text-fintage-graphite/60 dark:text-fintage-graphite/75 mt-1">
                        {categories.find(c => c.id === product.category)?.name || '-'}
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-graphite/60 dark:text-fintage-graphite/75 hidden sm:table-cell text-xs sm:text-sm">
                      {categories.find(c => c.id === product.category)?.name || '-'}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-sm text-[9px] sm:text-xs font-mono uppercase tracking-[0.1em] backdrop-blur-md shadow-fintage-sm ${
                        product.is_published 
                          ? 'bg-accent/15 dark:bg-accent/30 text-fintage-charcoal dark:text-fintage-offwhite border border-accent/30 dark:border-accent/40' 
                          : 'bg-fintage-graphite/20 dark:bg-fintage-graphite/30 text-fintage-graphite/60 dark:text-fintage-graphite/75 border border-fintage-graphite/30 dark:border-fintage-graphite/45'
                      }`}>
                        {product.is_published ? 'Опубликован' : 'Черновик'}
                      </span>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-graphite/60 dark:text-fintage-graphite/75 hidden sm:table-cell text-xs sm:text-sm">
                      {product.variants.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 sm:mt-6">
          <Link href="/backoffice/products" className="text-[10px] sm:text-xs font-mono text-accent dark:text-accent hover:underline uppercase tracking-[0.15em]">
            Все товары →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/45 shadow-fintage-sm p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Последние заказы</h2>
          <Link href="/backoffice/orders" className="text-[10px] sm:text-xs font-mono text-accent dark:text-accent hover:underline uppercase tracking-[0.15em]">Все заказы →</Link>
        </div>
        {!orders ? (
          <p className="text-fintage-graphite/60 dark:text-fintage-graphite/75 font-mono text-[10px] sm:text-xs uppercase tracking-[0.15em]">Нет данных</p>
        ) : (
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
                  </tr>
                </thead>
                <tbody>
                  {orders.results.slice(0,5).map((o) => (
                    <tr key={o.id} className="border-b border-fintage-graphite/10 dark:border-fintage-graphite/35 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/18 transition-fintage">
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-charcoal dark:text-fintage-offwhite">
                        <Link href={`/backoffice/orders/${o.id}`} className="hover:text-accent dark:hover:text-accent transition-fintage text-xs sm:text-sm">{o.number}</Link>
                        <div className="sm:hidden text-[9px] text-fintage-graphite/60 dark:text-fintage-graphite/75 mt-1">
                          {o.customerName || o.customerEmail || '-'}
                        </div>
                      </td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-graphite/60 dark:text-fintage-graphite/75 hidden sm:table-cell text-xs sm:text-sm">{o.customerName || o.customerEmail || '-'}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-graphite/60 dark:text-fintage-graphite/75 text-xs sm:text-sm">{o.total}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-[9px] sm:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/75 uppercase tracking-[0.1em] hidden sm:table-cell">{o.paymentStatus} / {o.fulfillmentStatus} / {o.orderStatus}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4 text-fintage-graphite/60 dark:text-fintage-graphite/75 hidden md:table-cell text-[9px] sm:text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

