import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function saveImage(file) {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const dir = path.join(process.cwd(), 'public', 'images')

  await mkdir(path.join(dir, 'uploads'), { recursive: true })
  const filepath = path.join(dir, filename)
  await writeFile(filepath, buffer)

  return `/images/${filename}`
}

export async function deleteImage(url) {
  // Only delete local uploads, not original product images
  if (url.startsWith('/images/uploads/')) {
    try {
      const fs = await import('fs/promises')
      const filepath = path.join(process.cwd(), 'public', url)
      await fs.unlink(filepath)
    } catch {
      // File may not exist, ignore
    }
  }
}
