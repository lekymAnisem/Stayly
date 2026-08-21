import { Router } from 'express'
import { pool } from '../db/pool.js'

export const inspirationsRouter = Router()

inspirationsRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, description, image FROM inspirations ORDER BY id',
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})