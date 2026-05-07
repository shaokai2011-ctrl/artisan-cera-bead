import { readJSON, writeJSON } from '@/lib/store'
import { verifyPassword } from '@/lib/auth'

export async function GET(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  const categories = await readJSON('categories.json')
  return Response.json(categories)
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

  const categories = await readJSON('categories.json')
  if (categories.find((c) => c.id === data.id)) {
    return Response.json({ error: '分类 ID 已存在' }, { status: 409 })
  }

  categories.push({
    id: data.id,
    name: data.name,
    nameZh: data.nameZh || '',
    nameJa: data.nameJa || '',
    sort: data.sort || categories.length + 1,
  })

  await writeJSON('categories.json', categories)
  return Response.json(categories, { status: 201 })
}
