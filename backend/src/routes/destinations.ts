import { Router } from 'express'
import { pool } from '../db/pool.js'

export const destinationsRouter = Router()

destinationsRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, country, description, image, stays FROM destinations ORDER BY stays DESC',
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})