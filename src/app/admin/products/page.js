'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const router = useRouter()

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) return router.push('/admin/login')
      setProducts(await res.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  async function toggleActive(product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !product.active }),
    })
    if (res.ok) fetchProducts()
  }

  async function toggleFeatured(product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ featured: !product.featured }),
    })
    if (res.ok) fetchProducts()
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-serif text-stone-900">商品管理</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="pb-3 font-medium">商品</th>
              <th className="pb-3 font-medium">价格</th>
              <th className="pb-3 font-medium">库存</th>
              <th className="pb-3 font-medium">状态</th>
              <th className="pb-3 font-medium">精选</th>
              <th className="pb-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone-100">
                <td className="py-3 pr-4">
                  <div className="font-medium text-stone-900">{p.name}</div>
                  <div className="text-xs text-stone-400">{p.id}</div>
                </td>
                <td className="py-3 pr-4 text-stone-700">{formatPrice(p.price)}</td>
                <td className="py-3 pr-4 text-stone-700">{p.stock}</td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.active !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {p.active !== false ? '上架' : '下架'}
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={`text-xs px-2 py-1 rounded-full ${
                      p.featured
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {p.featured ? '精选' : '普通'}
                  </button>
                </td>
                <td className="py-3">
                  <a
                    href={`/admin/products/${p.id}`}
                    className="text-xs text-stone-500 hover:text-stone-900 underline"
                  >
                    编辑
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
