import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import {
  authorText,
  brandText,
  cardStyle,
  dateText,
  descriptionText,
  logoSrc,
  px,
  templateFields,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

export const CommunityAppleFinancial = (input: RenderInput): ReactElement => {
  const title = titleText(input)
  const date = dateText(input)
  const secondary = authorText(input) ?? descriptionText(input)
  const brand = brandText(input)
  const src = logoSrc(input)

  return (
    <div
      style={{
        ...cardStyle,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: `${px(74)}px ${px(78)}px`,
        backgroundColor: '#000000',
        color: '#ffffff',
        fontFamily: 'SF Pro Display',
      }}>
      <TextBlock
        color="#ffffff"
        fontFamily="Arial"
        fontSize={px(18)}
        fontWeight={400}
        letterSpacing={1.2}
        style={{
          position: 'absolute',
          top: px(28),
          right: px(40),
          textTransform: 'uppercase',
        }}>
        LIVE
      </TextBlock>
      <div
        style={{
          display: 'flex',
          height: px(44),
          alignItems: 'center',
          marginBottom: px(14),
        }}>
        {src ? (
          <img
            alt=""
            src={src}
            width={px(38)}
            height={px(38)}
            style={{
              display: 'flex',
              width: px(38),
              height: px(38),
              objectFit: 'contain',
            }}
          />
        ) : (
          <TextBlock
            color="#ffffff"
            fontFamily="SF Pro Display"
            fontSize={px(25)}
            fontWeight={500}>
            {brand ?? 'Financial'}
          </TextBlock>
        )}
      </div>
      <TextBlock
        color="#ffffff"
        fontFamily="SF Pro Display"
        fontSize={titleSize(title, { large: 66, medium: 56, small: 46 })}
        fontWeight={200}
        letterSpacing={0.5}
        lineHeight={titleLineHeight(title, 1.05)}
        style={{ width: px(780), marginBottom: px(56) }}>
        {title}
      </TextBlock>
      {date || secondary ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {date ? (
            <TextBlock
              color="#ffffff"
              fontFamily="SF Pro Display"
              fontSize={px(24)}
              fontWeight={300}
              lineHeight={1.35}>
              {date}
            </TextBlock>
          ) : null}
          {secondary ? (
            <TextBlock
              color="#ffffff"
              fontFamily="SF Pro Display"
              fontSize={px(24)}
              fontWeight={300}
              lineHeight={1.35}>
              {secondary}
            </TextBlock>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export const communityAppleFinancialTemplateMeta = {
  id: 'community-apple-financial',
  name: 'Apple Financial',
  description: 'Minimal black financial event card inspired by community cards.',
  fields: templateFields,
} as const satisfies OgTemplateMeta

export const communityAppleFinancialTemplate = {
  ...communityAppleFinancialTemplateMeta,
  render: CommunityAppleFinancial,
} as const satisfies OgTemplate
