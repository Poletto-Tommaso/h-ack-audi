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
    {/* A separate near, low navigation rail avoids overlapping the answer/continue rays. */}
    {state.scene !== 'origin' && <WorldButton label={state.scene === 'result' && state.mode !== 'reveal' ? 'BACK TO YOUR AUDI' : 'BACK'} position={[-1.15, 0.25, -2.3]} width={1.8} height={0.38} onClick={() => dispatch({ type: 'back' })} />}
    <WorldButton label="RESTART" position={[0.55, 0.25, -2.3]} width={1.1} height={0.38} onClick={() => dispatch({ type: 'restart' })} />
    {session && <WorldButton label="EXIT VR" position={[1.85, 0.25, -2.3]} width={1.1} height={0.38} onClick={() => { void session.end().catch(() => setError(true)) }} />}
    {error && <SceneLabel text="Use the headset system menu to exit VR." position={[0, 0.7, -2.3]} width={3} fontSize={0.08} color="#ff8ba3" />}
  </group>
}
