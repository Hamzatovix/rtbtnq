'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product, Category, Color } from '@/lib/api/mocks'

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
        <p className="text-inkSoft/60">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-display-1 font-light text-inkSoft font-display mb-4">
          Панель управления
        </h1>
        <p className="text-inkSoft/60 text-body">
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
        <div className="bg-roseBeige/40 rounded-2xl border border-mistGray/20 shadow-misty/50 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-light text-inkSoft">Товары</h3>
            <Link href="/backoffice/products/new">
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Добавить
              </Button>
            </Link>
          </div>
          <p className="text-3xl font-light text-inkSoft mb-2">{products.length}</p>
          <Link href="/backoffice/products" className="text-sm text-sageTint hover:underline inline-block">
            Управление →
          </Link>
        </div>

        <div className="bg-roseBeige/40 rounded-2xl border border-mistGray/20 shadow-misty/50 p-6">
          <h3 className="text-lg font-light text-inkSoft mb-2">Категории</h3>
          <p className="text-3xl font-light text-inkSoft">{categories.length}</p>
          <Link href="/backoffice/categories" className="text-sm text-sageTint hover:underline mt-2 inline-block">
            Управление →
          </Link>
        </div>

        <div className="bg-roseBeige/40 rounded-2xl border border-mistGray/20 shadow-misty/50 p-6">
          <h3 className="text-lg font-light text-inkSoft mb-2">Новые заказы</h3>
          <p className="text-3xl font-light text-inkSoft">{newOrdersCount > 0 ? `+${newOrdersCount}` : '0'}</p>
          <Link href="/backoffice/orders" className="text-sm text-sageTint hover:underline mt-2 inline-block">
            Управление →
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-roseBeige/40 rounded-2xl border border-mistGray/20 shadow-misty/50 p-6">
        <h2 className="text-title-1 font-light text-inkSoft font-display mb-6">Последние товары</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mistGray/20">
                <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">Название</th>
                <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">Категория</th>
                <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">Статус</th>
                <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">Варианты</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product.id} className="border-b border-mistGray/10 hover:bg-mistGray/10 transition-colors">
                  <td className="py-3 px-4 text-inkSoft">
                    <Link href={`/backoffice/products/${product.slug}`} className="hover:text-sageTint transition-colors">
                      {product.name}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-inkSoft/60">
                    {categories.find(c => c.id === product.category)?.name || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-warm ${
                      product.is_published 
                        ? 'bg-sageTint/15 text-inkSoft border border-sageTint/30' 
                        : 'bg-mistGray/20 text-inkSoft/60 border border-mistGray/30'
                    }`}>
                      {product.is_published ? 'Опубликован' : 'Черновик'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-inkSoft/60">
                    {product.variants.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <Link href="/backoffice/products" className="text-sageTint hover:underline">
            Все товары →
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-roseBeige/40 rounded-2xl border border-mistGray/20 shadow-misty/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title-1 font-light text-inkSoft font-display">Последние заказы</h2>
          <Link href="/backoffice/orders" className="text-sageTint hover:underline">Все заказы →</Link>
        </div>
        {!orders ? (
          <p className="text-inkSoft/60">Нет данных</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-mistGray/20">
                  <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">№</th>
                  <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">Клиент</th>
                  <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">Сумма</th>
                  <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">Статусы</th>
                  <th className="text-left py-3 px-4 text-inkSoft/80 font-medium">Создан</th>
                </tr>
              </thead>
              <tbody>
                {orders.results.slice(0,5).map((o) => (
                  <tr key={o.id} className="border-b border-mistGray/10 hover:bg-mistGray/10 transition-colors">
                    <td className="py-3 px-4 text-inkSoft">
                      <Link href={`/backoffice/orders/${o.id}`} className="hover:text-sageTint transition-colors">{o.number}</Link>
                    </td>
                    <td className="py-3 px-4 text-inkSoft/60">{o.customerName || o.customerEmail || '-'}</td>
                    <td className="py-3 px-4 text-inkSoft/60">{o.total}</td>
                    <td className="py-3 px-4 text-inkSoft/60">{o.paymentStatus} / {o.fulfillmentStatus} / {o.orderStatus}</td>
                    <td className="py-3 px-4 text-inkSoft/60">{new Date(o.createdAt).toLocaleString()}</td>
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

