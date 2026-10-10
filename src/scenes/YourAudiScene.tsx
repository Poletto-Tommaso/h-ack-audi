import { useEffect, useState } from 'react'
import { useJourney } from '../state/JourneyContext'
import { recommend } from '../logic/recommendation'
import { formatBudget } from '../logic/budget'
import { getPortal } from '../data/portals'
import { SceneHeading } from '../components/SceneHeading'
import { SceneLabel } from '../components/SceneLabel'
import { WorldButton } from '../components/WorldButton'
import { RecommendedCar } from '../components/RecommendedCar'
import type { ModelStatus } from '../components/AudiCarModel'
import { getRecommendationAsset } from '../data/recommendationAssets'
import { GroundContact } from '../components/VehicleStage'
import { SpatialPanel } from '../components/SpatialPanel'
import { useBooking } from '../hooks/useBooking'

export function YourAudiScene() {
  const { state, dispatch } = useJourney()
  const booking = useBooking()
  const result = recommend(state.portal, state.budget, state.answers)
  const [revealed, setRevealed] = useState(false)
  const [status, setStatus] = useState<ModelStatus>('loading')
  // Reading time is independent of motion preference; model loading starts underneath.
  useEffect(() => { const timer = setTimeout(() => setRevealed(true), 1200); return () => clearTimeout(timer) }, [])
  if (result.status !== 'prototype') return <>
    <SpatialPanel /><SceneHeading title="YOUR AUDI" subtitle="No verified affordable match" />
    <SceneLabel text={result.message} position={[0, 1.65, -3.2]} width={3.5} height={0.7} fontSize={0.13} />
    <SceneLabel text={`${state.portal ? getPortal(state.portal).title : 'No route'} · ${formatBudget(state.budget)}`} position={[0, 1.1, -3.2]} width={3.3} color="#c5cede" />
    <WorldButton label="ADJUST BUDGET" position={[0, 0.65, -3]} onClick={() => dispatch({ type: 'edit-budget' })} />
  </>
  const asset = getRecommendationAsset(result.model.id)
  return <>
    {!revealed && <SceneLabel text="WE FOUND YOUR DRIVE." position={[0, 1.9, -4.5]} width={5.5} height={0.65} fontSize={0.3} />}
    <group visible={revealed}>
      <SceneLabel text="YOUR AUDI" position={[0, 3.25, -5.8]} width={5.5} height={0.35} fontSize={0.25} />
      <SceneLabel text={result.model.name} position={[0, 2.87, -5.8]} width={5.5} height={0.35} fontSize={0.23} />
      <SceneLabel text={`${getPortal(state.portal!).title} · ${formatBudget(state.budget)} · PROTOTYPE SUGGESTION`} position={[0, 2.53, -5.8]} width={5.5} fontSize={0.12} color="#b8c6d9" />
      <SceneLabel text={status === 'loading' ? 'LOADING YOUR AUDI MODEL…' : status === 'error' ? 'AUDI MODEL COULD NOT LOAD · PLEASE RELOAD' : status === 'ready' && asset ? `Original 3D asset: ${asset.name}` : 'AUDI MODEL FILE UNAVAILABLE'} position={[0, 2.22, -5.8]} width={5.5} height={0.32} fontSize={0.105} color="#c8b393" />
      <group position={[0, 0.22, -6.4]}><GroundContact /><group scale={2}><RecommendedCar model={result.model} rotation={Math.PI / 5} onStatus={setStatus} showStatusLabel={false} /></group></group>
      <SpatialPanel position={[3.65, 1.36, -6.5]} width={2.55} height={2.2} />
      <SceneLabel text="WHY THIS AUDI?" position={[3.65, 2.17, -6.4]} width={2.3} fontSize={0.15} />
      {result.reasons.map((reason, index) => <SceneLabel key={reason} text={`${index + 1}. ${reason}`} position={[3.65, 1.72 - index * 0.56, -6.4]} width={2.28} height={0.5} fontSize={0.115} align="left" />)}
      <SceneLabel text={booking.message || 'Prototype matching. Real price and affordability remain unverified.'} position={[0, 1.45, -3.8]} width={4.8} height={0.28} fontSize={0.095} color="#b7c2d1" />
      <WorldButton label="EXPLORE YOUR AUDI" position={[-1.75, 0.92, -3.8]} width={1.6} height={0.48} fontSize={0.105} onClick={() => dispatch({ type: 'mode', mode: 'explore' })} />
      <WorldButton label="EXPERIENCE YOUR DRIVE" position={[0, 0.92, -3.8]} width={1.7} height={0.48} fontSize={0.105} onClick={() => dispatch({ type: 'mode', mode: 'drive' })} />
      <WorldButton label="BOOK A TEST DRIVE" position={[1.75, 0.92, -3.8]} width={1.6} height={0.48} fontSize={0.105} onClick={booking.open} />
    </group>
  </>
}
