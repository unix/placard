export type RenderFormat = 'png' | 'svg'
export type RenderLang = 'en-US' | 'ja-JP' | 'ko-KR' | 'zh-CN' | 'zh-TW'
export type ContentRadius = 'auto' | number

export type RenderAuthorInput = string | string[]

export interface RenderInput {
  readonly author: RenderAuthorInput
  readonly brandName: string
  readonly date: string
  readonly description: string
  readonly logoId: string
  readonly logoUrl: string
  readonly template: string
  readonly title: string
}

export interface GlobalRenderBehavior {
  readonly canvasColor: string
  readonly canvasPadding: number
  readonly canvasRadius: number
  readonly contentRadius: ContentRadius
  readonly seed: string
  readonly lang: RenderLang
}

export interface RenderBehaviorCatalog {
  readonly defaults: GlobalRenderBehavior
  readonly languages: readonly RenderLang[]
  readonly limits: {
    readonly canvasPadding: number
    readonly canvasRadius: number
    readonly contentRadius: number
    readonly seed: number
  }
}

export interface TemplateMeta {
  readonly defaultLogoId: string
  readonly id: string
  readonly name: string
  readonly description: string
  readonly fields: readonly Exclude<keyof RenderInput, 'template'>[]
}

export type TemplateSummary = Omit<TemplateMeta, 'defaultLogoId' | 'fields'>

export interface LogoMeta {
  readonly id: string
  readonly name: string
  readonly src: string
}

export interface TemplateCatalog {
  readonly defaults: RenderInput
  readonly image: {
    readonly height: number
    readonly width: number
  }
  readonly limits: {
    readonly author: number
    readonly authorItem: number
    readonly brandName: number
    readonly date: number
    readonly description: number
    readonly logoId: number
    readonly logoUrl: number
    readonly title: number
  }
  readonly logos: {
    readonly customId: string
    readonly defaultId: string
    readonly items: readonly LogoMeta[]
    readonly noneId: string
  }
  readonly renderBehavior: RenderBehaviorCatalog
  readonly templates: readonly TemplateMeta[]
}

export const apiBaseUrl = (
  import.meta.env.PUBLIC_API_BASE_URL ??
  (import.meta.env.DEV ? 'http://localhost:3003' : '')
).replace(/\/$/, '')

export const apiUrl = (path: string) => `${apiBaseUrl}${path}`

export const absoluteApiUrl = (path: string) =>
  new URL(apiUrl(path), window.location.origin)

export const resolvedApiBaseUrl = () => apiBaseUrl || window.location.origin

export const templateCatalogUrl = apiUrl('/api/templates')

const staticTemplatesBaseUrl = '/generated/templates'

export const staticTemplatesUrl = `${staticTemplatesBaseUrl}/templates.json`

export const staticTemplatePreviewUrl = (templateId: string) =>
  `${staticTemplatesBaseUrl}/thumbnails/${encodeURIComponent(templateId)}.svg`

const messageFromPayload = (payload: unknown) => {
  if (!payload || typeof payload !== 'object' || !('message' in payload)) return null
  const { message } = payload
  if (typeof message === 'string') return message
  if (Array.isArray(message)) return message.filter(Boolean).join('\n')
  return null
}

const requestError = async (response: Response) => {
  try {
    const payload: unknown = await response.json()
    return new Error(
      messageFromPayload(payload) ?? `API returned ${response.status}`,
    )
  } catch {
    return new Error(`API returned ${response.status}`)
  }
}

export const renderOpenGraph = async (
  input: RenderInput,
  behavior: GlobalRenderBehavior,
  format: RenderFormat,
  signal?: AbortSignal,
) => {
  const response = await fetch(apiUrl('/api/render'), {
    body: JSON.stringify({ ...input, ...behavior, format }),
    headers: {
      Accept: format === 'svg' ? 'image/svg+xml' : 'image/png',
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal,
  })
  if (!response.ok) throw await requestError(response)
  return response.blob()
}
