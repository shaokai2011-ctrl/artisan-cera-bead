import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'
import { readStockLogs, logStockChange } from '@/lib/stock'

export async function GET(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const products = await readJSON('products.json')
  const product = products.find((p) => p.id === id)
  if (!product) return Response.json({ error: '商品不存在' }, { status: 404 })
  return Response.json(product)
}

export async function PATCH(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const updates = await request.json()
  const products = await readJSON('products.json')
  const idx = products.findIndex((p) => p.id === id)

  if (idx === -1) {
    return Response.json({ error: '商品不存在' }, { status: 404 })
  }

  // Log manual stock changes
  if ('stock' in updates && products[idx].stock !== updates.stock) {
    const oldStock = products[idx].stock || 0
    const newStock = updates.stock
    const diff = newStock - oldStock
    if (diff !== 0) {
      await logStockChange({
        productId: id,
        productName: products[idx].name || products[idx].nameZh || id,
        quantity: diff,
        type: 'manual',
        orderId: '',
        note: `后台手动调整库存（${oldStock} → ${newStock}）`,
      })
    }
  }

  // Only allow updating specific fields
  const allowed = ['price', 'salePrice', 'stock', 'featured', 'active', 'name', 'nameZh', 'nameJa', 'description', 'descriptionZh', 'descriptionJa', 'coverImage', 'details', 'detailsZh', 'detailsJa', 'images', 'length', 'materials', 'category', 'sales']
  for (const key of allowed) {
    if (key in updates) {
      products[idx][key] = updates[key]
    }
  }

  // Auto-set coverImage to first image when images array changes
  if ('images' in updates && products[idx].images?.length > 0) {
    products[idx].coverImage = products[idx].images[0]
  }

  await writeJSON('products.json', products)
  return Response.json(products[idx])
}

export async function DELETE(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const products = await readJSON('products.json')
  const idx = products.findIndex((p) => p.id === id)

  if (idx === -1) {
    return Response.json({ error: '商品不存在' }, { status: 404 })
  }

  // Check if product has active orders
  const orders = await readJSON('orders.json')
  const hasActiveOrders = orders.some((o) =>
    o.fulfillmentStatus !== 'cancelled' &&
    o.fulfillmentStatus !== 'delivered' &&
    o.items?.some((item) => item.name === products[idx].name || item.name === products[idx].nameZh)
  )
  if (hasActiveOrders) {
    return Response.json({ error: '该商品有订单正在履约中，无法删除' }, { status: 409 })
  }

  products.splice(idx, 1)
  await writeJSON('products.json', products)
  return Response.json({ success: true })
}
