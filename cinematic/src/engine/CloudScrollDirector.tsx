import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { experienceConfig as config } from '../config/experience.config'
import { flightMotion, journeyMotion, rangeProgress, smoothRange } from '../scenes/clouds/flight-motion'
import { introMotion } from '../scenes/intro/intro-motion'
import { useSceneStore } from '../store/scene.store'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function CloudScrollDirector({ root }: { root: HTMLElement | null }) {
  const scene = useSceneStore((state) => state.currentScene)
  const journeyActive = scene === 'intro' || scene === 'clouds'
  const autoPlaying = useSceneStore((state) => state.cloudAutoPlaying)
  const autoTween = useRef<gsap.core.Tween | null>(null)

  useGSAP(() => {
    const element = root
    if (!journeyActive || !element) return

    journeyMotion.progress = 0
    introMotion.progress = 0
    flightMotion.progress = 0
    element.style.setProperty('--intro-progress', '0')
    element.style.setProperty('--flight-progress', '0')
    element.style.setProperty('--flight-ui', '0')
    element.style.setProperty('--door-reveal', '0')

    const syncJourney = () => {
      const progress = journeyMotion.progress
      introMotion.progress = smoothRange(progress, 0, config.cloudJourney.introEnd)
      flightMotion.progress = rangeProgress(progress, config.cloudJourney.flightStart, 1)
      element.style.setProperty('--intro-progress', introMotion.progress.toFixed(4))
      element.style.setProperty('--flight-progress', flightMotion.progress.toFixed(4))
      element.style.setProperty('--flight-ui', smoothRange(progress, config.cloudJourney.flightUiStart, config.cloudJourney.flightUiEnd).toFixed(4))
      element.style.setProperty('--door-reveal', smoothRange(flightMotion.progress, config.cloudJourney.doorRevealStart, config.cloudJourney.doorRevealEnd).toFixed(4))

      const state = useSceneStore.getState()
      state.setIntroComplete(introMotion.progress >= 0.995)
      state.setFlightComplete(flightMotion.progress >= config.cloudJourney.completeAt)
      const desiredPhase = progress >= config.cloudJourney.phaseSwitch ? 'clouds' : 'intro'
      state.setJourneyPhase(desiredPhase)
    }

    const tween = gsap.to(journeyMotion, {
      progress: 1,
      ease: 'none',
      onUpdate: syncJourney,
      scrollTrigger: {
        id: 'cloud-journey',
        trigger: element,
        start: 'top top',
        end: 'bottom bottom',
        scrub: config.cloudJourney.scrub,
        invalidateOnRefresh: true,
      },
    })

    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      tween.kill()
      element.style.removeProperty('--intro-progress')
      element.style.removeProperty('--flight-progress')
      element.style.removeProperty('--flight-ui')
      element.style.removeProperty('--door-reveal')
      useSceneStore.getState().setIntroComplete(false)
      useSceneStore.getState().setFlightComplete(false)
    }
  }, { dependencies: [journeyActive, root], revertOnUpdate: true })

  useGSAP(() => {
    autoTween.current?.kill()
    if (scene !== 'clouds' || !autoPlaying) return

    const trigger = ScrollTrigger.getById('cloud-journey')
    if (!trigger) {
      useSceneStore.getState().setCloudAutoPlaying(false)
      return
    }

    const start = Number(trigger.start)
    const end = Number(trigger.end)
    const distance = Math.max(1, end - start)
    const cursor = { y: window.scrollY }
    const remaining = Math.max(0.12, (end - window.scrollY) / distance)
    autoTween.current = gsap.to(cursor, {
      y: end,
      duration: config.cloudJourney.timeFallback * remaining,
      ease: 'none',
      onUpdate: () => window.scrollTo(0, cursor.y),
      onComplete: () => useSceneStore.getState().setCloudAutoPlaying(false),
    })

    return () => {
      autoTween.current?.kill()
      autoTween.current = null
    }
  }, { dependencies: [scene, autoPlaying], revertOnUpdate: true })

  useEffect(() => {
    if (!autoPlaying) return
    const interrupt = () => useSceneStore.getState().setCloudAutoPlaying(false)
    const options = { passive: true } as const
    window.addEventListener('wheel', interrupt, options)
    window.addEventListener('touchstart', interrupt, options)
    window.addEventListener('keydown', interrupt)
    return () => {
      window.removeEventListener('wheel', interrupt)
      window.removeEventListener('touchstart', interrupt)
      window.removeEventListener('keydown', interrupt)
    }
  }, [autoPlaying])

  return null
}
