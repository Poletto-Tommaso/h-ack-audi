import { useState } from 'react'
import { SceneLabel } from './SceneLabel'

export function WorldButton({ label, position, onClick }: { label: string; position: [number, number, number]; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return <group position={position}>
    <mesh
      onClick={(event) => { event.stopPropagation(); onClick() }}
      onPointerOver={(event) => { event.stopPropagation(); setHovered(true) }}
      onPointerOut={() => setHovered(false)}
      pointerEventsType={{ deny: 'grab' }}
    >
      <boxGeometry args={[0.7, 0.22, 0.05]} />
      <meshBasicMaterial color={hovered ? '#bb0a30' : '#292b30'} />
    </mesh>
    <SceneLabel text={label} position={[0, 0, 0.03]} width={0.6} />
  </group>
}
