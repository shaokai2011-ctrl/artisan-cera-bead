import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'

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

  // Only allow updating specific fields
  const allowed = ['price', 'stock', 'featured', 'active', 'name', 'nameZh', 'nameJa', 'description', 'descriptionZh', 'descriptionJa', 'coverImage', 'details', 'detailsZh', 'detailsJa', 'images', 'length', 'materials', 'category', 'sales']
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
