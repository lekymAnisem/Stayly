import type { NextFunction, Request, Response } from 'express'
import { Counter, Histogram, register, collectDefaultMetrics } from 'prom-client'

collectDefaultMetrics({ prefix: 'stayly_' })

const httpDuration = new Histogram({
  name: 'stayly_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
})

const httpRequests = new Counter({
  name: 'stayly_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'] as const,
})

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/metrics' || req.path === '/api/metrics') {
    next()
    return
  }
  const end = httpDuration.startTimer()
  res.on('finish', () => {
    // Use the matched route pattern (e.g. /properties/:id) to avoid label explosion
    const route = req.route?.path ?? 'unmatched'
    const labels = { method: req.method, route, status: String(res.statusCode) }
    end(labels)
    httpRequests.inc(labels)
  })
  next()
}

export async function metricsHandler(_req: Request, res: Response): Promise<void> {
  res.set('Content-Type', register.contentType)
  res.end(await register.metrics())
}
