import { timingSafeEqual } from 'node:crypto'

import type { FastifyReply, FastifyRequest } from 'fastify'

import { jsonContentType } from './constants.js'

const bearerScheme = 'bearer'
const authenticateHeader = 'Bearer'

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

export const hasExpectedBearerToken = (
  authorization: string | undefined,
  expectedToken: string | null,
) => {
  if (expectedToken == null) return false
  const token = bearerTokenFromHeader(authorization)
  if (token == null) return false
  return isExpectedToken(token, expectedToken)
}

export const requireBearerToken = (
  allowAnonymous: boolean,
  expectedToken: string | null,
) =>
  async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    if (allowAnonymous) return
    if (hasExpectedBearerToken(request.headers.authorization, expectedToken)) return

    return reply
      .header('WWW-Authenticate', authenticateHeader)
      .status(401)
      .type(jsonContentType)
      .send(unauthorizedBody)
  }
