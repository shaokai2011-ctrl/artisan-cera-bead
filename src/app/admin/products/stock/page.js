'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_LABELS = {
  order_deduct: '发货扣减',
  order_restore: '取消归还',
  manual: '手动调整',
}

const TYPE_STYLES = {
  order_deduct: 'bg-red-100 text-red-600',
  order_restore: 'bg-green-100 text-green-600',
  manual: 'bg-blue-100 text-blue-600',
}

function fmtTime(iso) {
  return new Date(iso).toLocaleString('zh-CN')
}

export default function AdminStockLogsPage() {
  const [data, setData] = useState({ logs: [], total: 0, totalPages: 0 })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')
  const [productFilter, setProductFilter] = useState('')
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const router = useRouter()

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page })
      if (typeFilter) params.set('type', typeFilter)
      if (productFilter) params.set('productId', productFilter)

      const [lRes, pRes] = await Promise.all([
        fetch(`/api/admin/stock-logs?${params}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (lRes.status === 401 || pRes.status === 401) return router.push('/admin/login')
      setData(await lRes.json())
      setProducts(await pRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token, router, page, typeFilter, productFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: 'order_deduct', label: '发货扣减' },
    { value: 'order_restore', label: '取消归还' },
    { value: 'manual', label: '手动调整' },
  ]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-serif text-stone-900">库存记录</h1>
        {data.total > 0 && (
          <span className="text-xs text-stone-400">共 {data.total} 条记录</span>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-3 py-1.5 border border-stone-300 rounded text-xs focus:outline-none focus:border-stone-900"
        >
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={productFilter}
          onChange={(e) => { setProductFilter(e.target.value); setPage(1) }}
          className="px-3 py-1.5 border border-stone-300 rounded text-xs focus:outline-none focus:border-stone-900"
        >
          <option value="">全部商品</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.nameZh})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-stone-500 py-8">加载中...</p>
      ) : data.logs.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">暂无库存记录</p>
          <p className="text-xs mt-1">商品发货或库存调整后，记录会在此显示。</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-400 text-xs">
                  <th className="pb-2 font-medium pr-3">时间</th>
                  <th className="pb-2 font-medium pr-3">商品</th>
                  <th className="pb-2 font-medium pr-3">类型</th>
                  <th className="pb-2 font-medium pr-3">数量变化</th>
                  <th className="pb-2 font-medium pr-3">关联订单</th>
                  <th className="pb-2 font-medium">备注</th>
                </tr>
              </thead>
              <tbody>
                {data.logs.map((log) => (
                  <tr key={log.id} className="border-b border-stone-100">
                    <td className="py-3 pr-3 text-xs text-stone-400 whitespace-nowrap">{fmtTime(log.timestamp)}</td>
                    <td className="py-3 pr-3">
                      <span className="text-stone-700 text-xs">{log.productName}</span>
                      <span className="text-[10px] text-stone-400 ml-1">{log.productId}</span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${TYPE_STYLES[log.type] || 'bg-stone-100 text-stone-500'}`}>
                        {TYPE_LABELS[log.type] || log.type}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs font-medium ${log.quantity < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {log.quantity > 0 ? '+' : ''}{log.quantity}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      {log.orderId ? (
                        <a href={`/admin/orders/${log.orderId}`} className="text-xs text-stone-500 hover:text-stone-900 underline font-mono">
                          {log.orderId.slice(0, 12)}...
                        </a>
                      ) : (
                        <span className="text-xs text-stone-300">—</span>
                      )}
                    </td>
                    <td className="py-3 text-xs text-stone-500 max-w-[200px] truncate">{log.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 text-xs border border-stone-200 rounded hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-xs text-stone-500">
                {page} / {data.totalPages}
              </span>
              <button
                disabled={page >= data.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-xs border border-stone-200 rounded hover:border-stone-400 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
