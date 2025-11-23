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
        <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.15em]">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite mb-4 tracking-tighter uppercase">
          Панель управления
        </h1>
        <p className="text-[10px] md:text-xs font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em] mb-2">
          Системы управления RSBTNQ
        </p>
        <div className="mt-4">
          <Link href="/backoffice/products/new">
            <Button className="inline-flex items-center gap-2 whitespace-nowrap">
              <Plus className="h-4 w-4" />
              <span>Добавить товар</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite uppercase tracking-[0.15em]">Товары</h3>
            <Link href="/backoffice/products/new">
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Добавить
              </Button>
            </Link>
          </div>
          <p className="text-3xl font-black text-fintage-charcoal dark:text-fintage-offwhite mb-2">{products.length}</p>
          <Link href="/backoffice/products" className="text-xs font-mono text-accent dark:text-accent hover:underline inline-block uppercase tracking-[0.15em]">
            Управление →
          </Link>
        </div>

        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm p-6">
          <h3 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-2 uppercase tracking-[0.15em]">Категории</h3>
          <p className="text-3xl font-black text-fintage-charcoal dark:text-fintage-offwhite">{categories.length}</p>
          <Link href="/backoffice/categories" className="text-xs font-mono text-accent dark:text-accent hover:underline mt-2 inline-block uppercase tracking-[0.15em]">
            Управление →
          </Link>
        </div>

        <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm p-6">
          <h3 className="text-sm font-mono text-fintage-charcoal dark:text-fintage-offwhite mb-2 uppercase tracking-[0.15em]">Новые заказы</h3>
          <p className="text-3xl font-black text-fintage-charcoal dark:text-fintage-offwhite">{newOrdersCount > 0 ? `+${newOrdersCount}` : '0'}</p>
          <Link href="/backoffice/orders" className="text-xs font-mono text-accent dark:text-accent hover:underline mt-2 inline-block uppercase tracking-[0.15em]">
            Управление →
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm p-6">
        <h2 className="text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite mb-6 tracking-tighter uppercase">Последние товары</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-fintage-graphite/20 dark:border-fintage-graphite/30">
                <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Название</th>
                <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Категория</th>
                <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Статус</th>
                <th className="text-left py-3 px-4 text-[10px] font-mono text-fintage-graphite/60 dark:text-fintage-graphite/50 uppercase tracking-[0.15em]">Варианты</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product.id} className="border-b border-fintage-graphite/10 dark:border-fintage-graphite/20 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/10 transition-fintage">
                  <td className="py-3 px-4 text-fintage-charcoal dark:text-fintage-offwhite">
                    <Link href={`/backoffice/products/${product.slug}`} className="hover:text-accent dark:hover:text-accent transition-fintage">
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">
                    {categories.find(c => c.id === product.category)?.name || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-sm text-xs font-mono uppercase tracking-[0.1em] backdrop-blur-md shadow-fintage-sm ${
                      product.is_published 
                        ? 'bg-accent/15 dark:bg-accent/20 text-fintage-charcoal dark:text-fintage-offwhite border border-accent/30 dark:border-accent/30' 
                        : 'bg-fintage-graphite/20 dark:bg-fintage-graphite/20 text-fintage-graphite/60 dark:text-fintage-graphite/50 border border-fintage-graphite/30 dark:border-fintage-graphite/30'
                    }`}>
                      {product.is_published ? 'Опубликован' : 'Черновик'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">
                    {product.variants.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <Link href="/backoffice/products" className="text-xs font-mono text-accent dark:text-accent hover:underline uppercase tracking-[0.15em]">
            Все товары →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-fintage-graphite/5 dark:bg-fintage-graphite/10 rounded-sm border border-fintage-graphite/20 dark:border-fintage-graphite/30 shadow-fintage-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title-1 font-display-vintage font-black text-fintage-charcoal dark:text-fintage-offwhite tracking-tighter uppercase">Последние заказы</h2>
          <Link href="/backoffice/orders" className="text-xs font-mono text-accent dark:text-accent hover:underline uppercase tracking-[0.15em]">Все заказы →</Link>
        </div>
        {!orders ? (
          <p className="text-fintage-graphite/60 dark:text-fintage-graphite/50 font-mono text-xs uppercase tracking-[0.15em]">Нет данных</p>
        ) : (
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
                {orders.results.slice(0,5).map((o) => (
                  <tr key={o.id} className="border-b border-fintage-graphite/10 dark:border-fintage-graphite/20 hover:bg-fintage-graphite/5 dark:hover:bg-fintage-graphite/10 transition-fintage">
                    <td className="py-3 px-4 text-fintage-charcoal dark:text-fintage-offwhite">
                      <Link href={`/backoffice/orders/${o.id}`} className="hover:text-accent dark:hover:text-accent transition-fintage">{o.number}</Link>
                    </td>
                    <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">{o.customerName || o.customerEmail || '-'}</td>
                    <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">{o.total}</td>
                    <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">{o.paymentStatus} / {o.fulfillmentStatus} / {o.orderStatus}</td>
                    <td className="py-3 px-4 text-fintage-graphite/60 dark:text-fintage-graphite/50">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

