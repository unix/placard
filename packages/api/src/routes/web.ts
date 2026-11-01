import fastifyStatic from '@fastify/static'
import type { FastifyInstance } from 'fastify'
import { extname, sep } from 'node:path'

const immutableAssetSegment = `${sep}_astro${sep}`

export const registerWebRoutes = async (app: FastifyInstance, root: string) => {
  await app.register(fastifyStatic, {
    extensions: ['html'],
    root,
    setHeaders: (reply, path) => {
      if (path.includes(immutableAssetSegment)) {
        reply.header('Cache-Control', 'public, max-age=31536000, immutable')
        return
      }
      if (extname(path) === '.html') reply.header('Cache-Control', 'no-cache')
    },
  })
}
