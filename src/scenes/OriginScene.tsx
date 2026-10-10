import { useState } from 'react'
import { useJourney } from '../state/JourneyContext'
import { useOriginPhase } from '../hooks/useOriginPhase'
import { SceneHeading } from '../components/SceneHeading'
import { SceneLabel } from '../components/SceneLabel'
import { WorldButton } from '../components/WorldButton'
import { usePointerFeedback } from '../hooks/usePointerFeedback'

export function OriginScene() {
  const { dispatch } = useJourney()
  const phase = useOriginPhase(true)
  const [awakened, setAwakened] = useState(false)
  const { hovered, handlers } = usePointerFeedback()
  return <>
    <SceneHeading title={phase ? 'WHAT DRIVES YOU?' : 'WELCOME TO AUDI.'} subtitle={phase ? 'Discover the Audi that moves you.' : 'Your journey starts here.'} />
    <group position={[0, 1.55, -3.5]}>
      <group pointerEvents="none">
        {[-0.69, -0.23, 0.23, 0.69].map((x) => <mesh key={x} position={[x, 0, 0]}>
          <torusGeometry args={[0.36, 0.027, 10, 64]} />
          <meshStandardMaterial color={awakened ? '#ff2446' : hovered ? '#ffffff' : '#d1d8e2'} emissive={awakened ? '#c50827' : '#6d7a8c'} emissiveIntensity={awakened ? 1 : 0.25} metalness={0.45} roughness={0.22} />
        </mesh>)}
      </group>
      <mesh {...handlers} pointerEventsType={{ deny: 'grab' }} onClick={(event) => { event.stopPropagation(); setAwakened((value) => !value) }}>
        <boxGeometry args={[2.2, 0.85, 0.16]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
    </group>
    <SceneLabel text="A journey beyond specifications." position={[0, 1.02, -3.5]} width={3.2} color="#b5c0d1" />
    <WorldButton label="START YOUR JOURNEY" position={[0, 0.65, -3]} onClick={() => dispatch({ type: 'start' })} />
  </>
}
