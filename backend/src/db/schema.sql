CREATE TABLE IF NOT EXISTS categories (
  id   TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS properties (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  location       TEXT NOT NULL,
  country        TEXT NOT NULL,
  image          TEXT NOT NULL,
  images         JSONB NOT NULL,
  price          INTEGER NOT NULL,
  rating         NUMERIC(3, 2) NOT NULL,
  reviews        INTEGER NOT NULL,
  dates          TEXT NOT NULL,
  property_type  TEXT NOT NULL,
  guests         INTEGER NOT NULL,
  bedrooms       INTEGER NOT NULL,
  beds           INTEGER NOT NULL,
  bathrooms      INTEGER NOT NULL,
  amenities      JSONB NOT NULL,
  category       TEXT NOT NULL REFERENCES categories (id),
  guest_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  instant_book   BOOLEAN NOT NULL DEFAULT FALSE
);

-- Idempotent additions for admin-managed listings
ALTER TABLE properties ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS destinations (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  country     TEXT NOT NULL,
  description TEXT NOT NULL,
  image       TEXT NOT NULL,
  stays       INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS inspirations (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  image       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_properties_category ON properties (category);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_guest_favorite ON properties (guest_favorite);