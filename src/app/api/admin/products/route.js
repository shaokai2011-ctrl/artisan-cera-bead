import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'

export async function GET(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const products = await readJSON('products.json')
  return Response.json(products)
}

export async function POST(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const data = await request.json()
  if (!data.name) {
    return Response.json({ error: '商品名称不能为空' }, { status: 400 })
  }

  const products = await readJSON('products.json')

  // Auto-generate 8-digit ID
  const maxId = products.reduce((max, p) => {
    const n = parseInt(p.id, 10)
    return isNaN(n) ? max : Math.max(max, n)
  }, 10000000)

  const newProduct = {
    id: String(maxId + 1),
    name: data.name,
    nameZh: data.nameZh || '',
    nameJa: data.nameJa || '',
    price: data.price || 0,
    salePrice: data.salePrice || 0,
    currency: 'USD',
    description: data.description || '',
    descriptionZh: data.descriptionZh || '',
    descriptionJa: data.descriptionJa || '',
    images: data.images || [],
    materials: data.materials || [],
    length: data.length || '',
    stock: data.stock || 0,
    featured: data.featured || false,
    active: data.active !== false,
    coverImage: data.coverImage || (data.images?.[0] || ''),
    details: data.details || '',
    detailsZh: data.detailsZh || '',
    detailsJa: data.detailsJa || '',
    category: data.category || '',
    sales: 0,
  }

  products.push(newProduct)
  await writeJSON('products.json', products)
  return Response.json(newProduct, { status: 201 })
}
