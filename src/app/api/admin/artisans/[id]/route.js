import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'

const ALLOWED = ['name', 'nameEn', 'nameJa', 'title', 'titleEn', 'titleJa', 'avatar', 'coverImage', 'bio', 'bioEn', 'bioJa', 'videoUrl', 'productIds', 'sort']

export async function GET(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const artisans = await readJSON('artisans.json')
  const artisan = artisans.find((a) => a.id === id)
  if (!artisan) return Response.json({ error: '匠人不存在' }, { status: 404 })
  return Response.json(artisan)
}

export async function PATCH(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const updates = await request.json()
  const artisans = await readJSON('artisans.json')
  const idx = artisans.findIndex((a) => a.id === id)

  if (idx === -1) {
    return Response.json({ error: '匠人不存在' }, { status: 404 })
  }

  for (const key of ALLOWED) {
    if (key in updates) artisans[idx][key] = updates[key]
  }

  await writeJSON('artisans.json', artisans)
  return Response.json(artisans[idx])
}

export async function DELETE(request, { params }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const { id } = await params
  const artisans = await readJSON('artisans.json')
  const idx = artisans.findIndex((a) => a.id === id)

  if (idx === -1) {
    return Response.json({ error: '匠人不存在' }, { status: 404 })
  }

  artisans.splice(idx, 1)
  await writeJSON('artisans.json', artisans)
  return Response.json({ success: true })
}
