import { profile } from '../data/profile'
import { useSceneStore } from '../store/scene.store'
import { TransitionController } from '../engine/TransitionController'
import { JourneyOverlay } from './JourneyOverlay'
export function Overlay() {
  const scene = useSceneStore((state) => state.currentScene)
  const paused = useSceneStore((state) => state.motionPaused)
  const reduced = useSceneStore((state) => state.reducedMotion)
  const toggleMotion = useSceneStore((state) => state.toggleMotion)
  return <div className="overlay-shell" data-active-scene={scene}>
    <header className="site-header flex items-center justify-between gap-4">{!['intro', 'clouds'].includes(scene) && <a href="/index.html" className="wordmark" aria-label="Mevcut portfolyoya dön">hç.</a>}<div className="header-actions">{scene === 'intro' && !reduced && <button className="text-button motion-toggle" aria-pressed={paused} onClick={toggleMotion}>{paused ? 'Hareketi sürdür' : 'Hareketi durdur'}</button>}<a href="#portfolio-content">Sade görünüm</a></div></header>
    <TransitionController>{(activeScene) =>
      ['intro', 'clouds'].includes(activeScene) ? <JourneyOverlay /> : <div className="hero-copy">
          <p className="hero-role">{profile.name}</p><h1 tabIndex={-1}>Biraz merak.<br />Çokça üretim.</h1>
          <nav className="hub-links" aria-label="Portfolyo bölümleri"><a href="#experience-content">Deneyim <span aria-hidden="true">↗</span></a><a href="#projects-content">Projeler <span aria-hidden="true">↗</span></a></nav>
      </div>
    }</TransitionController>
    {!['intro', 'clouds'].includes(scene) && <footer className="site-footer"><span>{profile.location}</span><nav aria-label="Sosyal bağlantılar">{profile.links.map((link) => <a key={link.label} href={link.href}>{link.label}</a>)}</nav></footer>}
    <span className="sr-only" role="status">{scene === 'hub' ? 'Portfolyo bölümleri açıldı.' : ''}</span>
  </div>
}
