import { usePointerFeedback } from '../hooks/usePointerFeedback'
import { SceneLabel } from './SceneLabel'

type Props = { label: string; position: [number, number, number]; onClick: () => void; width?: number; height?: number; selected?: boolean; disabled?: boolean; color?: string; fontSize?: number }
export function WorldButton({ label, position, onClick, width = 2.5, height = 0.36, selected = false, disabled = false, color = '#bb0a30', fontSize = 0.095 }: Props) {
  const { hovered, handlers } = usePointerFeedback()
  return <group position={position} name={label}>
    <mesh pointerEvents="none" position={[0, 0, -0.012]}>
      <boxGeometry args={[width + 0.025, height + 0.025, 0.04]} />
      <meshBasicMaterial color={disabled ? '#2b3038' : selected || hovered ? color : '#697382'} />
    </mesh>
    <mesh {...handlers} onClick={(event) => { event.stopPropagation(); if (!disabled) onClick() }} pointerEventsType={{ deny: 'grab' }}>
      <boxGeometry args={[width, height, 0.04]} />
      <meshBasicMaterial color={disabled ? '#151920' : selected ? '#3d2a3e' : hovered ? '#3b4350' : '#222832'} />
    </mesh>
    <SceneLabel text={label} position={[0, 0, 0.025]} width={width - 0.12} height={height - 0.04} fontSize={fontSize} color={disabled ? '#727a87' : '#ffffff'} />
  </group>
}
