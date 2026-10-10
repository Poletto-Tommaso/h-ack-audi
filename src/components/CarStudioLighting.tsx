import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

/** Local studio reflections, no HDR downloads or per-frame cube captures. */
export function CarStudioLighting() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const room = new RoomEnvironment()
    const generator = new PMREMGenerator(gl)
    const target = generator.fromScene(room, 0.04)
    const previous = scene.environment
    // Three.js owns this mutable scene; synchronize its environment with the GPU resource lifetime.
    // oxlint-disable-next-line react/immutability
    scene.environment = target.texture
    room.dispose()
    generator.dispose()
    return () => { scene.environment = previous; target.dispose() }
  }, [gl, scene])
  return <>
    <hemisphereLight args={['#e5edff', '#353a44', 1.2]} />
    <directionalLight position={[3, 5, 4]} intensity={2.2} />
  </>
}
