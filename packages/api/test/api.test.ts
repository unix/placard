import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { createApp } from '../src/app.js'
import { defaultLogoId, inverseLogoId, noLogoId } from '../assets/logo/index.js'
import { validateAccessConfig } from '../src/config.js'
import { defaultTemplateId } from '../src/constants.js'
import { defaultGlobalRenderBehavior } from '../src/og/behavior.js'
import { renderInputFromUnknown } from '../src/og/input.js'
import { templateIdForId } from '../src/templates/index.js'

const templateIds = [
  'minimal',
  'logo-only',
  'logo-only-dark',
  'night',
  'spotlight',
  'stack',
  'blueprint',
  'central',
  'logo-text-white',
  'logo-text-dark',
  'logo-text-gradient',
  'logo-text-grid',
  'logo-text-ink',
  'logo-text-prism',
  'logo-text-mist',
  'logo-text-mono',
  'signal-white',
  'signal-dark',
  'signal-gradient',
  'signal-grid',
  'signal-ink',
  'signal-prism',
  'signal-mist',
  'signal-mono',
  'logo-center-white',
  'logo-center-dark',
  'logo-center-gradient',
  'logo-center-grid',
  'logo-center-ink',
  'logo-center-prism',
  'logo-center-mist',
  'logo-center-mono',
  'logo-large-white',
  'logo-large-dark',
  'logo-large-gradient',
  'logo-large-grid',
  'logo-large-ink',
  'logo-large-prism',
  'logo-large-mist',
  'logo-large-mono',
  'gradient-midnight',
  'gradient-aurora',
  'gradient-prism',
  'gradient-sunset',
  'gradient-mist',
  'gradient-horizon',
  'gradient-mono',
  'grid-pattern',
  'grid-dark',
  'grid-dot',
  'grid-hexagon',
  'paper-ledger',
  'paper-brief',
  'ink-column',
  'ink-focus',
  'ink-statement',
  'midnight-story',
  'midnight-brief',
  'midnight-block',
  'aurora-column',
  'aurora-focus',
  'prism-focus',
  'prism-brief',
  'sunset-column',
  'sunset-focus',
  'sunset-statement',
  'mist-story',
  'mist-brief',
  'mono-focus',
  'mono-folio',
  'grid-light-column',
  'grid-light-focus',
  'grid-dark-column',
  'system-shell',
  'system-kernel-panic',
  'system-bios',
  'community-apple-financial',
] as const

const removedTemplateIds = [
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
  'paper-masthead',
  'aurora-mark',
  'prism-masthead',
  'mist-mark',
  'mono-masthead',
] as const

const webFixtureRoot = fileURLToPath(new URL('./fixtures/web/', import.meta.url))

test('rejects access settings that cannot serve traffic', () => {
  assert.throws(
    () =>
      validateAccessConfig({
        allowAnonymous: false,
        token: 'test-token',
        webEnabled: true,
      }),
    /OG_WEB_ENABLED must be false/,
  )
  assert.throws(
    () =>
      validateAccessConfig({
        allowAnonymous: false,
        token: null,
        webEnabled: false,
      }),
    /OG_INTERNAL_TOKEN must be configured/,
  )
})

test('does not resolve removed template IDs', () => {
  for (const templateId of removedTemplateIds)
    assert.equal(templateIdForId(templateId), defaultTemplateId)
})

test('serves the bundled web UI without shadowing API routes', async () => {
  const app = await createApp({ token: null, webRoot: webFixtureRoot })

  try {
    const home = await app.inject({ method: 'GET', url: '/' })
    assert.equal(home.statusCode, 200)
    assert.match(home.body, /Bundled web UI/)
    assert.equal(home.headers['cache-control'], 'no-cache')

    const intro = await app.inject({ method: 'GET', url: '/intro' })
    assert.equal(intro.statusCode, 200)
    assert.match(intro.body, /Introduction/)

    const asset = await app.inject({ method: 'GET', url: '/_astro/app.js' })
    assert.equal(asset.statusCode, 200)
    assert.equal(
      asset.headers['cache-control'],
      'public, max-age=31536000, immutable',
    )

    const health = await app.inject({ method: 'GET', url: '/api/health' })
    assert.equal(health.statusCode, 200)

    const missing = await app.inject({ method: 'GET', url: '/not-found' })
    assert.equal(missing.statusCode, 404)
    assert.equal(missing.body, '')
    assert.equal(missing.headers['content-type'], undefined)
  } finally {
    await app.close()
  }
})

test('returns an empty HTTP 404 for unknown routes', async () => {
  const app = await createApp({ token: null })

  try {
    for (const url of ['/', '/123', '/notfound']) {
      const response = await app.inject({ method: 'GET', url })
      assert.equal(response.statusCode, 404)
      assert.equal(response.body, '')
      assert.equal(response.headers['content-type'], undefined)
    }
  } finally {
    await app.close()
  }
})

test('exposes health and template metadata without a token by default', async () => {
  const app = await createApp({ token: null })

  try {
    const health = await app.inject({ method: 'GET', url: '/api/health' })
    assert.equal(health.statusCode, 200)
    assert.deepEqual(health.json(), { ok: true })

    const legacyHealth = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(legacyHealth.statusCode, 404)

    const legacyRender = await app.inject({ method: 'GET', url: '/render.svg' })
    assert.equal(legacyRender.statusCode, 404)

    const response = await app.inject({ method: 'GET', url: '/api/templates' })
    assert.equal(response.statusCode, 200)
    assert.deepEqual(
      response.json().templates.map((template: { id: string }) => template.id),
      templateIds,
    )
    assert.equal('backgrounds' in response.json(), false)
    assert.equal('layouts' in response.json(), false)
    assert.equal('background' in response.json().defaults, false)
    assert.equal('layout' in response.json().defaults, false)
    assert.equal('styles' in response.json().defaults, false)
    assert.equal(response.json().defaults.logoId, defaultLogoId)
    assert.equal(response.json().defaults.template, 'gradient-sunset')
    assert.equal(response.json().logos.defaultId, defaultLogoId)
    assert.equal(response.json().logos.noneId, noLogoId)
    assert.equal(response.json().logos.items[0]?.id, defaultLogoId)
    assert.equal(response.json().logos.items[1]?.id, inverseLogoId)
    const templateDefaults = new Map(
      response
        .json()
        .templates.map((template: { defaultLogoId: string; id: string }) => [
          template.id,
          template.defaultLogoId,
        ]),
    )
    assert.equal(templateDefaults.get('logo-only-dark'), inverseLogoId)
    assert.equal(templateDefaults.get('night'), inverseLogoId)
    assert.equal(templateDefaults.get('signal-gradient'), inverseLogoId)
    assert.equal(templateDefaults.get('gradient-horizon'), inverseLogoId)
    assert.equal(templateDefaults.get('grid-hexagon'), inverseLogoId)
    assert.equal(templateDefaults.get('aurora-column'), inverseLogoId)
    assert.equal(templateDefaults.get('minimal'), defaultLogoId)
    const minifiedResponse = await app.inject({
      method: 'GET',
      url: '/api/templates-minify',
    })
    assert.equal(minifiedResponse.statusCode, 200)
    const minifiedTemplateDefaults = new Map(
      minifiedResponse
        .json()
        .map((template: { defaultLogoId: string; id: string }) => [
          template.id,
          template.defaultLogoId,
        ]),
    )
    assert.equal(minifiedTemplateDefaults.get('night'), inverseLogoId)
    assert.equal(minifiedTemplateDefaults.get('minimal'), defaultLogoId)
    assert.equal('fields' in minifiedResponse.json()[0], false)
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

test('uses the template logo default unless the request selects a logo', () => {
  assert.equal(renderInputFromUnknown({ template: 'night' }).logoId, inverseLogoId)
  assert.equal(
    renderInputFromUnknown({ logoId: 'unknown', template: 'gradient-horizon' })
      .logoId,
    inverseLogoId,
  )
  assert.equal(
    renderInputFromUnknown({ logoId: defaultLogoId, template: 'night' }).logoId,
    defaultLogoId,
  )
  assert.equal(renderInputFromUnknown({ template: 'minimal' }).logoId, defaultLogoId)
})

test('keeps anonymous API access enabled when a token is configured', async () => {
  const app = await createApp({ token: 'test-token' })

  try {
    const health = await app.inject({ method: 'GET', url: '/api/health' })
    assert.equal(health.statusCode, 200)

    const anonymous = await app.inject({ method: 'GET', url: '/api/templates' })
    assert.equal(anonymous.statusCode, 200)
  } finally {
    await app.close()
  }
})

test('requires the configured token when anonymous access is disabled', async () => {
  const app = await createApp({
    allowAnonymous: false,
    token: 'test-token',
  })

  try {
    const unauthorized = await app.inject({ method: 'GET', url: '/api/health' })
    assert.equal(unauthorized.statusCode, 401)
    assert.equal(unauthorized.headers['www-authenticate'], 'Bearer')

    const authorized = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { authorization: 'Bearer test-token' },
    })
    assert.equal(authorized.statusCode, 200)
  } finally {
    await app.close()
  }
})

test('limits anonymous requests and exempts valid bearer tokens', async () => {
  const app = await createApp({ renderRateLimitMax: 1, token: 'test-token' })

  try {
    const anonymous = await app.inject({
      method: 'GET',
      url: '/api/render.svg?title=Anonymous',
    })
    assert.equal(anonymous.statusCode, 200)
    assert.equal(anonymous.headers['x-ratelimit-limit'], '1')

    const limited = await app.inject({
      method: 'GET',
      url: '/api/render.svg?title=Limited',
    })
    assert.equal(limited.statusCode, 429)

    for (let index = 0; index < 3; index += 1) {
      const response = await app.inject({
        method: 'GET',
        url: `/api/render.svg?title=Authorized-${index}`,
        headers: { authorization: 'Bearer test-token' },
      })
      assert.equal(response.statusCode, 200)
      assert.equal(response.headers['x-ratelimit-limit'], undefined)
    }
  } finally {
    await app.close()
  }
})

test('renders every template as SVG and PNG', async () => {
  const app = await createApp({
    renderRateLimitMax: templateIds.length * 2 + 1,
    token: null,
  })

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
      const svg = await app.inject({
        method: 'GET',
        url: `/api/render.svg?${query}`,
      })
      assert.equal(svg.statusCode, 200)
      assert.match(svg.headers['content-type'] ?? '', /^image\/svg\+xml/)
      assert.match(svg.body, /<svg/)

      const png = await app.inject({
        method: 'GET',
        url: `/api/render.png?${query}`,
      })
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

test('shares a per-IP rate limit across render endpoints', async () => {
  const app = await createApp({
    renderRateLimitMax: 2,
    token: null,
  })

  try {
    for (let index = 0; index < 3; index += 1) {
      const templates = await app.inject({
        method: 'GET',
        url: '/api/templates-minify',
      })
      assert.equal(templates.statusCode, 200)
    }

    const first = await app.inject({
      method: 'GET',
      url: '/api/render.svg?title=First',
    })
    assert.equal(first.statusCode, 200)
    assert.equal(first.headers['x-ratelimit-limit'], '2')
    assert.equal(first.headers['x-ratelimit-remaining'], '1')

    const second = await app.inject({
      method: 'POST',
      url: '/api/render',
      payload: { format: 'svg', title: 'Second' },
    })
    assert.equal(second.statusCode, 200)
    assert.equal(second.headers['x-ratelimit-remaining'], '0')

    const limited = await app.inject({
      method: 'GET',
      url: '/api/render.png?title=Limited',
    })
    assert.equal(limited.statusCode, 429)
    assert.equal(limited.headers['retry-after'], '60')
    assert.deepEqual(limited.json(), {
      error: 'rate_limit_exceeded',
      message: 'Too many render requests',
      statusCode: 429,
    })

    const health = await app.inject({ method: 'GET', url: '/api/health' })
    assert.equal(health.statusCode, 200)
  } finally {
    await app.close()
  }
})

test('rejects unsafe custom logo URLs before rendering', async () => {
  const app = await createApp({ token: null })

  try {
    for (const logoUrl of [
      'http://example.com/logo.png',
      'https://127.0.0.1/logo.png',
      'https://metadata.google.internal/logo.png',
    ]) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/render',
        payload: {
          format: 'svg',
          logoId: 'custom',
          logoUrl,
        },
      })
      assert.equal(response.statusCode, 400)
      assert.equal(response.json().error, 'invalid_payload')
      assert.match(response.json().message.join('\n'), /public HTTPS URL/)
    }
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
      template: 'minimal',
      title: '全局渲染行为',
    })
    const svg = await app.inject({
      method: 'GET',
      url: `/api/render.svg?${query}`,
    })
    assert.equal(svg.statusCode, 200)
    assert.match(svg.body, /<clipPath/)
    assert.match(svg.body, /#102030/)
    assert.equal(svg.headers['x-render-fallback-fields'], undefined)

    const png = await app.inject({
      method: 'GET',
      url: `/api/render.png?${query}`,
    })
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
          template: 'logo-text-gradient',
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
