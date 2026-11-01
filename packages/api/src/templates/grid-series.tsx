import type { ReactElement, ReactNode } from 'react'

import { imageHeight, imageWidth } from '../constants.js'
import type { RenderContext } from '../og/render-context.js'
import {
  fieldsForKnownTemplateStyle,
  renderKnownTemplateStyle,
  type KnownTemplateStyle,
} from './known-template-styles.js'
import { cardStyle, sansFontFamily } from './shared.js'
import type { OgTemplate } from './types.js'

type GridPatternKind = 'dot' | 'hexagon' | 'pattern'
type GridCoordinate = readonly [column: number, row: number]

export interface GridPreset {
  readonly accentColor: string
  readonly backgroundColor: string
  readonly backdrop: string
  readonly mutedTextColor: string
  readonly patternColor: string
  readonly patternKind: GridPatternKind
  readonly textColor: string
}

interface GridTemplateDefinition {
  readonly description: string
  readonly id: string
  readonly name: string
  readonly preset: GridPreset
  readonly style: KnownTemplateStyle
}

const svgDataUrl = (svg: string) =>
  `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

const rounded = (value: number) => Math.round(value * 100) / 100

const uniqueCoordinates = (
  random: () => number,
  columns: number,
  rows: number,
  count: number,
): readonly GridCoordinate[] => {
  const coordinates = new Map<string, GridCoordinate>()
  const maximumCount = Math.min(count, columns * rows)

  while (coordinates.size < maximumCount) {
    const column = Math.floor(random() * columns)
    const row = Math.floor(random() * rows)
    coordinates.set(`${column}-${row}`, [column, row])
  }

  return [...coordinates.values()]
}

const squarePatternSvg = (preset: GridPreset, random: () => number) => {
  const size = 58
  const columns = Math.ceil(imageWidth / size) + 1
  const rows = Math.ceil(imageHeight / size) + 1
  const x = -Math.floor(random() * size)
  const y = -Math.floor(random() * size)
  const squares = uniqueCoordinates(random, columns, rows, 14)

  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" viewBox="0 0 ${imageWidth} ${imageHeight}">
  <defs>
    <pattern id="grid-pattern" width="${size}" height="${size}" patternUnits="userSpaceOnUse" x="${x}" y="${y}">
      <path d="M.5 ${size}V.5H${size}" fill="none" stroke="${preset.patternColor}" stroke-opacity=".34" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid-pattern)"/>
  <g transform="translate(${x} ${y})">
    ${squares
      .map(
        ([column, row]) =>
          `<rect x="${column * size + 1}" y="${row * size + 1}" width="${size - 1}" height="${size - 1}" fill="${preset.accentColor}" fill-opacity=".12"/>`,
      )
      .join('')}
  </g>
</svg>`)
}

const dotPatternSvg = (preset: GridPreset, random: () => number) => {
  const size = 28
  const dotOffset = 2
  const columns = Math.ceil(imageWidth / size) + 1
  const rows = Math.ceil(imageHeight / size) + 1
  const x = -Math.floor(random() * size)
  const y = -Math.floor(random() * size)
  const dots = uniqueCoordinates(random, columns, rows, 18)

  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" viewBox="0 0 ${imageWidth} ${imageHeight}">
  <defs>
    <pattern id="dot-pattern" width="${size}" height="${size}" patternUnits="userSpaceOnUse" x="${x}" y="${y}">
      <circle cx="${dotOffset}" cy="${dotOffset}" r="1.45" fill="${preset.patternColor}" fill-opacity=".62"/>
    </pattern>
    <radialGradient id="dot-glow">
      <stop offset="0" stop-color="${preset.accentColor}" stop-opacity=".72"/>
      <stop offset="1" stop-color="${preset.accentColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#dot-pattern)"/>
  <g transform="translate(${x} ${y})">
    ${dots
      .map(([column, row]) => {
        const cx = column * size + dotOffset
        const cy = row * size + dotOffset

        return `<circle cx="${cx}" cy="${cy}" r="12" fill="url(#dot-glow)"/><circle cx="${cx}" cy="${cy}" r="2.7" fill="${preset.accentColor}" fill-opacity=".92"/>`
      })
      .join('')}
  </g>
</svg>`)
}

const hexagonPoints = (cx: number, cy: number, radius: number) =>
  Array.from({ length: 6 }, (_, index) => {
    const angle = (index * Math.PI) / 3
    return `${rounded(cx + radius * Math.cos(angle))},${rounded(cy + radius * Math.sin(angle))}`
  }).join(' ')

const hexagonPatternSvg = (preset: GridPreset, random: () => number) => {
  const radius = 36
  const gap = 2
  const squareRootOfThree = Math.sqrt(3)
  const columnStep = (3 * radius) / 2 + (squareRootOfThree * gap) / 2
  const rowStep = squareRootOfThree * radius + gap
  const tileWidth = columnStep * 2
  const tileHeight = rowStep
  const patternCenters = [
    [columnStep / 2, rowStep / 2],
    [(columnStep * 3) / 2, 0],
    [(columnStep * 3) / 2, rowStep],
  ] as const
  const columns = Math.ceil(imageWidth / columnStep) + 1
  const rows = Math.ceil(imageHeight / rowStep) + 1
  const x = -Math.floor(random() * tileWidth)
  const y = -Math.floor(random() * tileHeight)
  const hexagons = uniqueCoordinates(random, columns, rows, 12)

  return svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}" viewBox="0 0 ${imageWidth} ${imageHeight}">
  <defs>
    <pattern id="hexagon-pattern" width="${rounded(tileWidth)}" height="${rounded(tileHeight)}" patternUnits="userSpaceOnUse" x="${x}" y="${y}">
      ${patternCenters
        .map(
          ([cx, cy]) =>
            `<polygon points="${hexagonPoints(cx, cy, radius)}" fill="none" stroke="${preset.patternColor}" stroke-opacity=".38" stroke-width="1"/>`,
        )
        .join('')}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#hexagon-pattern)"/>
  <g transform="translate(${x} ${y})">
    ${hexagons
      .map(([column, row]) => {
        const cx = column * columnStep + columnStep / 2
        const cy =
          column % 2 === 0 ? row * rowStep + rowStep / 2 : row * rowStep + rowStep

        return `<polygon points="${hexagonPoints(cx, cy, radius - 2)}" fill="${preset.accentColor}" fill-opacity=".13" stroke="${preset.accentColor}" stroke-opacity=".4" stroke-width="1"/>`
      })
      .join('')}
  </g>
</svg>`)
}

const patternImage = (preset: GridPreset, random: () => number) => {
  if (preset.patternKind === 'dot') return dotPatternSvg(preset, random)
  if (preset.patternKind === 'hexagon') return hexagonPatternSvg(preset, random)
  return squarePatternSvg(preset, random)
}

export const GridFrame = ({
  children,
  preset,
  random,
}: {
  readonly children: ReactNode
  readonly preset: GridPreset
  readonly random: RenderContext['random']
}): ReactElement => (
  <div
    style={{
      ...cardStyle,
      backgroundColor: preset.backgroundColor,
      color: preset.textColor,
      fontFamily: sansFontFamily,
    }}>
    <img
      alt=""
      height={imageHeight}
      src={patternImage(preset, random)}
      width={imageWidth}
      style={{
        display: 'flex',
        position: 'absolute',
        top: 0,
        left: 0,
        width: imageWidth,
        height: imageHeight,
        objectFit: 'cover',
      }}
    />
    <div
      style={{
        display: 'flex',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: preset.backdrop,
      }}
    />
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

const defineGridTemplate = ({
  description,
  id,
  name,
  preset,
  style,
}: GridTemplateDefinition): OgTemplate => ({
  description,
  fields: fieldsForKnownTemplateStyle(style),
  id,
  name,
  render: (input, context) => (
    <GridFrame preset={preset} random={context.random}>
      {renderKnownTemplateStyle(style, input, {
        foreground: preset.textColor,
        secondary: preset.mutedTextColor,
      })}
    </GridFrame>
  ),
})

export const gridPatternPreset = {
  accentColor: '#2563eb',
  backgroundColor: '#f8fafc',
  backdrop:
    'linear-gradient(90deg, rgba(248, 250, 252, 0.98) 0%, rgba(248, 250, 252, 0.91) 58%, rgba(248, 250, 252, 0.2) 100%)',
  mutedTextColor: '#475569',
  patternColor: '#64748b',
  patternKind: 'pattern',
  textColor: '#0f172a',
} as const satisfies GridPreset

export const gridTemplates = [
  defineGridTemplate({
    id: 'grid-pattern',
    name: 'Grid Pattern',
    description:
      'A light seeded square grid with a simple framed title composition.',
    style: 'around',
    preset: gridPatternPreset,
  }),
  defineGridTemplate({
    id: 'grid-dark',
    name: 'Grid Dark',
    description:
      'A graphite square grid with a logo-led title and summary composition.',
    style: 'float-summary',
    preset: {
      accentColor: '#a1a1aa',
      backgroundColor: '#202124',
      backdrop:
        'linear-gradient(90deg, rgba(32, 33, 36, 0.99) 0%, rgba(32, 33, 36, 0.91) 62%, rgba(32, 33, 36, 0.26) 100%)',
      mutedTextColor: '#a1a1aa',
      patternColor: '#f8fafc',
      patternKind: 'pattern',
      textColor: '#fafafa',
    },
  }),
  defineGridTemplate({
    id: 'grid-dot',
    name: 'Grid Dot',
    description: 'A deep dot matrix with a logo-led title and summary composition.',
    style: 'float-summary',
    preset: {
      accentColor: '#38bdf8',
      backgroundColor: '#070a12',
      backdrop:
        'linear-gradient(90deg, rgba(7, 10, 18, 0.99) 0%, rgba(7, 10, 18, 0.91) 58%, rgba(7, 10, 18, 0.18) 100%)',
      mutedTextColor: '#94a3b8',
      patternColor: '#64748b',
      patternKind: 'dot',
      textColor: '#f8fafc',
    },
  }),
  defineGridTemplate({
    id: 'grid-hexagon',
    name: 'Grid Hexagon',
    description:
      'A dark honeycomb field with a logo-led title and summary composition.',
    style: 'float-summary',
    preset: {
      accentColor: '#34d399',
      backgroundColor: '#06140f',
      backdrop:
        'linear-gradient(90deg, rgba(6, 20, 15, 0.99) 0%, rgba(6, 20, 15, 0.91) 58%, rgba(6, 20, 15, 0.16) 100%)',
      mutedTextColor: '#86efac',
      patternColor: '#34d399',
      patternKind: 'hexagon',
      textColor: '#ecfdf5',
    },
  }),
] as const satisfies readonly OgTemplate[]
