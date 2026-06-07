const fs = require('fs/promises')
const path = require('path')
const { Pool } = require('pg')

const COLLECTIONS = ['users', 'vacancies', 'courses', 'faqs', 'resumes', 'courseProgress', 'certificates']

const LOCAL_DB_PATH = path.join(__dirname, 'database.json')
const SEED_DB_PATH = path.join(__dirname, 'database.seed.json')

const DATABASE_URL = process.env.DATABASE_URL

function resolveDbPath() {
  if (process.env.DATABASE_FILE) return process.env.DATABASE_FILE
  const railwayVolume = process.env.RAILWAY_VOLUME_MOUNT_PATH
  if (railwayVolume) return path.join(railwayVolume, 'data', 'database.json')
  return LOCAL_DB_PATH
}

const DB_PATH = resolveDbPath()

let pool = null
let schemaReady = false

function usePostgres() {
  return Boolean(DATABASE_URL)
}

function getPoolConfig() {
  const config = { connectionString: DATABASE_URL }
  if (DATABASE_URL && !DATABASE_URL.includes('localhost') && !DATABASE_URL.includes('127.0.0.1')) {
    config.ssl = { rejectUnauthorized: false }
  }
  return config
}

async function getPool() {
  if (pool) return pool
  if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')
  pool = new Pool(getPoolConfig())
  await ensureSchema(pool)
  await ensureSeeded(pool)
  return pool
}

async function ensureSchema(clientOrPool) {
  if (schemaReady) return
  await clientOrPool.query(`
    CREATE TABLE IF NOT EXISTS app_documents (
      collection TEXT NOT NULL,
      doc JSONB NOT NULL
    )
  `)
  await clientOrPool.query(`
    CREATE INDEX IF NOT EXISTS idx_app_documents_collection
    ON app_documents (collection)
  `)
  schemaReady = true
}

async function ensureSeeded(clientOrPool) {
  const { rows } = await clientOrPool.query('SELECT COUNT(*)::int AS count FROM app_documents')
  if (rows[0].count > 0) return

  let seedContent = '{}'
  try {
    seedContent = await fs.readFile(SEED_DB_PATH, 'utf-8')
  } catch {
    seedContent = await fs.readFile(LOCAL_DB_PATH, 'utf-8')
  }
  const data = JSON.parse(seedContent)
  await writeDbToPostgres(data, clientOrPool)
}

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

async function readDbFromFile() {
  await ensureDbFile()
  const raw = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(raw)
}

async function writeDbToFile(data) {
  await ensureDbFile()
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  return data
}

async function readDbFromPostgres(clientOrPool) {
  const db = clientOrPool || (await getPool())
  const result = Object.fromEntries(COLLECTIONS.map((name) => [name, []]))
  const { rows } = await db.query('SELECT collection, doc FROM app_documents')
  for (const row of rows) {
    if (Array.isArray(result[row.collection])) {
      result[row.collection].push(row.doc)
    }
  }
  return result
}

async function writeDbToPostgres(data, clientOrPool) {
  const db = clientOrPool || (await getPool())
  const client = clientOrPool ? null : await db.connect()
  const executor = client || db

  try {
    if (client) await client.query('BEGIN')
    for (const name of COLLECTIONS) {
      const items = Array.isArray(data[name]) ? data[name] : []
      await executor.query('DELETE FROM app_documents WHERE collection = $1', [name])
      for (const item of items) {
        await executor.query('INSERT INTO app_documents (collection, doc) VALUES ($1, $2)', [name, item])
      }
    }
    if (client) await client.query('COMMIT')
  } catch (error) {
    if (client) await client.query('ROLLBACK')
    throw error
  } finally {
    client?.release()
  }
  return data
}

async function readDb() {
  if (usePostgres()) return readDbFromPostgres()
  return readDbFromFile()
}

async function writeDb(data) {
  if (usePostgres()) return writeDbToPostgres(data)
  return writeDbToFile(data)
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
