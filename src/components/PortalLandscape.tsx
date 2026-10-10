import type { PortalId } from '../data/portals'
export function PortalLandscape({ portal, color }: { portal: PortalId; color: string }) {
  return <group pointerEvents="none" rotation={[0.22, 0, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.24, 0]}><planeGeometry args={[1.7, 1.2]} /><meshStandardMaterial color="#343b43" roughness={0.9} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.23, 0]}><planeGeometry args={[0.48, 1.18]} /><meshBasicMaterial color="#101923" /></mesh>
    {portal === 'performance' && <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}><torusGeometry args={[0.45, 0.07, 4, 28]} /><meshStandardMaterial color="#59616a" roughness={0.85} /></mesh>
      {[-1, 1].map(s => <group key={s} position={[s * 0.67, 0, -0.2]}><mesh><boxGeometry args={[0.22, 0.45, 0.7]} /><meshStandardMaterial color="#6e737b" /></mesh><mesh position={[0, 0.25, 0]}><boxGeometry args={[0.28, 0.05, 0.8]} /><meshBasicMaterial color={color} /></mesh></group>)}
    </>}
    {portal === 'comfort' && <>
      {[-0.55, 0.57].map((x, i) => <mesh key={x} position={[x, 0.08, -0.22]} rotation={[0, i, 0]}><coneGeometry args={[0.38, 0.65, 5]} /><meshStandardMaterial color={i ? '#8a8e7d' : '#697467'} roughness={1} /></mesh>)}
      <mesh position={[0, 0.42, -0.4]}><sphereGeometry args={[0.12, 16, 8]} /><meshBasicMaterial color="#d2b489" /></mesh>
    </>}
    {portal === 'everyday' && [-0.62, -0.35, 0.35, 0.62].map((x, i) => <group key={x} position={[x, 0.03, -0.15]}><mesh><boxGeometry args={[0.22, i % 2 ? 0.7 : 0.48, 0.32]} /><meshStandardMaterial color={i % 2 ? '#697784' : '#4e5d6b'} /></mesh><mesh position={[0, 0.05, 0.165]}><boxGeometry args={[0.13, 0.22, 0.01]} /><meshBasicMaterial color="#bac5cb" /></mesh></group>)}
    {portal === 'emotion' && [-0.35, 0.25].map(z => <group key={z} position={[0, 0, z]}>
      {[-0.62, 0.62].map(x => <mesh key={x} position={[x, 0.08, 0]}><boxGeometry args={[0.08, 0.62, 0.14]} /><meshStandardMaterial color="#c4cace" metalness={0.3} /></mesh>)}
      <mesh position={[0, 0.4, 0]}><boxGeometry args={[1.38, 0.08, 0.3]} /><meshStandardMaterial color="#bac4cd" /></mesh>
      <mesh position={[0, 0.35, 0.16]}><boxGeometry args={[1.2, 0.015, 0.015]} /><meshBasicMaterial color={color} /></mesh>
    </group>)}
  </group>
}
