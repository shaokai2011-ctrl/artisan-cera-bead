import { readJSON, writeJSON } from '@/lib/store'

export async function readStockLogs() {
  try {
    return await readJSON('stock_log.json')
  } catch {
    return []
  }
}

export async function logStockChange({ productId, productName, quantity, type, orderId, note }) {
  const logs = await readStockLogs()
  logs.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    productId,
    productName,
    quantity,  // negative for deduction, positive for addition
    type,      // 'order_deduct', 'order_restore', 'manual'
    orderId: orderId || '',
    note: note || '',
    timestamp: new Date().toISOString(),
  })
  // Keep last 10000 entries
  if (logs.length > 10000) logs.splice(0, logs.length - 10000)
  await writeJSON('stock_log.json', logs)
}

export async function readProducts() {
  try {
    return await readJSON('products.json')
  } catch {
    return []
  }
}

function findProduct(products, productId, productName) {
  // Try by internal ID first
  let idx = products.findIndex((p) => p.id === productId)
  if (idx !== -1) return idx
  // Fallback: match by name
  idx = products.findIndex((p) => p.name === productName || p.nameZh === productName)
  return idx
}

export async function deductStock(productId, quantity, orderId, productName) {
  const products = await readProducts()
  const idx = findProduct(products, productId, productName)
  if (idx === -1) return false

  const product = products[idx]
  const currentStock = product.stock || 0
  const deductQty = Math.min(quantity, currentStock)
  product.stock = currentStock - deductQty
  product.sales = (product.sales || 0) + deductQty

  await writeJSON('products.json', products)
  await logStockChange({
    productId: product.id,
    productName: product.name || product.nameZh || productId,
    quantity: -deductQty,
    type: 'order_deduct',
    orderId,
    note: `订单 ${orderId.slice(0, 12)}... 发货扣减库存`,
  })
  return true
}

export async function restoreStock(productId, quantity, orderId, productName) {
  const products = await readProducts()
  const idx = findProduct(products, productId, productName)
  if (idx === -1) return false

  const product = products[idx]
  product.stock = (product.stock || 0) + quantity
  product.sales = Math.max(0, (product.sales || 0) - quantity)

  await writeJSON('products.json', products)
  await logStockChange({
    productId: product.id,
    productName: product.name || product.nameZh || productId,
    quantity,
    type: 'order_restore',
    orderId,
    note: `订单 ${orderId.slice(0, 12)}... 取消归还库存`,
  })
  return true
}
