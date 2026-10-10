export function SpatialPanel({ position = [0, 1.55, -3.65], width = 4.4, height = 2.65 }: { position?: [number, number, number]; width?: number; height?: number }) {
  return <group position={position} pointerEvents="none">
    <mesh><boxGeometry args={[width, height, 0.05]} /><meshBasicMaterial color="#10151b" transparent opacity={0.96} /></mesh>
    <mesh position={[0, height / 2, 0.03]}><boxGeometry args={[width, 0.015, 0.015]} /><meshBasicMaterial color="#6b737f" /></mesh>
    <mesh position={[-width / 2 + 0.36, height / 2, 0.04]}><boxGeometry args={[0.65, 0.023, 0.015]} /><meshBasicMaterial color="#bb1833" /></mesh>
  </group>
}
