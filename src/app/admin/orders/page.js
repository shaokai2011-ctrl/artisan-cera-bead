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

const statusLabels = {
  pending: '待处理',
  processing: '处理中',
  shipped: '已发货',
  delivered: '已送达',
  cancelled: '已取消',
}

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
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
      setOrders(await res.json())
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-serif text-stone-900">订单管理</h1>
        {orders.length > 0 && (
          <span className="text-xs text-stone-400">共 {orders.length} 单</span>
        )}
      </div>

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
                <th className="pb-3 font-medium pr-3">简号</th>
                <th className="pb-3 font-medium">客户</th>
                <th className="pb-3 font-medium">商品数</th>
                <th className="pb-3 font-medium">金额</th>
                <th className="pb-3 font-medium">发货状态</th>
                <th className="pb-3 font-medium">支付</th>
                <th className="pb-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className="border-b border-stone-100 cursor-pointer hover:bg-stone-50 transition-colors"
                >
                  <td className="py-3 pr-3 font-mono text-xs text-stone-500">
                    {order.orderNumber || order.id.replace('cs_test_', '').slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="text-stone-900 text-sm">{order.customerName || '—'}</div>
                    <div className="text-xs text-stone-400">{order.customerEmail}</div>
                  </td>
                  <td className="py-3 pr-4 text-stone-500 text-xs">
                    {(order.items || []).length} 件
                  </td>
                  <td className="py-3 pr-4 text-stone-700">{formatPrice(order.total, order.currency)}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[order.fulfillmentStatus] || 'bg-stone-100 text-stone-500'}`}>
                      {statusLabels[order.fulfillmentStatus] || order.fulfillmentStatus || '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {order.paymentStatus === 'paid' ? '已付' : order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-stone-400 whitespace-nowrap">
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
