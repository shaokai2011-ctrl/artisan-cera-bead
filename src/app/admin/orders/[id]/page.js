'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

function formatPrice(cents, currency = 'usd') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

function statusBadge(status) {
  const styles = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }
  const labels = {
    pending: '待处理',
    processing: '处理中',
    shipped: '已发货',
    delivered: '已送达',
    cancelled: '已取消',
  }
  const s = styles[status] || 'bg-stone-100 text-stone-500'
  return <span className={`text-xs px-2 py-1 rounded-full ${s}`}>{labels[status] || status}</span>
}

function paymentBadge(status) {
  if (status === 'paid') return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">已支付</span>
  if (status === 'unpaid') return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">未支付</span>
  return <span className="text-xs px-2 py-1 rounded-full bg-stone-100 text-stone-500">{status}</span>
}

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tracking, setTracking] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.status === 401) return router.push('/admin/login')
      if (res.status === 404) return router.push('/admin/orders')
      const data = await res.json()
      setOrder(data)
      setTracking(data.trackingNumber || '')
      setNote(data.note || '')
      setLoading(false)
    }
    load()
  }, [id, token, router])

  async function updateStatus(fulfillmentStatus) {
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fulfillmentStatus, trackingNumber: tracking, note }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrder(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  function addressLines(a) {
    if (!a) return '—'
    const parts = [a.line1, a.line2, a.city, a.state, a.postal_code, a.country].filter(Boolean)
    return parts.length ? parts.join(', ') : '—'
  }

  if (loading) return <p className="text-sm text-stone-500">加载中...</p>
  if (!order) return null

  const statusFlow = ['pending', 'processing', 'shipped', 'delivered']
  const currentIdx = statusFlow.indexOf(order.fulfillmentStatus)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <a href="/admin/orders" className="text-sm text-stone-400 hover:text-stone-900">&larr; 返回订单列表</a>
        <h1 className="text-xl font-serif text-stone-900">订单详情</h1>
      </div>

      {/* Status Timeline */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-stone-400">订单号</span>
            <p className="text-sm font-mono text-stone-700 mt-0.5 break-all">{order.id}</p>
            {order.orderNumber && (
              <p className="text-xs text-stone-400 mt-0.5">简号: {order.orderNumber}</p>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400">当前状态</span>
            <div className="mt-1">{statusBadge(order.fulfillmentStatus)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-1 mb-5">
          {statusFlow.map((s, i) => {
            const done = i <= currentIdx
            const cancelled = order.fulfillmentStatus === 'cancelled'
            return (
              <div key={s} className="flex-1 flex items-center">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cancelled ? 'bg-red-300' : done ? 'bg-stone-900' : 'bg-stone-200'}`} />
                {i < statusFlow.length - 1 && (
                  <div className={`flex-1 h-0.5 ${cancelled ? 'bg-red-200' : done ? 'bg-stone-900' : 'bg-stone-200'}`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-xs text-stone-400">
          <span>待处理</span>
          <span>处理中</span>
          <span>已发货</span>
          <span>已送达</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-medium text-stone-900 mb-3">操作</h2>
        <div className="flex flex-wrap gap-2">
          {(order.fulfillmentStatus === 'pending') && (
            <button onClick={() => updateStatus('processing')} disabled={saving} className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50">
              确认处理
            </button>
          )}
          {(order.fulfillmentStatus === 'processing') && (
            <button
              onClick={() => updateStatus('shipped')}
              disabled={saving || !tracking.trim()}
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!tracking.trim() ? '请先填写运单号' : ''}
            >
              标记已发货
            </button>
          )}
          {order.fulfillmentStatus === 'processing' && !tracking.trim() && (
            <span className="text-xs text-amber-600 self-center">请先填写运单号</span>
          )}
          {(order.fulfillmentStatus === 'shipped') && (
            <button onClick={() => updateStatus('delivered')} disabled={saving} className="px-4 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50">
              标记已送达
            </button>
          )}
          {!['delivered', 'cancelled'].includes(order.fulfillmentStatus) && (
            <button onClick={() => updateStatus('cancelled')} disabled={saving} className="px-4 py-1.5 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 disabled:opacity-50">
              取消订单
            </button>
          )}
          {order.fulfillmentStatus === 'cancelled' && (
            <button onClick={() => updateStatus('pending')} disabled={saving} className="px-4 py-1.5 bg-stone-600 text-white text-xs rounded hover:bg-stone-700 disabled:opacity-50">
              恢复订单
            </button>
          )}
          {saved && <span className="text-xs text-green-600 self-center">已更新 ✓</span>}
        </div>

        {/* Tracking Number */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone-500 mb-1">运单号</label>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="填写物流单号" className="w-full px-3 py-1.5 border border-stone-300 rounded text-sm focus:outline-none focus:border-stone-900" />
          </div>
          <div className="flex items-end">
            <button onClick={() => updateStatus(order.fulfillmentStatus)} disabled={saving} className="px-3 py-1.5 bg-stone-900 text-white text-xs rounded hover:bg-stone-800 disabled:opacity-50">
              保存
            </button>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-medium text-stone-900 mb-3">客户信息</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-stone-400">姓名</span><p className="text-stone-700">{order.customerName || '—'}</p></div>
          <div><span className="text-stone-400">邮箱</span><p className="text-stone-700">{order.customerEmail || '—'}</p></div>
          <div><span className="text-stone-400">电话</span><p className="text-stone-700">{order.customerPhone || '—'}</p></div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-medium text-stone-900 mb-3">收货地址</h2>
        <p className="text-sm text-stone-700">{addressLines(order.shippingAddress)}</p>
      </div>

      {/* Payment Info */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-medium text-stone-900 mb-3">支付信息</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-stone-400">支付状态</span>
            <div className="mt-0.5">{paymentBadge(order.paymentStatus)}</div>
          </div>
          <div><span className="text-stone-400">支付时间</span><p className="text-stone-700">{order.paidAt ? new Date(order.paidAt).toLocaleString('zh-CN') : '—'}</p></div>
          <div><span className="text-stone-400">下单时间</span><p className="text-stone-700">{order.createdAt ? new Date(order.createdAt).toLocaleString('zh-CN') : '—'}</p></div>
          <div><span className="text-stone-400">货币</span><p className="text-stone-700">{order.currency?.toUpperCase() || '—'}</p></div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-medium text-stone-900 mb-3">商品明细 ({order.items?.length || 0} 件)</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-left text-stone-400 text-xs">
              <th className="pb-2 font-medium">商品</th>
              <th className="pb-2 font-medium">单价</th>
              <th className="pb-2 font-medium">数量</th>
              <th className="pb-2 font-medium text-right">小计</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item, i) => (
              <tr key={i} className="border-b border-stone-100">
                <td className="py-3 text-stone-700">{item.name}</td>
                <td className="py-3 text-stone-500">{formatPrice(item.unitAmount, order.currency)}</td>
                <td className="py-3 text-stone-500">{item.quantity}</td>
                <td className="py-3 text-right text-stone-700">{formatPrice(item.totalAmount, order.currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-3 text-right text-stone-400 text-xs">小计</td>
              <td className="pt-3 text-right text-stone-700 text-sm">{formatPrice(order.subtotal, order.currency)}</td>
            </tr>
            {order.shippingCost > 0 && (
              <tr>
                <td colSpan={3} className="pt-1 text-right text-stone-400 text-xs">运费</td>
                <td className="pt-1 text-right text-stone-700 text-sm">{formatPrice(order.shippingCost, order.currency)}</td>
              </tr>
            )}
            <tr>
              <td colSpan={3} className="pt-1 text-right text-stone-900 font-medium text-sm">合计</td>
              <td className="pt-1 text-right text-stone-900 font-medium">{formatPrice(order.total, order.currency)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Admin Note */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 mb-6">
        <h2 className="text-sm font-medium text-stone-900 mb-3">备注</h2>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="添加内部备注..." className="w-full px-3 py-2 border border-stone-300 rounded text-sm focus:outline-none focus:border-stone-900 min-h-[80px]" />
        <button onClick={() => updateStatus(order.fulfillmentStatus)} disabled={saving} className="mt-2 px-3 py-1.5 bg-stone-900 text-white text-xs rounded hover:bg-stone-800 disabled:opacity-50">
          保存备注
        </button>
        {saved && <span className="text-xs text-green-600 ml-2">已保存 ✓</span>}
      </div>
    </div>
  )
}
