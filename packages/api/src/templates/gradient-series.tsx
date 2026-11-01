import type { ReactElement, ReactNode } from 'react'

import type { RenderContext } from '../og/render-context.js'
import {
  fieldsForKnownTemplateStyle,
  renderKnownTemplateStyle,
  type KnownTemplateStyle,
} from './known-template-styles.js'
import { cardStyle, sansFontFamily } from './shared.js'
import type { OgTemplate } from './types.js'

interface GradientLayer {
  readonly backgroundImage: string
  readonly opacity: number
}

interface GradientDrift {
  readonly angle: number
  readonly color: string
  readonly opacity: number
  readonly transparentColor: string
}

interface GradientPreset {
  readonly backgroundColor: string
  readonly backgroundImage: string
  readonly drift: GradientDrift
  readonly layers?: readonly GradientLayer[]
  readonly mutedTextColor: string
  readonly textColor: string
}

interface GradientTemplateDefinition {
  readonly description: string
  readonly id: string
  readonly name: string
  readonly preset: GradientPreset
  readonly style: KnownTemplateStyle
}

const seededOffset = (random: () => number, maximum: number) =>
  (random() * 2 - 1) * maximum

const seededRangedOffset = (
  random: () => number,
  minimum: number,
  maximum: number,
) => {
  const offset = random() * 2 - 1
  const direction = offset < 0 ? -1 : 1
  return direction * (minimum + Math.abs(offset) * (maximum - minimum))
}

const rounded = (value: number) => Math.round(value * 10) / 10

const driftedColorFilter = (random: () => number) => {
  const hue = seededRangedOffset(random, 8, 20)
  const saturation = 100 + seededRangedOffset(random, 4, 14)
  const brightness = 100 + seededRangedOffset(random, 2, 7)

  return `hue-rotate(${rounded(hue)}deg) saturate(${rounded(saturation)}%) brightness(${rounded(brightness)}%)`
}

const driftedLayers = (
  preset: GradientPreset,
  random: () => number,
): readonly GradientLayer[] => {
  const layers = (preset.layers ?? []).map(layer => ({
    ...layer,
    opacity: Math.min(1, Math.max(0, layer.opacity + seededOffset(random, 0.06))),
  }))
  const center = 50 + seededOffset(random, 8)
  const spread = 26 + seededOffset(random, 5)
  const angle = preset.drift.angle + seededOffset(random, 10)
  const opacity = Math.min(
    1,
    Math.max(0, preset.drift.opacity + seededOffset(random, 0.08)),
  )

  return [
    ...layers,
    {
      backgroundImage: `linear-gradient(${rounded(angle)}deg, ${preset.drift.transparentColor} ${rounded(center - spread)}%, ${preset.drift.color} ${rounded(center)}%, ${preset.drift.transparentColor} ${rounded(center + spread)}%)`,
      opacity,
    },
  ]
}

const GradientFrame = ({
  children,
  preset,
  random,
}: {
  readonly children: ReactNode
  readonly preset: GradientPreset
  readonly random: RenderContext['random']
}): ReactElement => {
  const colorFilter = driftedColorFilter(random)
  const layers = driftedLayers(preset, random)

  return (
    <div
      style={{
        ...cardStyle,
        backgroundColor: preset.backgroundColor,
        color: preset.textColor,
        fontFamily: sansFontFamily,
      }}>
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: preset.backgroundColor,
          backgroundImage: preset.backgroundImage,
          filter: colorFilter,
        }}>
        {layers.map(layer => (
          <div
            key={layer.backgroundImage}
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: layer.backgroundImage,
              opacity: layer.opacity,
            }}
          />
        ))}
      </div>
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

const defineGradientTemplate = ({
  description,
  id,
  name,
  preset,
  style,
}: GradientTemplateDefinition): OgTemplate => ({
  description,
  fields: fieldsForKnownTemplateStyle(style),
  id,
  name,
  render: (input, context) => (
    <GradientFrame preset={preset} random={context.random}>
      {renderKnownTemplateStyle(style, input, {
        foreground: preset.textColor,
        secondary: preset.mutedTextColor,
      })}
    </GradientFrame>
  ),
})

export const gradientTemplates = [
  defineGradientTemplate({
    id: 'gradient-midnight',
    name: 'Gradient Midnight',
    description:
      'Deep navy and violet gradient card with a centered title composition.',
    style: 'centered',
    preset: {
      backgroundColor: '#030712',
      backgroundImage:
        'linear-gradient(135deg, #172554 0%, #030712 48%, #3b0764 100%)',
      drift: {
        angle: 118,
        color: 'rgba(125, 211, 252, 0.1)',
        opacity: 0.8,
        transparentColor: 'rgba(125, 211, 252, 0)',
      },
      layers: [
        {
          backgroundImage:
            'linear-gradient(25deg, rgba(34, 211, 238, 0.16) 0%, rgba(34, 211, 238, 0) 42%, rgba(168, 85, 247, 0.18) 100%)',
          opacity: 1,
        },
      ],
      mutedTextColor: '#cbd5e1',
      textColor: '#f8fafc',
    },
  }),
  defineGradientTemplate({
    id: 'gradient-aurora',
    name: 'Gradient Aurora',
    description:
      'Layered teal, cyan, and violet card with a logo-led title and summary.',
    style: 'float-summary',
    preset: {
      backgroundColor: '#042f2e',
      backgroundImage:
        'linear-gradient(135deg, #042f2e 0%, #0369a1 48%, #312e81 100%)',
      drift: {
        angle: 112,
        color: 'rgba(240, 253, 250, 0.12)',
        opacity: 0.82,
        transparentColor: 'rgba(240, 253, 250, 0)',
      },
      layers: [
        {
          backgroundImage:
            'linear-gradient(25deg, rgba(45, 212, 191, 0) 18%, rgba(94, 234, 212, 0.72) 50%, rgba(168, 85, 247, 0) 78%)',
          opacity: 0.72,
        },
      ],
      mutedTextColor: '#ccfbf1',
      textColor: '#f0fdfa',
    },
  }),
  defineGradientTemplate({
    id: 'gradient-prism',
    name: 'Gradient Prism',
    description:
      'Vivid cyan, magenta, and gold card with a centered title composition.',
    style: 'title',
    preset: {
      backgroundColor: '#fc7efc',
      backgroundImage:
        'linear-gradient(135deg, #01befc 0%, #fc7efc 52%, #fbd847 100%)',
      drift: {
        angle: 126,
        color: 'rgba(255, 255, 255, 0.14)',
        opacity: 0.76,
        transparentColor: 'rgba(255, 255, 255, 0)',
      },
      layers: [
        {
          backgroundImage:
            'linear-gradient(45deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 45%, rgba(255, 255, 255, 0.18) 100%)',
          opacity: 0.7,
        },
      ],
      mutedTextColor: '#312e81',
      textColor: '#111827',
    },
  }),
  defineGradientTemplate({
    id: 'gradient-sunset',
    name: 'Gradient Sunset',
    description:
      'Warm plum, coral, and apricot story card with bottom-anchored content.',
    style: 'float',
    preset: {
      backgroundColor: '#e11d48',
      backgroundImage:
        'linear-gradient(135deg, #581c87 0%, #e11d48 48%, #fdba74 100%)',
      drift: {
        angle: 122,
        color: 'rgba(255, 247, 237, 0.12)',
        opacity: 0.78,
        transparentColor: 'rgba(255, 247, 237, 0)',
      },
      layers: [
        {
          backgroundImage:
            'linear-gradient(35deg, rgba(251, 146, 60, 0) 28%, rgba(254, 215, 170, 0.38) 62%, rgba(255, 255, 255, 0.12) 100%)',
          opacity: 0.78,
        },
      ],
      mutedTextColor: '#ffedd5',
      textColor: '#fff7ed',
    },
  }),
  defineGradientTemplate({
    id: 'gradient-mist',
    name: 'Gradient Mist',
    description:
      'Airy pearl, lavender, and sky card with a centered title composition.',
    style: 'centered',
    preset: {
      backgroundColor: '#f8fafc',
      backgroundImage:
        'linear-gradient(135deg, #f8fafc 0%, #e9d5ff 48%, #bfdbfe 100%)',
      drift: {
        angle: 116,
        color: 'rgba(255, 255, 255, 0.28)',
        opacity: 0.74,
        transparentColor: 'rgba(255, 255, 255, 0)',
      },
      layers: [
        {
          backgroundImage:
            'linear-gradient(25deg, rgba(255, 255, 255, 0.72) 0%, rgba(255, 255, 255, 0) 52%, rgba(196, 181, 253, 0.28) 100%)',
          opacity: 0.84,
        },
      ],
      mutedTextColor: '#475569',
      textColor: '#1e1b4b',
    },
  }),
  defineGradientTemplate({
    id: 'gradient-horizon',
    name: 'Gradient Horizon',
    description: 'Layered ocean and indigo story card with bottom-anchored content.',
    style: 'float',
    preset: {
      backgroundColor: '#020617',
      backgroundImage:
        'linear-gradient(165deg, #020617 0%, #0e7490 34%, #22d3ee 52%, #4f46e5 74%, #1e1b4b 100%)',
      drift: {
        angle: 108,
        color: 'rgba(224, 242, 254, 0.14)',
        opacity: 0.78,
        transparentColor: 'rgba(224, 242, 254, 0)',
      },
      layers: [
        {
          backgroundImage:
            'linear-gradient(35deg, rgba(14, 165, 233, 0) 10%, rgba(125, 211, 252, 0.48) 46%, rgba(99, 102, 241, 0) 82%)',
          opacity: 0.72,
        },
        {
          backgroundImage:
            'linear-gradient(120deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 44%, rgba(196, 181, 253, 0.3) 100%)',
          opacity: 0.78,
        },
      ],
      mutedTextColor: '#e0f2fe',
      textColor: '#f0f9ff',
    },
  }),
  defineGradientTemplate({
    id: 'gradient-mono',
    name: 'Gradient Mono',
    description:
      'Layered graphite and silver card with a title-first reverse composition.',
    style: 'float-reverse',
    preset: {
      backgroundColor: '#09090b',
      backgroundImage:
        'linear-gradient(140deg, #09090b 0%, #27272a 28%, #71717a 52%, #3f3f46 74%, #18181b 100%)',
      drift: {
        angle: 120,
        color: 'rgba(255, 255, 255, 0.12)',
        opacity: 0.8,
        transparentColor: 'rgba(255, 255, 255, 0)',
      },
      layers: [
        {
          backgroundImage:
            'linear-gradient(115deg, rgba(255, 255, 255, 0) 22%, rgba(255, 255, 255, 0.34) 46%, rgba(255, 255, 255, 0) 70%)',
          opacity: 0.74,
        },
        {
          backgroundImage:
            'linear-gradient(30deg, rgba(59, 130, 246, 0.16) 0%, rgba(59, 130, 246, 0) 42%, rgba(244, 244, 245, 0.18) 76%, rgba(24, 24, 27, 0) 100%)',
          opacity: 0.76,
        },
      ],
      mutedTextColor: '#e4e4e7',
      textColor: '#fafafa',
    },
  }),
] as const satisfies readonly OgTemplate[]
