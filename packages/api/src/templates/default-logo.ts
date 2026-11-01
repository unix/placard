import { defaultLogoId, inverseLogoId } from '../../assets/logo/index.js'

const inverseDefaultLogoTemplateIds = new Set([
  'gradient-aurora',
  'gradient-horizon',
  'gradient-midnight',
  'gradient-mono',
  'gradient-sunset',
  'grid-dark',
  'grid-dark-column',
  'grid-dot',
  'grid-hexagon',
  'logo-center-dark',
  'logo-center-gradient',
  'logo-center-ink',
  'logo-center-mono',
  'logo-large-dark',
  'logo-large-gradient',
  'logo-large-ink',
  'logo-large-mono',
  'logo-only-dark',
  'night',
  'signal-dark',
  'signal-gradient',
  'signal-ink',
  'signal-mono',
])

const inverseDefaultLogoTemplatePrefixes = [
  'aurora-',
  'ink-',
  'midnight-',
  'mono-',
  'sunset-',
] as const

export const defaultLogoIdForTemplate = (templateId: string) => {
  if (inverseDefaultLogoTemplateIds.has(templateId)) return inverseLogoId
  if (
    inverseDefaultLogoTemplatePrefixes.some(prefix => templateId.startsWith(prefix))
  )
    return inverseLogoId
  return defaultLogoId
}
