import { getAudiModel } from './audiModels'
import type { AudiVehicleId } from './audiModels'
import { mockModels } from './mockModels'

// Explicit, exact vehicle identities. Never use an RS model under an S model's name,
// or a sedan under a Sportback name. Candidates are derived from the asset registry.
export function getRecommendationAsset(modelId: string) {
  const candidate = mockModels.find(model => model.id === modelId)
  return getAudiModel(candidate?.assetId || modelId)
}
export function getAssetDescription(modelId: string) {
  const asset = getRecommendationAsset(modelId)
  return asset?.available && asset.modelPath ? `3D asset: ${asset.name}. Original imported GLB and materials.` : 'Audi model file unavailable. No generated vehicle is substituted.'
}
export const previewPaths: Partial<Record<AudiVehicleId, string>> = {
  'audi-a5-sportback': '/models/cars/audi-a5-sportback/model-mobile.glb',
  'audi-a6-limousine': '/models/cars/audi-a6-limousine/model-mobile.glb',
  'audi-q4-etron': '/models/cars/audi-q4-etron/model-mobile.glb',
  'audi-q5': '/models/cars/audi-q5/model-mobile.glb',
}
export const canPresentRealModel = (modelId: string) => {
  const asset = getRecommendationAsset(modelId)
  return !!(asset?.available && asset.modelPath)
}
