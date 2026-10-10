import { useJourney } from '../state/JourneyContext'
import { recommend } from '../logic/recommendation'
import { formatBudget } from '../logic/budget'
import { getPortal } from '../data/portals'
import { SceneHeading } from '../components/SceneHeading'
import { SceneLabel } from '../components/SceneLabel'
import { WorldButton } from '../components/WorldButton'
import { RecommendedCar } from '../components/RecommendedCar'
import { getRecommendationAsset } from '../data/recommendationAssets'
import { useBooking } from '../hooks/useBooking'

export function YourAudiScene() {
  const { state, dispatch } = useJourney()
  const booking = useBooking()
  const result = recommend(state.portal, state.budget, state.answers)
  if (result.status !== 'prototype') return <>
    <SceneHeading title="YOUR AUDI" subtitle="No verified affordable match" />
    <SceneLabel text={result.message} position={[0, 1.65, -3.2]} width={3.5} height={0.7} fontSize={0.12} />
    <SceneLabel text={`${state.portal ? getPortal(state.portal).title : 'No route'} · ${formatBudget(state.budget)}`} position={[0, 1.1, -3.2]} width={3.3} color="#c5cede" />
    <WorldButton label="ADJUST BUDGET" position={[0, 0.65, -3]} onClick={() => dispatch({ type: 'edit-budget' })} />
  </>
  return <>
    <SceneHeading title="WE FOUND YOUR DRIVE." subtitle="YOUR AUDI · PROTOTYPE SUGGESTION" />
    <SceneLabel text={result.model.name} position={[0, 2.02, -3.4]} width={3.8} height={0.35} fontSize={0.22} />
    <SceneLabel text={`${getPortal(state.portal!).title} · ${formatBudget(state.budget)}`} position={[0, 1.77, -3.4]} width={3.8} fontSize={0.095} color="#b8c6d9" />
    <group position={[-1.05, 0.72, -3.5]} scale={0.5}><RecommendedCar model={result.model} rotation={Math.PI / 5} /></group>
    {result.reasons.map((reason, index) => <SceneLabel key={reason} text={`${index + 1}. ${reason}`} position={[0.83, 1.45 - index * 0.28, -3.4]} width={2.05} height={0.26} fontSize={0.072} align="left" />)}
    <SceneLabel text={booking.message || `MOCK MATCH · Affordability unverified. ${getRecommendationAsset(result.model.id) ? `Asset variant: ${getRecommendationAsset(result.model.id)!.name}.` : 'Generic placeholder.'}`} position={[0, 0.69, -3.1]} width={3.8} height={0.36} fontSize={0.072} color="#e8bf94" />
    <WorldButton label="EXPLORE YOUR AUDI" position={[-1.32, 0.34, -3.3]} width={1.2} height={0.36} fontSize={0.078} onClick={() => dispatch({ type: 'mode', mode: 'explore' })} />
    <WorldButton label="EXPERIENCE YOUR DRIVE" position={[0, 0.34, -3.3]} width={1.25} height={0.36} fontSize={0.078} onClick={() => dispatch({ type: 'mode', mode: 'drive' })} />
    <WorldButton label="BOOK A TEST DRIVE" position={[1.32, 0.34, -3.3]} width={1.2} height={0.36} fontSize={0.078} onClick={booking.open} />
  </>
}
