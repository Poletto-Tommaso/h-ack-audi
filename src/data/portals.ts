export type PortalId = 'performance' | 'comfort' | 'everyday' | 'emotion'
export type Trait = 'power' | 'handling' | 'comfort' | 'space' | 'technology' | 'compact' | 'versatility' | 'efficiency' | 'range'

export const portals: { id: PortalId; title: string; description: string; environment: string; color: string }[] = [
  { id: 'performance', title: 'PERFORMANCE', description: 'Sporty driving, acceleration, excitement.', environment: 'Racing circuit', color: '#ff3157' },
  { id: 'comfort', title: 'COMFORT', description: 'Relaxation, premium travel, quiet driving.', environment: 'Panoramic road', color: '#e8b885' },
  { id: 'everyday', title: 'EVERYDAY', description: 'Practicality, agility, everyday mobility.', environment: 'Modern city', color: '#87c9dd' },
  { id: 'emotion', title: 'E-MOTION', description: 'Electric mobility, range, modern technology.', environment: 'Future landscape', color: '#bda2ff' },
]
export const getPortal = (id: PortalId) => portals.find((portal) => portal.id === id)!
