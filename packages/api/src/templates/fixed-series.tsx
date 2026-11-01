import type { ReactElement, ReactNode } from 'react'

import type { RenderContext } from '../og/render-context.js'
import {
  fieldsForKnownTemplateStyle,
  renderKnownTemplateStyle,
  type KnownTemplateStyle,
  type KnownTemplateStyleOptions,
} from './known-template-styles.js'
import { cardStyle, sansFontFamily } from './shared.js'
import type { OgTemplate } from './types.js'

type PatternKind = 'dot' | 'square'

interface PatternDefinition {
  readonly color: string
  readonly kind: PatternKind
  readonly opacity: number
}

interface FrameDefinition {
  readonly backgroundColor: string
  readonly backgroundImage?: string
  readonly foreground: string
  readonly glow?: string
  readonly pattern?: PatternDefinition
  readonly secondary: string
}

interface FixedTemplateDefinition {
  readonly description: string
  readonly frame: FrameDefinition
  readonly id: string
  readonly name: string
  readonly options?: KnownTemplateStyleOptions
  readonly style: KnownTemplateStyle
}

const fullLayerStyle = {
  display: 'flex',
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
} as const

const rounded = (value: number) => Math.round(value * 10) / 10

const patternSvg = (pattern: PatternDefinition) => {
  if (pattern.kind === 'dot')
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><defs><pattern id="p" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.35" fill="${pattern.color}" fill-opacity="${pattern.opacity}"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675"><defs><pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M.5 48V.5H48" fill="none" stroke="${pattern.color}" stroke-opacity="${pattern.opacity}"/></pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`
}

const patternDataUrl = (pattern: PatternDefinition) =>
  `data:image/svg+xml;base64,${Buffer.from(patternSvg(pattern)).toString('base64')}`

const FixedFrame = ({
  children,
  frame,
  random,
}: {
  readonly children: ReactNode
  readonly frame: FrameDefinition
  readonly random: RenderContext['random']
}): ReactElement => {
  const glowPosition = frame.glow
    ? `${rounded(24 + random() * 52)}% ${rounded(18 + random() * 62)}%`
    : ''

  return (
    <div
      style={{
        ...cardStyle,
        backgroundColor: frame.backgroundColor,
        color: frame.foreground,
        fontFamily: sansFontFamily,
      }}>
      {frame.backgroundImage ? (
        <div
          style={{
            ...fullLayerStyle,
            backgroundImage: frame.backgroundImage,
          }}
        />
      ) : null}
      {frame.pattern ? (
        <img
          alt=""
          height={675}
          src={patternDataUrl(frame.pattern)}
          width={1200}
          style={{
            ...fullLayerStyle,
            width: 1200,
            height: 675,
            objectFit: 'cover',
          }}
        />
      ) : null}
      {frame.glow ? (
        <div
          style={{
            ...fullLayerStyle,
            backgroundImage: `radial-gradient(circle at ${glowPosition}, ${frame.glow} 0%, transparent 44%)`,
          }}
        />
      ) : null}
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}>
        {children}
      </div>
    </div>
  )
}

const defineFixedTemplate = ({
  description,
  frame,
  id,
  name,
  options,
  style,
}: FixedTemplateDefinition): OgTemplate => ({
  description,
  fields: fieldsForKnownTemplateStyle(style, options),
  id,
  name,
  render: (input, context) => (
    <FixedFrame frame={frame} random={context.random}>
      {renderKnownTemplateStyle(
        style,
        input,
        {
          foreground: frame.foreground,
          secondary: frame.secondary,
        },
        options,
      )}
    </FixedFrame>
  ),
})

const paperFrame = {
  backgroundColor: '#fbfaf7',
  backgroundImage:
    'linear-gradient(135deg, rgba(37, 99, 235, 0.035) 0%, rgba(255, 255, 255, 0) 48%, rgba(180, 83, 9, 0.045) 100%)',
  foreground: '#171717',
  secondary: '#57534e',
} as const satisfies FrameDefinition

const inkFrame = {
  backgroundColor: '#09090b',
  backgroundImage: 'linear-gradient(145deg, #09090b 0%, #18181b 54%, #09090b 100%)',
  foreground: '#fafafa',
  glow: 'rgba(163, 230, 53, 0.12)',
  secondary: '#a1a1aa',
} as const satisfies FrameDefinition

const midnightFrame = {
  backgroundColor: '#030712',
  backgroundImage: 'linear-gradient(135deg, #172554 0%, #030712 48%, #3b0764 100%)',
  foreground: '#f8fafc',
  glow: 'rgba(125, 211, 252, 0.24)',
  secondary: '#cbd5e1',
} as const satisfies FrameDefinition

const auroraFrame = {
  backgroundColor: '#042f2e',
  backgroundImage: 'linear-gradient(135deg, #042f2e 0%, #0369a1 48%, #312e81 100%)',
  foreground: '#f0fdfa',
  glow: 'rgba(94, 234, 212, 0.38)',
  secondary: '#ccfbf1',
} as const satisfies FrameDefinition

const prismFrame = {
  backgroundColor: '#fc7efc',
  backgroundImage: 'linear-gradient(135deg, #01befc 0%, #fc7efc 52%, #fbd847 100%)',
  foreground: '#111827',
  glow: 'rgba(255, 255, 255, 0.3)',
  secondary: '#312e81',
} as const satisfies FrameDefinition

const sunsetFrame = {
  backgroundColor: '#e11d48',
  backgroundImage: 'linear-gradient(135deg, #581c87 0%, #e11d48 48%, #fdba74 100%)',
  foreground: '#fff7ed',
  glow: 'rgba(255, 247, 237, 0.24)',
  secondary: '#ffedd5',
} as const satisfies FrameDefinition

const mistFrame = {
  backgroundColor: '#f8fafc',
  backgroundImage: 'linear-gradient(135deg, #f8fafc 0%, #e9d5ff 48%, #bfdbfe 100%)',
  foreground: '#1e1b4b',
  glow: 'rgba(255, 255, 255, 0.72)',
  secondary: '#475569',
} as const satisfies FrameDefinition

const monoFrame = {
  backgroundColor: '#18181b',
  backgroundImage: 'linear-gradient(140deg, #09090b 0%, #3f3f46 48%, #18181b 100%)',
  foreground: '#fafafa',
  glow: 'rgba(244, 244, 245, 0.17)',
  secondary: '#d4d4d8',
} as const satisfies FrameDefinition

const gridLightFrame = {
  backgroundColor: '#fafafa',
  backgroundImage:
    'linear-gradient(90deg, rgba(250, 250, 250, 0.98) 0%, rgba(250, 250, 250, 0.88) 66%, rgba(250, 250, 250, 0.4) 100%)',
  foreground: '#0f172a',
  pattern: { color: '#475569', kind: 'square', opacity: 0.1 },
  secondary: '#475569',
} as const satisfies FrameDefinition

const gridDarkFrame = {
  backgroundColor: '#202124',
  backgroundImage:
    'linear-gradient(90deg, rgba(32, 33, 36, 0.98) 0%, rgba(32, 33, 36, 0.88) 66%, rgba(32, 33, 36, 0.46) 100%)',
  foreground: '#fafafa',
  pattern: { color: '#f8fafc', kind: 'square', opacity: 0.08 },
  secondary: '#a1a1aa',
} as const satisfies FrameDefinition

export const fixedTemplates = [
  defineFixedTemplate({
    id: 'paper-ledger',
    name: 'Paper Ledger',
    description: 'A quiet paper card with the headline first and identity below.',
    frame: paperFrame,
    style: 'float-reverse',
  }),
  defineFixedTemplate({
    id: 'paper-brief',
    name: 'Paper Brief',
    description: 'A restrained paper brief with a broad title and summary.',
    frame: paperFrame,
    style: 'float-summary',
  }),
  defineFixedTemplate({
    id: 'paper-masthead',
    name: 'Paper Masthead',
    description: 'A clean horizontal identity lockup on a warm paper surface.',
    frame: paperFrame,
    style: 'site-logo',
  }),
  defineFixedTemplate({
    id: 'ink-column',
    name: 'Ink Column',
    description: 'A near-black framed title composition with restrained contrast.',
    frame: inkFrame,
    style: 'around',
  }),
  defineFixedTemplate({
    id: 'ink-focus',
    name: 'Ink Focus',
    description: 'A centered dark statement with a compact identity marker.',
    frame: inkFrame,
    style: 'centered',
  }),
  defineFixedTemplate({
    id: 'ink-statement',
    name: 'Ink Statement',
    description: 'A centered headline on a softly glowing ink field.',
    frame: inkFrame,
    style: 'title',
  }),
  defineFixedTemplate({
    id: 'midnight-story',
    name: 'Midnight Story',
    description: 'A bottom-anchored story over a deep navy and violet atmosphere.',
    frame: midnightFrame,
    style: 'float',
  }),
  defineFixedTemplate({
    id: 'midnight-brief',
    name: 'Midnight Brief',
    description: 'A spacious midnight brief with an expansive title and summary.',
    frame: midnightFrame,
    style: 'float-summary',
  }),
  defineFixedTemplate({
    id: 'midnight-block',
    name: 'Midnight Block',
    description: 'A strong title block with the site name on a midnight gradient.',
    frame: midnightFrame,
    options: {
      titleShadowAttribution: 'brandName',
      titleShadowAttributionSize: 24,
      titleShadowOffsetColor: '#7dd3fc',
      titleShadowPlainAttribution: true,
    },
    style: 'title-shadow',
  }),
  defineFixedTemplate({
    id: 'aurora-column',
    name: 'Aurora Column',
    description: 'A framed title composition over a teal and violet atmosphere.',
    frame: auroraFrame,
    style: 'around',
  }),
  defineFixedTemplate({
    id: 'aurora-focus',
    name: 'Aurora Focus',
    description: 'A centered headline held inside a softly drifting aurora.',
    frame: auroraFrame,
    style: 'centered',
  }),
  defineFixedTemplate({
    id: 'aurora-mark',
    name: 'Aurora Mark',
    description: 'A large identity presentation over a luminous teal atmosphere.',
    frame: auroraFrame,
    style: 'logo-hero',
  }),
  defineFixedTemplate({
    id: 'prism-focus',
    name: 'Prism Focus',
    description: 'A centered dark headline on a cyan, magenta, and gold field.',
    frame: prismFrame,
    style: 'centered',
  }),
  defineFixedTemplate({
    id: 'prism-brief',
    name: 'Prism Brief',
    description: 'A bold prismatic brief with a wide headline and supporting copy.',
    frame: prismFrame,
    style: 'float-summary',
  }),
  defineFixedTemplate({
    id: 'prism-masthead',
    name: 'Prism Masthead',
    description: 'A vivid identity lockup for compact brand announcements.',
    frame: prismFrame,
    style: 'site-logo',
  }),
  defineFixedTemplate({
    id: 'sunset-column',
    name: 'Sunset Column',
    description: 'A framed title composition over plum, coral, and apricot color.',
    frame: sunsetFrame,
    style: 'around',
  }),
  defineFixedTemplate({
    id: 'sunset-focus',
    name: 'Sunset Focus',
    description: 'A centered story title surrounded by a warm sunset glow.',
    frame: sunsetFrame,
    style: 'centered',
  }),
  defineFixedTemplate({
    id: 'sunset-statement',
    name: 'Sunset Statement',
    description: 'A clear centered statement over a high-energy warm gradient.',
    frame: sunsetFrame,
    style: 'title',
  }),
  defineFixedTemplate({
    id: 'mist-story',
    name: 'Mist Story',
    description: 'A bottom-anchored story on an airy pearl and lavender field.',
    frame: mistFrame,
    style: 'float',
  }),
  defineFixedTemplate({
    id: 'mist-brief',
    name: 'Mist Brief',
    description: 'A light editorial brief with a generous title and summary.',
    frame: mistFrame,
    style: 'float-summary',
  }),
  defineFixedTemplate({
    id: 'mist-mark',
    name: 'Mist Mark',
    description: 'A calm identity presentation on a pearl and sky gradient.',
    frame: mistFrame,
    style: 'logo-hero',
  }),
  defineFixedTemplate({
    id: 'mono-focus',
    name: 'Mono Focus',
    description: 'A centered headline on a layered graphite monochrome surface.',
    frame: monoFrame,
    style: 'centered',
  }),
  defineFixedTemplate({
    id: 'mono-folio',
    name: 'Mono Folio',
    description: 'A monochrome folio with the title above and identity below.',
    frame: monoFrame,
    style: 'float-reverse',
  }),
  defineFixedTemplate({
    id: 'mono-masthead',
    name: 'Mono Masthead',
    description: 'A horizontal identity lockup on graphite and silver.',
    frame: monoFrame,
    style: 'site-logo',
  }),
  defineFixedTemplate({
    id: 'grid-light-column',
    name: 'Grid Light Column',
    description: 'A simple framed title composition over a quiet technical grid.',
    frame: gridLightFrame,
    style: 'around',
  }),
  defineFixedTemplate({
    id: 'grid-light-focus',
    name: 'Grid Light Focus',
    description: 'A centered technical statement on a clean light grid.',
    frame: gridLightFrame,
    style: 'centered',
  }),
  defineFixedTemplate({
    id: 'grid-dark-column',
    name: 'Grid Dark Column',
    description: 'A simple framed title composition on a graphite grid.',
    frame: gridDarkFrame,
    style: 'around',
  }),
] as const satisfies readonly OgTemplate[]
