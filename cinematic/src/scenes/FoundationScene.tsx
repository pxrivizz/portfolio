import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { experienceConfig as config } from '../config/experience.config'
export default function FoundationScene() {
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    gl.domElement.setAttribute('data-scene-ready', 'true')
    invalidate()
    return () => { gl.domElement.removeAttribute('data-scene-ready') }
  }, [gl, invalidate])
  const shape = config.foundation
  return <group rotation={shape.tilt}>
    <mesh><torusGeometry args={[shape.radius, shape.tube, shape.radialSegments, shape.tubularSegments]} /><meshBasicMaterial color={config.colors.line} /></mesh>
    <mesh rotation={[Math.PI / 2, 0, 0]} scale={shape.innerScale}><torusGeometry args={[shape.radius, shape.tube, shape.radialSegments, shape.tubularSegments]} /><meshBasicMaterial color={config.colors.line} /></mesh>
  </group>
}
