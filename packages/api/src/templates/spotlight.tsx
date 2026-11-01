import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import {
  cardStyle,
  logoSrc,
  px,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

const spotlightTemplateFields = [
  'logoId',
  'logoUrl',
  'title',
] as const satisfies OgTemplateMeta['fields']

export const Spotlight = (input: RenderInput): ReactElement => {
  const title = titleText(input)
  const logo = logoSrc(input)

  return (
    <div
      style={{
        ...cardStyle,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f4ef',
        backgroundImage:
          'linear-gradient(145deg, #fbfaf7 0%, #f5f4ef 54%, #eeece5 100%)',
        color: '#292927',
      }}>
      {logo ? (
        <img
          alt=""
          src={logo}
          width={px(64)}
          height={px(64)}
          style={{
            display: 'flex',
            position: 'absolute',
            top: px(72),
            left: px(568),
            width: px(64),
            height: px(64),
            objectFit: 'contain',
          }}
        />
      ) : null}
      <div style={{ display: 'flex', width: px(880), justifyContent: 'center' }}>
        <TextBlock
          color="#292927"
          fontSize={titleSize(title, { large: 70, medium: 58, small: 48 })}
          fontWeight={600}
          letterSpacing={-1.2}
          lineHeight={titleLineHeight(title, 0.98)}
          style={{
            maxWidth: px(880),
            textAlign: 'center',
            textWrap: 'wrap',
          }}>
          {title}
        </TextBlock>
      </div>
    </div>
  )
}

export const spotlightTemplateMeta = {
  id: 'spotlight',
  name: 'Spotlight',
  description: 'Warm editorial OG card with a centered logo and title.',
  fields: spotlightTemplateFields,
} as const satisfies OgTemplateMeta

export const spotlightTemplate = {
  ...spotlightTemplateMeta,
  render: Spotlight,
} as const satisfies OgTemplate
