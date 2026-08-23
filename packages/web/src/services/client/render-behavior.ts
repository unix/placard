import type {
  ContentRadius,
  GlobalRenderBehavior,
  RenderBehaviorCatalog,
  RenderLang,
} from '@/lib/api'
import { readStoredValue, writeStoredValue } from '@/services/client/indexdb'

const GLOBAL_RENDER_BEHAVIOR_KEY = 'render-behavior:global'
const colorPattern = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i

const recordFromUnknown = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

const normalizedNumber = (value: unknown, fallback: number, maximum: number) => {
  if (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= maximum
  )
    return value
  return fallback
}

const normalizedColor = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim().toLowerCase()
  if (normalized === 'transparent' || colorPattern.test(normalized))
    return normalized
  return fallback
}

const normalizedContentRadius = (
  value: unknown,
  fallback: ContentRadius,
  maximum: number,
) => {
  if (value === 'auto') return value
  if (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= maximum
  )
    return value
  return fallback
}

const normalizedSeed = (value: unknown, fallback: string, maximum: number) => {
  if (typeof value !== 'string') return fallback
  const normalized = value.trim()
  if (normalized.length > 0 && normalized.length <= maximum) return normalized
  return fallback
}

const normalizedLang = (
  value: unknown,
  fallback: RenderLang,
  languages: readonly RenderLang[],
) => {
  if (typeof value !== 'string') return fallback
  if (languages.some(language => language === value)) return value as RenderLang
  return fallback
}

export const normalizedGlobalRenderBehavior = (
  value: unknown,
  catalog: RenderBehaviorCatalog,
): GlobalRenderBehavior => {
  const source = recordFromUnknown(value)
  return {
    canvasColor: normalizedColor(source.canvasColor, catalog.defaults.canvasColor),
    canvasPadding: normalizedNumber(
      source.canvasPadding,
      catalog.defaults.canvasPadding,
      catalog.limits.canvasPadding,
    ),
    canvasRadius: normalizedNumber(
      source.canvasRadius,
      catalog.defaults.canvasRadius,
      catalog.limits.canvasRadius,
    ),
    contentRadius: normalizedContentRadius(
      source.contentRadius,
      catalog.defaults.contentRadius,
      catalog.limits.contentRadius,
    ),
    seed: normalizedSeed(source.seed, catalog.defaults.seed, catalog.limits.seed),
    lang: normalizedLang(source.lang, catalog.defaults.lang, catalog.languages),
  }
}

export const readGlobalRenderBehavior = async (catalog: RenderBehaviorCatalog) => {
  const storedValue = await readStoredValue(GLOBAL_RENDER_BEHAVIOR_KEY)
  if (!storedValue) return catalog.defaults
  try {
    return normalizedGlobalRenderBehavior(JSON.parse(storedValue), catalog)
  } catch {
    return catalog.defaults
  }
}

export const writeGlobalRenderBehavior = (behavior: GlobalRenderBehavior) =>
  writeStoredValue(GLOBAL_RENDER_BEHAVIOR_KEY, JSON.stringify(behavior))
