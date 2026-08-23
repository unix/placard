import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import { customLogoId, logoForId } from '../../assets/logo/index.js'
import {
  cardStyle,
  optionalText,
  px,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

const logoOnlyTemplateFields = [
  'logoId',
  'logoUrl',
  'title',
] as const satisfies OgTemplateMeta['fields']

const defaultLogoSrc = logoForId('nore-dark')?.src ?? null

const logoSource = (input: RenderInput) => {
  if (input.logoId === customLogoId)
    return optionalText(input.logoUrl) ?? defaultLogoSrc
  return logoForId(input.logoId)?.src ?? defaultLogoSrc
}

export const NoreLogoOnly = (input: RenderInput): ReactElement => {
  const title = titleText(input)
  const src = logoSource(input)

  return (
    <div
      style={{
        ...cardStyle,
        backgroundColor: '#ffffff',
        color: '#ffffff',
        fontFamily: 'Geist',
      }}>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
        }}>
        {src ? (
          <img
            alt=""
            src={src}
            width={px(188)}
            height={px(188)}
            style={{
              display: 'flex',
              width: px(188),
              height: px(188),
              objectFit: 'contain',
            }}
          />
        ) : null}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            bottom: px(24),
            left: 0,
            width: '100%',
            justifyContent: 'center',
          }}>
          <div
            style={{
              display: 'flex',
              maxWidth: px(1080),
              justifyContent: 'center',
              borderRadius: px(8),
              backgroundColor: '#3f3f46',
              padding: `${px(9)}px ${px(16)}px`,
            }}>
            <TextBlock
              color="#ffffff"
              fontSize={titleSize(title, { large: 36, medium: 32, small: 28 })}
              fontWeight={560}
              lineHeight={titleLineHeight(title, 1.14)}
              style={{ maxWidth: px(1040), textAlign: 'center' }}>
              {title}
            </TextBlock>
          </div>
        </div>
      </div>
    </div>
  )
}

export const noreLogoOnlyTemplateMeta = {
  id: 'nore-logo-only',
  name: 'Nore Logo Only',
  description: 'Minimal logo-focused OG card with a bottom title badge.',
  fields: logoOnlyTemplateFields,
} as const satisfies OgTemplateMeta

export const noreLogoOnlyTemplate = {
  ...noreLogoOnlyTemplateMeta,
  render: NoreLogoOnly,
} as const satisfies OgTemplate
