import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react'
import { Overlay } from './components/Overlay'
import { Loader } from './components/Loader'
import { RenderBoundary } from './components/RenderBoundary'
import { useMediaQuery } from './hooks/useMediaQuery'
import { useSceneStore } from './store/scene.store'
import { experienceConfig } from './config/experience.config'
import { CloudScrollDirector } from './engine/CloudScrollDirector'
const ExperienceCanvas = lazy(() => import('./components/ExperienceCanvas'))
export default function App() {
  const [shell, setShell] = useState<HTMLElement | null>(null)
  const reduced = useMediaQuery(experienceConfig.quality.reducedQuery)
  const scene = useSceneStore((state) => state.currentScene)
  useEffect(() => { useSceneStore.getState().setReducedMotion(reduced) }, [reduced])
  return <section ref={setShell} className="experience-shell" data-scene={scene} style={{
    '--cloud-scroll-vh': experienceConfig.cloudJourney.scrollLengthVh,
  } as CSSProperties} aria-label="Etkileşimli portfolyo">
    <RenderBoundary><Suspense fallback={<Loader />}><ExperienceCanvas /></Suspense></RenderBoundary>
    <CloudScrollDirector root={shell} />
    <Overlay />
  </section>
}
