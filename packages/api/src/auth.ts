import { timingSafeEqual } from 'node:crypto'

import type { FastifyReply, FastifyRequest } from 'fastify'

import { jsonContentType } from './constants.js'

const bearerScheme = 'bearer'
const authenticateHeader = 'Bearer'
const publicPaths = new Set(['/health'])

const unauthorizedBody = {
  error: 'unauthorized',
  message: 'Bearer token is required',
}

const bearerTokenFromHeader = (authorization: string | undefined) => {
  if (authorization == null) return null
  const [scheme = '', token = ''] = authorization.trim().split(/\s+/, 2)
  if (scheme.toLowerCase() !== bearerScheme) return null
  if (token.length === 0) return null
  return token
}

const isExpectedToken = (token: string, expectedToken: string) => {
  const expected = Buffer.from(expectedToken)
  const received = Buffer.from(token)
  if (received.length !== expected.length) return false
  return timingSafeEqual(received, expected)
}

export const requireBearerToken = (expectedToken: string | null) =>
  async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    if (expectedToken == null) return

    const [pathname = request.url] = request.url.split('?', 1)
    if (publicPaths.has(pathname)) return

    const token = bearerTokenFromHeader(request.headers.authorization)
    if (token != null && isExpectedToken(token, expectedToken)) return

    return reply
      .header('WWW-Authenticate', authenticateHeader)
      .status(401)
      .type(jsonContentType)
      .send(unauthorizedBody)
  }
