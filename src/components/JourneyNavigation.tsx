import { useState } from 'react'
import { useXR } from '@react-three/xr'
import { useJourney } from '../state/JourneyContext'
import { SceneLabel } from './SceneLabel'
import { WorldButton } from './WorldButton'

export function JourneyNavigation() {
  const { state, dispatch } = useJourney()
  const session = useXR((xr) => xr.session)
  const [error, setError] = useState(false)
  return <group>
    {state.scene !== 'origin' && <WorldButton label="BACK" position={[-0.9, 0.17, -2]} width={0.7} height={0.3} onClick={() => dispatch({ type: 'back' })} />}
    <WorldButton label="RESTART" position={[0, 0.17, -2]} width={0.9} height={0.3} onClick={() => dispatch({ type: 'restart' })} />
    {session && <WorldButton label="EXIT VR" position={[0.9, 0.17, -2]} width={0.7} height={0.3} onClick={() => { void session.end().catch(() => setError(true)) }} />}
    {error && <SceneLabel text="Use the headset system menu to exit VR." position={[0, 0.48, -2.8]} width={3} fontSize={0.08} color="#ff8ba3" />}
  </group>
}
