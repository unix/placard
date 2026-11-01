import { defaultPort } from './constants.js'

const trueValues = new Set(['1', 'on', 'true', 'yes'])
const falseValues = new Set(['0', 'false', 'no', 'off'])

const integerFromEnv = (
  value: string | undefined,
  fallback: number,
  minimum: number,
) => {
  const trimmed = value?.trim()
  if (!trimmed) return fallback
  const number = Number(trimmed)
  if (!Number.isSafeInteger(number) || number < minimum) return fallback
  return number
}

export const portFromEnv = (value: string | undefined) => {
  if (value == null) return defaultPort
  const trimmed = value.trim()
  if (trimmed.length === 0) return defaultPort
  const port = Number(trimmed)
  if (!Number.isInteger(port) || port <= 0) return defaultPort
  return port
}

export const tokenFromEnv = (value: string | undefined) => {
  const token = value?.trim()
  if (!token) return null
  return token
}

export const booleanFromEnv = (value: string | undefined, fallback: boolean) => {
  const normalized = value?.trim().toLowerCase()
  if (!normalized) return fallback
  if (trueValues.has(normalized)) return true
  if (falseValues.has(normalized)) return false
  return fallback
}

export interface AccessConfig {
  readonly allowAnonymous: boolean
  readonly token: string | null
  readonly webEnabled: boolean
}

export const validateAccessConfig = ({
  allowAnonymous,
  token,
  webEnabled,
}: AccessConfig) => {
  if (!allowAnonymous && webEnabled)
    throw new Error('OG_WEB_ENABLED must be false when OG_ALLOW_ANONYMOUS is false')
  if (!allowAnonymous && token == null)
    throw new Error(
      'OG_INTERNAL_TOKEN must be configured when OG_ALLOW_ANONYMOUS is false',
    )
}

export const positiveIntegerFromEnv = (
  value: string | undefined,
  fallback: number,
) => integerFromEnv(value, fallback, 1)

export const trustProxyFromEnv = (value: string | undefined) => {
  const proxies = value
    ?.split(',')
    .map(proxy => proxy.trim())
    .filter(Boolean)
  if (!proxies || proxies.length === 0) return undefined
  if (proxies.length === 1) return proxies[0]
  return proxies
}
