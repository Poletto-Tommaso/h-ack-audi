import type { MockModel } from '../data/mockModels'
import { getRecommendationAsset } from '../data/recommendationAssets'
import { AudiCarModel } from './AudiCarModel'
import type { ModelStatus } from './AudiCarModel'
import { useXR } from '@react-three/xr'

export function RecommendedCar({ model, rotation = 0, onStatus, showStatusLabel = true }: { model: MockModel; rotation?: number; onStatus?: (status: ModelStatus) => void; showStatusLabel?: boolean }) {
  const session = useXR(state => state.session)
  const asset = getRecommendationAsset(model.id)
  // Desktop uses the exact original model.glb. VR may use an optimized copy of that same car.
  return <AudiCarModel vehicleId={asset?.id || model.assetId} detail={session ? 'preview' : 'source'} showStatusLabel={showStatusLabel} rotation={[0, rotation, 0]} onStatus={onStatus} />
}
