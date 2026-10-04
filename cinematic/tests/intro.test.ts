import { describe, expect, it } from 'vitest'
import { layerProgress } from '../src/scenes/intro/intro-motion'
import { experienceConfig as config } from '../src/config/experience.config'
describe('cloud entrance timing', () => {
  it('keeps all clouds in bounds before, during and after the entrance', () => {
    for (const layer of config.intro.layers) {
      expect(layerProgress(-1, layer.start, layer.end)).toBe(0)
      expect(layerProgress(2, layer.start, layer.end)).toBe(1)
      expect(layerProgress((layer.start + layer.end) / 2, layer.start, layer.end)).toBeCloseTo(.5)
    }
  })
  it('stages the three depths rather than moving them in lockstep', () => {
    const progress = config.intro.layers.map((layer) => layerProgress(.4, layer.start, layer.end))
    expect(progress[0]).toBeGreaterThan(progress[1])
    expect(progress[1]).toBeGreaterThan(progress[2])
  })
})
