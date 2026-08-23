import fastifyCors from '@fastify/cors'
import Fastify from 'fastify'

import { requireBearerToken } from './auth.js'
import { tokenFromEnv } from './config.js'
import { renderFallbackFieldsHeader } from './constants.js'
import { registerHealthRoutes } from './routes/health.js'
import { registerRenderRoutes } from './routes/render.js'

export interface CreateAppOptions {
  readonly token?: string | null
}

export const createApp = async ({
  token = tokenFromEnv(process.env.OG_INTERNAL_TOKEN),
}: CreateAppOptions = {}) => {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
  })

  await app.register(fastifyCors, {
    allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
    exposedHeaders: [renderFallbackFieldsHeader],
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: true,
  })

  await registerHealthRoutes(app)
  app.addHook('preHandler', requireBearerToken(token))
  await registerRenderRoutes(app)
  return app
}
