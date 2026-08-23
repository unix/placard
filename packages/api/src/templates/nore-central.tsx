import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import {
  authorText,
  cardStyle,
  px,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

const noreCentralTemplateFields = [
  'title',
  'author',
] as const satisfies OgTemplateMeta['fields']

export const NoreCentral = (input: RenderInput): ReactElement => {
  const title = titleText(input)
  const author = authorText(input)

  return (
    <div
      style={{
        ...cardStyle,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Arial',
      }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <div
          style={{
            display: 'flex',
            width: px(860),
            maxWidth: px(960),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            padding: `${px(32)}px ${px(16)}px`,
          }}>
          <TextBlock
            color="#ffffff"
            fontFamily="Arial"
            fontSize={titleSize(title, { large: 68, medium: 58, small: 48 })}
            fontWeight={700}
            letterSpacing={-1.4}
            lineHeight={titleLineHeight(title, 1.08)}
            style={{ textAlign: 'center' }}>
            {title}
          </TextBlock>
        </div>
        {author ? (
          <div
            style={{
              display: 'flex',
              marginTop: px(16),
              backgroundColor: '#000000',
              padding: `${px(10)}px ${px(20)}px`,
            }}>
            <TextBlock
              color="#ffffff"
              fontFamily="Arial"
              fontSize={px(22)}
              fontWeight={700}
              lineHeight={1.15}>
              {author}
            </TextBlock>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export const noreCentralTemplateMeta = {
  id: 'nore-central',
  name: 'Nore Central',
  description:
    'High-contrast white card with stacked black title and author blocks.',
  fields: noreCentralTemplateFields,
} as const satisfies OgTemplateMeta

export const noreCentralTemplate = {
  ...noreCentralTemplateMeta,
  render: NoreCentral,
} as const satisfies OgTemplate
