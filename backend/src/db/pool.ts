import { Pool } from 'pg'
import { config } from '../config.js'

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export async function ping(): Promise<boolean> {
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}