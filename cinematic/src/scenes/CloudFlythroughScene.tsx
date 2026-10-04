import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AdditiveBlending,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  type Group,
  type Points,
  type Texture,
} from 'three'
import { experienceConfig as config } from '../config/experience.config'
import { useSceneStore } from '../store/scene.store'
import { CloudLayer } from './intro/CloudLayer'
import { introMotion } from './intro/intro-motion'
import { useIntroTextures } from './intro/useIntroTextures'
import { flightMotion, smoothRange } from './clouds/flight-motion'

type CloudSettings = typeof config.cloudJourney.cloudPlanes[number]

function FlightCloud({ settings, texture, index }: { settings: CloudSettings; texture: Texture; index: number }) {
  const mesh = useRef<Mesh>(null)
  const material = useRef<MeshBasicMaterial>(null)
  const { camera } = useThree()

  useFrame(({ clock }) => {
    if (!mesh.current || !material.current) return
    const passedFade = smoothRange(camera.position.z, settings.position[2] - 1.6, settings.position[2] + 0.25)
    const arrival = smoothRange(flightMotion.progress, 0, config.cloudJourney.flightCloudArrivalEnd)
    material.current.opacity = settings.opacity * passedFade * arrival
    mesh.current.position.x = settings.position[0] + Math.sin(clock.elapsedTime * 0.09 + index * 1.7) * 0.08
  })

  return <mesh ref={mesh} position={settings.position} scale={[settings.size[0], settings.size[1], 1]} renderOrder={index + 1}>
    <planeGeometry args={[1, 1]} />
    <meshBasicMaterial ref={material} map={texture} transparent depthWrite={false} toneMapped={false} />
  </mesh>
}

function FlightStars({ mobile, sprite }: { mobile: boolean; sprite?: Texture }) {
  const points = useRef<Points>(null)
  const count = mobile ? 700 : 1800
  const positions = useMemo(() => {
    let seed = 9917
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
    const values = new Float32Array(count * 3)
    for (let index = 0; index < count; index++) {
      values[index * 3] = (random() - 0.5) * 42
      values[index * 3 + 1] = (random() - 0.5) * 25
      values[index * 3 + 2] = 6 - random() * 54
    }
    return values
  }, [count])

  useFrame(() => {
    if (points.current) points.current.rotation.z = flightMotion.progress * 0.025
  })

  return <points ref={points} renderOrder={-1}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial map={sprite} color={config.colors.foreground} size={mobile ? 0.05 : 0.06} transparent opacity={0.72} depthWrite={false} blending={AdditiveBlending} />
  </points>
}

function Doorway() {
  const group = useRef<Group>(null)
  const pivot = useRef<Group>(null)
  const materials = useRef<MeshBasicMaterial[]>([])

  useEffect(() => {
    if (!group.current) return
    materials.current = []
    group.current.traverse((object) => {
      if (object instanceof Mesh) {
        const material = Array.isArray(object.material) ? object.material : [object.material]
        materials.current.push(...material.filter((item): item is MeshBasicMaterial => item instanceof MeshBasicMaterial))
      }
    })
    return () => { materials.current = [] }
  }, [])

  useFrame(() => {
    if (!pivot.current || !group.current) return
    const reveal = smoothRange(flightMotion.progress, config.cloudJourney.doorRevealStart, config.cloudJourney.doorRevealEnd)
    group.current.visible = reveal > 0.001
    group.current.scale.setScalar(MathUtils.lerp(config.cloudJourney.doorRevealScale, 1, reveal))
    group.current.position.y = MathUtils.lerp(config.cloudJourney.doorRevealYOffset, 0, reveal)
    materials.current.forEach((material) => { material.opacity = reveal })
    const opening = smoothRange(flightMotion.progress, config.cloudJourney.doorOpenStart, config.cloudJourney.doorOpenEnd)
    pivot.current.rotation.y = config.cloudJourney.doorOpenAngle * opening
  })

  return <group ref={group} visible={false} position={[0, 0, config.cloudJourney.doorZ]}>
    <mesh position={[0, 0, -0.18]}><planeGeometry args={[3.05, 5.05]} /><meshBasicMaterial color="#050505" transparent opacity={0} depthWrite={false} /></mesh>
    <mesh position={[-1.6, 0, 0]}><boxGeometry args={[0.22, 5.55, 0.28]} /><meshBasicMaterial color={config.colors.foreground} transparent opacity={0} depthWrite={false} /></mesh>
    <mesh position={[1.6, 0, 0]}><boxGeometry args={[0.22, 5.55, 0.28]} /><meshBasicMaterial color={config.colors.foreground} transparent opacity={0} depthWrite={false} /></mesh>
    <mesh position={[0, 2.67, 0]}><boxGeometry args={[3.42, 0.22, 0.28]} /><meshBasicMaterial color={config.colors.foreground} transparent opacity={0} depthWrite={false} /></mesh>
    <group ref={pivot} position={[-1.46, 0, 0.05]}>
      <mesh position={[1.46, 0, 0]}><boxGeometry args={[2.92, 5.12, 0.1]} /><meshBasicMaterial color="#e8e6e2" transparent opacity={0} depthWrite={false} /></mesh>
      <mesh position={[2.56, 0, 0.08]}><sphereGeometry args={[0.07, 12, 12]} /><meshBasicMaterial color="#333333" transparent opacity={0} depthWrite={false} /></mesh>
    </group>
  </group>
}

function FlightCamera() {
  const { camera } = useThree()
  const target = useMemo(() => new Vector3(), [])

  useFrame(() => {
    const progress = smoothRange(flightMotion.progress, 0, 1)
    const z = MathUtils.lerp(config.cloudJourney.cameraStartZ, config.cloudJourney.cameraEndZ, progress)
    const x = Math.sin(progress * Math.PI) * 0.24
    const y = Math.sin(progress * Math.PI * 2) * 0.09
    camera.position.set(x, y, z)
    camera.up.set(0, 1, 0)
    target.set(x * 0.15, y * 0.15, z - 5)
    camera.lookAt(target)
    camera.rotateZ(Math.sin(progress * Math.PI) * config.cloudJourney.cameraRoll)
  })

  useEffect(() => () => {
    camera.position.set(...config.camera.position)
    camera.rotation.set(0, 0, 0)
    camera.up.set(0, 1, 0)
  }, [camera])

  return null
}

export default function CloudFlythroughScene({ mobile }: { mobile: boolean }) {
  const textures = useIntroTextures()
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    gl.domElement.setAttribute('data-scene-ready', textures ? 'true' : 'loading')
    if (textures) gl.domElement.setAttribute('data-rendered-scene', 'journey')
    return () => {
      gl.domElement.removeAttribute('data-scene-ready')
      gl.domElement.removeAttribute('data-rendered-scene')
    }
  }, [gl, textures])

  useFrame((_, delta) => {
    const state = useSceneStore.getState()
    if (!state.motionPaused && state.renderActive && !state.reducedMotion) {
      introMotion.elapsed += Math.min(delta, config.intro.maxDelta)
    }
  })

  return <group name="cloud-flythrough-scene">
    <FlightCamera />
    <FlightStars mobile={mobile} sprite={textures?.[3]} />
    {textures && config.intro.layers.map((layer, index) => (
      <CloudLayer key={layer.name} settings={layer} mobile={mobile} texture={textures[index]} />
    ))}
    {textures && config.cloudJourney.cloudPlanes.map((settings, index) => (
      <FlightCloud key={`${settings.position[2]}-${index}`} settings={settings} texture={textures[settings.texture]} index={index} />
    ))}
    <Doorway />
  </group>
}
