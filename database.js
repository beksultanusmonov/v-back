const fs = require('fs/promises')
const path = require('path')

const LOCAL_DB_PATH = path.join(__dirname, 'database.json')
const SEED_DB_PATH = path.join(__dirname, 'database.seed.json')

function resolveDbPath() {
  if (process.env.DATABASE_FILE) return process.env.DATABASE_FILE
  const railwayVolume = process.env.RAILWAY_VOLUME_MOUNT_PATH
  if (railwayVolume) return path.join(railwayVolume, 'data', 'database.json')
  return LOCAL_DB_PATH
}

const DB_PATH = resolveDbPath()

async function ensureDbFile() {
  const targetDir = path.dirname(DB_PATH)
  await fs.mkdir(targetDir, { recursive: true })
  try {
    await fs.access(DB_PATH)
  } catch {
    let seedContent = '{}'
    try {
      seedContent = await fs.readFile(SEED_DB_PATH, 'utf-8')
    } catch {
      seedContent = await fs.readFile(LOCAL_DB_PATH, 'utf-8')
    }
    await fs.writeFile(DB_PATH, seedContent, 'utf-8')
  }
}

async function readDb() {
  await ensureDbFile()
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeDb(data) {
  await ensureDbFile()
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  return data
}

async function updateDb(updater) {
  const db = await readDb()
  const updated = await updater(db)
  await writeDb(updated)
  return updated
}

module.exports = {
  readDb,
  writeDb,
  updateDb,
}
