import { imageHeight, imageWidth } from '../constants.js'

export const renderLangOptions = [
  'en-US',
  'zh-CN',
  'zh-TW',
  'ja-JP',
  'ko-KR',
] as const

export type RenderLang = (typeof renderLangOptions)[number]
export type ContentRadius = 'auto' | number

export interface GlobalRenderBehavior {
  readonly canvasColor: string
  readonly canvasPadding: number
  readonly canvasRadius: number
  readonly contentRadius: ContentRadius
  readonly seed: string
  readonly lang: RenderLang
}

export type GlobalRenderBehaviorField = keyof GlobalRenderBehavior

export const maxCanvasRadius = Math.floor(Math.min(imageWidth, imageHeight) / 2)
export const maxCanvasPadding = maxCanvasRadius
export const maxContentRadius = maxCanvasRadius
export const maxSeedLength = 64

export const defaultGlobalRenderBehavior = {
  canvasColor: 'transparent',
  canvasPadding: 0,
  canvasRadius: 0,
  contentRadius: 'auto',
  seed: 'auto',
  lang: 'en-US',
} as const satisfies GlobalRenderBehavior

export const globalRenderBehaviorCatalog = {
  defaults: defaultGlobalRenderBehavior,
  languages: renderLangOptions,
  limits: {
    canvasPadding: maxCanvasPadding,
    canvasRadius: maxCanvasRadius,
    contentRadius: maxContentRadius,
    seed: maxSeedLength,
  },
} as const

interface UnknownFieldValue {
  readonly provided: boolean
  readonly value: unknown
}

export interface ResolvedGlobalRenderBehavior {
  readonly behavior: GlobalRenderBehavior
  readonly fallbackFields: readonly GlobalRenderBehaviorField[]
}

const unknownFieldValue = (
  source: unknown,
  field: GlobalRenderBehaviorField,
): UnknownFieldValue => {
  if (source == null || typeof source !== 'object' || Array.isArray(source))
    return { provided: false, value: undefined }
  if (!Object.prototype.hasOwnProperty.call(source, field))
    return { provided: false, value: undefined }

  const value = Reflect.get(source, field)
  if (Array.isArray(value)) return { provided: true, value: value.at(0) }
  return { provided: true, value }
}

const resolvedNumber = (
  source: unknown,
  field: 'canvasPadding' | 'canvasRadius',
  maximum: number,
  fallbackFields: GlobalRenderBehaviorField[],
) => {
  const fallback = defaultGlobalRenderBehavior[field]
  const unknown = unknownFieldValue(source, field)
  if (!unknown.provided) return fallback

  const trimmedValue =
    typeof unknown.value === 'string' ? unknown.value.trim() : null
  const value = trimmedValue === null ? unknown.value : Number(trimmedValue)
  if (
    trimmedValue !== '' &&
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= maximum
  )
    return value

  fallbackFields.push(field)
  return fallback
}

const colorPattern = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i

const resolvedColor = (
  source: unknown,
  field: 'canvasColor',
  fallbackFields: GlobalRenderBehaviorField[],
) => {
  const fallback = defaultGlobalRenderBehavior[field]
  const unknown = unknownFieldValue(source, field)
  if (!unknown.provided) return fallback
  if (typeof unknown.value !== 'string') {
    fallbackFields.push(field)
    return fallback
  }

  const value = unknown.value.trim().toLowerCase()
  if (value === 'transparent' || colorPattern.test(value)) return value

  fallbackFields.push(field)
  return fallback
}

const resolvedContentRadius = (
  source: unknown,
  fallbackFields: GlobalRenderBehaviorField[],
): ContentRadius => {
  const unknown = unknownFieldValue(source, 'contentRadius')
  if (!unknown.provided) return defaultGlobalRenderBehavior.contentRadius

  const trimmedValue =
    typeof unknown.value === 'string' ? unknown.value.trim() : null
  if (trimmedValue === 'auto') return 'auto'

  const value = trimmedValue === null ? unknown.value : Number(trimmedValue)
  if (
    trimmedValue !== '' &&
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= maxContentRadius
  )
    return value

  fallbackFields.push('contentRadius')
  return defaultGlobalRenderBehavior.contentRadius
}

const resolvedSeed = (
  source: unknown,
  fallbackFields: GlobalRenderBehaviorField[],
) => {
  const { seed: fallback } = defaultGlobalRenderBehavior
  const unknown = unknownFieldValue(source, 'seed')
  if (!unknown.provided) return fallback
  if (typeof unknown.value !== 'string') {
    fallbackFields.push('seed')
    return fallback
  }

  const value = unknown.value.trim()
  if (value.length > 0 && value.length <= maxSeedLength) return value

  fallbackFields.push('seed')
  return fallback
}

const isRenderLang = (value: string): value is RenderLang =>
  renderLangOptions.some(language => language === value)

const resolvedLang = (
  source: unknown,
  fallbackFields: GlobalRenderBehaviorField[],
) => {
  const { lang: fallback } = defaultGlobalRenderBehavior
  const unknown = unknownFieldValue(source, 'lang')
  if (!unknown.provided) return fallback
  if (typeof unknown.value === 'string' && isRenderLang(unknown.value))
    return unknown.value

  fallbackFields.push('lang')
  return fallback
}

export const globalRenderBehaviorFromUnknown = (
  source: unknown,
): ResolvedGlobalRenderBehavior => {
  const fallbackFields: GlobalRenderBehaviorField[] = []
  const behavior: GlobalRenderBehavior = {
    canvasColor: resolvedColor(source, 'canvasColor', fallbackFields),
    canvasPadding: resolvedNumber(
      source,
      'canvasPadding',
      maxCanvasPadding,
      fallbackFields,
    ),
    canvasRadius: resolvedNumber(
      source,
      'canvasRadius',
      maxCanvasRadius,
      fallbackFields,
    ),
    contentRadius: resolvedContentRadius(source, fallbackFields),
    seed: resolvedSeed(source, fallbackFields),
    lang: resolvedLang(source, fallbackFields),
  }
  return { behavior, fallbackFields }
}
