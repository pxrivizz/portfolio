import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSceneStore, type SceneId } from '../store/scene.store'
import { experienceConfig as config } from '../config/experience.config'
gsap.registerPlugin(useGSAP)
export function TransitionController({ children }: { children: (scene: SceneId) => ReactNode }) {
  const host = useRef<HTMLDivElement>(null)
  const current = useSceneStore((state) => state.currentScene)
  const target = useSceneStore((state) => state.targetScene)
  const reduced = useSceneStore((state) => state.reducedMotion)
  useGSAP(() => {
    if (!target || !host.current) return
    const state = useSceneStore.getState()
    const outgoing = host.current.querySelector(`[data-scene="${current}"]`)
    const incoming = host.current.querySelector(`[data-scene="${target}"]`)
    const progress = { value: 0 }
    const duration = reduced ? config.motion.reducedFade : config.motion.transition
    const timeline = gsap.timeline({ defaults: { duration, ease: config.motion.ease }, onComplete: () => {
      state.completeTransition()
      requestAnimationFrame(() => host.current?.querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true }))
    } })
    timeline.to(progress, { value: 1, onUpdate: () => state.setProgress(progress.value) }, 0)
      .to(outgoing, { opacity: 0, scale: reduced ? 1 : config.motion.outgoingScale }, 0)
      .fromTo(incoming, { opacity: 0, scale: reduced ? 1 : 1 / config.motion.outgoingScale }, { opacity: 1, scale: 1 }, 0)
  }, { scope: host, dependencies: [target, reduced, current], revertOnUpdate: true })
  return <div ref={host} className="scene-overlay">
    {[current, ...(target ? [target] : [])].map((scene) => <div key={['intro', 'clouds'].includes(scene) ? 'journey' : scene} data-scene={scene} className="scene-panel" inert={Boolean(target)} aria-hidden={scene !== current}>
      {children(scene)}
    </div>)}
  </div>
}
