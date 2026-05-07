'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

function formatPrice(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  const router = useRouter()

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) return router.push('/admin/login')
      const data = await res.json()
      setOrders(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [token, router])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>

  return (
    <div>
      <h1 className="text-xl font-serif text-stone-900 mb-6">订单管理</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">暂无订单</p>
          <p className="text-xs mt-1">当有客户完成购买后，订单会出现在这里。</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-stone-500">
                <th className="pb-3 font-medium">订单号</th>
                <th className="pb-3 font-medium">客户</th>
                <th className="pb-3 font-medium">金额</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-stone-100">
                  <td className="py-3 pr-4 text-stone-700 font-mono text-xs">{order.id.slice(0, 20)}...</td>
                  <td className="py-3 pr-4">
                    <div className="text-stone-900">{order.customerName || '—'}</div>
                    <div className="text-xs text-stone-400">{order.customerEmail}</div>
                  </td>
                  <td className="py-3 pr-4 text-stone-700">{formatPrice(order.total, order.currency)}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {order.status === 'paid' ? '已付款' : order.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-stone-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
