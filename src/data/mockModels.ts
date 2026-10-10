import type { PortalId, Trait } from './portals'

export type MockModel = { id: string; name: string; portals: PortalId[]; demoTier: number; traits: Trait[]; silhouette: 'sport' | 'sedan' | 'suv' }
// All tiers and traits are fictional matching metadata. No Audi price/specification is asserted.
export const mockModels: MockModel[] = [
  { id: 's3', name: 'Audi S3', portals: ['performance'], demoTier: 1, traits: ['power', 'handling', 'compact'], silhouette: 'sport' },
  { id: 'rs3', name: 'Audi RS 3', portals: ['performance'], demoTier: 3, traits: ['power', 'handling', 'technology'], silhouette: 'sport' },
  { id: 's5', name: 'Audi S5', portals: ['performance'], demoTier: 3, traits: ['power', 'comfort', 'versatility'], silhouette: 'sedan' },
  { id: 'rs6', name: 'Audi RS 6', portals: ['performance'], demoTier: 5, traits: ['power', 'space', 'comfort'], silhouette: 'sedan' },
  { id: 'a5', name: 'Audi A5', portals: ['comfort'], demoTier: 1, traits: ['compact', 'comfort', 'versatility'], silhouette: 'sedan' },
  { id: 'a6', name: 'Audi A6', portals: ['comfort'], demoTier: 3, traits: ['comfort', 'technology', 'versatility'], silhouette: 'sedan' },
  { id: 'q5', name: 'Audi Q5', portals: ['comfort'], demoTier: 3, traits: ['space', 'versatility', 'handling'], silhouette: 'suv' },
  { id: 'q7', name: 'Audi Q7', portals: ['comfort'], demoTier: 4, traits: ['space', 'comfort', 'versatility'], silhouette: 'suv' },
  { id: 'a8', name: 'Audi A8', portals: ['comfort'], demoTier: 5, traits: ['comfort', 'technology', 'space'], silhouette: 'sedan' },
  { id: 'a3', name: 'Audi A3 Sportback', portals: ['everyday'], demoTier: 1, traits: ['compact', 'handling', 'efficiency'], silhouette: 'sport' },
  { id: 'q3', name: 'Audi Q3', portals: ['everyday'], demoTier: 2, traits: ['space', 'versatility', 'comfort'], silhouette: 'suv' },
  { id: 'q4', name: 'Audi Q4 e-tron', portals: ['everyday', 'emotion'], demoTier: 1, traits: ['compact', 'efficiency', 'versatility'], silhouette: 'suv' },
  { id: 'q6', name: 'Audi Q6 e-tron', portals: ['emotion'], demoTier: 3, traits: ['space', 'comfort', 'technology'], silhouette: 'suv' },
  { id: 'a6-etron', name: 'Audi A6 e-tron', portals: ['emotion'], demoTier: 3, traits: ['range', 'efficiency', 'technology'], silhouette: 'sedan' },
  { id: 'etron-gt', name: 'Audi e-tron GT', portals: ['emotion'], demoTier: 5, traits: ['power', 'handling', 'technology'], silhouette: 'sport' },
]
