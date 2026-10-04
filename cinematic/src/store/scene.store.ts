import { create } from 'zustand'
export type SceneId = 'intro' | 'clouds' | 'tunnel' | 'hub' | 'experience' | 'projects'
export const sceneGraph: Record<SceneId, readonly SceneId[]> = {
  intro: ['clouds', 'hub'], clouds: ['tunnel', 'hub'], tunnel: ['hub'],
  hub: ['experience', 'projects'], experience: ['hub'], projects: ['hub'],
}
type SceneState = {
  introAssets: 'loading' | 'ready' | 'failed'
  introComplete: boolean
  introReplay: number
  motionPaused: boolean
  renderActive: boolean
  flightComplete: boolean
  cloudAutoPlaying: boolean
  setIntroAssets: (status: 'loading' | 'ready' | 'failed') => void
  setIntroComplete: (complete: boolean) => void
  replayIntro: () => void
  toggleMotion: () => void
  setRenderActive: (active: boolean) => void
  setFlightComplete: (complete: boolean) => void
  setCloudAutoPlaying: (playing: boolean) => void
  setJourneyPhase: (scene: 'intro' | 'clouds') => void
  currentScene: SceneId
  targetScene: SceneId | null
  transitionProgress: number
  isTransitioning: boolean
  reducedMotion: boolean
  requestScene: (scene: SceneId) => boolean
  setProgress: (progress: number) => void
  completeTransition: () => void
  cancelTransition: () => void
  setReducedMotion: (reduce: boolean) => void
}
export const useSceneStore = create<SceneState>((set, get) => ({
  introAssets: 'loading', introComplete: false, introReplay: 0, motionPaused: false, renderActive: true,
  flightComplete: false, cloudAutoPlaying: false,
  setIntroAssets: (introAssets) => set({ introAssets }),
  setIntroComplete: (introComplete) => set({ introComplete }),
  replayIntro: () => set((state) => ({ introReplay: state.introReplay + 1, introComplete: false, motionPaused: false })),
  toggleMotion: () => set((state) => ({ motionPaused: !state.motionPaused })),
  setRenderActive: (renderActive) => set({ renderActive }),
  setFlightComplete: (flightComplete) => set((state) => state.flightComplete === flightComplete ? state : { flightComplete }),
  setCloudAutoPlaying: (cloudAutoPlaying) => set({ cloudAutoPlaying }),
  setJourneyPhase: (currentScene) => set((state) => {
    if (state.isTransitioning || !['intro', 'clouds'].includes(state.currentScene) || state.currentScene === currentScene) return state
    return { currentScene }
  }),
  currentScene: 'intro', targetScene: null, transitionProgress: 0, isTransitioning: false, reducedMotion: false,
  requestScene: (scene) => {
    const state = get()
    if (state.isTransitioning || !sceneGraph[state.currentScene].includes(scene)) return false
    set({ targetScene: scene, transitionProgress: 0, isTransitioning: true })
    return true
  },
  setProgress: (progress) => {
    if (get().isTransitioning && Number.isFinite(progress)) set({ transitionProgress: Math.min(1, Math.max(0, progress)) })
  },
  completeTransition: () => {
    const targetScene = get().targetScene
    if (targetScene) set({
      currentScene: targetScene,
      targetScene: null,
      transitionProgress: 1,
      isTransitioning: false,
      flightComplete: targetScene === 'clouds' ? false : get().flightComplete,
      cloudAutoPlaying: false,
    })
  },
  cancelTransition: () => set({ targetScene: null, transitionProgress: 0, isTransitioning: false }),
  setReducedMotion: (reduce) => set(reduce
    ? { reducedMotion: true, currentScene: 'hub', targetScene: null, transitionProgress: 0, isTransitioning: false, cloudAutoPlaying: false }
    : { reducedMotion: false }),
}))
