import type { ReactElement } from 'react'

import { defaultTemplateId } from '../constants.js'
import type { RenderInput } from '../og/input.js'
import type { RenderContext } from '../og/render-context.js'
import { communityAppleFinancialTemplate } from './community-apple-financial.js'
import { fixedTemplates } from './fixed-series.js'
import { gradientTemplates } from './gradient-series.js'
import { gridTemplates } from './grid-series.js'
import { noreBlueprintTemplate } from './nore-blueprint.js'
import { noreCentralTemplate } from './nore-central.js'
import { noreLogoOnlyDarkTemplate } from './nore-logo-only-dark.js'
import { noreLogoOnlyTemplate } from './nore-logo-only.js'
import { template as noreMinimalTemplate } from './nore-minimal.js'
import { noreNightTemplate } from './nore-night.js'
import { noreReportTemplate } from './nore-report.js'
import { noreSignalTemplate } from './nore-signal.js'
import { noreSpotlightTemplate } from './nore-spotlight.js'
import { noreStackTemplate } from './nore-stack.js'
import { systemBiosTemplate } from './system-bios.js'
import { systemKernelPanicTemplate } from './system-kernel-panic.js'
import { template as systemShellTemplate } from './system-shell.js'
import type { OgTemplate } from './types.js'

export type { OgTemplate, OgTemplateMeta, TemplateField } from './types.js'

export const templates = [
  noreMinimalTemplate,
  noreLogoOnlyTemplate,
  noreLogoOnlyDarkTemplate,
  noreReportTemplate,
  noreNightTemplate,
  noreSpotlightTemplate,
  noreStackTemplate,
  noreSignalTemplate,
  noreBlueprintTemplate,
  noreCentralTemplate,
  ...gradientTemplates,
  ...gridTemplates,
  ...fixedTemplates,
  systemShellTemplate,
  systemKernelPanicTemplate,
  systemBiosTemplate,
  communityAppleFinancialTemplate,
] as const satisfies readonly OgTemplate[]

export const templateOptions = templates.map(
  ({ description, fields, id, name }) => ({ description, fields, id, name }),
)

export const templateMinifyOptions = templates.map(({ description, id, name }) => ({
  description,
  id,
  name,
}))

const fallbackTemplate =
  templates.find(template => template.id === defaultTemplateId) ?? templates[0]

export const templateForId = (id: string): OgTemplate =>
  templates.find(template => template.id === id.trim()) ?? fallbackTemplate

export const templateIdForId = (id: string) => templateForId(id).id

export const renderTemplate = (
  input: RenderInput,
  context: RenderContext,
): ReactElement => templateForId(input.template).render(input, context)
