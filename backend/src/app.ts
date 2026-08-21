import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import { config } from './config.js'
import { apiRouter } from './routes/index.js'
import { metricsHandler, metricsMiddleware } from './lib/metrics.js'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(cors({ origin: config.corsOrigin }))
  app.use(express.json({ limit: '1mb' }))
  app.use(metricsMiddleware)

  app.get('/', (_req, res) => {
    res.json({ service: 'stayly-api', docs: '/api/health' })
  })

  // Prometheus scrape endpoints (bare for in-cluster, /api/* for the nginx proxy path)
  app.get('/metrics', metricsHandler)
  app.get('/api/metrics', metricsHandler)

  app.use('/api', apiRouter)

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' })
  })

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as Error & { statusCode?: number }).statusCode ?? 500
    const message =
      (err as Error & { statusCode?: number }).statusCode !== undefined
        ? err.message
        : 'Internal server error'
    if (!(err as Error & { statusCode?: number }).statusCode)
      console.error('[api] unhandled error:', err)
    res.status(status).json({ error: message })
  })

  return app
}