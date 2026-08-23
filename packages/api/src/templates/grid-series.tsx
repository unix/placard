import type { ReactElement } from 'react'

import { imageHeight, imageWidth } from '../constants.js'
import type { RenderInput } from '../og/input.js'
import type { RenderContext } from '../og/render-context.js'
import {
  cardStyle,
  descriptionText,
  Header,
  px,
  sansFontFamily,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { OgTemplate, OgTemplateMeta } from './types.js'

const gridTemplateFields = [
  'brandName',
  'logoId',
  'logoUrl',
  'title',
  'description',
  'author',
  'date',
] as const satisfies OgTemplateMeta['fields']

type GridPatternKind = 'dot' | 'hexagon' | 'pattern'
type GridCoordinate = readonly [column: number, row: number]

interface GridPreset {
  readonly accentColor: string
  readonly backgroundColor: string
  readonly backdrop: string
  readonly label: string
  readonly lineColor: string
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
        const cy = row * rowStep + rowStep / 2 + (column % 2 === 0 ? 0 : rowStep / 2)

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

const GridDescription = ({
  input,
  preset,
}: {
  readonly input: RenderInput
  readonly preset: GridPreset
}) => {
  const description = descriptionText(input)
  if (!description) return null

  return (
    <TextBlock
      color={preset.mutedTextColor}
      fontSize={px(24)}
      fontWeight={480}
      lineHeight={1.4}
      style={{ lineClamp: 3, marginTop: px(26), width: px(680) }}>
      {description}
    </TextBlock>
  )
}

const GridCard = (
  input: RenderInput,
  context: RenderContext,
  preset: GridPreset,
): ReactElement => {
  const title = titleText(input)
  const pattern = patternImage(preset, context.random)

  return (
    <div
      style={{
        ...cardStyle,
        backgroundColor: preset.backgroundColor,
        color: preset.textColor,
        fontFamily: sansFontFamily,
      }}>
      <img
        alt=""
        src={pattern}
        width={imageWidth}
        height={imageHeight}
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
          flexDirection: 'column',
          padding: px(64),
        }}>
        <Header
          brandColor={preset.textColor}
          input={input}
          metaColor={preset.mutedTextColor}
          separatorColor={preset.lineColor}
        />
        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                width: px(10),
                height: px(10),
                backgroundColor: preset.accentColor,
                marginRight: px(12),
              }}
            />
            <TextBlock
              color={preset.mutedTextColor}
              fontSize={px(16)}
              fontWeight={650}
              letterSpacing={1.6}
              lineHeight={1}>
              GRID / {preset.label}
            </TextBlock>
          </div>
          <div style={{ display: 'flex', marginTop: px(24) }}>
            <TextBlock
              color={preset.textColor}
              fontSize={titleSize(title, { large: 76, medium: 62, small: 49 })}
              fontWeight={700}
              letterSpacing={-1.5}
              lineHeight={titleLineHeight(title, 1.02)}
              style={{ textWrap: 'balance', width: px(800) }}>
              {title}
            </TextBlock>
          </div>
          <GridDescription input={input} preset={preset} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <div
            style={{
              display: 'flex',
              width: px(84),
              height: px(2),
              backgroundColor: preset.accentColor,
            }}
          />
          <TextBlock
            color={preset.mutedTextColor}
            fontSize={px(14)}
            fontWeight={560}
            letterSpacing={1.2}>
            1200 × 675
          </TextBlock>
        </div>
      </div>
    </div>
  )
}

const defineGridTemplate = ({
  description,
  id,
  name,
  preset,
}: GridTemplateDefinition): OgTemplate => ({
  description,
  fields: gridTemplateFields,
  id,
  name,
  render: (input, context) => GridCard(input, context, preset),
})

export const gridTemplates = [
  defineGridTemplate({
    id: 'grid-pattern',
    name: 'Grid Pattern',
    description:
      'Editorial light card with a seeded square grid and highlighted cells.',
    preset: {
      accentColor: '#2563eb',
      backgroundColor: '#f8fafc',
      backdrop:
        'linear-gradient(90deg, rgba(248, 250, 252, 0.98) 0%, rgba(248, 250, 252, 0.91) 58%, rgba(248, 250, 252, 0.2) 100%)',
      label: 'PATTERN',
      lineColor: '#cbd5e1',
      mutedTextColor: '#475569',
      patternColor: '#64748b',
      patternKind: 'pattern',
      textColor: '#0f172a',
    },
  }),
  defineGridTemplate({
    id: 'grid-dot',
    name: 'Grid Dot',
    description:
      'Deep navy card with a precise dot matrix and softly glowing points.',
    preset: {
      accentColor: '#38bdf8',
      backgroundColor: '#070a12',
      backdrop:
        'linear-gradient(90deg, rgba(7, 10, 18, 0.99) 0%, rgba(7, 10, 18, 0.91) 58%, rgba(7, 10, 18, 0.18) 100%)',
      label: 'DOT',
      lineColor: '#334155',
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
      'Dark emerald card with a honeycomb grid and highlighted hexagonal cells.',
    preset: {
      accentColor: '#34d399',
      backgroundColor: '#06140f',
      backdrop:
        'linear-gradient(90deg, rgba(6, 20, 15, 0.99) 0%, rgba(6, 20, 15, 0.91) 58%, rgba(6, 20, 15, 0.16) 100%)',
      label: 'HEXAGON',
      lineColor: '#14532d',
      mutedTextColor: '#86efac',
      patternColor: '#34d399',
      patternKind: 'hexagon',
      textColor: '#ecfdf5',
    },
  }),
] as const satisfies readonly OgTemplate[]
