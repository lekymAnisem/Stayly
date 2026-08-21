import 'dotenv/config'

const numberEnv = (value: string | undefined, fallback: number): number => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export const config = {
  port: numberEnv(process.env.PORT, 4000),
  databaseUrl:
    process.env.DATABASE_URL ??
    'postgres://stayly:stayly@localhost:5432/stayly',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  seedOnBoot: process.env.SEED_ON_BOOT !== 'false',
  migrationsOnBoot: process.env.MIGRATIONS_ON_BOOT !== 'false',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'stayly-admin',
  clerk: {
    publishableKey:
      process.env.VITE_CLERK_PUBLISHABLE_KEY ?? process.env.CLERK_PUBLISHABLE_KEY ?? '',
    secretKey: process.env.CLERK_SECRET_KEY ?? '',
  },
  allowedAdminEmails: (process.env.ALLOWED_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
  },
} as const