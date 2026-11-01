import { fromJsx } from '@takumi-rs/helpers/jsx'
import { createElement } from 'react'
import type { CSSProperties, ReactElement } from 'react'

import {
  defaultRemoteImageMaxBytes,
  defaultRemoteImageTimeoutMs,
  imageHeight,
  imageWidth,
} from '../constants.js'
import { renderTemplate } from '../templates/index.js'
import { defaultGlobalRenderBehavior } from './behavior.js'
import type { GlobalRenderBehavior } from './behavior.js'
import { readyRenderer } from './fonts.js'
import type { RenderInput } from './input.js'
import { prepareRemoteImages } from './remote-image.js'
import type { RemoteImageOptions } from './remote-image.js'
import { renderContextForInput } from './render-context.js'

const defaultRemoteImageOptions = {
  maxBytes: defaultRemoteImageMaxBytes,
  timeoutMs: defaultRemoteImageTimeoutMs,
} satisfies RemoteImageOptions

const framedRender = (
  rendered: ReactElement,
  behavior: GlobalRenderBehavior,
): ReactElement => {
  const usesDefaultFrame =
    behavior.canvasColor === defaultGlobalRenderBehavior.canvasColor &&
    behavior.canvasPadding === defaultGlobalRenderBehavior.canvasPadding &&
    behavior.canvasRadius === defaultGlobalRenderBehavior.canvasRadius &&
    behavior.contentRadius === defaultGlobalRenderBehavior.contentRadius
  if (usesDefaultFrame) return rendered

  const contentRadius =
    behavior.contentRadius === 'auto'
      ? Math.max(behavior.canvasRadius - behavior.canvasPadding, 0)
      : behavior.contentRadius

  const canvasStyle: CSSProperties = {
    width: imageWidth,
    height: imageHeight,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  }
  const canvasLayerStyle: CSSProperties = {
    width: imageWidth,
    height: imageHeight,
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: behavior.canvasColor,
    borderRadius: behavior.canvasRadius,
    flexShrink: 0,
  }
  const contentClippingStyle: CSSProperties = {
    position: 'absolute',
    top: behavior.canvasPadding,
    right: behavior.canvasPadding,
    bottom: behavior.canvasPadding,
    left: behavior.canvasPadding,
    display: 'flex',
    overflow: 'hidden',
    borderRadius: contentRadius,
  }
  const renderedStyle: CSSProperties = {
    width: imageWidth,
    height: imageHeight,
    display: 'flex',
    position: 'absolute',
    top: -behavior.canvasPadding,
    left: -behavior.canvasPadding,
    flexShrink: 0,
  }

  return createElement(
    'div',
    { style: canvasStyle },
    createElement(
      'div',
      { style: canvasLayerStyle },
      createElement(
        'div',
        { style: contentClippingStyle },
        createElement('div', { style: renderedStyle }, rendered),
      ),
    ),
  )
}

const renderNode = async (input: RenderInput, behavior: GlobalRenderBehavior) => {
  const context = renderContextForInput(input, behavior)
  return fromJsx(framedRender(renderTemplate(input, context), behavior))
}

const renderResources = async (
  input: RenderInput,
  behavior: GlobalRenderBehavior,
  remoteImages: RemoteImageOptions,
) => {
  const [{ node, stylesheets }, renderer] = await Promise.all([
    renderNode(input, behavior),
    readyRenderer(),
  ])
  const images = await prepareRemoteImages(node, remoteImages)
  return { images, node, renderer, stylesheets }
}

export const renderPng = async (
  input: RenderInput,
  behavior: GlobalRenderBehavior = defaultGlobalRenderBehavior,
  remoteImages: RemoteImageOptions = defaultRemoteImageOptions,
) => {
  const { images, node, renderer, stylesheets } = await renderResources(
    input,
    behavior,
    remoteImages,
  )
  return renderer.render(node, {
    width: imageWidth,
    height: imageHeight,
    format: 'png',
    images,
    lang: behavior.lang,
    stylesheets,
  })
}

export const renderSvg = async (
  input: RenderInput,
  behavior: GlobalRenderBehavior = defaultGlobalRenderBehavior,
  remoteImages: RemoteImageOptions = defaultRemoteImageOptions,
) => {
  const { images, node, renderer, stylesheets } = await renderResources(
    input,
    behavior,
    remoteImages,
  )
  return renderer.renderSvg(node, {
    width: imageWidth,
    height: imageHeight,
    images,
    lang: behavior.lang,
    stylesheets,
  })
}
