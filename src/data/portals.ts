export type PortalId = 'performance' | 'comfort' | 'everyday' | 'emotion'
export type Trait = 'power' | 'handling' | 'comfort' | 'space' | 'technology' | 'compact' | 'versatility' | 'efficiency' | 'range'

export const portals: { id: PortalId; title: string; description: string; environment: string; color: string }[] = [
  { id: 'performance', title: 'PERFORMANCE', description: 'Sporty driving, acceleration, excitement.', environment: 'Racing circuit', color: '#bc3044' },
  { id: 'comfort', title: 'COMFORT', description: 'Relaxation, premium travel, quiet driving.', environment: 'Panoramic road', color: '#d3bfa5' },
  { id: 'everyday', title: 'EVERYDAY', description: 'Practicality, agility, everyday mobility.', environment: 'Modern city', color: '#b4c5d0' },
  { id: 'emotion', title: 'E-MOTION', description: 'Electric mobility, range, modern technology.', environment: 'Contemporary electric architecture', color: '#a9c9ce' },
]
export const getPortal = (id: PortalId) => portals.find((portal) => portal.id === id)!
