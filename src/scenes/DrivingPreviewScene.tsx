import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { WorldButton } from '../components/WorldButton'
import { SceneLabel } from '../components/SceneLabel'
import { VehiclePlaceholder } from '../components/VehiclePlaceholder'
import { useJourney } from '../state/JourneyContext'
import { getPortal } from '../data/portals'
import { recommend } from '../logic/recommendation'

export function DrivingPreviewScene() {
  const { state, dispatch } = useJourney()
  const markers = useRef<Group>(null)
  const travel = useRef(0)
  const result = recommend(state.portal, state.budget, state.answers)
  const color = state.portal ? getPortal(state.portal).color : '#ffffff'
  useFrame((_, delta) => {
    if (!state.playing || !markers.current) return
    travel.current = (travel.current + Math.min(delta, 0.05) * 2) % 2
    markers.current.position.z = travel.current
  })
  return <>
    <SceneLabel text="EXPERIENCE YOUR DRIVE" position={[0, 2.65, -4]} width={4.5} fontSize={0.18} />
    <SceneLabel text="Miniature simulation · not vehicle performance" position={[0, 2.32, -4]} width={4.5} fontSize={0.1} color="#bbc6d5" />
    <group position={[0, 0.3, -5]} pointerEvents="none">
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[4, 14]} /><meshBasicMaterial color="#1c2532" /></mesh>
      <group ref={markers}>
        {Array.from({ length: 7 }, (_, index) => [-0.7, 0.7].map((x) => <mesh key={`${index}:${x}`} position={[x, 0.01, -7 + index * 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.045, 0.7]} /><meshBasicMaterial color="#c6cfdd" /></mesh>))}
      </group>
      <group position={[state.lane * 0.7, 0.03, 1]} scale={0.7}><VehiclePlaceholder silhouette={result.status === 'prototype' ? result.model.silhouette : 'sedan'} color={color} rotation={Math.PI} /></group>
    </group>
    <WorldButton label={state.playing ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'} position={[0, 1.1, -2.8]} width={2.4} onClick={() => dispatch({ type: 'preview-toggle' })} />
    <WorldButton label="LEFT" position={[-0.9, 0.65, -2.8]} width={1.1} disabled={state.lane <= -1} onClick={() => dispatch({ type: 'lane', delta: -1 })} />
    <WorldButton label="RIGHT" position={[0.9, 0.65, -2.8]} width={1.1} disabled={state.lane >= 1} onClick={() => dispatch({ type: 'lane', delta: 1 })} />
  </>
}
