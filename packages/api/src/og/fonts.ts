import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Renderer } from '@takumi-rs/core'

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url))
const compiledPackageDirectory = path.resolve(moduleDirectory, '..', '..')
const packageDirectory =
  path.basename(compiledPackageDirectory) === 'dist'
    ? path.resolve(compiledPackageDirectory, '..')
    : compiledPackageDirectory
const fontsDirectory = path.join(packageDirectory, 'assets', 'fonts')

const fontFiles = [
  { file: 'Geist-Regular.ttf', name: 'Geist', weight: 400 },
  { file: 'Geist-SemiBold.ttf', name: 'Geist', weight: 600 },
  { file: 'GeistMono-Regular.ttf', name: 'Geist Mono', weight: 400 },
  { file: 'GeistMono-SemiBold.ttf', name: 'Geist Mono', weight: 600 },
  { file: 'NotoSansCJKsc-Regular.otf', name: 'Noto Sans SC', weight: 400 },
  { file: 'NotoSansCJKsc-Medium.otf', name: 'Noto Sans SC', weight: 500 },
] as const

const renderer = new Renderer()
let rendererPromise: Promise<Renderer> | undefined

const prepareRenderer = async () => {
  const fonts = await Promise.all(
    fontFiles.map(async font => ({
      ...font,
      data: await readFile(path.join(fontsDirectory, font.file)),
    })),
  )

  for (const font of fonts) await renderer.registerFont(font)
  return renderer
}

export const readyRenderer = () => {
  rendererPromise ??= prepareRenderer()
  return rendererPromise
}
