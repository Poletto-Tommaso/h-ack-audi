import { getAudiModel } from './audiModels'
import type { AudiVehicleId } from './audiModels'

// Family previews only. The actual imported variant must always be identified in UI.
// A3 Sportback has no matching asset: the discovered A3 Sedan is deliberately not mapped.
const familyAssets: Readonly<Record<string, AudiVehicleId>> = {
  rs3: 'audi-rs3', rs6: 'audi-rs6', a5: 'audi-a5-sportback', a6: 'audi-a6-limousine',
  q5: 'audi-q5', q4: 'audi-q4-etron', 'etron-gt': 'audi-etron-gt',
}
export function getRecommendationAsset(modelId: string) {
  const id = familyAssets[modelId]
  return id ? getAudiModel(id) : undefined
}
export function getAssetDescription(modelId: string) {
  const asset = getRecommendationAsset(modelId)
  return asset?.available ? `3D asset: ${asset.name}. Source variant preview; trim may differ from the prototype suggestion.` : 'Generic vehicle placeholder. No matching 3D asset is available for this candidate.'
}
