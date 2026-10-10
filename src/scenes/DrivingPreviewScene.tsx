import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { WorldButton } from '../components/WorldButton'
import { SceneLabel } from '../components/SceneLabel'
import { RecommendedCar } from '../components/RecommendedCar'
import { GroundContact } from '../components/VehicleStage'
import { useJourney } from '../state/JourneyContext'
import { getAssetDescription, canPresentRealModel } from '../data/recommendationAssets'
import { recommend } from '../logic/recommendation'
import { useReducedMotion } from '../hooks/useReducedMotion'
export function DrivingPreviewScene() {
  const { state, dispatch } = useJourney()
  const markers = useRef<Group>(null)
  const travel = useRef(0)
  const reduced = useReducedMotion()
  const result = recommend(state.portal, state.budget, state.answers)
  useFrame((_, delta) => {
    if (!state.playing || reduced || !markers.current) return
    travel.current = (travel.current + Math.min(delta, 0.05) * 0.6) % 5
    markers.current.position.z = travel.current
  })
  if (result.status !== 'prototype') return null
  return <>
    <SceneLabel text="EXPERIENCE YOUR DRIVE" position={[0, 3.05, -5]} width={5.5} fontSize={0.24} />
    <SceneLabel text={`${result.model.name} · stationary atmosphere preview`} position={[0, 2.7, -5]} width={5.5} fontSize={0.14} color="#bbc6d5" />
    <group position={[state.lane * 0.6, 0.025, -6.4]}><GroundContact /><group scale={2}><RecommendedCar model={result.model} rotation={Math.PI / 6} /></group></group>
    <group ref={markers} pointerEvents="none">{Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[0, 0.02, -17 - i * 5]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.07, 1.7]} /><meshBasicMaterial color="#bdc4cb" /></mesh>)}</group>
    <SceneLabel text={reduced ? 'Reduced motion enabled. The environment remains still.' : 'Your viewpoint stays still. Optional movement affects distant road markings only.'} position={[0, 1.85, -3.8]} width={4.8} height={0.4} fontSize={0.11} color="#b9c7d5" />
    {!canPresentRealModel(result.model.id) && <SceneLabel text={getAssetDescription(result.model.id)} position={[0, 2.2, -3.8]} width={4.8} height={0.4} fontSize={0.1} color="#d0b18b" />}
    <WorldButton label={state.playing ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'} position={[0, 1.2, -3.8]} width={2.5} height={0.45} disabled={reduced} onClick={() => dispatch({ type: 'preview-toggle' })} />
    <WorldButton label="LEFT" position={[-0.95, 0.72, -3.8]} width={1.2} height={0.35} disabled={state.lane <= -1} onClick={() => dispatch({ type: 'lane', delta: -1 })} />
    <WorldButton label="RIGHT" position={[0.95, 0.72, -3.8]} width={1.2} height={0.35} disabled={state.lane >= 1} onClick={() => dispatch({ type: 'lane', delta: 1 })} />
  </>
}
