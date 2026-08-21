import { Router } from 'express'
import { pool } from '../db/pool.js'

export const categoriesRouter = Router()

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, label, icon FROM categories ORDER BY label')
    res.json(rows)
  } catch (err) {
    next(err)
  }
})