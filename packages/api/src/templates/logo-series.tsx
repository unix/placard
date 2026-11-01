import type { ReactElement, ReactNode } from 'react'

import type { RenderInput } from '../og/input.js'
import type { RenderContext } from '../og/render-context.js'
import { textLength } from '../og/text-length.js'
import {
  FixedFrame,
  inkFrame,
  mistFrame,
  monoFrame,
  prismFrame,
} from './fixed-series.js'
import { GridFrame, gridPatternPreset } from './grid-series.js'
import {
  fieldsForKnownTemplateStyle,
  renderKnownTemplateStyle,
  type TemplatePalette,
} from './known-template-styles.js'
import {
  brandText,
  cardStyle,
  logoSrc,
  px,
  sansFontFamily,
  TextBlock,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

interface LogoBackgroundDefinition {
  readonly description: string
  readonly id: string
  readonly name: string
  readonly palette: TemplatePalette
  readonly render: (children: ReactNode, context: RenderContext) => ReactElement
}

interface LogoLayoutDefinition {
  readonly description: string
  readonly fields: OgTemplateMeta['fields']
  readonly id: string
  readonly name: string
  readonly render: (input: RenderInput, palette: TemplatePalette) => ReactElement
}

const identityFields = [
  'brandName',
  'logoId',
  'logoUrl',
] as const satisfies OgTemplateMeta['fields']

const logoTextFields = ['brandName'] as const satisfies OgTemplateMeta['fields']

const randomInteger = (maximum: number, random: () => number) =>
  Math.floor(random() * maximum)

const randomGradient = (random: () => number) => {
  const primaryHue = randomInteger(360, random)
  const secondaryHue = (primaryHue + 45 + randomInteger(90, random)) % 360
  const angle = 115 + randomInteger(101, random)
  return `linear-gradient(${angle}deg, hsl(${primaryHue}, 78%, 26%) 0%, #050505 50%, hsl(${secondaryHue}, 72%, 20%) 100%)`
}

const PlainFrame = ({
  backgroundColor,
  children,
  foreground,
}: {
  readonly backgroundColor: string
  readonly children: ReactNode
  readonly foreground: string
}): ReactElement => (
  <div
    style={{
      ...cardStyle,
      backgroundColor,
      color: foreground,
      fontFamily: sansFontFamily,
    }}>
    {children}
  </div>
)

const GradientFrame = ({
  children,
  random,
}: {
  readonly children: ReactNode
  readonly random: RenderContext['random']
}): ReactElement => (
  <div
    style={{
      ...cardStyle,
      backgroundColor: '#050505',
      backgroundImage: randomGradient(random),
      color: '#f5f5f5',
      fontFamily: sansFontFamily,
    }}>
    {children}
  </div>
)

const fixedBackground = (
  definition: Omit<LogoBackgroundDefinition, 'render'> & {
    readonly frame: Parameters<typeof FixedFrame>[0]['frame']
  },
): LogoBackgroundDefinition => ({
  description: definition.description,
  id: definition.id,
  name: definition.name,
  palette: definition.palette,
  render: (children, context) => (
    <FixedFrame frame={definition.frame} random={context.random}>
      {children}
    </FixedFrame>
  ),
})

const logoBackgrounds = [
  {
    id: 'white',
    name: 'White',
    description: 'a clean white background',
    palette: { foreground: '#171717', secondary: '#57534e' },
    render: children => (
      <PlainFrame backgroundColor="#ffffff" foreground="#171717">
        {children}
      </PlainFrame>
    ),
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'a near-black background',
    palette: { foreground: '#ffffff', secondary: '#d4d4d8' },
    render: children => (
      <PlainFrame backgroundColor="#09090b" foreground="#ffffff">
        {children}
      </PlainFrame>
    ),
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'a seeded dark color gradient',
    palette: { foreground: '#f5f5f5', secondary: '#d4d4d8' },
    render: (children, context) => (
      <GradientFrame random={context.random}>{children}</GradientFrame>
    ),
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'a light seeded square grid',
    palette: {
      foreground: gridPatternPreset.textColor,
      secondary: gridPatternPreset.mutedTextColor,
    },
    render: (children, context) => (
      <GridFrame preset={gridPatternPreset} random={context.random}>
        {children}
      </GridFrame>
    ),
  },
  fixedBackground({
    id: 'ink',
    name: 'Ink',
    description: 'a softly glowing near-black ink field',
    frame: inkFrame,
    palette: {
      foreground: inkFrame.foreground,
      secondary: inkFrame.secondary,
    },
  }),
  fixedBackground({
    id: 'prism',
    name: 'Prism',
    description: 'a vivid cyan, magenta, and gold field',
    frame: prismFrame,
    palette: {
      foreground: prismFrame.foreground,
      secondary: prismFrame.secondary,
    },
  }),
  fixedBackground({
    id: 'mist',
    name: 'Mist',
    description: 'an airy pearl, lavender, and sky gradient',
    frame: mistFrame,
    palette: {
      foreground: mistFrame.foreground,
      secondary: mistFrame.secondary,
    },
  }),
  fixedBackground({
    id: 'mono',
    name: 'Mono',
    description: 'a layered graphite monochrome surface',
    frame: monoFrame,
    palette: {
      foreground: monoFrame.foreground,
      secondary: monoFrame.secondary,
    },
  }),
] as const satisfies readonly LogoBackgroundDefinition[]

const logoTextSize = (name: string) => {
  const length = textLength(name)
  if (length > 60) return px(54)
  if (length > 36) return px(68)
  return px(88)
}

const LogoTextContent = (
  input: RenderInput,
  palette: TemplatePalette,
): ReactElement => {
  const brand = brandText(input)
  const isCompactBrand = brand ? textLength(brand) <= 24 : true

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: px(72),
      }}>
      <div
        style={{
          display: 'flex',
          width: px(1020),
          justifyContent: 'center',
        }}>
        {brand ? (
          <TextBlock
            color={palette.foreground}
            fontSize={logoTextSize(brand)}
            fontWeight={700}
            letterSpacing={-1.8}
            lineHeight={1.05}
            style={{
              maxWidth: px(1020),
              textAlign: 'center',
              ...(isCompactBrand ? {} : { width: px(1020) }),
            }}>
            {brand}
          </TextBlock>
        ) : null}
      </div>
    </div>
  )
}

const SignalContent = (
  input: RenderInput,
  palette: TemplatePalette,
): ReactElement => {
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
      }}>
      {logo ? (
        <img
          alt=""
          height={px(208)}
          src={logo}
          width={px(208)}
          style={{
            display: 'flex',
            width: px(208),
            height: px(208),
            objectFit: 'contain',
          }}
        />
      ) : null}
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

const logoLayouts = [
  {
    id: 'logo-text',
    name: 'Logo Text',
    description: 'A bold centered brand name',
    fields: logoTextFields,
    render: LogoTextContent,
  },
  {
    id: 'signal',
    name: 'Signal',
    description: 'A large centered logo with the brand name below',
    fields: identityFields,
    render: SignalContent,
  },
  {
    id: 'logo-center',
    name: 'Logo Center',
    description: 'A centered horizontal logo and brand lockup',
    fields: fieldsForKnownTemplateStyle('site-logo'),
    render: (input, palette) =>
      renderKnownTemplateStyle('site-logo', input, palette),
  },
  {
    id: 'logo-large',
    name: 'Logo Large',
    description: 'A large centered identity presentation',
    fields: fieldsForKnownTemplateStyle('logo-hero'),
    render: (input, palette) =>
      renderKnownTemplateStyle('logo-hero', input, palette),
  },
] as const satisfies readonly LogoLayoutDefinition[]

export const logoTemplates = logoLayouts.flatMap(layout =>
  logoBackgrounds.map((background): OgTemplate => ({
    id: `${layout.id}-${background.id}`,
    name: `${layout.name} ${background.name}`,
    description: `${layout.description} on ${background.description}.`,
    fields: layout.fields,
    render: (input, context) =>
      background.render(layout.render(input, background.palette), context),
  })),
)
