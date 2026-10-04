import { beforeEach, describe, expect, it } from 'vitest'
import { useSceneStore } from '../src/store/scene.store'
beforeEach(() => useSceneStore.setState({ currentScene: 'intro', targetScene: null, transitionProgress: 0, isTransitioning: false, reducedMotion: false }))
describe('scene navigation', () => {
  it('rejects invalid routes and locks repeated clicks until the transition completes', () => {
    const state = useSceneStore.getState()
    expect(state.requestScene('projects')).toBe(false)
    expect(state.requestScene('hub')).toBe(true)
    expect(state.requestScene('clouds')).toBe(false)
    expect(useSceneStore.getState().currentScene).toBe('intro')
    state.completeTransition()
    expect(useSceneStore.getState().currentScene).toBe('hub')
    expect(state.requestScene('projects')).toBe(true)
  })
  it('can cancel without changing the active scene', () => {
    useSceneStore.getState().requestScene('clouds')
    useSceneStore.getState().cancelTransition()
    expect(useSceneStore.getState()).toMatchObject({ currentScene: 'intro', targetScene: null, isTransitioning: false })
  })
  it('respects motion preference even during a transition', () => {
    const state = useSceneStore.getState()
    state.requestScene('clouds'); state.setProgress(.5); state.setReducedMotion(true)
    expect(useSceneStore.getState()).toMatchObject({ currentScene: 'hub', targetScene: null, reducedMotion: true, isTransitioning: false })
    state.completeTransition()
    expect(useSceneStore.getState().currentScene).toBe('hub')
  })
  it('clamps progress and rejects non-finite values', () => {
    const state = useSceneStore.getState()
    state.requestScene('hub'); state.setProgress(2)
    expect(useSceneStore.getState().transitionProgress).toBe(1)
    state.setProgress(NaN)
    expect(useSceneStore.getState().transitionProgress).toBe(1)
    state.setProgress(-2)
    expect(useSceneStore.getState().transitionProgress).toBe(0)
  })
})
