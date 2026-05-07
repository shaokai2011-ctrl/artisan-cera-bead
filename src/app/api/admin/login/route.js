import { verifyPassword } from '@/lib/auth'

export async function POST(request) {
  try {
    const { password } = await request.json()
    if (verifyPassword(password)) {
      return Response.json({ success: true, token: btoa(password) })
    }
    return Response.json({ success: false, error: '密码错误' }, { status: 401 })
  } catch {
    return Response.json({ success: false, error: '请求格式错误' }, { status: 400 })
  }
}
