import { useJourney } from '../state/JourneyContext'
import { OriginEnvironment } from '../components/OriginEnvironment'
import { JourneyNavigation } from '../components/JourneyNavigation'
import { OriginScene } from './OriginScene'
import { FindYourWorldScene } from './FindYourWorldScene'
import { BudgetScene } from './BudgetScene'
import { DiscoverYourDriveScene } from './DiscoverYourDriveScene'
import { YourAudiScene } from './YourAudiScene'
import { VehicleExplorationScene } from './VehicleExplorationScene'
import { DrivingPreviewScene } from './DrivingPreviewScene'

export function JourneyScene() {
  const { state } = useJourney()
  let content
  switch (state.scene) {
    case 'origin': content = <OriginScene />; break
    case 'world': content = <FindYourWorldScene />; break
    case 'budget': content = <BudgetScene />; break
    case 'discovery': content = <DiscoverYourDriveScene />; break
    case 'result': content = state.mode === 'explore' ? <VehicleExplorationScene /> : state.mode === 'drive' ? <DrivingPreviewScene /> : <YourAudiScene />; break
  }
  return <>
    <OriginEnvironment awakened={state.scene !== 'origin'} />
    <group key={`${state.scene}:${state.mode}:${state.restartEpoch}`} name={`Scene ${state.scene}`}>{content}</group>
    <JourneyNavigation />
  </>
}
