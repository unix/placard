import fastifyCors from '@fastify/cors'
import fastifyRateLimit from '@fastify/rate-limit'
import Fastify from 'fastify'

import { hasExpectedBearerToken, requireBearerToken } from './auth.js'
import {
  booleanFromEnv,
  positiveIntegerFromEnv,
  tokenFromEnv,
  trustProxyFromEnv,
  validateAccessConfig,
} from './config.js'
import {
  defaultRemoteImageCacheMax,
  defaultRemoteImageCacheTtlMs,
  defaultRemoteImageMaxBytes,
  defaultRemoteImageTimeoutMs,
  defaultRenderRateLimitMax,
  renderFallbackFieldsHeader,
  renderRateLimitWindowMs,
} from './constants.js'
import { RemoteImageCache } from './og/remote-image.js'
import { registerHealthRoutes } from './routes/health.js'
import { registerRenderRoutes } from './routes/render.js'
import { registerWebRoutes } from './routes/web.js'

export interface CreateAppOptions {
  readonly allowAnonymous?: boolean
  readonly remoteImageCacheMax?: number
  readonly remoteImageCacheTtlMs?: number
  readonly remoteImageMaxBytes?: number
  readonly remoteImageTimeoutMs?: number
  readonly renderRateLimitMax?: number
  readonly token?: string | null
  readonly trustProxy?: string | string[]
  readonly webRoot?: string
}

export const createApp = async (options: CreateAppOptions = {}) => {
  const allowAnonymous =
    options.allowAnonymous ?? booleanFromEnv(process.env.OG_ALLOW_ANONYMOUS, true)
  const token =
    options.token === undefined
      ? tokenFromEnv(process.env.OG_INTERNAL_TOKEN)
      : options.token
  validateAccessConfig({
    allowAnonymous,
    token,
    webEnabled: options.webRoot != null,
  })
  const trustProxy =
    options.trustProxy ?? trustProxyFromEnv(process.env.OG_TRUST_PROXY)
  const renderRateLimitMax =
    options.renderRateLimitMax ??
    positiveIntegerFromEnv(process.env.OG_RATE_LIMIT_MAX, defaultRenderRateLimitMax)
  const remoteImageCacheMax =
    options.remoteImageCacheMax ??
    positiveIntegerFromEnv(
      process.env.OG_REMOTE_IMAGE_CACHE_MAX,
      defaultRemoteImageCacheMax,
    )
  const remoteImageCacheTtlMs =
    options.remoteImageCacheTtlMs ??
    positiveIntegerFromEnv(
      process.env.OG_REMOTE_IMAGE_CACHE_TTL_MS,
      defaultRemoteImageCacheTtlMs,
    )
  const remoteImageMaxBytes =
    options.remoteImageMaxBytes ??
    positiveIntegerFromEnv(
      process.env.OG_REMOTE_IMAGE_MAX_BYTES,
      defaultRemoteImageMaxBytes,
    )
  const remoteImageTimeoutMs =
    options.remoteImageTimeoutMs ??
    positiveIntegerFromEnv(
      process.env.OG_REMOTE_IMAGE_TIMEOUT_MS,
      defaultRemoteImageTimeoutMs,
    )
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
    },
    ...(trustProxy ? { trustProxy } : {}),
  })

  app.setNotFoundHandler((_request, reply) => reply.status(404).send())

  await app.register(fastifyCors, {
    allowedHeaders: ['Accept', 'Authorization', 'Content-Type'],
    exposedHeaders: [
      renderFallbackFieldsHeader,
      'Retry-After',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    origin: true,
  })

  await app.register(async api => {
    api.addHook('onRequest', requireBearerToken(allowAnonymous, token))
    await api.register(fastifyRateLimit, {
      allowList: request =>
        hasExpectedBearerToken(request.headers.authorization, token),
      errorResponseBuilder: (_request, context) => ({
        error: 'rate_limit_exceeded',
        message: 'Too many render requests',
        statusCode: context.statusCode,
      }),
      global: true,
      max: renderRateLimitMax,
      onExceeded: request => {
        request.log.warn(
          { ip: request.ip, route: request.routeOptions.url },
          'render rate limit exceeded',
        )
      },
      timeWindow: renderRateLimitWindowMs,
    })
    await registerHealthRoutes(api)
    await registerRenderRoutes(api, {
      remoteImages: {
        fetchCache: new RemoteImageCache(remoteImageCacheMax, remoteImageCacheTtlMs),
        maxBytes: remoteImageMaxBytes,
        timeoutMs: remoteImageTimeoutMs,
      },
    })
  })
  if (options.webRoot) await registerWebRoutes(app, options.webRoot)
  return app
}
