import type { RenderInput } from '../og/input.js'
import {
  authorText,
  brandText,
  dateText,
  descriptionText,
  px,
  TextBlock,
  titleLineHeight,
  titleSize,
  titleText,
} from './shared.js'
import type { TemplateField } from './types.js'

export const systemFontFamily = "Geist Mono, 'Noto Sans SC'"

export const systemTemplateFields = [
  'title',
  'description',
  'author',
  'date',
] as const satisfies readonly TemplateField[]

export const systemBrandTemplateFields = [
  'brandName',
  ...systemTemplateFields,
] as const satisfies readonly TemplateField[]

export const systemBrandText = (input: RenderInput) => brandText(input)

export const systemCodeText = (value: string) =>
  value.trim().toUpperCase().split(/\s+/).join('_\u200b')

const systemTextJustification = (textAlign: 'center' | 'left' | 'right') => {
  if (textAlign === 'center') return 'center'
  if (textAlign === 'right') return 'flex-end'
  return 'flex-start'
}

export const systemMetaText = (input: RenderInput) => {
  const items = [authorText(input), dateText(input)].filter((item): item is string =>
    Boolean(item),
  )
  if (items.length === 0) return null
  return items.join(' / ')
}

export const SystemTitle = ({
  color,
  input,
  sizes,
  textAlign = 'left',
  transform,
  width = 1092,
}: {
  readonly color: string
  readonly input: RenderInput
  readonly sizes: {
    readonly large: number
    readonly medium: number
    readonly small: number
  }
  readonly textAlign?: 'center' | 'left' | 'right'
  readonly transform?: (value: string) => string
  readonly width?: number
}) => {
  const title = titleText(input)
  const displayTitle = transform ? transform(title) : title

  return (
    <TextBlock
      color={color}
      fontFamily={systemFontFamily}
      fontSize={titleSize(title, sizes)}
      fontWeight={600}
      letterSpacing={-1.8}
      lineHeight={titleLineHeight(title, 1.16)}
      style={{
        justifyContent: systemTextJustification(textAlign),
        lineClamp: 3,
        textAlign,
        width: px(width),
      }}>
      {displayTitle}
    </TextBlock>
  )
}

export const SystemDescription = ({
  color,
  input,
  size = 19,
  textAlign = 'left',
  width = 1000,
}: {
  readonly color: string
  readonly input: RenderInput
  readonly size?: number
  readonly textAlign?: 'center' | 'left' | 'right'
  readonly width?: number
}) => {
  const description = descriptionText(input)
  if (!description) return null

  return (
    <TextBlock
      color={color}
      fontFamily={systemFontFamily}
      fontSize={px(size)}
      fontWeight={400}
      lineHeight={1.45}
      style={{
        justifyContent: systemTextJustification(textAlign),
        lineClamp: 2,
        textAlign,
        width: px(width),
      }}>
      {description}
    </TextBlock>
  )
}

export const SystemMeta = ({
  color,
  input,
  size = 16,
}: {
  readonly color: string
  readonly input: RenderInput
  readonly size?: number
}) => {
  const meta = systemMetaText(input)
  if (!meta) return null

  return (
    <TextBlock
      color={color}
      fontFamily={systemFontFamily}
      fontSize={px(size)}
      fontWeight={400}
      style={{ lineClamp: 1 }}>
      {meta}
    </TextBlock>
  )
}
