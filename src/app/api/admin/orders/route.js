import { readJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'

export async function GET(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  let orders = []
  try {
    orders = await readJSON('orders.json')
  } catch {
    orders = []
  }

  return Response.json(orders)
}
