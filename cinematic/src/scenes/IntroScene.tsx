import { useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { experienceConfig as config } from '../config/experience.config'
import { useSceneStore } from '../store/scene.store'
import { useIntroTextures } from './intro/useIntroTextures'
import { Starfield } from './intro/Starfield'
import { CloudLayer } from './intro/CloudLayer'
import { introMotion } from './intro/intro-motion'
export default function IntroScene({ mobile }: { mobile: boolean }) {
  const textures = useIntroTextures()
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    if (!textures) return
    gl.domElement.setAttribute('data-scene-ready', 'true')
    return () => gl.domElement.removeAttribute('data-scene-ready')
  }, [gl, textures])
  useFrame((_, delta) => {
    const state = useSceneStore.getState()
    if (!state.motionPaused && state.renderActive && !state.reducedMotion) introMotion.elapsed += Math.min(delta, config.intro.maxDelta)
  })
  return <group name="intro-scene">
    <Starfield mobile={mobile} sprite={textures?.[3]} />
    {textures && config.intro.layers.map((layer) => <CloudLayer key={layer.name} settings={layer} mobile={mobile} texture={textures[config.intro.layers.indexOf(layer)]} />)}
  </group>
}
