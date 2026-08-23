import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const customLogoId = 'custom'
export const noLogoId = 'none'
export const defaultLogoId = noLogoId

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url))
const compiledPackageDirectory = path.resolve(moduleDirectory, '..', '..')
const packageDirectory =
  path.basename(compiledPackageDirectory) === 'dist'
    ? path.resolve(compiledPackageDirectory, '..')
    : compiledPackageDirectory
const logoDirectory = path.join(packageDirectory, 'assets', 'logo')

const svgDataUrl = (fileName: string) => {
  const svg = readFileSync(path.join(logoDirectory, fileName))
  return `data:image/svg+xml;base64,${svg.toString('base64')}`
}

export const logos = [
  { id: 'nore-dark', name: 'Nore Dark', src: svgDataUrl('nore-dark.svg') },
  { id: 'nore-white', name: 'Nore White', src: svgDataUrl('nore-white.svg') },
  { id: 'secret-dark', name: 'Secret Dark', src: svgDataUrl('secret-dark.svg') },
  {
    id: 'secret-light',
    name: 'Secret Light',
    src: svgDataUrl('secret-light.svg'),
  },
  { id: 'unui-dark', name: 'UNUI Dark', src: svgDataUrl('unui-dark.svg') },
  { id: 'unui-white', name: 'UNUI White', src: svgDataUrl('unui-white.svg') },
] as const

export type BuiltInLogoId = (typeof logos)[number]['id']

export const logoOptions = logos.map(({ id, name, src }) => ({ id, name, src }))
export const logoForId = (id: string) => logos.find(logo => logo.id === id)
