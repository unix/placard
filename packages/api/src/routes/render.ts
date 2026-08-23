import type { FastifyInstance, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

import { customLogoId, logoOptions } from '../../assets/logo/index.js'
import {
  defaultAuthor,
  defaultBrandName,
  defaultDate,
  defaultDescription,
  defaultLogoId,
  defaultLogoUrl,
  defaultTemplateId,
  defaultTitle,
  imageHeight,
  imageWidth,
  jsonContentType,
  maxAuthorItemLength,
  maxAuthorLength,
  maxBrandNameLength,
  maxDateLength,
  maxDescriptionLength,
  maxLogoIdLength,
  maxLogoUrlLength,
  maxTitleLength,
  pngContentType,
  renderCacheControl,
  renderFallbackFieldsHeader,
  svgContentType,
} from '../constants.js'
import {
  globalRenderBehaviorCatalog,
  globalRenderBehaviorFromUnknown,
} from '../og/behavior.js'
import type { GlobalRenderBehaviorField } from '../og/behavior.js'
import { renderInputFromUnknown, renderRequestFromUnknown } from '../og/input.js'
import { renderPng, renderSvg } from '../og/render.js'
import { templateMinifyOptions, templateOptions } from '../templates/index.js'
import { templateOptionsWithPreviews } from '../templates/previews.js'

const invalidPayload = (error: ZodError) => ({
  error: 'invalid_payload',
  message: error.issues.map(issue => issue.message),
  issues: error.issues,
})

const applyFallbackFieldsHeader = (
  reply: FastifyReply,
  fallbackFields: readonly GlobalRenderBehaviorField[],
) => {
  if (fallbackFields.length === 0) return reply
  return reply.header(renderFallbackFieldsHeader, fallbackFields.join(', '))
}

const previewFlagEnabled = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(previewFlagEnabled)
  return value === '1'
}

const templateOptionsForQuery = async (query: unknown) => {
  if (query == null || typeof query !== 'object') return templateOptions
  if (!previewFlagEnabled(Reflect.get(query, 'preview'))) return templateOptions
  return templateOptionsWithPreviews(templateOptions)
}

export const registerRenderRoutes = async (app: FastifyInstance) => {
  app.get('/api/templates-minify', async (_request, reply) =>
    reply.type(jsonContentType).send(templateMinifyOptions),
  )

  app.get('/api/templates', async (request, reply) =>
    reply.type(jsonContentType).send({
      defaults: {
        author: defaultAuthor,
        brandName: defaultBrandName,
        date: defaultDate,
        description: defaultDescription,
        logoId: defaultLogoId,
        logoUrl: defaultLogoUrl,
        template: defaultTemplateId,
        title: defaultTitle,
      },
      image: { height: imageHeight, width: imageWidth },
      limits: {
        author: maxAuthorLength,
        authorItem: maxAuthorItemLength,
        brandName: maxBrandNameLength,
        date: maxDateLength,
        description: maxDescriptionLength,
        logoId: maxLogoIdLength,
        logoUrl: maxLogoUrlLength,
        title: maxTitleLength,
      },
      logos: {
        customId: customLogoId,
        defaultId: defaultLogoId,
        items: logoOptions,
      },
      renderBehavior: globalRenderBehaviorCatalog,
      templates: await templateOptionsForQuery(request.query),
    }),
  )

  app.get('/render.svg', async (request, reply) => {
    try {
      const input = renderInputFromUnknown(request.query)
      const { behavior, fallbackFields } = globalRenderBehaviorFromUnknown(
        request.query,
      )
      const svg = await renderSvg(input, behavior)
      return applyFallbackFieldsHeader(reply, fallbackFields)
        .header('Cache-Control', renderCacheControl)
        .type(svgContentType)
        .send(svg)
    } catch (error) {
      if (error instanceof ZodError)
        return reply.status(400).type(jsonContentType).send(invalidPayload(error))
      throw error
    }
  })

  app.get('/render.png', async (request, reply) => {
    try {
      const input = renderInputFromUnknown(request.query)
      const { behavior, fallbackFields } = globalRenderBehaviorFromUnknown(
        request.query,
      )
      const png = await renderPng(input, behavior)
      return applyFallbackFieldsHeader(reply, fallbackFields)
        .header('Cache-Control', renderCacheControl)
        .type(pngContentType)
        .send(png)
    } catch (error) {
      if (error instanceof ZodError)
        return reply.status(400).type(jsonContentType).send(invalidPayload(error))
      throw error
    }
  })

  app.post('/api/render', async (request, reply) => {
    try {
      const requestInput = renderRequestFromUnknown(request.body)
      const { behavior, fallbackFields } = globalRenderBehaviorFromUnknown(
        request.body,
      )
      const { format, ...input } = requestInput
      if (format === 'svg') {
        const svg = await renderSvg(input, behavior)
        return applyFallbackFieldsHeader(reply, fallbackFields)
          .type(svgContentType)
          .send(svg)
      }

      const png = await renderPng(input, behavior)
      return applyFallbackFieldsHeader(reply, fallbackFields)
        .type(pngContentType)
        .send(png)
    } catch (error) {
      if (error instanceof ZodError)
        return reply.status(400).type(jsonContentType).send(invalidPayload(error))
      throw error
    }
  })
}
