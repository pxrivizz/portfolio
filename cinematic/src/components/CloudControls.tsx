import { useSceneStore } from '../store/scene.store'

export function CloudControls() {
  const scene = useSceneStore((state) => state.currentScene)
  const active = scene === 'clouds'
  const complete = useSceneStore((state) => state.flightComplete)
  const autoPlaying = useSceneStore((state) => state.cloudAutoPlaying)
  const setAutoPlaying = useSceneStore((state) => state.setCloudAutoPlaying)
  const request = useSceneStore((state) => state.requestScene)

  const skip = () => {
    setAutoPlaying(false)
    window.scrollTo({ top: 0, behavior: 'auto' })
    request('hub')
  }

  const restart = () => {
    setAutoPlaying(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <div className="cloud-controls" data-active={active} inert={!active} aria-hidden={!active} aria-label="Bulut yolculuğu kontrolleri">
    <div className="cloud-instruction">
      <span className="cloud-kicker">YOLCULUK</span>
      <p>{complete ? 'Kapıdan geçtin. Tünel bir sonraki fazda.' : 'Kaydırmaya devam et.'}</p>
      <span className="cloud-progress" aria-hidden="true"><span /></span>
    </div>
    <div className="cloud-actions">
      {complete
        ? <button className="text-button" disabled={!active} onClick={restart}>Başa dön</button>
        : <button className="text-button" disabled={!active} aria-pressed={autoPlaying} onClick={() => setAutoPlaying(!autoPlaying)}>{autoPlaying ? 'Otomatik ilerlemeyi durdur' : 'Otomatik ilerle'}</button>}
      <button className="text-button" disabled={!active} onClick={skip}>Deneyimi atla</button>
    </div>
    <span className="sr-only" role="status">{complete ? 'Bulut yolculuğu tamamlandı ve kapıdan geçildi.' : ''}</span>
  </div>
}
