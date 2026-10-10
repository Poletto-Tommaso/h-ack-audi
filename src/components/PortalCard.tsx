import { usePointerFeedback } from '../hooks/usePointerFeedback'
import { SceneLabel } from './SceneLabel'
import { PortalLandscape } from './PortalLandscape'
import type { portals } from '../data/portals'

export function PortalCard({ portal, position, rotation = 0, selected, onSelect }: { portal: typeof portals[number]; position: [number, number, number]; rotation?: number; selected: boolean; onSelect: () => void }) {
  const { hovered, handlers } = usePointerFeedback()
  return <group position={position} rotation={[0, rotation, 0]} name={`${portal.title} portal`}>
    <mesh pointerEvents="none" position={[0, 0, -0.04]}><boxGeometry args={[1.9, 2.65, 0.15]} /><meshStandardMaterial color={hovered || selected ? '#dce3eb' : '#505b69'} metalness={0.6} roughness={0.3} /></mesh>
    <mesh {...handlers} onClick={(event) => { event.stopPropagation(); onSelect() }} pointerEventsType={{ deny: 'grab' }}>
      <boxGeometry args={[1.82, 2.57, 0.08]} /><meshBasicMaterial color={hovered ? '#27313d' : '#121a24'} />
    </mesh>
    <group position={[0, 0.43, 0.24]}><PortalLandscape portal={portal.id} color={portal.color} /></group>
    <mesh position={[0, -0.16, 0.09]} pointerEvents="none"><boxGeometry args={[1.55, 0.018, 0.02]} /><meshBasicMaterial color={hovered || selected ? '#c42a42' : portal.color} /></mesh>
    <SceneLabel text={portal.title} position={[0, -0.42, 0.09]} width={1.65} height={0.26} fontSize={0.135} />
    <SceneLabel text={hovered || selected ? portal.description : portal.environment} position={[0, -0.8, 0.09]} width={1.6} height={0.46} fontSize={0.105} color="#c5ced8" />
    <SceneLabel text={hovered ? 'SELECT TO ENTER →' : 'POINT TO DISCOVER'} position={[0, -1.16, 0.09]} width={1.6} height={0.18} fontSize={0.08} color={hovered ? '#ffffff' : '#a0aab7'} />
  </group>
}
