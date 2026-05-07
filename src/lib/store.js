import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'src/data')

export async function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename)
  const raw = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(raw)
}

export async function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  return true
}
