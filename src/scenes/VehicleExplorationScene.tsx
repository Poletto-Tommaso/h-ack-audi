import { useJourney } from '../state/JourneyContext'
import { recommend } from '../logic/recommendation'
import { getPortal } from '../data/portals'
import { RecommendedCar } from '../components/RecommendedCar'
import { getRecommendationAsset } from '../data/recommendationAssets'
import { SceneHeading } from '../components/SceneHeading'
import { WorldButton } from '../components/WorldButton'
import { SceneLabel } from '../components/SceneLabel'

export function VehicleExplorationScene() {
  const { state, dispatch } = useJourney()
  const result = recommend(state.portal, state.budget, state.answers)
  if (result.status !== 'prototype') return null
  const asset = getRecommendationAsset(result.model.id)
  return <>
    <SceneHeading title={result.model.name.toUpperCase()} subtitle={asset ? `Source variant: ${asset.name}` : '3D exploration · generic vehicle blockout'} />
    <group position={[0, 0.3, -3.9]} scale={0.9}><RecommendedCar model={result.model} rotation={state.rotation} color={state.vehicleColor} /></group>
    <WorldButton label="ROTATE LEFT" position={[-0.9, 0.88, -2.65]} width={1.5} onClick={() => dispatch({ type: 'rotate', delta: -Math.PI / 6 })} />
    <WorldButton label="ROTATE RIGHT" position={[0.9, 0.88, -2.65]} width={1.5} onClick={() => dispatch({ type: 'rotate', delta: Math.PI / 6 })} />
    {!asset && <>
      <WorldButton label="SILVER" position={[-0.65, 0.44, -2.65]} width={1.1} selected={state.vehicleColor === '#d8dde6'} onClick={() => dispatch({ type: 'paint', color: '#d8dde6' })} />
      <WorldButton label="ROUTE COLOR" position={[0.65, 0.44, -2.65]} width={1.3} selected={state.vehicleColor !== '#d8dde6'} onClick={() => dispatch({ type: 'paint', color: getPortal(state.portal!).color })} />
    </>}
    <SceneLabel text={asset ? 'Imported source materials preserved. Variant may differ from suggestion.' : "Illustrative geometry; not the selected model's design."} position={[0, 1.5, -3.9]} width={3.6} fontSize={0.08} color="#b6c0d0" />
  </>
}
