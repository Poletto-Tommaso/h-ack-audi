import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MathUtils, MeshBasicMaterial } from 'three'

const dormant = new Color('#323842')
const active = new Color('#e0183b')

export function OriginEnvironment({ awakened }: { awakened: boolean }) {
  const portalMaterial = useRef<MeshBasicMaterial>(null)
  useFrame((_, delta) => {
    portalMaterial.current?.color.lerp(awakened ? active : dormant, MathUtils.damp(0, 1, 3, Math.min(delta, 0.1)))
  })
  return <>
    <color attach="background" args={['#080a0d']} />
    <fog attach="fog" args={['#080a0d', 8, 26]} />
    <group pointerEvents="none">
    <ambientLight intensity={1.4} />
    <directionalLight position={[3, 6, 2]} intensity={3} color="#e0e8ff" />
    <pointLight position={[0, 2, -4]} intensity={awakened ? 22 : 8} distance={10} color={awakened ? '#ff2446' : '#c7d7ff'} />
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 80]} /><meshStandardMaterial color="#101318" roughness={0.55} metalness={0.3} /></mesh>
    <mesh position={[0, 2.4, -6]}><torusGeometry args={[2.8, 0.025, 6, 96]} /><meshBasicMaterial ref={portalMaterial} color="#323842" /></mesh>
    <mesh position={[0, 2.4, -6.04]}><torusGeometry args={[2.9, 0.065, 6, 96]} /><meshStandardMaterial color="#242931" metalness={0.5} roughness={0.4} /></mesh>
    {[-3.5, 3.5].map((x) => <group key={x}>
      <mesh position={[x, 2, -5]}><boxGeometry args={[0.035, 4, 0.04]} /><meshBasicMaterial color="#5b6473" /></mesh>
      <mesh position={[x, 0.008, -9]}><boxGeometry args={[0.025, 0.015, 24]} /><meshBasicMaterial color={awakened ? '#be1332' : '#454e5e'} /></mesh>
    </group>)}
    {Array.from({ length: 9 }, (_, index) => <mesh key={index} position={[0, 0.006, -index * 2]}><boxGeometry args={[7, 0.01, 0.012]} /><meshBasicMaterial color="#252b35" /></mesh>)}
    <mesh position={[0, 0.12, -3]}><cylinderGeometry args={[1.45, 1.6, 0.24, 64]} /><meshStandardMaterial color="#20242b" roughness={0.45} metalness={0.4} /></mesh>
    <mesh position={[0, 0.245, -3]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.4, 1.43, 64]} /><meshBasicMaterial color={awakened ? '#e0183b' : '#6b7787'} /></mesh>
    </group>
  </>
}
