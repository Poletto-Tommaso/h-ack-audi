import { useLayoutEffect, useMemo } from 'react'
import { Object3D } from 'three'
import { invalidateCarShadows } from '../logic/carLighting'
import { useThree } from '@react-three/fiber'

/** Fixed scene lights supplement the broad softbox environment and ground the car. */
export function CarKeyLighting({ target = [0, 0.8, -6.4], shadows = false }: { target?: [number, number, number]; shadows?: boolean }) {
  const scene = useThree(state => state.scene)
  const [x, y, z] = target
  const aim = useMemo(() => {
    const object = new Object3D()
    object.position.set(x, y, z)
    return object
  }, [x, y, z])
  useLayoutEffect(() => { invalidateCarShadows(scene) }, [scene, shadows, aim])
  return <group name="Fixed car key and fill lighting" pointerEvents="none">
    <primitive object={aim} />
    <directionalLight position={[x - 4, y + 7, z + 5]} target={aim} color="#fff6ec" intensity={1.35} castShadow={shadows}
      shadow-autoUpdate={false} shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4}
      shadow-camera-near={0.5} shadow-camera-far={22} shadow-normalBias={0.025} shadow-bias={-0.0001} />
    <directionalLight position={[x + 5, y + 3, z - 4]} target={aim} color="#edf2ff" intensity={0.25} />
  </group>
}
