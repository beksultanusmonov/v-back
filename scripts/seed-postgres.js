const fs = require('fs/promises')
const path = require('path')
const { Pool } = require('pg')

const COLLECTIONS = ['users', 'vacancies', 'courses', 'faqs', 'resumes', 'courseProgress', 'certificates']
const DB_JSON_PATH = path.join(__dirname, '..', 'database.json')

function getPoolConfig() {
  const connectionString = process.env.DATABASE_URL
  const config = { connectionString }
  if (connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1')) {
    config.ssl = { rejectUnauthorized: false }
  }
  return config
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required.')
    console.error('Example: DATABASE_URL="postgresql://..." npm run seed:postgres')
    process.exit(1)
  }

  const raw = await fs.readFile(DB_JSON_PATH, 'utf-8')
  const data = JSON.parse(raw)

  const pool = new Pool(getPoolConfig())
  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_documents (
        collection TEXT NOT NULL,
        doc JSONB NOT NULL
      )
    `)
    await client.query('BEGIN')

    for (const name of COLLECTIONS) {
      const items = Array.isArray(data[name]) ? data[name] : []
      await client.query('DELETE FROM app_documents WHERE collection = $1', [name])
      for (const item of items) {
        await client.query('INSERT INTO app_documents (collection, doc) VALUES ($1, $2)', [name, item])
      }
      console.log(`Imported ${items.length} documents into "${name}"`)
    }

    await client.query('COMMIT')
    console.log('Seed complete.')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error('Seed failed:', error.message)
  process.exit(1)
})
