import { verifyPassword } from '@/lib/auth'
import { saveImage } from '@/lib/upload'

export async function POST(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token || !verifyPassword(atob(token))) {
    return Response.json({ error: '未授权' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('image')

    if (!file) {
      return Response.json({ error: '请选择图片' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: '图片不能超过 5MB' }, { status: 400 })
    }

    const ext = file.name.split('.').pop().toLowerCase()
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return Response.json({ error: '仅支持 JPG、PNG、WebP 格式' }, { status: 400 })
    }

    const url = await saveImage(file)
    return Response.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return Response.json({ error: '上传失败' }, { status: 500 })
  }
}
