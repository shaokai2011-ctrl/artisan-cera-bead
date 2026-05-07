import { readStockLogs } from '@/lib/stock'
import { verifyPassword } from '@/lib/auth'

export async function GET(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 50
  const typeFilter = searchParams.get('type') || ''
  const productFilter = searchParams.get('productId') || ''

  let logs = await readStockLogs()

  // Apply filters
  if (typeFilter) {
    logs = logs.filter((l) => l.type === typeFilter)
  }
  if (productFilter) {
    logs = logs.filter((l) => l.productId === productFilter)
  }

  // Sort newest first
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const total = logs.length
  const totalPages = Math.ceil(total / pageSize)
  const paged = logs.slice((page - 1) * pageSize, page * pageSize)

  return Response.json({
    logs: paged,
    page,
    totalPages,
    total,
  })
}
