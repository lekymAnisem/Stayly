import { createApp } from './app.js'
import { config } from './config.js'
import { pool } from './db/pool.js'
import { migrate, seedIfEmpty } from './db/seed.js'

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

async function waitForDatabase(retries = 30): Promise<void> {
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT 1')
      return
    } catch {
      if (i === retries) throw new Error('Database unreachable')
      console.log(`[boot] waiting for database (attempt ${i}/${retries})…`)
      await sleep(1_000)
    }
  }
}

async function main(): Promise<void> {
  await waitForDatabase()

  if (config.migrationsOnBoot) {
    console.log('[boot] running migrations…')
    await migrate()
  }

  if (config.seedOnBoot) {
    const seeded = await seedIfEmpty()
    if (seeded > 0) console.log(`[boot] seeded ${seeded} properties`)
    else console.log('[boot] database already seeded')
  }

  const app = createApp()
  app.listen(config.port, () => {
    console.log(`[boot] stayly-api listening on :${config.port}`)
  })
}

main().catch((err) => {
  console.error('[boot] fatal:', err)
  process.exit(1)
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    console.log(`[boot] received ${signal}, shutting down…`)
    pool.end().finally(() => process.exit(0))
  })
}