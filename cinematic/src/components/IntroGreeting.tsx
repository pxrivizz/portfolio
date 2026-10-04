import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { profile } from '../data/profile'
import { useSceneStore } from '../store/scene.store'
import { introMotion } from '../scenes/intro/intro-motion'
export function IntroGreeting() {
  const root = useRef<HTMLDivElement>(null)
  const status = useSceneStore((state) => state.introAssets)
  const complete = useSceneStore((state) => state.introComplete)
  useGSAP(() => {
    if (status === 'loading') return
    const timeline = gsap.timeline({ paused: true })
      .fromTo('.greeting-text', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }, 0.08)
      .to('.greeting-text', { y: () => -window.innerHeight * 0.58, opacity: 0, duration: 0.5, ease: 'power2.inOut' }, 0.5)
      .fromTo('.intro-scroll-hint', { opacity: 0 }, { opacity: 1, duration: 0.16 }, 0)
      .to('.intro-scroll-hint', { opacity: 0, y: 12, duration: 0.2 }, 0.48)
    const sync = () => { timeline.progress(introMotion.progress) }
    gsap.ticker.add(sync)
    sync()
    return () => gsap.ticker.remove(sync)
  }, { scope: root, dependencies: [status], revertOnUpdate: true })
  return <div className="hero-copy intro-copy" ref={root} data-intro-complete={complete} data-assets={status}>
    <div className="greeting-text">
      <h1 tabIndex={-1}>Merhaba, ben {profile.name}.</h1>
    </div>
    <div className="intro-bottom-controls">
      <p className="intro-scroll-hint">Kaydırarak devam et <span aria-hidden="true">↓</span></p>
    </div>
  </div>
}
