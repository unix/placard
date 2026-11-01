import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { textLength } from '../og/text-length.js'
import {
  Brand,
  cardStyle,
  MetaBadges,
  px,
  templateFieldsWithoutDescription,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

export const Stack = (input: RenderInput): ReactElement => {
  const title = titleText(input)
  const cardHeight = 500
  const frontLeft = 140
  const frontTop = 108
  const horizontalGap = 30
  const titleWidth = 800
  const verticalGap = 24
  const isCompactTitle = textLength(title) <= 24

  return (
    <div
      style={{
        ...cardStyle,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e2e8f0',
        color: '#0f172a',
        fontFamily: 'Geist',
      }}>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: px(frontTop - verticalGap * 2),
          left: px(frontLeft - horizontalGap * 2),
          width: px(1040),
          height: px(cardHeight),
          border: `${px(1)}px solid #cbd5e1`,
          borderRadius: px(18),
          backgroundColor: '#f8fafc',
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: px(frontTop - verticalGap),
          left: px(frontLeft - horizontalGap),
          width: px(980),
          height: px(cardHeight),
          border: `${px(1)}px solid #d4d4d8`,
          borderRadius: px(18),
          backgroundColor: '#ffffff',
        }}
      />
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: px(frontTop),
          left: px(frontLeft),
          width: px(920),
          height: px(cardHeight),
          flexDirection: 'column',
          border: `${px(1)}px solid #d4d4d8`,
          borderRadius: px(18),
          backgroundColor: '#ffffff',
          padding: px(46),
        }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Brand color="#0f172a" input={input} />
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <div
            style={{
              display: 'flex',
              width: px(titleWidth),
              justifyContent: 'center',
            }}>
            <TextBlock
              color="#0f172a"
              fontSize={titleSize(title, { large: 62, medium: 52, small: 40 })}
              fontWeight={660}
              lineHeight={titleLineHeight(title, 1.08)}
              style={{
                maxWidth: px(titleWidth),
                textAlign: 'center',
                ...(isCompactTitle ? {} : { width: px(titleWidth) }),
              }}>
              {title}
            </TextBlock>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            minHeight: px(38),
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}>
          <MetaBadges input={input} />
        </div>
      </div>
    </div>
  )
}

export const stackTemplateMeta = {
  id: 'stack',
  name: 'Stack',
  description: 'Layered neutral OG card with centered title and metadata.',
  fields: templateFieldsWithoutDescription,
} as const satisfies OgTemplateMeta

export const stackTemplate = {
  ...stackTemplateMeta,
  render: Stack,
} as const satisfies OgTemplate
