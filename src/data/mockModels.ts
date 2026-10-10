import type { PortalId, Trait } from './portals'
import { audiModels } from './audiModels'
import type { AudiVehicleId } from './audiModels'

export type MockModel = { id: string; assetId: AudiVehicleId; name: string; portals: PortalId[]; demoTier: number; traits: Trait[]; silhouette: 'sport' | 'sedan' | 'suv' }
// Eligibility tiers and traits remain fictional demo metadata, never Audi prices/specifications.
// Candidate identity, name and categories come from the imported GLB registry itself.
const demoProfiles: Record<AudiVehicleId, Pick<MockModel, 'id' | 'demoTier' | 'traits' | 'silhouette'>> = {
  'audi-a1': { id: 'a1', demoTier: 1, traits: ['compact', 'efficiency'], silhouette: 'sport' },
  'audi-a3-sedan': { id: 'a3', demoTier: 1, traits: ['compact', 'handling', 'efficiency'], silhouette: 'sedan' },
  'audi-rs3': { id: 'rs3', demoTier: 1, traits: ['power', 'handling', 'compact'], silhouette: 'sport' },
  'audi-rs6': { id: 'rs6', demoTier: 5, traits: ['power', 'space', 'comfort'], silhouette: 'sedan' },
  'audi-a5-sportback': { id: 'a5', demoTier: 1, traits: ['compact', 'comfort', 'versatility'], silhouette: 'sedan' },
  'audi-a6-limousine': { id: 'a6', demoTier: 3, traits: ['comfort', 'technology', 'versatility'], silhouette: 'sedan' },
  'audi-q4-etron': { id: 'q4', demoTier: 1, traits: ['compact', 'efficiency', 'versatility'], silhouette: 'suv' },
  'audi-q5': { id: 'q5', demoTier: 3, traits: ['space', 'versatility', 'handling'], silhouette: 'suv' },
  'audi-etron-gt': { id: 'etron-gt', demoTier: 5, traits: ['power', 'handling', 'technology'], silhouette: 'sport' },
}

export const mockModels: MockModel[] = audiModels
  .filter(asset => asset.available && asset.modelPath)
  .map(asset => ({ ...demoProfiles[asset.id], assetId: asset.id, name: asset.name, portals: [...asset.categories] }))
