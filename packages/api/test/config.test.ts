import assert from 'node:assert/strict'
import test from 'node:test'

import { portFromEnv } from '../src/config.js'
import { defaultPort } from '../src/constants.js'

test('uses port 3003 by default and accepts a valid override', () => {
  assert.equal(defaultPort, 3003)
  assert.equal(portFromEnv(undefined), 3003)
  assert.equal(portFromEnv(''), 3003)
  assert.equal(portFromEnv(' 3103 '), 3103)
  assert.equal(portFromEnv('65535'), 65_535)
})

test('falls back to port 3003 for invalid overrides', () => {
  for (const value of ['0', '-1', '1.5', '65536', 'invalid']) {
    assert.equal(portFromEnv(value), 3003)
  }
})
