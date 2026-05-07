import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'
import { deductStock, restoreStock } from '@/lib/stock'

export async function GET(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const orders = await readJSON('orders.json')
  const order = orders.find((o) => o.id === id)
  if (!order) return Response.json({ error: '订单不存在' }, { status: 404 })
  return Response.json(order)
}

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

export async function PATCH(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const { fulfillmentStatus, trackingNumber, note } = await request.json()

  const orders = await readJSON('orders.json')
  const order = orders.find((o) => o.id === id)
  if (!order) return Response.json({ error: '订单不存在' }, { status: 404 })

  const prevStatus = order.fulfillmentStatus

  if (fulfillmentStatus && STATUSES.includes(fulfillmentStatus)) {
    order.fulfillmentStatus = fulfillmentStatus
  }
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber
  if (note !== undefined) order.note = note
  order.updatedAt = new Date().toISOString()

  // Stock deduction: when order is shipped
  if (fulfillmentStatus === 'shipped' && prevStatus !== 'shipped' && order.items) {
    for (const item of order.items) {
      const productId = item.productId || item.id
      if (productId && item.quantity > 0) {
        await deductStock(productId, item.quantity, order.id, item.name)
      }
    }
  }

  // Stock restore: when shipped/delivered order is cancelled
  if (fulfillmentStatus === 'cancelled' && ['shipped', 'delivered'].includes(prevStatus) && order.items) {
    for (const item of order.items) {
      const productId = item.productId || item.id
      if (productId && item.quantity > 0) {
        await restoreStock(productId, item.quantity, order.id, item.name)
      }
    }
  }

  // Stock restore: when pending/processing order is cancelled (no deduction happened yet)
  // No action needed for these since stock wasn't deducted

  await writeJSON('orders.json', orders)
  return Response.json(order)
}
