import type { PortalId } from '../data/portals'

// Miniature procedural vignettes. No textures, particles, shadows, or remote models.
export function PortalLandscape({ portal, color }: { portal: PortalId; color: string }) {
  return <group pointerEvents="none">
    <mesh position={[0, -0.12, 0]} rotation={[-Math.PI / 2.7, 0, 0]}><planeGeometry args={[1.16, 0.8]} /><meshBasicMaterial color="#111923" /></mesh>
    {portal === 'performance' && <>
      <mesh rotation={[-0.7, 0, 0]}><torusGeometry args={[0.32, 0.04, 4, 28]} /><meshBasicMaterial color={color} /></mesh>
      {[0, 1, 2, 3].map((i) => <mesh key={i} position={[-0.48 + i * 0.11, 0.28, 0.01]}><boxGeometry args={[0.08, 0.07, 0.02]} /><meshBasicMaterial color={i % 2 ? '#ffffff' : color} /></mesh>)}
    </>}
    {portal === 'comfort' && <>
      <mesh position={[0, 0.2, -0.1]}><circleGeometry args={[0.16, 24]} /><meshBasicMaterial color={color} /></mesh>
      {[-0.35, 0.3].map((x) => <mesh key={x} position={[x, 0.02, 0]}><coneGeometry args={[0.34, 0.35, 4]} /><meshBasicMaterial color="#7d7269" /></mesh>)}
      <mesh position={[0, -0.15, 0.15]} rotation={[-0.7, 0, -0.12]}><planeGeometry args={[0.17, 0.6]} /><meshBasicMaterial color={color} /></mesh>
    </>}
    {portal === 'everyday' && [-0.42, -0.18, 0.14, 0.42].map((x, i) => <group key={x} position={[x, 0, 0]}>
      <mesh position={[0, i % 2 ? 0.08 : 0, 0]}><boxGeometry args={[0.18, i % 2 ? 0.55 : 0.4, 0.13]} /><meshBasicMaterial color={i % 2 ? '#385366' : '#253443'} /></mesh>
      <mesh position={[0, 0.03, 0.075]}><boxGeometry args={[0.045, 0.28, 0.01]} /><meshBasicMaterial color={color} /></mesh>
    </group>)}
    {portal === 'emotion' && [0.2, 0.35, 0.5].map((radius) => <mesh key={radius} rotation={[0, 0, Math.PI / 4]}><torusGeometry args={[radius, 0.012, 4, 4]} /><meshBasicMaterial color={color} /></mesh>)}
  </group>
}
