import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from './pool.js'
import { categories, destinations, inspirations, properties } from './data.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

export async function migrate(): Promise<void> {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8')
  await pool.query(schema)
}

const hashOf = (id: string): number => {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash
}

export async function seedIfEmpty(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM properties',
  )
  if (Number(rows[0].count) > 0) return 0

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    for (const c of categories) {
      await client.query(
        'INSERT INTO categories (id, label, icon) VALUES ($1, $2, $3)',
        [c.id, c.label, c.icon],
      )
    }

    for (const p of properties) {
      await client.query(
        `INSERT INTO properties
           (id, title, location, country, image, images, price, rating, reviews,
            dates, property_type, guests, bedrooms, beds, bathrooms, amenities,
            category, guest_favorite, instant_book)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          p.id,
          p.title,
          p.location,
          p.country,
          p.image,
          JSON.stringify(p.images),
          p.price,
          p.rating,
          p.reviews,
          p.dates,
          p.propertyType,
          p.guests,
          p.bedrooms,
          p.beds,
          Math.max(1, Math.round(p.guests / 3)),
          JSON.stringify(p.amenities),
          p.category,
          p.guestFavorite ?? false,
          hashOf(p.id) % 2 === 0,
        ],
      )
    }

    for (const d of destinations) {
      await client.query(
        'INSERT INTO destinations (id, name, country, description, image, stays) VALUES ($1,$2,$3,$4,$5,$6)',
        [d.id, d.name, d.country, d.description, d.image, d.stays],
      )
    }

    for (const i of inspirations) {
      await client.query(
        'INSERT INTO inspirations (id, title, description, image) VALUES ($1,$2,$3,$4)',
        [i.id, i.title, i.description, i.image],
      )
    }

    await client.query('COMMIT')
    return properties.length
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}