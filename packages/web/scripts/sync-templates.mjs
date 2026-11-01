import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { access, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

const schemaVersion = 1
const defaultApiBaseUrl = 'http://localhost:3003'
const defaultConcurrency = 8
const requestTimeoutMs = 15_000
const waitAttempts = 20
const waitIntervalMs = 500
const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const environmentPath = join(scriptDirectory, '..', '.env')
if (existsSync(environmentPath)) loadEnvFile(environmentPath)
const outputDirectory = join(
  scriptDirectory,
  '..',
  'public',
  'generated',
  'templates',
)
const manifestPath = join(outputDirectory, 'manifest.json')
const templatesPath = join(outputDirectory, 'templates.json')
const argumentsSet = new Set(process.argv.slice(2))
const force = argumentsSet.has('--force')
const waitForServer = argumentsSet.has('--wait')

const apiBaseUrl = (
  process.env.TEMPLATES_SYNC_API_BASE_URL?.trim() ||
  process.env.PUBLIC_API_BASE_URL?.trim() ||
  defaultApiBaseUrl
).replace(/\/$/, '')
const token = process.env.TEMPLATES_SYNC_TOKEN?.trim()
const requestHeaders = token ? { Authorization: `Bearer ${token}` } : undefined
const configuredConcurrency = Number.parseInt(
  process.env.TEMPLATES_SYNC_CONCURRENCY ?? '',
  10,
)
const concurrency =
  Number.isInteger(configuredConcurrency) && configuredConcurrency > 0
    ? Math.min(configuredConcurrency, 16)
    : defaultConcurrency

const wait = durationMs =>
  new Promise(resolve => globalThis.setTimeout(resolve, durationMs))

const fetchText = async path => {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: requestHeaders,
    signal: AbortSignal.timeout(requestTimeoutMs),
  })
  if (!response.ok) throw new Error(`${path} returned HTTP ${response.status}`)
  return response.text()
}

const fetchInitialSnapshot = async () => {
  const attempts = waitForServer ? waitAttempts : 1
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetchText('/api/templates-minify')
    } catch (error) {
      lastError = error
      if (attempt === attempts) break
      await wait(waitIntervalMs)
    }
  }
  throw lastError
}

const templatesFromText = text => {
  const value = JSON.parse(text)
  if (!Array.isArray(value))
    throw new Error('/api/templates-minify did not return an array')

  const ids = new Set()
  return value.map(template => {
    if (
      !template ||
      typeof template !== 'object' ||
      typeof template.description !== 'string' ||
      typeof template.id !== 'string' ||
      typeof template.name !== 'string' ||
      !/^[a-z0-9][a-z0-9-]*$/.test(template.id)
    )
      throw new Error('/api/templates-minify returned an invalid template')
    if (ids.has(template.id))
      throw new Error(`/api/templates-minify returned duplicate ID ${template.id}`)
    ids.add(template.id)
    return {
      description: template.description,
      id: template.id,
      name: template.name,
    }
  })
}

const readManifest = async () => {
  try {
    return JSON.parse(await readFile(manifestPath, 'utf8'))
  } catch {
    return null
  }
}

const snapshotIsComplete = async templates => {
  try {
    await access(templatesPath)
    await Promise.all(
      templates.map(template =>
        access(join(outputDirectory, 'thumbnails', `${template.id}.svg`)),
      ),
    )
    return true
  } catch {
    return false
  }
}

const existingSnapshotIsUsable = async () => {
  try {
    const templates = templatesFromText(await readFile(templatesPath, 'utf8'))
    return (await readManifest()) !== null && snapshotIsComplete(templates)
  } catch {
    return false
  }
}

const thumbnailPath = templateId => {
  const search = new URLSearchParams({
    author: 'Nore',
    brandName: 'Placard',
    date: '2026-08-22',
    description: 'An open-source social image renderer.',
    logoId: 'nore-dark',
    seed: 'catalog-preview',
    template: templateId,
    title: 'Make every shared link unmistakably yours.',
  })
  return `/api/render.svg?${search}`
}

const fetchThumbnails = async templates => {
  const thumbnails = new Array(templates.length)
  let nextIndex = 0
  const worker = async () => {
    while (nextIndex < templates.length) {
      const index = nextIndex
      nextIndex += 1
      const template = templates[index]
      thumbnails[index] = {
        id: template.id,
        svg: await fetchText(thumbnailPath(template.id)),
      }
    }
  }
  const workerCount = Math.min(concurrency, templates.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return thumbnails
}

const replaceSnapshot = async (templates, thumbnails, sourceHash) => {
  const outputParent = dirname(outputDirectory)
  const temporaryDirectory = join(
    outputParent,
    `.templates-${process.pid}-${Date.now()}`,
  )
  const previousDirectory = `${temporaryDirectory}-previous`
  await mkdir(join(temporaryDirectory, 'thumbnails'), { recursive: true })
  try {
    await Promise.all([
      writeFile(
        join(temporaryDirectory, 'manifest.json'),
        `${JSON.stringify(
          {
            schemaVersion,
            sourceHash,
            templateCount: templates.length,
          },
          null,
          2,
        )}\n`,
      ),
      writeFile(
        join(temporaryDirectory, 'templates.json'),
        `${JSON.stringify(templates, null, 2)}\n`,
      ),
      ...thumbnails.map(thumbnail =>
        writeFile(
          join(temporaryDirectory, 'thumbnails', `${thumbnail.id}.svg`),
          thumbnail.svg,
        ),
      ),
    ])

    let movedPreviousSnapshot = false
    try {
      await rename(outputDirectory, previousDirectory)
      movedPreviousSnapshot = true
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }

    try {
      await rename(temporaryDirectory, outputDirectory)
    } catch (error) {
      if (movedPreviousSnapshot) await rename(previousDirectory, outputDirectory)
      throw error
    }
    if (movedPreviousSnapshot)
      await rm(previousDirectory, { force: true, recursive: true })
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true })
  }
}

const syncTemplates = async () => {
  const templatesText = await fetchInitialSnapshot()
  const templates = templatesFromText(templatesText)
  const sourceHash = createHash('sha256').update(templatesText).digest('hex')
  const manifest = await readManifest()
  if (
    !force &&
    manifest?.schemaVersion === schemaVersion &&
    manifest.sourceHash === sourceHash &&
    (await snapshotIsComplete(templates))
  ) {
    console.log(`Template snapshot is current (${templates.length} templates).`)
    return
  }

  const thumbnails = await fetchThumbnails(templates)
  await replaceSnapshot(templates, thumbnails, sourceHash)
  console.log(`Synced ${templates.length} templates from ${apiBaseUrl}.`)
}

try {
  await syncTemplates()
} catch (error) {
  if (!force && (await existingSnapshotIsUsable())) {
    console.warn(
      `Template sync skipped; using the existing snapshot: ${error instanceof Error ? error.message : String(error)}`,
    )
  } else {
    console.error(error)
    process.exitCode = 1
  }
}
