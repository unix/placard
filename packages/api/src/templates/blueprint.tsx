import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { textLength } from '../og/text-length.js'
import {
  brandText,
  cardStyle,
  logoSrc,
  px,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

const blueprintTemplateFields = [
  'brandName',
  'logoId',
  'logoUrl',
  'title',
] as const satisfies OgTemplateMeta['fields']

export const Blueprint = (input: RenderInput): ReactElement => {
  const brand = brandText(input)
  const logo = logoSrc(input)
  const title = titleText(input)
  const titleWidth = 920
  const lineColor = '#dbeafe'
  const isCompactTitle = textLength(title) <= 24

  return (
    <div
      style={{
        ...cardStyle,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eff6ff',
        color: '#0f172a',
        fontFamily: 'Geist',
      }}>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}>
        {[168, 336, 504, 672, 840, 1008].map(offset => (
          <div
            key={`vertical-${offset}`}
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: px(offset),
              width: px(1),
              backgroundColor: lineColor,
            }}
          />
        ))}
        {[132, 264, 396, 528].map(offset => (
          <div
            key={`horizontal-${offset}`}
            style={{
              display: 'flex',
              position: 'absolute',
              top: px(offset),
              left: 0,
              right: 0,
              height: px(1),
              backgroundColor: lineColor,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          padding: px(48),
        }}>
        <div
          style={{
            display: 'flex',
            minHeight: px(48),
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          {brand ? (
            <TextBlock
              color="#0f172a"
              fontSize={px(20)}
              fontWeight={650}
              lineHeight={1.15}
              style={{ lineClamp: 1, maxWidth: px(420) }}>
              {brand}
            </TextBlock>
          ) : null}
          {logo ? (
            <img
              alt=""
              src={logo}
              width={px(48)}
              height={px(48)}
              style={{
                display: 'flex',
                width: px(48),
                height: px(48),
                flexShrink: 0,
                objectFit: 'contain',
              }}
            />
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: px(40),
          }}>
          <div
            style={{
              display: 'flex',
              width: px(titleWidth),
              justifyContent: 'center',
            }}>
            <TextBlock
              color="#0f172a"
              fontSize={titleSize(title, { large: 72, medium: 60, small: 48 })}
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
      </div>
    </div>
  )
}

export const blueprintTemplateMeta = {
  id: 'blueprint',
  name: 'Blueprint',
  description:
    'Light blueprint OG card with grid background and centered hierarchy.',
  fields: blueprintTemplateFields,
} as const satisfies OgTemplateMeta

export const blueprintTemplate = {
  ...blueprintTemplateMeta,
  render: Blueprint,
} as const satisfies OgTemplate
