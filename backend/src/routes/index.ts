import { Router } from 'express'
import { healthRouter } from './health.js'
import { categoriesRouter } from './categories.js'
import { destinationsRouter } from './destinations.js'
import { inspirationsRouter } from './inspirations.js'
import { propertiesRouter } from './properties.js'
import { bookingsRouter } from './bookings.js'
import { adminRouter } from './admin.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/categories', categoriesRouter)
apiRouter.use('/destinations', destinationsRouter)
apiRouter.use('/inspirations', inspirationsRouter)
apiRouter.use('/properties', propertiesRouter)
apiRouter.use('/bookings', bookingsRouter)
apiRouter.use('/admin', adminRouter)