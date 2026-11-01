import type { FastifyInstance } from 'fastify'

export const registerHealthRoutes = async (app: FastifyInstance) => {
  app.get('/api/health', { config: { rateLimit: false } }, async () => ({
    ok: true,
  }))
}
