import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Points, type Texture } from 'three'
import { experienceConfig as config } from '../../config/experience.config'
import { introMotion } from './intro-motion'
export function Starfield({ mobile, sprite }: { mobile: boolean; sprite?: Texture }) {
  const points = useRef<Points>(null)
  const count = mobile ? config.intro.mobileStarCount : config.intro.starCount
  const positions = useMemo(() => {
    let seed = config.intro.seed as number
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296 }
    const result = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      result[i * 3] = (random() - .5) * config.intro.starSpread[0]
      result[i * 3 + 1] = (random() - .5) * config.intro.starSpread[1]
      result[i * 3 + 2] = config.intro.starDepth - random() * config.intro.starSpread[2]
    }
    return result
  }, [count])
  useFrame(() => {
    if (points.current) points.current.rotation.z = Math.sin(introMotion.elapsed * config.intro.starDrift) * config.intro.starDrift
  })
  return <points ref={points} name="intro-stars" renderOrder={-1}>
    <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
    <pointsMaterial color={config.colors.foreground} map={sprite} size={config.intro.starSize} transparent opacity={config.intro.starOpacity} depthWrite={false} blending={AdditiveBlending} />
  </points>
}
