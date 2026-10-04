import { lazy, Suspense } from 'react'
import { useSceneStore } from '../store/scene.store'
const CloudFlythroughScene = lazy(() => import('../scenes/CloudFlythroughScene'))
const HubBackdrop = lazy(() => import('../scenes/HubBackdrop'))
export function SceneController({ mobile }: { mobile: boolean }) {
  const current = useSceneStore((state) => state.currentScene)
  const journeyActive = current === 'intro' || current === 'clouds'
  return <Suspense fallback={null}>
    {journeyActive && <CloudFlythroughScene mobile={mobile} />}
    {!journeyActive && <HubBackdrop mobile={mobile} />}
  </Suspense>
}
