import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { brandText, cardStyle, logoSrc, px, TextBlock } from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

const noreSignalTemplateFields = [
  'brandName',
  'logoId',
  'logoUrl',
] as const satisfies OgTemplateMeta['fields']

export const NoreSignal = (input: RenderInput): ReactElement => {
  const brand = brandText(input)
  const logo = logoSrc(input)

  return (
    <div
      style={{
        ...cardStyle,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'Geist',
      }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {logo ? (
          <img
            alt=""
            src={logo}
            width={px(208)}
            height={px(208)}
            style={{
              display: 'flex',
              width: px(208),
              height: px(208),
              objectFit: 'contain',
            }}
          />
        ) : null}
        {brand ? (
          <TextBlock
            color="#ffffff"
            fontSize={px(48)}
            fontWeight={700}
            lineHeight={1.15}
            style={{
              lineClamp: 1,
              marginTop: logo ? px(32) : 0,
              maxWidth: px(960),
              textAlign: 'center',
            }}>
            {brand}
          </TextBlock>
        ) : null}
      </div>
    </div>
  )
}

export const noreSignalTemplateMeta = {
  id: 'nore-signal',
  name: 'Nore Signal',
  description: 'Black OG card with a large centered logo and site name.',
  fields: noreSignalTemplateFields,
} as const satisfies OgTemplateMeta

export const noreSignalTemplate = {
  ...noreSignalTemplateMeta,
  render: NoreSignal,
} as const satisfies OgTemplate
