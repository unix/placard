import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import {
  brandText,
  Header,
  logoSrc,
  MetaLine,
  px,
  sansFontFamily,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
  descriptionText,
} from './shared.js'
import type { OgTemplateMeta } from './types.js'

export type KnownTemplateStyle =
  | 'around'
  | 'centered'
  | 'float'
  | 'float-reverse'
  | 'float-summary'
  | 'logo-hero'
  | 'site-logo'
  | 'title'
  | 'title-shadow'

export interface TemplatePalette {
  readonly foreground: string
  readonly secondary: string
}

export interface KnownTemplateStyleOptions {
  readonly titleShadowAttribution?: 'author' | 'brandName'
  readonly titleShadowAttributionSize?: number
  readonly titleShadowOffsetColor?: string
  readonly titleShadowPlainAttribution?: boolean
}

const aroundFields = [
  'brandName',
  'logoId',
  'logoUrl',
  'title',
  'author',
  'date',
] as const satisfies OgTemplateMeta['fields']

const floatFields = [
  'logoId',
  'logoUrl',
  'title',
  'author',
  'date',
] as const satisfies OgTemplateMeta['fields']

const floatReverseFields = [
  'brandName',
  'logoId',
  'logoUrl',
  'title',
] as const satisfies OgTemplateMeta['fields']

const centeredFields = [
  'brandName',
  'logoId',
  'logoUrl',
  'title',
] as const satisfies OgTemplateMeta['fields']

const floatSummaryFields = [
  'logoId',
  'logoUrl',
  'title',
  'description',
] as const satisfies OgTemplateMeta['fields']

const identityFields = [
  'brandName',
  'logoId',
  'logoUrl',
] as const satisfies OgTemplateMeta['fields']

const titleFields = [
  'brandName',
  'logoId',
  'logoUrl',
  'title',
] as const satisfies OgTemplateMeta['fields']

const titleShadowFields = [
  'title',
  'author',
] as const satisfies OgTemplateMeta['fields']

const titleShadowBrandFields = [
  'brandName',
  'title',
] as const satisfies OgTemplateMeta['fields']

const Logo = ({
  input,
  size,
}: {
  readonly input: RenderInput
  readonly size: number
}) => {
  const src = logoSrc(input)
  if (!src) return null

  return (
    <img
      alt=""
      height={px(size)}
      src={src}
      width={px(size)}
      style={{
        display: 'flex',
        width: px(size),
        height: px(size),
        flexShrink: 0,
        objectFit: 'contain',
      }}
    />
  )
}

const Title = ({
  centered = false,
  input,
  palette,
  sizes,
  weight = 700,
  width,
}: {
  readonly centered?: boolean
  readonly input: RenderInput
  readonly palette: TemplatePalette
  readonly sizes: {
    readonly large: number
    readonly medium: number
    readonly small: number
  }
  readonly weight?: number
  readonly width: number
}) => {
  const title = titleText(input)
  const titleBlock = (
    <TextBlock
      color={palette.foreground}
      fontSize={titleSize(title, sizes)}
      fontWeight={weight}
      letterSpacing={-1.2}
      lineHeight={titleLineHeight(title, 1.04)}
      style={{
        ...(centered ? { maxWidth: px(width) } : { width: px(width) }),
        textAlign: centered ? 'center' : 'left',
        textWrap: centered ? 'wrap' : 'balance',
      }}>
      {title}
    </TextBlock>
  )

  if (!centered) return titleBlock
  return (
    <div style={{ display: 'flex', width: px(width), justifyContent: 'center' }}>
      {titleBlock}
    </div>
  )
}

const Description = ({
  input,
  palette,
  width,
}: {
  readonly input: RenderInput
  readonly palette: TemplatePalette
  readonly width: number
}) => {
  const description = descriptionText(input)
  if (!description) return null

  return (
    <TextBlock
      color={palette.secondary}
      fontSize={px(30)}
      fontWeight={480}
      lineHeight={1.38}
      style={{ lineClamp: 3, width: px(width) }}>
      {description}
    </TextBlock>
  )
}

const AroundContent = (input: RenderInput, palette: TemplatePalette) => (
  <div
    style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: px(58),
      fontFamily: sansFontFamily,
    }}>
    <Header
      brandColor={palette.foreground}
      input={input}
      metaColor={palette.secondary}
      separatorColor={palette.secondary}
    />
    <Title
      input={input}
      palette={palette}
      sizes={{ large: 76, medium: 62, small: 49 }}
      width={1040}
    />
  </div>
)

const FloatContent = (input: RenderInput, palette: TemplatePalette) => (
  <div
    style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: px(50),
      fontFamily: sansFontFamily,
    }}>
    <div style={{ display: 'flex', minHeight: px(52) }}>
      <Logo input={input} size={52} />
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
      <Title
        input={input}
        palette={palette}
        sizes={{ large: 74, medium: 61, small: 48 }}
        weight={680}
        width={980}
      />
    </div>
    <MetaLine
      color={palette.secondary}
      input={input}
      separatorColor={palette.secondary}
      size={24}
    />
  </div>
)

const FloatReverseContent = (input: RenderInput, palette: TemplatePalette) => {
  const brand = brandText(input)
  const logo = logoSrc(input)

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: px(50),
        fontFamily: sansFontFamily,
      }}>
      <div style={{ display: 'flex', paddingBottom: px(48), paddingTop: px(24) }}>
        <Title
          input={input}
          palette={palette}
          sizes={{ large: 74, medium: 61, small: 48 }}
          weight={680}
          width={980}
        />
      </div>
      <div style={{ display: 'flex', minHeight: px(52), alignItems: 'center' }}>
        <Logo input={input} size={52} />
        {brand ? (
          <TextBlock
            color={palette.foreground}
            fontSize={px(24)}
            fontWeight={560}
            lineHeight={1.15}
            style={{
              lineClamp: 1,
              marginLeft: logo ? px(14) : 0,
              maxWidth: px(640),
            }}>
            {brand}
          </TextBlock>
        ) : null}
      </div>
    </div>
  )
}

const CenteredIdentity = ({
  input,
  palette,
}: {
  readonly input: RenderInput
  readonly palette: TemplatePalette
}) => {
  const src = logoSrc(input)
  if (src) return <Logo input={input} size={44} />

  const brand = brandText(input)
  if (!brand) return null
  return (
    <TextBlock
      color={palette.foreground}
      fontSize={px(20)}
      fontWeight={650}
      lineHeight={1.15}
      style={{ lineClamp: 1, maxWidth: px(720), textAlign: 'center' }}>
      {brand}
    </TextBlock>
  )
}

const CenteredContent = (input: RenderInput, palette: TemplatePalette) => (
  <div
    style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      alignItems: 'center',
      padding: px(58),
      fontFamily: sansFontFamily,
    }}>
    <div
      style={{
        display: 'flex',
        minHeight: px(44),
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <CenteredIdentity input={input} palette={palette} />
    </div>
    <div
      style={{
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: px(24),
      }}>
      <Title
        centered
        input={input}
        palette={palette}
        sizes={{ large: 72, medium: 60, small: 48 }}
        weight={680}
        width={880}
      />
    </div>
  </div>
)

const FloatSummaryContent = (input: RenderInput, palette: TemplatePalette) => (
  <div
    style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      padding: px(64),
      fontFamily: sansFontFamily,
    }}>
    <div style={{ display: 'flex', minHeight: px(48) }}>
      <Logo input={input} size={48} />
    </div>
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
      <Title
        input={input}
        palette={palette}
        sizes={{ large: 80, medium: 65, small: 50 }}
        width={1040}
      />
      <div style={{ display: 'flex', marginTop: px(26) }}>
        <Description input={input} palette={palette} width={900} />
      </div>
    </div>
  </div>
)

const LogoHeroContent = (input: RenderInput, palette: TemplatePalette) => {
  const brand = brandText(input)
  const logo = logoSrc(input)

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: sansFontFamily,
      }}>
      <Logo input={input} size={208} />
      {brand ? (
        <TextBlock
          color={palette.foreground}
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
  )
}

const SiteLogoContent = (input: RenderInput, palette: TemplatePalette) => {
  const brand = brandText(input)
  const logo = logoSrc(input)

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: px(72),
        fontFamily: sansFontFamily,
      }}>
      <Logo input={input} size={96} />
      {brand ? (
        <TextBlock
          color={palette.foreground}
          fontSize={px(64)}
          fontWeight={700}
          letterSpacing={-0.8}
          lineHeight={1.05}
          style={{
            lineClamp: 1,
            marginLeft: logo ? px(24) : 0,
            maxWidth: px(900),
          }}>
          {brand}
        </TextBlock>
      ) : null}
    </div>
  )
}

const TitleContent = (input: RenderInput, palette: TemplatePalette) => {
  const brand = brandText(input)

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        padding: px(48),
        fontFamily: sansFontFamily,
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
            color={palette.foreground}
            fontSize={px(20)}
            fontWeight={650}
            lineHeight={1.15}
            style={{ lineClamp: 1, maxWidth: px(520) }}>
            {brand}
          </TextBlock>
        ) : null}
        <Logo input={input} size={48} />
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: px(40),
        }}>
        <Title
          centered
          input={input}
          palette={palette}
          sizes={{ large: 72, medium: 60, small: 48 }}
          weight={660}
          width={920}
        />
      </div>
    </div>
  )
}

const contrastColor = (color: string) => {
  const value = color.replace('#', '')
  const expanded =
    value.length === 3 || value.length === 4
      ? value
          .slice(0, 3)
          .split('')
          .map(character => `${character}${character}`)
          .join('')
      : value.slice(0, 6)
  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)
  const luminance = (red * 299 + green * 587 + blue * 114) / 255_000
  return luminance > 0.62 ? '#000000' : '#ffffff'
}

const TitleShadowContent = (
  input: RenderInput,
  palette: TemplatePalette,
  options: KnownTemplateStyleOptions,
) => {
  const title = titleText(input)
  const attributionField = options.titleShadowAttribution ?? 'author'
  const attribution =
    attributionField === 'brandName' ? brandText(input) : input.author.trim() || null
  const inverse = contrastColor(palette.foreground)
  const hasOffset = Boolean(options.titleShadowOffsetColor)

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: sansFontFamily,
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
            width: px(hasOffset ? 1010 : 900),
            maxWidth: px(hasOffset ? 1010 : 1000),
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: palette.foreground,
            boxShadow: options.titleShadowOffsetColor
              ? `${px(18)}px ${px(18)}px 0 ${options.titleShadowOffsetColor}`
              : undefined,
            padding: hasOffset
              ? `${px(34)}px ${px(42)}px`
              : `${px(32)}px ${px(24)}px`,
          }}>
          <TextBlock
            color={inverse}
            fontSize={titleSize(title, { large: 68, medium: 58, small: 46 })}
            fontWeight={700}
            letterSpacing={-0.6}
            lineHeight={titleLineHeight(title, 1.08)}
            style={{ justifyContent: 'center', textAlign: 'center' }}>
            {title}
          </TextBlock>
        </div>
        {attribution ? (
          <div style={{ display: 'flex', marginTop: px(hasOffset ? 30 : 16) }}>
            <TextBlock
              color={
                options.titleShadowPlainAttribution ? palette.foreground : inverse
              }
              fontSize={px(
                options.titleShadowAttributionSize ??
                  (options.titleShadowPlainAttribution ? 18 : 22),
              )}
              fontWeight={options.titleShadowPlainAttribution ? 650 : 700}
              lineHeight={1.15}
              style={{
                backgroundColor: options.titleShadowPlainAttribution
                  ? undefined
                  : palette.foreground,
                padding: options.titleShadowPlainAttribution
                  ? 0
                  : `${px(10)}px ${px(20)}px`,
              }}>
              {attribution}
            </TextBlock>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export const fieldsForKnownTemplateStyle = (
  style: KnownTemplateStyle,
  options: KnownTemplateStyleOptions = {},
): OgTemplateMeta['fields'] => {
  if (style === 'around') return aroundFields
  if (style === 'float') return floatFields
  if (style === 'float-reverse') return floatReverseFields
  if (style === 'centered') return centeredFields
  if (style === 'float-summary') return floatSummaryFields
  if (style === 'logo-hero' || style === 'site-logo') return identityFields
  if (style === 'title') return titleFields
  if (options.titleShadowAttribution === 'brandName') return titleShadowBrandFields
  return titleShadowFields
}

export const renderKnownTemplateStyle = (
  style: KnownTemplateStyle,
  input: RenderInput,
  palette: TemplatePalette,
  options: KnownTemplateStyleOptions = {},
): ReactElement => {
  if (style === 'around') return AroundContent(input, palette)
  if (style === 'float') return FloatContent(input, palette)
  if (style === 'float-reverse') return FloatReverseContent(input, palette)
  if (style === 'centered') return CenteredContent(input, palette)
  if (style === 'float-summary') return FloatSummaryContent(input, palette)
  if (style === 'logo-hero') return LogoHeroContent(input, palette)
  if (style === 'site-logo') return SiteLogoContent(input, palette)
  if (style === 'title') return TitleContent(input, palette)
  return TitleShadowContent(input, palette, options)
}
