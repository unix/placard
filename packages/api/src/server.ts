import { createApp } from './app.js'
import { portFromEnv } from './config.js'
import { defaultHost } from './constants.js'

const app = await createApp()
const port = portFromEnv(process.env.PORT)
const host = process.env.HOST ?? defaultHost

try {
  await app.listen({ host, port })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
