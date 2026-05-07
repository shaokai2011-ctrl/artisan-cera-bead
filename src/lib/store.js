import fs from 'fs'
import path from 'path'
import { Redis } from '@upstash/redis'

const DATA_DIR = path.join(process.cwd(), 'src/data')

let redis
function getRedis() {
  const url = process.env.UPSTASH_REDIS_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_TOKEN || process.env.KV_REST_API_TOKEN
  if (url && token) {
    if (!redis) redis = new Redis({ url, token })
    return redis
  }
  return null
}

function filenameToKey(filename) {
  return filename.replace(/\.json$/i, '')
}

export async function readJSON(filename, { allowMissing } = {}) {
  const client = getRedis()
  if (client) {
    const key = filenameToKey(filename)
    let data = await client.get(key)
    // Auto-seed from deployment filesystem if key doesn't exist yet
    if (data === null) {
      const filePath = path.join(DATA_DIR, filename)
      try {
        const raw = fs.readFileSync(filePath, 'utf-8')
        data = JSON.parse(raw)
        await client.set(key, data)
      } catch {
        if (allowMissing) return null
        throw new Error(`Redis key "${key}" not found and no local file to seed`)
      }
    }
    return data
  }

  const filePath = path.join(DATA_DIR, filename)
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    if (allowMissing) return null
    throw new Error(`File not found: ${filename}`)
  }
}

export async function writeJSON(filename, data) {
  const client = getRedis()
  if (client) {
    const key = filenameToKey(filename)
    await client.set(key, data)
    return true
  }

  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  return true
}
