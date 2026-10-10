import { useMemo } from 'react'
import type { PortalId } from '../data/portals'
import { InstancedBoxes } from './InstancedBoxes'
import type { BoxInstance } from './InstancedBoxes'
const tones = { performance: '#0b1018', comfort: '#24272a', everyday: '#141e28', emotion: '#161e24' }
export function PortalEnvironment({ portal }: { portal: PortalId }) {
  const buildings = useMemo<BoxInstance[]>(() => [-1, 1].flatMap(side => Array.from({ length: 6 }, (_, i) => ({ position: [side * (portal === 'performance' ? 11 : 10), (portal === 'everyday' ? 6 + i % 3 * 2 : 3) / 2, -12 - i * 8], scale: [portal === 'emotion' ? 0.5 : 5, portal === 'everyday' ? 6 + i % 3 * 2 : 3, 5] }))), [portal])
  const windows = useMemo<BoxInstance[]>(() => buildings.flatMap(b => Array.from({ length: portal === 'everyday' ? 4 : 1 }, (_, i) => ({ position: [Math.sign(b.position[0]) * 7.48, 1.3 + i * 1.5, b.position[2]], scale: [0.025, 0.65, 3.9] }))), [buildings, portal])
  return <group pointerEvents="none" name={`${portal} route environment`}>
    <color attach="background" args={[tones[portal]]} /><fog attach="fog" args={[tones[portal], 17, 65]} />
    <hemisphereLight args={[portal === 'comfort' ? '#e7d9c4' : '#c8d5e3', '#171b22', 1.8]} />
    <directionalLight position={[-10, 15, -5]} intensity={2.3} color={portal === 'comfort' ? '#f2dfb9' : '#e2e9f3'} />
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[180, 180]} /><meshStandardMaterial color={portal === 'comfort' ? '#45463e' : '#222b33'} roughness={0.92} /></mesh>
    <mesh position={[0, 0.008, -30]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[6.5, 85]} /><meshStandardMaterial color="#151d25" roughness={0.86} /></mesh>
    {[-3.15, 3.15].map(x => <mesh key={x} position={[x, 0.014, -30]}><boxGeometry args={[0.05, 0.015, 85]} /><meshBasicMaterial color="#8b969f" /></mesh>)}
    {portal === 'comfort' ? <>
      {[-1, 1].flatMap(side => [0, 1, 2, 3].map(i => <mesh key={`${side}:${i}`} position={[side * (15 + i * 4), 4 + i % 2 * 2, -18 - i * 11]} rotation={[0, i * 0.6, 0]}><coneGeometry args={[12, 12 + i % 2 * 6, 5]} /><meshStandardMaterial color={i % 2 ? '#73776b' : '#565e58'} roughness={1} /></mesh>))}
      <mesh position={[-22, 14, -52]}><sphereGeometry args={[3, 20, 12]} /><meshBasicMaterial color="#d8b88b" /></mesh>
    </> : <>
      <InstancedBoxes boxes={buildings} color={portal === 'emotion' ? '#bec4c5' : '#404d5a'} metalness={portal === 'emotion' ? 0.3 : 0.05} />
      <InstancedBoxes boxes={windows} color="#75828f" metalness={0.35} />
    </>}
    {portal === 'performance' && <>
      {[0, 1, 2, 3, 4, 5].map(i => <group key={i} position={[0, 0, -12 - i * 7]}>
        {[-3.45, 3.45].map(x => <mesh key={x} position={[x, 0.04, 0]}><boxGeometry args={[0.45, 0.08, 3]} /><meshBasicMaterial color={i % 2 ? '#b62b3d' : '#c2c6c9'} /></mesh>)}
      </group>)}
      <mesh position={[0, 5, -23]}><boxGeometry args={[23, 0.7, 0.5]} /><meshStandardMaterial color="#2a323c" /></mesh>
    </>}
    {portal === 'emotion' && [-16, -29, -42].map(z => <group key={z} position={[0, 0, z]}>
      <mesh position={[0, 4, 0]}><boxGeometry args={[21, 0.35, 3]} /><meshStandardMaterial color="#a4adb3" metalness={0.3} roughness={0.55} /></mesh>
      <mesh position={[0, 3.8, 0]}><boxGeometry args={[14, 0.035, 0.06]} /><meshBasicMaterial color="#dce6e9" /></mesh>
      <mesh position={[5, 0.8, 1]}><boxGeometry args={[0.45, 1.6, 0.3]} /><meshStandardMaterial color="#d2d7da" /></mesh>
      <mesh position={[4.76, 1.1, 1]}><boxGeometry args={[0.015, 0.25, 0.2]} /><meshBasicMaterial color="#95b2ba" /></mesh>
    </group>)}
  </group>
}
