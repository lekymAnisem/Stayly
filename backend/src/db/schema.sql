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

CREATE TABLE IF NOT EXISTS bookings (
  id                TEXT PRIMARY KEY,
  property_id       TEXT NOT NULL REFERENCES properties (id),
  clerk_user_id     TEXT,
  guest_name        TEXT,
  guest_email       TEXT,
  check_in          DATE NOT NULL,
  check_out         DATE NOT NULL,
  guests            INTEGER NOT NULL,
  nights            INTEGER NOT NULL,
  price_per_night   INTEGER NOT NULL,
  subtotal          INTEGER NOT NULL,
  service_fee       INTEGER NOT NULL,
  total             INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  payment_method    TEXT,
  card_last4        TEXT,
  payment_reference TEXT,
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookings_dates_valid CHECK (check_out > check_in),
  CONSTRAINT bookings_status_valid CHECK (
    status IN ('pending', 'confirmed', 'cancelled', 'expired')
  )
);

CREATE INDEX IF NOT EXISTS idx_properties_category ON properties (category);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_guest_favorite ON properties (guest_favorite);
CREATE INDEX IF NOT EXISTS idx_bookings_property_dates ON bookings (property_id, check_in, check_out);