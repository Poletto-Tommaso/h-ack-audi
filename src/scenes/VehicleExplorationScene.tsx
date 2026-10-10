import { useJourney } from '../state/JourneyContext'
import { recommend } from '../logic/recommendation'
import { RecommendedCar } from '../components/RecommendedCar'
import { getAssetDescription } from '../data/recommendationAssets'
import { SceneHeading } from '../components/SceneHeading'
import { WorldButton } from '../components/WorldButton'
import { SceneLabel } from '../components/SceneLabel'
import { GroundContact } from '../components/VehicleStage'
import { VehicleInspection } from '../components/VehicleInspection'
export function VehicleExplorationScene() {
  const { state, dispatch } = useJourney()
  const result = recommend(state.portal, state.budget, state.answers)
  if (result.status !== 'prototype') return null
  return <>
    <SceneHeading title={result.model.name.toUpperCase()} subtitle="Hold the trigger and drag the vehicle, or use rotate controls." />
    <VehicleInspection onRotate={delta => dispatch({ type: 'rotate', delta })}>
      <GroundContact /><group scale={2}><RecommendedCar model={result.model} rotation={state.rotation} /></group>
    </VehicleInspection>
    <WorldButton label="ROTATE LEFT" position={[-0.95, 1.05, -3.7]} width={1.7} height={0.45} onClick={() => dispatch({ type: 'rotate', delta: -Math.PI / 6 })} />
    <WorldButton label="ROTATE RIGHT" position={[0.95, 1.05, -3.7]} width={1.7} height={0.45} onClick={() => dispatch({ type: 'rotate', delta: Math.PI / 6 })} />
    <SceneLabel text={getAssetDescription(result.model.id)} position={[0, 1.63, -3.8]} width={4.8} height={0.45} fontSize={0.11} color="#b6c0d0" />
  </>
}
