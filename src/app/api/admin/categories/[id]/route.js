import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'

const ALLOWED = ['name', 'nameZh', 'nameJa', 'sort']

export async function PATCH(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const updates = await request.json()
  const categories = await readJSON('categories.json')
  const idx = categories.findIndex((c) => c.id === id)

  if (idx === -1) {
    return Response.json({ error: '分类不存在' }, { status: 404 })
  }

  for (const key of ALLOWED) {
    if (key in updates) categories[idx][key] = updates[key]
  }

  await writeJSON('categories.json', categories)
  return Response.json(categories[idx])
}

export async function DELETE(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const categories = await readJSON('categories.json')
  const idx = categories.findIndex((c) => c.id === id)

  if (idx === -1) {
    return Response.json({ error: '分类不存在' }, { status: 404 })
  }

  categories.splice(idx, 1)
  await writeJSON('categories.json', categories)
  return Response.json({ success: true })
}
