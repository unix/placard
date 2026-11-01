import type { CSSProperties, ReactNode } from 'react'

import { customLogoId, logoForId } from '../../assets/logo/index.js'
import { defaultTitle, imageHeight, imageWidth } from '../constants.js'
import type { RenderInput } from '../og/input.js'
import { truncateUnbreakableTextRuns } from '../og/text-length.js'
import type { TemplateField } from './types.js'

const sourceWidth = 1200
const scale = imageWidth / sourceWidth
const cjkTitleLineHeightIncrease = 0.08
const cjkTitlePattern = /\p{Script=Han}/u
const maxCjkTitleLineHeight = 1.42
const maxBrandUnbreakableRunLength = 34
const maxTitleUnbreakableRunLength = 22

type TakumiTextStyle = CSSProperties & {
  readonly lineClamp?: number
  readonly textWrap?: 'balance' | 'wrap'
}

export const sansFontFamily = "Geist, 'Noto Sans SC'"
export const px = (value: number) => Math.round(value * scale)

export const templateFields = [
  'brandName',
  'logoId',
  'logoUrl',
  'title',
  'description',
  'author',
  'date',
] as const satisfies readonly TemplateField[]

export const templateFieldsWithoutDescription = [
  'brandName',
  'logoId',
  'logoUrl',
  'title',
  'author',
  'date',
] as const satisfies readonly TemplateField[]

export const cardStyle = {
  width: imageWidth,
  height: imageHeight,
  display: 'flex',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
} as const

export const optionalText = (value: string) => {
  const trimmed = value.trim()
  if (trimmed.length === 0) return null
  return trimmed
}

const displayText = (value: string, maxUnbreakableRunLength: number) =>
  truncateUnbreakableTextRuns(value, maxUnbreakableRunLength)

export const titleText = (input: RenderInput) =>
  displayText(
    optionalText(input.title) ?? defaultTitle,
    maxTitleUnbreakableRunLength,
  )

export const descriptionText = (input: RenderInput) =>
  optionalText(input.description)

export const authorText = (input: RenderInput) => optionalText(input.author)
export const dateText = (input: RenderInput) => optionalText(input.date)

export const brandText = (input: RenderInput) => {
  const brand = optionalText(input.brandName)
  if (!brand) return null
  return displayText(brand, maxBrandUnbreakableRunLength)
}

export const logoSrc = (input: RenderInput) => {
  if (input.logoId === customLogoId) return optionalText(input.logoUrl)
  return logoForId(input.logoId)?.src ?? null
}

export const hasAnyText = (items: ReadonlyArray<string | null>) =>
  items.some(item => item !== null)

export const titleSize = (
  title: string,
  sizes: {
    readonly large: number
    readonly medium: number
    readonly small: number
  },
) => {
  if (title.length > 100) return px(sizes.small)
  if (title.length > 62) return px(sizes.medium)
  return px(sizes.large)
}

export const titleLineHeight = (title: string, baseLineHeight: number) => {
  if (!cjkTitlePattern.test(title)) return baseLineHeight
  return Math.min(
    maxCjkTitleLineHeight,
    Math.round((baseLineHeight + cjkTitleLineHeightIncrease) * 100) / 100,
  )
}

export const TextBlock = ({
  children,
  color,
  fontFamily = sansFontFamily,
  fontSize,
  fontStyle,
  fontWeight = 400,
  letterSpacing = 0,
  lineHeight = 1,
  style,
}: {
  readonly children: ReactNode
  readonly color?: string
  readonly fontFamily?: string
  readonly fontSize: number
  readonly fontStyle?: 'italic' | 'normal'
  readonly fontWeight?: number
  readonly letterSpacing?: number
  readonly lineHeight?: number
  readonly style?: TakumiTextStyle
}) => {
  const blockStyle: TakumiTextStyle = {
    display: 'flex',
    minWidth: 0,
    overflow: 'hidden',
    overflowWrap: 'break-word',
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    lineHeight,
    ...style,
  }
  if (color) blockStyle.color = color
  if (fontStyle) blockStyle.fontStyle = fontStyle
  return <div style={blockStyle}>{children}</div>
}

export const Brand = ({
  color,
  input,
  logoSize = 40,
  textSize = 19,
}: {
  readonly color: string
  readonly input: RenderInput
  readonly logoSize?: number
  readonly textSize?: number
}) => {
  const brand = brandText(input)
  const src = logoSrc(input)
  if (!brand && !src) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
      {src ? (
        <img
          alt=""
          src={src}
          width={px(logoSize)}
          height={px(logoSize)}
          style={{
            display: 'flex',
            width: px(logoSize),
            height: px(logoSize),
            flexShrink: 0,
            objectFit: 'contain',
          }}
        />
      ) : null}
      {brand ? (
        <TextBlock
          color={color}
          fontSize={px(textSize)}
          fontWeight={650}
          lineHeight={1.15}
          style={{
            lineClamp: 1,
            marginLeft: src ? px(12) : 0,
            maxWidth: px(420),
          }}>
          {brand}
        </TextBlock>
      ) : null}
    </div>
  )
}

export const MetaLine = ({
  color,
  input,
  separatorColor,
  size = 16,
}: {
  readonly color: string
  readonly input: RenderInput
  readonly separatorColor: string
  readonly size?: number
}) => {
  const items = [authorText(input), dateText(input)].filter((item): item is string =>
    Boolean(item),
  )
  if (items.length === 0) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          style={{ display: 'flex', alignItems: 'center' }}>
          {index > 0 ? (
            <TextBlock
              color={separatorColor}
              fontSize={px(size)}
              fontWeight={500}
              style={{ marginLeft: px(12), marginRight: px(12) }}>
              /
            </TextBlock>
          ) : null}
          <TextBlock color={color} fontSize={px(size)} fontWeight={560}>
            {item}
          </TextBlock>
        </div>
      ))}
    </div>
  )
}

export const MetaBadges = ({
  input,
  tone = 'light',
}: {
  readonly input: RenderInput
  readonly tone?: 'dark' | 'light'
}) => {
  const items = [authorText(input), dateText(input)].filter((item): item is string =>
    Boolean(item),
  )
  if (items.length === 0) return null

  const colors =
    tone === 'dark'
      ? {
          background: '#27272a',
          border: '#3f3f46',
          text: '#d4d4d8',
        }
      : {
          background: '#f5f5f5',
          border: '#e5e5e5',
          text: '#525252',
        }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {items.map((item, index) => (
        <div
          key={`${item}-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            border: `${px(1)}px solid ${colors.border}`,
            borderRadius: px(999),
            backgroundColor: colors.background,
            padding: `${px(7)}px ${px(12)}px`,
            marginLeft: index > 0 ? px(8) : 0,
          }}>
          <TextBlock color={colors.text} fontSize={px(15)} fontWeight={560}>
            {item}
          </TextBlock>
        </div>
      ))}
    </div>
  )
}

export const Header = ({
  brandColor,
  brandLogoSize,
  brandTextSize,
  input,
  metaSize,
  metaColor,
  separatorColor,
}: {
  readonly brandColor: string
  readonly brandLogoSize?: number
  readonly brandTextSize?: number
  readonly input: RenderInput
  readonly metaSize?: number
  readonly metaColor: string
  readonly separatorColor: string
}) => {
  const hasBrand = hasAnyText([brandText(input), logoSrc(input)])
  const hasMeta = hasAnyText([authorText(input), dateText(input)])
  if (!hasBrand && !hasMeta) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <Brand
        color={brandColor}
        input={input}
        logoSize={brandLogoSize}
        textSize={brandTextSize}
      />
      <MetaLine
        color={metaColor}
        input={input}
        separatorColor={separatorColor}
        size={metaSize}
      />
    </div>
  )
}
