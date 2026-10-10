import { usePointerFeedback } from '../hooks/usePointerFeedback'
import { SceneLabel } from './SceneLabel'
import { PortalLandscape } from './PortalLandscape'
import type { portals } from '../data/portals'

export function PortalCard({ portal, position, selected, onSelect }: { portal: typeof portals[number]; position: [number, number, number]; selected: boolean; onSelect: () => void }) {
  const { hovered, handlers } = usePointerFeedback()
  return <group position={position} name={`${portal.title} portal`}>
    <mesh pointerEvents="none" position={[0, 0, -0.03]}><boxGeometry args={[2.02, 0.97, 0.03]} /><meshBasicMaterial color={hovered || selected ? '#ffffff' : portal.color} /></mesh>
    <mesh {...handlers} onClick={(event) => { event.stopPropagation(); onSelect() }} pointerEventsType={{ deny: 'grab' }}>
      <boxGeometry args={[1.97, 0.92, 0.04]} /><meshBasicMaterial color={hovered ? '#303846' : '#151d29'} />
    </mesh>
    <group position={[0, 0.13, 0.08]} scale={0.64}><PortalLandscape portal={portal.id} color={portal.color} /></group>
    <SceneLabel text={portal.title} position={[0, -0.16, 0.06]} width={1.8} height={0.14} fontSize={0.095} color={portal.color} />
    <SceneLabel text={portal.description} position={[0, -0.34, 0.06]} width={1.8} height={0.18} fontSize={0.064} color="#d0d8e4" />
  </group>
}
