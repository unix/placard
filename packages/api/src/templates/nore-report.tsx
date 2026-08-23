import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import type { RenderContext } from '../og/render-context.js'
import { textLength } from '../og/text-length.js'
import { brandText, cardStyle, px, TextBlock } from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

const noreReportTemplateFields = [
  'brandName',
] as const satisfies OgTemplateMeta['fields']

const randomInteger = (maximum: number, random: () => number) =>
  Math.floor(random() * maximum)

const randomGradient = (random: () => number) => {
  const primaryHue = randomInteger(360, random)
  const secondaryHue = (primaryHue + 45 + randomInteger(90, random)) % 360
  const angle = 115 + randomInteger(101, random)
  return `linear-gradient(${angle}deg, hsl(${primaryHue}, 78%, 26%) 0%, #050505 50%, hsl(${secondaryHue}, 72%, 20%) 100%)`
}

const blogNameSize = (name: string) => {
  const length = textLength(name)
  if (length > 60) return px(54)
  if (length > 36) return px(68)
  return px(88)
}

export const NoreReport = (
  input: RenderInput,
  context: RenderContext,
): ReactElement => {
  const blogName = brandText(input)
  const isCompactBlogName = blogName ? textLength(blogName) <= 24 : true

  return (
    <div
      style={{
        ...cardStyle,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#050505',
        backgroundImage: randomGradient(context.random),
        color: '#f5f5f5',
        fontFamily: 'Geist',
        padding: px(72),
      }}>
      <div
        style={{
          display: 'flex',
          width: px(1020),
          justifyContent: 'center',
        }}>
        {blogName ? (
          <TextBlock
            color="#f5f5f5"
            fontSize={blogNameSize(blogName)}
            fontWeight={700}
            letterSpacing={-1.8}
            lineHeight={1.05}
            style={{
              maxWidth: px(1020),
              textAlign: 'center',
              ...(isCompactBlogName ? {} : { width: px(1020) }),
            }}>
            {blogName}
          </TextBlock>
        ) : null}
      </div>
    </div>
  )
}

export const noreReportTemplateMeta = {
  id: 'nore-report',
  name: 'Nore Report',
  description: 'Minimal black gradient OG card with a bold centered blog name.',
  fields: noreReportTemplateFields,
} as const satisfies OgTemplateMeta

export const noreReportTemplate = {
  ...noreReportTemplateMeta,
  render: NoreReport,
} as const satisfies OgTemplate
