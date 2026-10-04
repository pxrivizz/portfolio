import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
export function CameraController() {
  const camera = useThree((state) => state.camera)
  useEffect(() => { camera.lookAt(0, 0, 0); camera.updateProjectionMatrix() }, [camera])
  return null
}
