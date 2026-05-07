'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (pRes.status === 401) return router.push('/admin/login')
      setProducts(await pRes.json())
      setCategories(await cRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => { fetchData() }, [fetchData])

  const catMap = {}
  categories.forEach((c) => { catMap[c.id] = c })

  async function toggleActive(product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ active: !product.active }),
    })
    fetchData()
  }

  async function toggleFeatured(product) {
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ featured: !product.featured }),
    })
    fetchData()
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-serif text-stone-900">商品管理</h1>
        <a href="/admin/products/new" className="px-4 py-1.5 bg-stone-900 text-white text-sm rounded hover:bg-stone-800">
          添加商品
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-500">
              <th className="pb-3 font-medium pr-3">图片</th>
              <th className="pb-3 font-medium">商品</th>
              <th className="pb-3 font-medium">分类</th>
              <th className="pb-3 font-medium">价格</th>
              <th className="pb-3 font-medium">优惠价</th>
              <th className="pb-3 font-medium">库存</th>
              <th className="pb-3 font-medium">销量</th>
              <th className="pb-3 font-medium">状态</th>
              <th className="pb-3 font-medium">精选</th>
              <th className="pb-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const imgSrc = p.coverImage || p.images?.[0]
              const cat = catMap[p.category]
              return (
                <tr key={p.id} className="border-b border-stone-100">
                  <td className="py-3 pr-3">
                    {imgSrc ? (
                      <img src={imgSrc} alt="" className="w-10 h-10 rounded object-cover bg-stone-100" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-stone-100" />
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-stone-900">{p.name}</div>
                    <div className="text-xs text-stone-400">{p.id}</div>
                  </td>
                  <td className="py-3 pr-4 text-xs text-stone-500">
                    {cat ? cat.nameZh || cat.name : '—'}
                  </td>
                  <td className="py-3 pr-4 text-stone-700">{formatPrice(p.price)}</td>
                  <td className="py-3 pr-4">
                    {p.salePrice > 0 ? (
                      <span className="text-red-500 font-medium">{formatPrice(p.salePrice)}</span>
                    ) : (
                      <span className="text-stone-300">—</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-stone-700">{p.stock}</td>
                  <td className="py-3 pr-4 text-stone-700">{p.sales || 0}</td>
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
                  <td className="py-3 flex gap-2">
                    <a
                      href={`/admin/products/${p.id}`}
                      className="text-xs text-stone-500 hover:text-stone-900 underline"
                    >
                      编辑
                    </a>
                    <button
                      onClick={async () => {
                        if (!confirm('确定删除此商品？删除后不可恢复。')) return
                        const res = await fetch(`/api/admin/products/${p.id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` },
                        })
                        if (!res.ok) {
                          const data = await res.json()
                          alert(data.error || '删除失败')
                        }
                        fetchData()
                      }}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
