import assert from 'node:assert/strict'
import test from 'node:test'

import { allowedRemoteImageUrl, RemoteImageCache } from '../src/og/remote-image.js'

test('allows public HTTPS image URLs', () => {
  assert.equal(allowedRemoteImageUrl('https://images.example.com/logo.png'), true)
})

test('rejects unsafe remote image URLs', () => {
  const unsafeUrls = [
    'http://images.example.com/logo.png',
    'https://localhost/logo.png',
    'https://service.internal/logo.png',
    'https://127.0.0.1/logo.png',
    'https://[::1]/logo.png',
    'https://user:password@images.example.com/logo.png',
    'https://images.example.com:8443/logo.png',
  ]

  for (const url of unsafeUrls) assert.equal(allowedRemoteImageUrl(url), false)
})

test('reuses remote images until their cache entry expires', async () => {
  let now = 1_000
  const cache = new RemoteImageCache(2, 100, () => now)
  const image = Promise.resolve(new ArrayBuffer(1))

  cache.set('https://images.example.com/logo.png', image)
  assert.equal(cache.get('https://images.example.com/logo.png'), image)

  now += 100
  assert.equal(cache.get('https://images.example.com/logo.png'), undefined)
})

test('evicts the least recently used remote image', () => {
  const cache = new RemoteImageCache(2, 100)
  const first = Promise.resolve(new ArrayBuffer(1))
  const second = Promise.resolve(new ArrayBuffer(2))
  const third = Promise.resolve(new ArrayBuffer(3))

  cache.set('https://images.example.com/first.png', first)
  cache.set('https://images.example.com/second.png', second)
  assert.equal(cache.get('https://images.example.com/first.png'), first)
  cache.set('https://images.example.com/third.png', third)

  assert.equal(cache.get('https://images.example.com/second.png'), undefined)
  assert.equal(cache.get('https://images.example.com/first.png'), first)
  assert.equal(cache.get('https://images.example.com/third.png'), third)
})
