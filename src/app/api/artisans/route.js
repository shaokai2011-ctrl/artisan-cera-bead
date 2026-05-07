import { readJSON } from '@/lib/store'

export async function GET() {
  const artisans = await readJSON('artisans.json')
  artisans.sort((a, b) => (a.sort || 999) - (b.sort || 999))
  return Response.json(artisans)
}
