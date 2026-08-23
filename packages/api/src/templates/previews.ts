import type { OgTemplateMeta } from './index.js'
import { renderInputFromUnknown } from '../og/input.js'
import { renderSvg } from '../og/render.js'

export type OgTemplateMetaWithPreview = OgTemplateMeta & {
  readonly previewSvg: string
}

const previewSvgCache = new Map<string, Promise<string>>()

const previewInputForTemplate = (templateId: string) =>
  renderInputFromUnknown({
    author: 'Nore',
    brandName: 'Nore OG',
    date: '2026-08-22',
    description: 'A programmable, self-hosted Open Graph image renderer by Nore.',
    logoId: 'nore-dark',
    template: templateId,
    title: 'Make every shared link unmistakably yours.',
  })

const previewSvgForTemplateId = (templateId: string) => {
  const cachedSvg = previewSvgCache.get(templateId)
  if (cachedSvg) return cachedSvg

  const svg = renderSvg(previewInputForTemplate(templateId))
  previewSvgCache.set(templateId, svg)
  return svg
}

export const templateOptionsWithPreviews = async (
  templateOptions: readonly OgTemplateMeta[],
): Promise<OgTemplateMetaWithPreview[]> =>
  Promise.all(
    templateOptions.map(async template => ({
      ...template,
      previewSvg: await previewSvgForTemplateId(template.id),
    })),
  )
