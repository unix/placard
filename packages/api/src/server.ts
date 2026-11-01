import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { createApp } from './app.js'
import {
  booleanFromEnv,
  portFromEnv,
  tokenFromEnv,
  validateAccessConfig,
} from './config.js'
import { defaultHost } from './constants.js'

const allowAnonymous = booleanFromEnv(process.env.OG_ALLOW_ANONYMOUS, true)
const webEnabled = booleanFromEnv(process.env.OG_WEB_ENABLED, true)
const token = tokenFromEnv(process.env.OG_INTERNAL_TOKEN)
const port = portFromEnv(process.env.PORT)
const host = process.env.HOST ?? defaultHost
const packagedWebRoot = fileURLToPath(new URL('../../web/dist/', import.meta.url))
const workspaceWebRoot = fileURLToPath(
  new URL('../../../web/dist/', import.meta.url),
)
const defaultWebRoot = existsSync(packagedWebRoot)
  ? packagedWebRoot
  : workspaceWebRoot
const webRoot = process.env.OG_WEB_ROOT?.trim() || defaultWebRoot

let app: Awaited<ReturnType<typeof createApp>> | undefined
try {
  validateAccessConfig({ allowAnonymous, token, webEnabled })
  app = await createApp({
    allowAnonymous,
    token,
    ...(webEnabled ? { webRoot } : {}),
  })
  await app.listen({ host, port })
  if (allowAnonymous)
    app.log.warn(
      'Anonymous API traffic is enabled and rate-limited; valid OG_INTERNAL_TOKEN requests bypass rate limiting',
    )
} catch (error) {
  if (app) app.log.error(error)
  else console.error(error)
  process.exit(1)
}
