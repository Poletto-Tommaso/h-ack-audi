import { InstancedBoxes } from './InstancedBoxes'
import type { BoxInstance } from './InstancedBoxes'
const stone: BoxInstance[] = [], windows: BoxInstance[] = [], trim: BoxInstance[] = []
for (const side of [-1, 1]) {
  stone.push({ position: [side * 10, 4, -9], scale: [4, 8, 28] })
  for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) windows.push({ position: [side * 7.97, 1.8 + row * 2.1, 3 - i * 2.8], scale: [0.035, 1.35, 1.1] })
  for (const y of [0.45, 3.1, 5.3, 7.8]) trim.push({ position: [side * 7.85, y, -9], scale: [0.25, 0.16, 28] })
}
stone.push({ position: [0, 4.5, -24], scale: [24, 9, 2] })
for (let i = -5; i <= 5; i++) {
  stone.push({ position: [i * 2.1, 2.1, -22.4], scale: [0.45, 4.2, 0.65] })
  windows.push({ position: [i * 2.1, 6.3, -22.97], scale: [1.05, 1.8, 0.03] })
}
trim.push({ position: [0, 4.35, -22.3], scale: [24, 0.35, 0.85] }, { position: [0, 8.9, -22.7], scale: [25, 0.25, 2.5] })
const paving: BoxInstance[] = Array.from({ length: 17 }, (_, i) => ({ position: [0, 0.004, 5 - i * 2], scale: [16, 0.008, 0.018] }))
export function OriginEnvironment({ awakened = false }: { awakened?: boolean }) {
  return <group pointerEvents="none" name="Provisional European architectural square">
    <color attach="background" args={['#0a0d12']} /><fog attach="fog" args={['#0a0d12', 13, 44]} />
    <hemisphereLight args={['#c1c9d4', '#17191e', 1.3]} />
    <directionalLight position={[-8, 12, 4]} intensity={2.4} color="#e2d2b9" />
    <pointLight position={[0, 4, -7]} intensity={45} distance={18} color={awakened ? '#d9e1ef' : '#d8bd95'} />
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#24282e" roughness={0.84} /></mesh>
    <InstancedBoxes boxes={stone} color="#45464a" /><InstancedBoxes boxes={windows} color="#101923" metalness={0.2} /><InstancedBoxes boxes={trim} color="#626266" />
    <InstancedBoxes boxes={paving} color="#363a40" />
    {[-6.6, 6.6].map(x => <group key={x} position={[x, 0, -7]}>
      <mesh position={[0, 1.8, 0]}><cylinderGeometry args={[0.035, 0.055, 3.6, 8]} /><meshStandardMaterial color="#13181f" metalness={0.5} roughness={0.4} /></mesh>
      <mesh position={[0, 3.65, 0]}><boxGeometry args={[0.35, 0.1, 0.35]} /><meshBasicMaterial color="#ebdfce" /></mesh>
    </group>)}
    <mesh position={[0, 0.009, -5]}><boxGeometry args={[0.018, 0.015, 13]} /><meshBasicMaterial color="#8c2737" /></mesh>
  </group>
}
