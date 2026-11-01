import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import {
  cardStyle,
  Header,
  px,
  sansFontFamily,
  templateFields,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

export const Minimal = (input: RenderInput): ReactElement => {
  const title = titleText(input)

  return (
    <div
      style={{
        ...cardStyle,
        backgroundColor: '#ffffff',
        color: '#171717',
        fontFamily: sansFontFamily,
      }}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: px(54),
        }}>
        <Header
          brandColor="#171717"
          brandLogoSize={48}
          brandTextSize={21}
          input={input}
          metaSize={20}
          metaColor="#525252"
          separatorColor="#d4d4d4"
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TextBlock
            color="#171717"
            fontSize={titleSize(title, { large: 74, medium: 62, small: 52 })}
            fontWeight={660}
            lineHeight={titleLineHeight(title, 1.05)}
            style={{ width: px(880) }}>
            {title}
          </TextBlock>
        </div>
      </div>
    </div>
  )
}

export const meta = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Neutral single-panel OG card with optional metadata.',
  fields: templateFields,
} as const satisfies OgTemplateMeta

export const template = {
  ...meta,
  render: Minimal,
} as const satisfies OgTemplate
