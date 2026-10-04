import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Starfield } from './intro/Starfield'
export default function HubBackdrop({ mobile }: { mobile: boolean }) {
  const gl = useThree((state) => state.gl)
  useEffect(() => {
    gl.domElement.setAttribute('data-scene-ready', 'true')
    return () => gl.domElement.removeAttribute('data-scene-ready')
  }, [gl])
  return <Starfield mobile={mobile} />
}
