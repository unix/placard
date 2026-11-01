import { defaultLogoId } from '../assets/logo/index.js'

export const defaultHost = '0.0.0.0'
export const defaultPort = 3003
export const defaultRemoteImageCacheMax = 50
export const defaultRemoteImageCacheTtlMs = 24 * 60 * 60 * 1_000
export const defaultRemoteImageMaxBytes = 4 * 1024 * 1024
export const defaultRemoteImageTimeoutMs = 5_000
export const defaultRenderRateLimitMax = 600
export const renderRateLimitWindowMs = 60_000

export const imageWidth = 1200
export const imageHeight = 675

export const defaultTitle = 'Untitled page'
export const defaultDescription = ''
export const defaultAuthor = ''
export const defaultDate = ''
export const defaultBrandName = ''
export { defaultLogoId }
export const defaultLogoUrl = ''
export const defaultTemplateId = 'gradient-sunset'

export const maxTitleLength = 160
export const maxDescriptionLength = 260
export const maxAuthorItemLength = 30
export const maxAuthorLength = 50
export const maxDateLength = 80
export const maxBrandNameLength = 80
export const maxLogoIdLength = 80
export const maxLogoUrlLength = 500
export const maxTemplateIdLength = 80

export const jsonContentType = 'application/json; charset=utf-8'
export const pngContentType = 'image/png'
export const svgContentType = 'image/svg+xml; charset=utf-8'

export const renderCacheControl = 'public, max-age=300'
export const renderFallbackFieldsHeader = 'X-Render-Fallback-Fields'
