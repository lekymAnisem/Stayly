import { Router } from 'express'
import { pool } from '../db/pool.js'
import type { Property, PropertyFilters } from '../types.js'

const PLACE_TYPE_SQL = `CASE
    WHEN property_type LIKE 'Entire %' OR property_type LIKE 'Tiny %' THEN 'Entire place'
    WHEN property_type LIKE 'Private %' THEN 'Private room'
    ELSE 'Shared room'
  END`

const PROPERTY_COLUMNS = `
  id, title, location, country, image, images,
  price, rating::float8 AS rating, reviews, dates,
  property_type AS "propertyType",
  guests, bedrooms, beds, bathrooms,
  amenities, category,
  description,
  guest_favorite AS "guestFavorite",
  instant_book AS "instantBook"
`

interface DbProperty extends Property {
  bathrooms: number
  instantBook: boolean
}

const rowToProperty = (row: DbProperty): Property => ({ ...row })

const parseNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

const parseBool = (value: unknown): boolean | undefined =>
  value === 'true' || value === '1' ? true : value === 'false' || value === '0' ? false : undefined

const parseList = (value: unknown): string[] | undefined => {
  if (value === undefined || value === '') return undefined
  return Array.isArray(value)
    ? value.map(String)
    : String(value).split(',').map((s) => s.trim()).filter(Boolean)
}

interface WhereClause {
  sql: string
  params: unknown[]
}

function buildWhere(f: PropertyFilters): WhereClause {
  const clauses: string[] = []
  const params: unknown[] = []
  const next = () => `$${params.length}`

  if (f.q) {
    const like = `%${f.q}%`
    params.push(like)
    const p = next()
    clauses.push(
      `(title ILIKE ${p} OR location ILIKE ${p} OR country ILIKE ${p} OR amenities::text ILIKE ${p})`,
    )
  }

  if (f.guests && f.guests > 0) {
    params.push(f.guests)
    clauses.push(`guests >= ${next()}`)
  }

  if (f.category && f.category !== 'trending') {
    params.push(f.category)
    clauses.push(`category = ${next()}`)
  }

  if (f.minPrice !== undefined) {
    params.push(f.minPrice)
    clauses.push(`price >= ${next()}`)
  }
  if (f.maxPrice !== undefined) {
    params.push(f.maxPrice)
    clauses.push(`price <= ${next()}`)
  }

  if (f.placeTypes && f.placeTypes.length > 0) {
    params.push(f.placeTypes)
    clauses.push(`${PLACE_TYPE_SQL} = ANY(${next()}::text[])`)
  }

  if (f.bedrooms && f.bedrooms > 0) {
    params.push(f.bedrooms)
    clauses.push(`bedrooms >= ${next()}`)
  }
  if (f.beds && f.beds > 0) {
    params.push(f.beds)
    clauses.push(`beds >= ${next()}`)
  }
  if (f.bathrooms && f.bathrooms > 0) {
    params.push(f.bathrooms)
    clauses.push(`bathrooms >= ${next()}`)
  }

  if (f.amenities && f.amenities.length > 0) {
    params.push(JSON.stringify(f.amenities))
    clauses.push(`amenities @> ${next()}::jsonb`)
  }

  if (f.propertyTypes && f.propertyTypes.length > 0) {
    params.push(f.propertyTypes)
    clauses.push(`property_type = ANY(${next()}::text[])`)
  }

  if (f.instantBook) clauses.push('instant_book = TRUE')
  if (f.guestFavorite) clauses.push('guest_favorite = TRUE')

  return { sql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '', params }
}

export const propertiesRouter = Router()

propertiesRouter.get('/', async (req, res, next) => {
  try {
    const f: PropertyFilters = {
      q: req.query.q ? String(req.query.q) : undefined,
      guests: parseNumber(req.query.guests),
      category: req.query.category ? String(req.query.category) : undefined,
      minPrice: parseNumber(req.query.minPrice),
      maxPrice: parseNumber(req.query.maxPrice),
      placeTypes: parseList(req.query.placeTypes),
      bedrooms: parseNumber(req.query.bedrooms),
      beds: parseNumber(req.query.beds),
      bathrooms: parseNumber(req.query.bathrooms),
      amenities: parseList(req.query.amenities),
      propertyTypes: parseList(req.query.propertyTypes),
      instantBook: parseBool(req.query.instantBook),
      guestFavorite: parseBool(req.query.guestFavorite),
    }

    const { sql, params } = buildWhere(f)
    const { rows } = await pool.query<DbProperty>(
      `SELECT ${PROPERTY_COLUMNS}
         FROM properties
         ${sql}
         ORDER BY created_at DESC, reviews DESC`,
      params,
    )
    res.json(rows.map(rowToProperty))
  } catch (err) {
    next(err)
  }
})

propertiesRouter.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query<DbProperty>(
      `SELECT ${PROPERTY_COLUMNS} FROM properties WHERE id = $1`,
      [req.params.id],
    )
    if (rows.length === 0) {
      res.status(404).json({ error: 'Property not found' })
      return
    }
    res.json(rowToProperty(rows[0]))
  } catch (err) {
    next(err)
  }
})