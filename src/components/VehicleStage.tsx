import { useEffect, useMemo } from 'react'
import { CanvasTexture } from 'three'
import { useXR } from '@react-three/xr'
import { CarKeyLighting } from './CarKeyLighting'
export function GroundContact() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(0,0,0,0.65)'); gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128)
    return new CanvasTexture(canvas)
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} pointerEvents="none"><planeGeometry args={[3.4, 5.2]} /><meshBasicMaterial map={texture} transparent depthWrite={false} /></mesh>
}
export function VehicleStage() {
  const session = useXR(state => state.session)
  return <group pointerEvents="none">
    <color attach="background" args={['#080b10']} /><fog attach="fog" args={['#080b10', 13, 42]} />
    <hemisphereLight args={['#e8e8e8', '#161616', 0.15]} />
    <CarKeyLighting shadows={!session} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#141920" roughness={0.6} metalness={0.15} /></mesh>
    <group position={[0, 0.1, -6.4]}>
      <mesh receiveShadow><cylinderGeometry args={[3.3, 3.4, 0.2, 64]} /><meshStandardMaterial color="#262e38" roughness={0.65} metalness={0.25} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.105, 0]}><ringGeometry args={[3.24, 3.26, 64]} /><meshBasicMaterial color="#8e98a5" /></mesh>
    </group>
    {[-6, 6].map(x => <group key={x} position={[x, 3, -10]}>
      <mesh><boxGeometry args={[0.16, 6, 0.8]} /><meshStandardMaterial color="#333c48" metalness={0.3} roughness={0.6} /></mesh>
      <mesh position={[-Math.sign(x) * 0.085, 0, 0.3]}><boxGeometry args={[0.025, 5.5, 0.05]} /><meshBasicMaterial color="#c8d1dc" /></mesh>
    </group>)}
    <mesh position={[0, 0.015, -2]}><boxGeometry args={[0.025, 0.02, 2.7]} /><meshBasicMaterial color="#9f273c" /></mesh>
  </group>
}
