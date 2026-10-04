import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, type Mesh, type MeshBasicMaterial, type Texture } from 'three'
import { experienceConfig as config } from '../../config/experience.config'
import { useSceneStore } from '../../store/scene.store'
import { flightMotion, smoothRange } from '../clouds/flight-motion'
import { introMotion, layerProgress } from './intro-motion'
type CloudSettings = (typeof config.intro.layers)[number]
export function CloudLayer({ texture, settings, mobile }: { texture: Texture; settings: CloudSettings; mobile: boolean }) {
  const mesh = useRef<Mesh>(null)
  const material = useRef<MeshBasicMaterial>(null)
  const viewport = useThree((state) => state.viewport)
  const camera = useThree((state) => state.camera)
  const frame = useMemo(() => viewport.getCurrentViewport(camera, new Vector3(0, 0, settings.z)), [viewport, camera, settings.z])
  const width = frame.width * (mobile ? settings.mobileWidth : settings.width)
  const height = width / config.intro.cloudAspect
  useFrame(() => {
    if (!mesh.current || !material.current) return
    const progress = layerProgress(introMotion.progress, settings.start, settings.end)
    const sway = mobile ? 0 : Math.sin(introMotion.elapsed * config.intro.cloudDrift + settings.z) * config.intro.cloudSway
    mesh.current.position.set(frame.width * (settings.offsetX + (settings.endX - settings.offsetX) * progress + sway), frame.height * (settings.startY + (settings.endY - settings.startY) * progress), settings.z)
    mesh.current.scale.setScalar(1 + config.intro.cloudScaleGain * progress)
    const state = useSceneStore.getState()
    const journeyFade = 1 - smoothRange(flightMotion.progress, 0, config.cloudJourney.introCloudExitEnd)
    const transitionFade = state.targetScene ? 1 - state.transitionProgress : 1
    material.current.opacity = settings.opacity * journeyFade * transitionFade
  })
  return <mesh ref={mesh} name={`cloud-${settings.name}`} renderOrder={config.intro.layers.indexOf(settings)} position={[0, frame.height * settings.startY, settings.z]}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial ref={material} map={texture} color={config.colors.cloudTint} transparent depthWrite={false} toneMapped={false} opacity={settings.opacity} />
  </mesh>
}
