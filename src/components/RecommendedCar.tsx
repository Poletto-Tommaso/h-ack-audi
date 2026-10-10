import type { MockModel } from '../data/mockModels'
import { getRecommendationAsset } from '../data/recommendationAssets'
import { AudiCarModel } from './AudiCarModel'
import { VehiclePlaceholder } from './VehiclePlaceholder'

export function RecommendedCar({ model, rotation = 0, color }: { model: MockModel; rotation?: number; color?: string }) {
  const asset = getRecommendationAsset(model.id)
  return asset?.available ? <AudiCarModel vehicleId={asset.id} rotation={[0, rotation, 0]} /> : <VehiclePlaceholder silhouette={model.silhouette} rotation={rotation} color={color} />
}
