import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import multer from 'multer'
import { pool } from '../db/pool.js'
import { adminLogin, requireAdmin } from '../lib/auth.js'
import { uploadImages } from '../lib/cloudinary.js'
import type { Property } from '../types.js'

export const adminRouter = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 12 },
})

adminRouter.post('/login', adminLogin)
adminRouter.post('/upload', requireAdmin, upload.array('images', 12), async (req, res, next) => {
  try {
    const files = (req.files as Express.Multer.File[] | undefined) ?? []
    if (files.length === 0) {
      res.status(400).json({ error: 'No files received' })
      return
    }
    const urls = await uploadImages(files.map((f) => ({ buffer: f.buffer })))
    res.json({ urls })
  } catch (err) {
    next(err)
  }
})

interface AdminPropertyInput {
  title?: unknown
  location?: unknown
  country?: unknown
  price?: unknown
  rating?: unknown
  reviews?: unknown
  dates?: unknown
  propertyType?: unknown
  guests?: unknown
  bedrooms?: unknown
  beds?: unknown
  bathrooms?: unknown
  amenities?: unknown
  category?: unknown
  images?: unknown
  description?: unknown
  guestFavorite?: unknown
  instantBook?: unknown
}

const asInt = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  return Number.isInteger(n) ? n : undefined
}

const asNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

const asBool = (value: unknown): boolean => Boolean(value)

function parsePropertyInput(body: AdminPropertyInput): Omit<Property, 'id'> | string {
  const { title, location, country, category } = body
  if (
    typeof title !== 'string' ||
    typeof location !== 'string' ||
    typeof country !== 'string' ||
    typeof category !== 'string'
  ) {
    return 'title, location, country and category are required'
  }

  const price = asInt(body.price)
  const rating = asNumber(body.rating)
  const reviews = asInt(body.reviews)
  const guests = asInt(body.guests)
  const bedrooms = asInt(body.bedrooms)
  const beds = asInt(body.beds)
  const bathrooms = asInt(body.bathrooms)

  if (price === undefined || price < 0) return 'price must be a non-negative integer'
  if (rating === undefined || rating < 0 || rating > 5)
    return 'rating must be a number between 0 and 5'
  if (reviews === undefined || reviews < 0) return 'reviews must be a non-negative integer'
  if (guests === undefined || guests < 1) return 'guests must be at least 1'
  if (bedrooms === undefined || bedrooms < 0) return 'bedrooms must be a non-negative integer'
  if (beds === undefined || beds < 1) return 'beds must be at least 1'
  if (bathrooms === undefined || bathrooms < 0)
    return 'bathrooms must be a non-negative integer'

  const images = Array.isArray(body.images)
    ? body.images.filter((i): i is string => typeof i === 'string' && i.length > 0)
    : []
  if (images.length === 0) return 'at least one image URL is required'

  const amenities = Array.isArray(body.amenities)
    ? body.amenities.filter((a): a is string => typeof a === 'string')
    : []
  const propertyType =
    typeof body.propertyType === 'string' && body.propertyType.length > 0
      ? body.propertyType
      : 'Entire place'
  const dates = typeof body.dates === 'string' && body.dates ? body.dates : ''
  const description =
    typeof body.description === 'string' ? body.description.slice(0, 2000) : null

  return {
    title: title.slice(0, 140),
    location: location.slice(0, 140),
    country: country.slice(0, 60),
    image: images[0],
    images,
    price,
    rating,
    reviews,
    dates,
    propertyType,
    guests,
    bedrooms,
    beds,
    bathrooms: bathrooms === 0 ? Math.max(1, Math.round(guests / 3)) : bathrooms,
    amenities,
    category,
    guestFavorite: asBool(body.guestFavorite),
    instantBook: asBool(body.instantBook),
    description: description ?? undefined,
  }
}

const PROPERTY_COLUMNS = `
  id, title, location, country, image, images,
  price, rating::float8 AS rating, reviews, dates,
  property_type AS "propertyType",
  guests, bedrooms, beds, bathrooms,
  amenities, category, description,
  guest_favorite AS "guestFavorite",
  instant_book AS "instantBook"
`

adminRouter.get('/properties', requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await pool.query<Property>(
      `SELECT ${PROPERTY_COLUMNS} FROM properties ORDER BY created_at DESC`,
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

adminRouter.post('/properties', requireAdmin, async (req, res, next) => {
  try {
    const input = parsePropertyInput(req.body as AdminPropertyInput)
    if (typeof input === 'string') {
      res.status(400).json({ error: input })
      return
    }
    const id = randomUUID()
    await pool.query(
      `INSERT INTO properties
         (id, title, location, country, image, images, price, rating, reviews,
          dates, property_type, guests, bedrooms, beds, bathrooms, amenities,
          category, description, guest_favorite, instant_book)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
      [
        id,
        input.title,
        input.location,
        input.country,
        input.image,
        JSON.stringify(input.images),
        input.price,
        input.rating,
        input.reviews,
        input.dates,
        input.propertyType,
        input.guests,
        input.bedrooms,
        input.beds,
        input.bathrooms,
        JSON.stringify(input.amenities),
        input.category,
        input.description ?? null,
        input.guestFavorite,
        input.instantBook,
      ],
    )
    const { rows } = await pool.query<Property>(
      `SELECT ${PROPERTY_COLUMNS} FROM properties WHERE id = $1`,
      [id],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    next(err)
  }
})

adminRouter.put('/properties/:id', requireAdmin, async (req, res, next) => {
  try {
    const input = parsePropertyInput(req.body as AdminPropertyInput)
    if (typeof input === 'string') {
      res.status(400).json({ error: input })
      return
    }
    const { rowCount } = await pool.query(
      `UPDATE properties SET
         title = $1, location = $2, country = $3, image = $4, images = $5,
         price = $6, rating = $7, reviews = $8, dates = $9, property_type = $10,
         guests = $11, bedrooms = $12, beds = $13, bathrooms = $14, amenities = $15,
         category = $16, description = $17, guest_favorite = $18, instant_book = $19
       WHERE id = $20`,
      [
        input.title,
        input.location,
        input.country,
        input.image,
        JSON.stringify(input.images),
        input.price,
        input.rating,
        input.reviews,
        input.dates,
        input.propertyType,
        input.guests,
        input.bedrooms,
        input.beds,
        input.bathrooms,
        JSON.stringify(input.amenities),
        input.category,
        input.description ?? null,
        input.guestFavorite,
        input.instantBook,
        req.params.id,
      ],
    )
    if (rowCount === 0) {
      res.status(404).json({ error: 'Property not found' })
      return
    }
    const { rows } = await pool.query<Property>(
      `SELECT ${PROPERTY_COLUMNS} FROM properties WHERE id = $1`,
      [req.params.id],
    )
    res.json(rows[0])
  } catch (err) {
    next(err)
  }
})

adminRouter.delete('/properties/:id', requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM properties WHERE id = $1', [
      req.params.id,
    ])
    if (rowCount === 0) {
      res.status(404).json({ error: 'Property not found' })
      return
    }
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})