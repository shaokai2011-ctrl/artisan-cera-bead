import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'

export async function GET(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const artisans = await readJSON('artisans.json')
  return Response.json(artisans)
}

export async function POST(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const data = await request.json()
  if (!data.id || !data.name) {
    return Response.json({ error: 'ID 和名称不能为空' }, { status: 400 })
  }

  const artisans = await readJSON('artisans.json')
  if (artisans.find((a) => a.id === data.id)) {
    return Response.json({ error: '匠人 ID 已存在' }, { status: 409 })
  }

  artisans.push({
    id: data.id,
    name: data.name,
    nameEn: data.nameEn || '',
    nameJa: data.nameJa || '',
    title: data.title || '',
    titleEn: data.titleEn || '',
    titleJa: data.titleJa || '',
    avatar: data.avatar || '',
    coverImage: data.coverImage || '',
    bio: data.bio || '',
    bioEn: data.bioEn || '',
    bioJa: data.bioJa || '',
    videoUrl: data.videoUrl || '',
    productIds: data.productIds || [],
    sort: data.sort || artisans.length + 1,
  })

  await writeJSON('artisans.json', artisans)
  return Response.json(artisans, { status: 201 })
}
