import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'

import { customLogoId, logoOptions, noLogoId } from '../../assets/logo/index.js'
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
import { RemoteImageError } from '../og/remote-image.js'
import type { RemoteImageOptions } from '../og/remote-image.js'
import { renderPng, renderSvg } from '../og/render.js'
import { templateMinifyOptions, templateOptions } from '../templates/index.js'

const invalidPayload = (error: ZodError) => ({
  error: 'invalid_payload',
  message: error.issues.map(issue => issue.message),
  issues: error.issues,
})

const invalidRemoteImage = {
  error: 'invalid_remote_image',
  message: 'Remote logo could not be loaded safely',
}

export interface RegisterRenderRoutesOptions {
  readonly remoteImages: Omit<RemoteImageOptions, 'signal'>
}

const applyFallbackFieldsHeader = (
  reply: FastifyReply,
  fallbackFields: readonly GlobalRenderBehaviorField[],
) => {
  if (fallbackFields.length === 0) return reply
  return reply.header(renderFallbackFieldsHeader, fallbackFields.join(', '))
}

const handleRenderError = (
  error: unknown,
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  if (error instanceof ZodError)
    return reply.status(400).type(jsonContentType).send(invalidPayload(error))
  if (error instanceof RemoteImageError) {
    request.log.warn(
      { ip: request.ip, route: request.routeOptions.url },
      'remote image rejected',
    )
    return reply.status(400).type(jsonContentType).send(invalidRemoteImage)
  }
  throw error
}

export const registerRenderRoutes = async (
  app: FastifyInstance,
  { remoteImages }: RegisterRenderRoutesOptions,
) => {
  app.get(
    '/api/templates-minify',
    { config: { rateLimit: false } },
    async (_request, reply) =>
      reply.type(jsonContentType).send(templateMinifyOptions),
  )

  app.get(
    '/api/templates',
    { config: { rateLimit: false } },
    async (_request, reply) =>
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
          noneId: noLogoId,
        },
        renderBehavior: globalRenderBehaviorCatalog,
        templates: templateOptions,
      }),
  )

  app.get('/api/render.svg', async (request, reply) => {
    try {
      const input = renderInputFromUnknown(request.query)
      const { behavior, fallbackFields } = globalRenderBehaviorFromUnknown(
        request.query,
      )
      const svg = await renderSvg(input, behavior, {
        ...remoteImages,
        signal: request.signal,
      })
      return applyFallbackFieldsHeader(reply, fallbackFields)
        .header('Cache-Control', renderCacheControl)
        .type(svgContentType)
        .send(svg)
    } catch (error) {
      return handleRenderError(error, request, reply)
    }
  })

  app.get('/api/render.png', async (request, reply) => {
    try {
      const input = renderInputFromUnknown(request.query)
      const { behavior, fallbackFields } = globalRenderBehaviorFromUnknown(
        request.query,
      )
      const png = await renderPng(input, behavior, {
        ...remoteImages,
        signal: request.signal,
      })
      return applyFallbackFieldsHeader(reply, fallbackFields)
        .header('Cache-Control', renderCacheControl)
        .type(pngContentType)
        .send(png)
    } catch (error) {
      return handleRenderError(error, request, reply)
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
        const svg = await renderSvg(input, behavior, {
          ...remoteImages,
          signal: request.signal,
        })
        return applyFallbackFieldsHeader(reply, fallbackFields)
          .type(svgContentType)
          .send(svg)
      }

      const png = await renderPng(input, behavior, {
        ...remoteImages,
        signal: request.signal,
      })
      return applyFallbackFieldsHeader(reply, fallbackFields)
        .type(pngContentType)
        .send(png)
    } catch (error) {
      return handleRenderError(error, request, reply)
    }
  })
}
