import { z } from 'zod'

import {
  defaultAuthor,
  defaultBrandName,
  defaultDate,
  defaultDescription,
  defaultLogoId,
  defaultLogoUrl,
  defaultTemplateId,
  defaultTitle,
  maxAuthorItemLength,
  maxAuthorLength,
  maxBrandNameLength,
  maxDateLength,
  maxDescriptionLength as defaultMaxDescriptionLength,
  maxLogoIdLength,
  maxLogoUrlLength,
  maxTemplateIdLength,
  maxTitleLength as defaultMaxTitleLength,
} from '../constants.js'
import { customLogoId, logoForId } from '../../assets/logo/index.js'
import { minTruncationLength, textLength, truncateText } from './text-length.js'
import { allowedRemoteImageUrl } from './remote-image.js'
import { templateIdForId } from '../templates/index.js'

const formatSchema = z.enum(['png', 'svg']).default('png')

const stringFromUnknown = (value: unknown) => {
  if (Array.isArray(value)) return stringFromUnknown(value.at(0))
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined
  return trimmed
}

const numberFromUnknown = (value: unknown) => {
  if (Array.isArray(value)) return numberFromUnknown(value.at(0))
  if (value === null || value === undefined) return undefined
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return value
  const trimmed = value.trim()
  if (trimmed.length === 0) return undefined
  return Number(trimmed)
}

const stringField = (fallback: string, maxLength: number) =>
  z.preprocess(stringFromUnknown, z.string().max(maxLength).default(fallback))

const templateIdField = z.preprocess(
  stringFromUnknown,
  z
    .string()
    .max(maxTemplateIdLength)
    .default(defaultTemplateId)
    .transform(templateIdForId),
)

const textField = (fallback: string) =>
  z.preprocess(stringFromUnknown, z.string().default(fallback))

const textLengthLimitField = (fallback: number, maxLength: number) =>
  z.preprocess(
    numberFromUnknown,
    z.number().int().min(minTruncationLength).max(maxLength).default(fallback),
  )

const logoIdField = z.preprocess(
  stringFromUnknown,
  z
    .string()
    .max(maxLogoIdLength)
    .default(defaultLogoId)
    .transform(value => {
      if (value === customLogoId || value === defaultLogoId || logoForId(value))
        return value
      return defaultLogoId
    }),
)

const stringsFromUnknown = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.flatMap(stringsFromUnknown)
  const text = stringFromUnknown(value)
  if (!text) return []
  return [text]
}

const authorsFromUnknown = (value: unknown) =>
  stringsFromUnknown(value).map(author => truncateText(author, maxAuthorItemLength))

const authorTextFromAuthors = (authors: readonly string[]) => {
  if (authors.length === 0) return defaultAuthor
  const allAuthors = authors.join(', ')
  if (textLength(allAuthors) <= maxAuthorLength) return allAuthors

  for (let visibleCount = authors.length - 1; visibleCount > 0; visibleCount -= 1) {
    const hiddenCount = authors.length - visibleCount
    const authorText = `${authors.slice(0, visibleCount).join(', ')} +${hiddenCount}`
    if (textLength(authorText) <= maxAuthorLength) return authorText
  }

  return `${authors[0]} +${authors.length - 1}`
}

const authorField = z.preprocess(
  authorsFromUnknown,
  z.array(z.string()).transform(authorTextFromAuthors),
)

const inputObjectFromUnknown = (value: unknown) => {
  if (value == null) return {}
  if (typeof value === 'string' && value.trim().length === 0) return {}
  if (typeof value !== 'object' || Array.isArray(value)) return value
  if ('author' in value || !('author[]' in value)) return value
  return { ...value, author: Reflect.get(value, 'author[]') }
}

const renderInputObjectSchema = z
  .object({
    title: textField(defaultTitle),
    description: textField(defaultDescription),
    maxTitleLength: textLengthLimitField(
      defaultMaxTitleLength,
      defaultMaxTitleLength,
    ),
    maxDescriptionLength: textLengthLimitField(
      defaultMaxDescriptionLength,
      defaultMaxDescriptionLength,
    ),
    author: authorField,
    date: stringField(defaultDate, maxDateLength),
    brandName: stringField(defaultBrandName, maxBrandNameLength),
    logoId: logoIdField,
    logoUrl: stringField(defaultLogoUrl, maxLogoUrlLength),
    template: templateIdField,
  })
  .superRefine((input, context) => {
    if (input.logoId !== customLogoId) return
    if (!input.logoUrl) {
      context.addIssue({
        code: 'custom',
        message: 'Custom logo URL is required.',
        path: ['logoUrl'],
      })
      return
    }

    if (allowedRemoteImageUrl(input.logoUrl)) return
    context.addIssue({
      code: 'custom',
      message: 'Custom logo URL must be a public HTTPS URL.',
      path: ['logoUrl'],
    })
  })

type RenderInputObject = z.infer<typeof renderInputObjectSchema>

const inputWithTruncatedText = ({
  maxDescriptionLength,
  maxTitleLength,
  ...input
}: RenderInputObject) => ({
  ...input,
  description: truncateText(input.description, maxDescriptionLength),
  title: truncateText(input.title, maxTitleLength),
})

export const renderInputSchema = z
  .preprocess(inputObjectFromUnknown, renderInputObjectSchema)
  .transform(inputWithTruncatedText)

const renderRequestObjectSchema = renderInputObjectSchema.extend({
  format: z.preprocess(stringFromUnknown, formatSchema),
})

export const renderRequestSchema = z
  .preprocess(inputObjectFromUnknown, renderRequestObjectSchema)
  .transform(value => {
    const { format, ...input } = value
    return { ...inputWithTruncatedText(input), format }
  })

export type RenderInput = z.infer<typeof renderInputSchema>
export type RenderRequest = z.infer<typeof renderRequestSchema>

export const renderInputFromUnknown = (value: unknown) =>
  renderInputSchema.parse(value)

export const renderRequestFromUnknown = (value: unknown) =>
  renderRequestSchema.parse(value)
