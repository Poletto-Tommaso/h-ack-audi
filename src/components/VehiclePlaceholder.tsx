import type { MockModel } from '../data/mockModels'

// Deliberately generic blockout, not the geometry or specification of an Audi model.
export function VehiclePlaceholder({ silhouette = 'sedan', color = '#d8dde6', rotation = 0 }: { silhouette?: MockModel['silhouette']; color?: string; rotation?: number }) {
  const tall = silhouette === 'suv'
  return <group rotation={[0, rotation, 0]} pointerEvents="none" name="Generic vehicle placeholder">
    <mesh position={[0, 0.43, 0]}><boxGeometry args={[1.15, 0.36, 2.25]} /><meshStandardMaterial color={color} metalness={0.35} roughness={0.32} /></mesh>
    <mesh position={[0, tall ? 0.83 : 0.75, -0.1]}><boxGeometry args={[1, tall ? 0.5 : 0.37, 1.2]} /><meshStandardMaterial color="#182635" metalness={0.2} roughness={0.25} /></mesh>
    <mesh position={[0, tall ? 1.1 : 0.96, -0.1]}><boxGeometry args={[1.02, 0.06, 1.23]} /><meshStandardMaterial color={color} metalness={0.35} roughness={0.32} /></mesh>
    {[-0.58, 0.58].flatMap((x) => [-0.72, 0.72].map((z) => <group key={`${x}:${z}`} position={[x, 0.29, z]} rotation={[0, 0, Math.PI / 2]}>
      <mesh><cylinderGeometry args={[0.28, 0.28, 0.15, 16]} /><meshStandardMaterial color="#111318" roughness={0.9} /></mesh>
      <mesh><cylinderGeometry args={[0.16, 0.16, 0.16, 12]} /><meshStandardMaterial color="#b6bfcd" metalness={0.6} roughness={0.3} /></mesh>
    </group>))}
    {[-0.4, 0.4].map((x) => <group key={x}>
      <mesh position={[x, 0.5, 1.13]}><boxGeometry args={[0.23, 0.045, 0.02]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[x, 0.5, -1.13]}><boxGeometry args={[0.23, 0.045, 0.02]} /><meshBasicMaterial color="#f51842" /></mesh>
    </group>)}
  </group>
}
