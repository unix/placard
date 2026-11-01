import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import {
  cardStyle,
  logoSrc,
  MetaLine,
  px,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

const nightTemplateFields = [
  'logoId',
  'logoUrl',
  'title',
  'author',
  'date',
] as const satisfies OgTemplateMeta['fields']

export const Night = (input: RenderInput): ReactElement => {
  const title = titleText(input)
  const logo = logoSrc(input)

  return (
    <div
      style={{
        ...cardStyle,
        backgroundColor: '#09090b',
        backgroundImage:
          'linear-gradient(135deg, #09090b 0%, #18181b 58%, #052e2b 135%)',
        color: '#fafafa',
        fontFamily: 'Geist',
      }}>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          bottom: px(52),
          left: px(62),
          width: px(460),
          height: px(1),
          backgroundColor: 'rgba(52, 211, 153, 0.42)',
        }}
      />
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(24, 24, 27, 0.78)',
          padding: px(50),
        }}>
        <div
          style={{
            display: 'flex',
            minHeight: px(46),
            alignItems: 'center',
          }}>
          {logo ? (
            <img
              alt=""
              src={logo}
              width={px(52)}
              height={px(52)}
              style={{
                display: 'flex',
                width: px(52),
                height: px(52),
                objectFit: 'contain',
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingBottom: px(48),
            paddingTop: px(24),
          }}>
          <TextBlock
            color="#fafafa"
            fontSize={titleSize(title, { large: 74, medium: 60, small: 48 })}
            fontWeight={680}
            lineHeight={titleLineHeight(title, 1.04)}
            style={{ width: px(920) }}>
            {title}
          </TextBlock>
        </div>
        <div
          style={{
            display: 'flex',
            minHeight: px(40),
            alignItems: 'flex-end',
          }}>
          <MetaLine
            color="#d4d4d8"
            input={input}
            separatorColor="#71717a"
            size={24}
          />
        </div>
      </div>
    </div>
  )
}

export const nightTemplateMeta = {
  id: 'night',
  name: 'Night',
  description:
    'Dark single-panel OG card with a bold title and slash-separated metadata.',
  fields: nightTemplateFields,
} as const satisfies OgTemplateMeta

export const nightTemplate = {
  ...nightTemplateMeta,
  render: Night,
} as const satisfies OgTemplate
