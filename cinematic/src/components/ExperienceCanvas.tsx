import { Canvas } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { experienceConfig as config } from '../config/experience.config'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useSceneStore } from '../store/scene.store'
import { SceneController } from '../engine/SceneController'
import { CameraController } from '../engine/CameraController'
import { Loader } from './Loader'
function NoWebGL() {
  useEffect(() => { useSceneStore.getState().setIntroAssets('failed') }, [])
  return null
}
export default function ExperienceCanvas() {
  const mobile = useMediaQuery(config.quality.mobileQuery)
  const host = useRef<HTMLDivElement>(null)
  const [lost, setLost] = useState(false)
  const scene = useSceneStore((state) => state.currentScene)
  const status = useSceneStore((state) => state.introAssets)
  const active = useSceneStore((state) => state.renderActive)
  const reduced = useSceneStore((state) => state.reducedMotion)
  const transitioning = useSceneStore((state) => state.isTransitioning)
  useEffect(() => {
    const element = host.current
    let intersects = true
    const update = () => useSceneStore.getState().setRenderActive(intersects && !document.hidden)
    const observer = new IntersectionObserver(([entry]) => { intersects = entry.isIntersecting && entry.intersectionRatio > config.quality.visibilityThreshold; update() }, { threshold: config.quality.visibilityThreshold })
    if (element) observer.observe(element)
    document.addEventListener('visibilitychange', update)
    update()
    const onLost = (event: Event) => {
      event.preventDefault(); setLost(true)
      useSceneStore.getState().setIntroAssets('failed')
    }
    element?.addEventListener('webglcontextlost', onLost, true)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); element?.removeEventListener('webglcontextlost', onLost, true) }
  }, [])
  const animate = active && !reduced && (['intro', 'clouds'].includes(scene) || transitioning)
  return <>
    <div className="canvas-layer" ref={host} aria-hidden="true" data-render-mode={animate ? 'animated' : 'static'}>
      {!lost && <Canvas camera={config.camera} dpr={[1, mobile ? config.quality.mobileDpr : config.quality.maxDpr]} frameloop={animate ? 'always' : 'demand'} gl={{ antialias: !mobile, alpha: true }} fallback={<NoWebGL />}>
        <CameraController /><SceneController mobile={mobile} />
      </Canvas>}
    </div>
    {scene === 'intro' && status === 'loading' && !lost && <Loader />}
    {(lost || status === 'failed') && <p className="render-notice" role="status">Sade görünüm etkin. Tüm içerikler aşağıda.</p>}
  </>
}
