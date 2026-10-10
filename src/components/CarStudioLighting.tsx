import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { carEnvironmentIntensity, createCarStudioEnvironment } from '../logic/carLighting'

/** Fixed world-space PBR reflections. No network HDR or per-frame cube captures. */
export function CarStudioLighting() {
  const { gl, scene } = useThree()
  useEffect(() => {
    const studio = createCarStudioEnvironment()
    const generator = new PMREMGenerator(gl)
    const target = generator.fromScene(studio.scene, 0.015, 0.1, 30, { size: 256 })
    const previous = { environment: scene.environment, intensity: scene.environmentIntensity }
    // Three's mutable scene environment is synchronized with its GPU resource lifetime.
    // oxlint-disable-next-line react/immutability
    scene.environment = target.texture
    scene.environmentIntensity = carEnvironmentIntensity
    studio.dispose()
    generator.dispose()
    return () => {
      scene.environment = previous.environment
      scene.environmentIntensity = previous.intensity
      target.dispose()
    }
  }, [gl, scene])
  // Direct lights belong to the fixed stage, never the rotating vehicle group.
  return null
}
