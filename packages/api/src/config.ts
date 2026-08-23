import { defaultPort } from './constants.js'

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
