import type { ReactElement } from 'react'

import type { RenderInput } from '../og/input.js'
import type { RenderContext } from '../og/render-context.js'

export type TemplateField = Exclude<keyof RenderInput, 'template'>
export type TemplateRenderer = (
  input: RenderInput,
  context: RenderContext,
) => ReactElement

export interface OgTemplateMeta {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly fields: readonly TemplateField[]
}

export interface OgTemplate extends OgTemplateMeta {
  readonly render: TemplateRenderer
}
