import type { ReactElement } from 'react'

import { defaultTemplateId } from '../constants.js'
import type { RenderInput } from '../og/input.js'
import type { RenderContext } from '../og/render-context.js'
import { blueprintTemplate } from './blueprint.js'
import { centralTemplate } from './central.js'
import { communityAppleFinancialTemplate } from './community-apple-financial.js'
import { defaultLogoIdForTemplate } from './default-logo.js'
import { fixedTemplates } from './fixed-series.js'
import { gradientTemplates } from './gradient-series.js'
import { gridTemplates } from './grid-series.js'
import { logoOnlyDarkTemplate } from './logo-only-dark.js'
import { logoOnlyTemplate } from './logo-only.js'
import { logoTemplates } from './logo-series.js'
import { template as minimalTemplate } from './minimal.js'
import { nightTemplate } from './night.js'
import { spotlightTemplate } from './spotlight.js'
import { stackTemplate } from './stack.js'
import { systemBiosTemplate } from './system-bios.js'
import { systemKernelPanicTemplate } from './system-kernel-panic.js'
import { template as systemShellTemplate } from './system-shell.js'
import type { OgTemplate } from './types.js'

export type { OgTemplate, OgTemplateMeta, TemplateField } from './types.js'

export const templates = [
  minimalTemplate,
  logoOnlyTemplate,
  logoOnlyDarkTemplate,
  nightTemplate,
  spotlightTemplate,
  stackTemplate,
  blueprintTemplate,
  centralTemplate,
  ...logoTemplates,
  ...gradientTemplates,
  ...gridTemplates,
  ...fixedTemplates,
  systemShellTemplate,
  systemKernelPanicTemplate,
  systemBiosTemplate,
  communityAppleFinancialTemplate,
] as const satisfies readonly OgTemplate[]

export const templateOptions = templates.map(
  ({ description, fields, id, name }) => ({
    defaultLogoId: defaultLogoIdForTemplate(id),
    description,
    fields,
    id,
    name,
  }),
)

export const templateMinifyOptions = templateOptions.map(
  ({ defaultLogoId, description, id, name }) => ({
    defaultLogoId,
    description,
    id,
    name,
  }),
)

const fallbackTemplate =
  templates.find(template => template.id === defaultTemplateId) ?? templates[0]

export const templateForId = (id: string): OgTemplate =>
  templates.find(template => template.id === id.trim()) ?? fallbackTemplate

export const templateIdForId = (id: string) => templateForId(id).id

export const renderTemplate = (
  input: RenderInput,
  context: RenderContext,
): ReactElement => templateForId(input.template).render(input, context)
