import { defaultGlobalRenderBehavior } from './behavior.js'
import type { GlobalRenderBehavior } from './behavior.js'
import type { RenderInput } from './input.js'

export interface RenderContext {
  readonly random: () => number
}

const hashString = (value: string) => {
  let hash = 2166136261
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const randomForSeed = (seed: number) => {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

const automaticSeed = (input: RenderInput) => JSON.stringify(input)

export const renderContextForInput = (
  input: RenderInput,
  behavior: GlobalRenderBehavior,
): RenderContext => {
  const seed =
    behavior.seed === defaultGlobalRenderBehavior.seed
      ? automaticSeed(input)
      : behavior.seed
  return { random: randomForSeed(hashString(seed)) }
}
