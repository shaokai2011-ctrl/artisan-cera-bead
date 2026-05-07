import { readJSON, writeJSON } from '@/lib/store'

export async function POST(request) {
  try {
    const { path, action, productId } = await request.json()
    if (!path) return Response.json({ error: 'path required' }, { status: 400 })
    if (!action && (path.startsWith('/admin') || path.startsWith('/api') || path.startsWith('/_next'))) {
      return Response.json({ ok: true })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip') || ''

    const entry = {
      path,
      ip: ip || '',
      timestamp: new Date().toISOString(),
    }
    if (action) entry.action = action
    if (productId) entry.productId = productId

    const logs = await readJSON('traffic.json')
    logs.push(entry)
    // Keep last 100k entries to prevent bloat
    if (logs.length > 100000) logs.splice(0, logs.length - 100000)
    await writeJSON('traffic.json', logs)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Track error:', err)
    return Response.json({ ok: true })
  }
}
