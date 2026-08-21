import { Router } from 'express'
import { ping } from '../db/pool.js'

export const healthRouter = Router()

healthRouter.get('/', async (_req, res) => {
  const db = await ping()
  const body = {
    status: db ? 'ok' : 'degraded',
    db: db ? 'up' : 'down',
    service: 'stayly-api',
    time: new Date().toISOString(),
  }
  res.status(db ? 200 : 503).json(body)
})