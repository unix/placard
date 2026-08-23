import assert from 'node:assert/strict'
import test from 'node:test'

import { createApp } from '../src/app.js'
import { defaultGlobalRenderBehavior } from '../src/og/behavior.js'

const templateIds = [
  'nore-minimal',
  'nore-logo-only',
  'nore-logo-only-dark',
  'nore-report',
  'nore-night',
  'nore-spotlight',
  'nore-stack',
  'nore-signal',
  'nore-blueprint',
  'nore-central',
  'gradient-midnight',
  'gradient-aurora',
  'gradient-prism',
  'gradient-sunset',
  'gradient-mist',
  'gradient-horizon',
  'gradient-mono',
  'grid-pattern',
  'grid-dot',
  'grid-hexagon',
  'system-shell',
  'system-blue-screen',
  'system-kernel-panic',
  'system-bios',
  'system-man-page',
  'community-apple-financial',
] as const

test('exposes health and template metadata without a token by default', async () => {
  const app = await createApp({ token: null })

  try {
    const health = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(health.statusCode, 200)
    assert.deepEqual(health.json(), { ok: true })

    const response = await app.inject({ method: 'GET', url: '/api/templates' })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(
      response.json().templates.map((template: { id: string }) => template.id),
      templateIds,
    )
    assert.deepEqual(
      response.json().renderBehavior.defaults,
      defaultGlobalRenderBehavior,
    )
    assert.deepEqual(response.json().renderBehavior.languages, [
      'en-US',
      'zh-CN',
      'zh-TW',
      'ja-JP',
      'ko-KR',
    ])
  } finally {
    await app.close()
  }
})

test('requires a bearer token only when one is configured', async () => {
  const app = await createApp({ token: 'test-token' })

  try {
    const health = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(health.statusCode, 200)

    const unauthorized = await app.inject({ method: 'GET', url: '/api/templates' })
    assert.equal(unauthorized.statusCode, 401)
    assert.equal(unauthorized.headers['www-authenticate'], 'Bearer')

    const authorized = await app.inject({
      method: 'GET',
      url: '/api/templates',
      headers: { authorization: 'Bearer test-token' },
    })
    assert.equal(authorized.statusCode, 200)
  } finally {
    await app.close()
  }
})

test('renders every template as SVG and PNG', async () => {
  const app = await createApp({ token: null })

  try {
    for (const template of templateIds) {
      const query = new URLSearchParams({
        author: 'Nore',
        brandName: 'Open Graph',
        date: '2026-08-22',
        description: 'A portable Open Graph image renderer.',
        template,
        title: `Rendering ${template}`,
      })
      const svg = await app.inject({ method: 'GET', url: `/render.svg?${query}` })
      assert.equal(svg.statusCode, 200)
      assert.match(svg.headers['content-type'] ?? '', /^image\/svg\+xml/)
      assert.match(svg.body, /<svg/)

      const png = await app.inject({ method: 'GET', url: `/render.png?${query}` })
      assert.equal(png.statusCode, 200)
      assert.match(png.headers['content-type'] ?? '', /^image\/png/)
      assert.deepEqual(
        png.rawPayload.subarray(0, 8),
        Buffer.from('89504e470d0a1a0a', 'hex'),
      )
    }
  } finally {
    await app.close()
  }
})

test('renders SVG through the JSON endpoint', async () => {
  const app = await createApp({ token: null })

  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/render',
      payload: {
        format: 'svg',
        template: 'system-shell',
        title: 'JSON API',
      },
    })

    assert.equal(response.statusCode, 200)
    assert.match(response.headers['content-type'] ?? '', /^image\/svg\+xml/)
    assert.match(response.body, /viewBox="0 0 1200 675"/)
    assert.ok(response.body.length > 1_000)
    assert.equal(response.headers['x-render-fallback-fields'], undefined)
  } finally {
    await app.close()
  }
})

test('applies global render behavior to SVG and PNG output', async () => {
  const app = await createApp({ token: null })

  try {
    const query = new URLSearchParams({
      canvasColor: '#102030',
      canvasPadding: '4',
      canvasRadius: '32',
      contentRadius: 'auto',
      lang: 'zh-CN',
      seed: 'rounded-output',
      template: 'nore-minimal',
      title: '全局渲染行为',
    })
    const svg = await app.inject({ method: 'GET', url: `/render.svg?${query}` })
    assert.equal(svg.statusCode, 200)
    assert.match(svg.body, /<clipPath/)
    assert.match(svg.body, /#102030/)
    assert.equal(svg.headers['x-render-fallback-fields'], undefined)

    const png = await app.inject({ method: 'GET', url: `/render.png?${query}` })
    assert.equal(png.statusCode, 200)
    assert.deepEqual(
      png.rawPayload.subarray(0, 8),
      Buffer.from('89504e470d0a1a0a', 'hex'),
    )
    assert.equal(png.headers['x-render-fallback-fields'], undefined)
  } finally {
    await app.close()
  }
})

test('falls back invalid global render behavior without failing the request', async () => {
  const app = await createApp({ token: null })

  try {
    const response = await app.inject({
      method: 'POST',
      url: '/api/render',
      headers: { origin: 'https://example.com' },
      payload: {
        canvasColor: 'not-a-color',
        canvasPadding: 2.5,
        canvasRadius: -1,
        contentRadius: 400,
        format: 'svg',
        lang: 'invalid-language',
        seed: '',
        title: 'Fallback behavior',
      },
    })

    assert.equal(response.statusCode, 200)
    assert.match(response.headers['content-type'] ?? '', /^image\/svg\+xml/)
    assert.equal(
      response.headers['x-render-fallback-fields'],
      'canvasColor, canvasPadding, canvasRadius, contentRadius, seed, lang',
    )
    assert.match(
      response.headers['access-control-expose-headers'] ?? '',
      /X-Render-Fallback-Fields/i,
    )
  } finally {
    await app.close()
  }
})

test('renders seeded output deterministically', async () => {
  const app = await createApp({ token: null })

  try {
    const request = (seed: string) =>
      app.inject({
        method: 'POST',
        url: '/api/render',
        payload: {
          brandName: 'Nore Seed',
          format: 'svg',
          seed,
          template: 'nore-report',
        },
      })

    const [first, repeated, different] = await Promise.all([
      request('alpha'),
      request('alpha'),
      request('beta'),
    ])
    assert.equal(first.statusCode, 200)
    assert.equal(first.body, repeated.body)
    assert.notEqual(first.body, different.body)
  } finally {
    await app.close()
  }
})

test('applies seeded geometry and color drift to gradient templates', async () => {
  const app = await createApp({ token: null })

  try {
    const request = (seed: string) =>
      app.inject({
        method: 'POST',
        url: '/api/render',
        payload: {
          brandName: 'Nore Gradient',
          format: 'svg',
          seed,
          template: 'gradient-prism',
          title: 'Seeded gradient drift',
        },
      })

    const [first, repeated, different] = await Promise.all([
      request('alpha'),
      request('alpha'),
      request('beta'),
    ])
    assert.equal(first.statusCode, 200)
    assert.equal(first.body, repeated.body)
    assert.notEqual(first.body, different.body)
  } finally {
    await app.close()
  }
})
