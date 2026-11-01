import { lookup } from 'node:dns/promises'
import { BlockList, isIP } from 'node:net'

import { prepareImages } from '@takumi-rs/helpers'
import type { ImageFetchCache, Node } from '@takumi-rs/helpers'

interface RemoteImageCacheEntry {
  readonly data: Promise<ArrayBuffer>
  readonly expiresAt: number
}

export class RemoteImageCache implements ImageFetchCache {
  private readonly entries = new Map<string, RemoteImageCacheEntry>()

  constructor(
    private readonly maxEntries: number,
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  private removeExpired(now: number) {
    for (const [url, entry] of this.entries)
      if (entry.expiresAt <= now) this.entries.delete(url)
  }

  get(url: string) {
    const entry = this.entries.get(url)
    if (!entry) return undefined
    if (entry.expiresAt <= this.now()) {
      this.entries.delete(url)
      return undefined
    }

    this.entries.delete(url)
    this.entries.set(url, entry)
    return entry.data
  }

  set(url: string, data: Promise<ArrayBuffer>) {
    if (this.maxEntries <= 0 || this.ttlMs <= 0) return
    const now = this.now()
    this.removeExpired(now)
    this.entries.delete(url)
    this.entries.set(url, { data, expiresAt: now + this.ttlMs })
    while (this.entries.size > this.maxEntries) {
      const oldestUrl = this.entries.keys().next().value
      if (oldestUrl == null) return
      this.entries.delete(oldestUrl)
    }
  }

  delete(url: string) {
    this.entries.delete(url)
  }
}

export interface RemoteImageOptions {
  readonly fetchCache?: ImageFetchCache
  readonly maxBytes: number
  readonly signal?: AbortSignal
  readonly timeoutMs: number
}

export class RemoteImageError extends Error {
  constructor(cause?: unknown) {
    super('Remote image could not be loaded safely', { cause })
    this.name = 'RemoteImageError'
  }
}

const blockedAddresses = new BlockList()

const blockedIpv4Subnets = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const

const blockedIpv6Subnets = [
  ['::', 128],
  ['::1', 128],
  ['::ffff:0:0', 96],
  ['64:ff9b::', 96],
  ['64:ff9b:1::', 48],
  ['100::', 64],
  ['2001:2::', 48],
  ['2001::', 32],
  ['2001:10::', 28],
  ['2001:20::', 28],
  ['2001:db8::', 32],
  ['2002::', 16],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const

for (const [network, prefix] of blockedIpv4Subnets)
  blockedAddresses.addSubnet(network, prefix, 'ipv4')
for (const [network, prefix] of blockedIpv6Subnets)
  blockedAddresses.addSubnet(network, prefix, 'ipv6')

const blockedHostnameSuffixes = [
  '.home.arpa',
  '.internal',
  '.invalid',
  '.local',
  '.localhost',
  '.test',
] as const

const normalizedHostname = (hostname: string) =>
  hostname
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '')
    .toLowerCase()

const blockedAddress = (address: string) => {
  const family = isIP(address)
  if (family === 4) return blockedAddresses.check(address, 'ipv4')
  if (family === 6) return blockedAddresses.check(address, 'ipv6')
  return true
}

const blockedHostname = (hostname: string) => {
  const normalized = normalizedHostname(hostname)
  if (normalized === 'localhost') return true
  if (blockedHostnameSuffixes.some(suffix => normalized.endsWith(suffix)))
    return true
  if (isIP(normalized) > 0) return blockedAddress(normalized)
  return false
}

const remoteImageUrl = (value: string) => {
  try {
    return new URL(value)
  } catch {
    return null
  }
}

export const allowedRemoteImageUrl = (value: string) => {
  const url = remoteImageUrl(value)
  if (!url || url.protocol !== 'https:') return false
  if (url.username || url.password) return false
  if (url.port && url.port !== '443') return false
  return !blockedHostname(url.hostname)
}

const fetchPublicRemoteImage = async (value: string, init?: RequestInit) => {
  if (!allowedRemoteImageUrl(value)) throw new RemoteImageError()
  const url = new URL(value)
  const hostname = normalizedHostname(url.hostname)
  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (addresses.length === 0 || addresses.some(item => blockedAddress(item.address)))
    throw new RemoteImageError()
  return globalThis.fetch(value, init)
}

export const prepareRemoteImages = async (
  node: Node,
  { fetchCache, maxBytes, signal, timeoutMs }: RemoteImageOptions,
) => {
  try {
    return await prepareImages({
      allowUrl: allowedRemoteImageUrl,
      fetch: fetchPublicRemoteImage,
      fetchCache,
      maxBytes,
      node,
      signal,
      timeout: timeoutMs,
    })
  } catch (error) {
    if (error instanceof RemoteImageError) throw error
    throw new RemoteImageError(error)
  }
}
