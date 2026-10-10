import { portals } from '../data/portals'
import { useJourney } from '../state/JourneyContext'
import { PortalCard } from '../components/PortalCard'
import { SceneHeading } from '../components/SceneHeading'

export function FindYourWorldScene() {
  const { state, dispatch } = useJourney()
  return <>
    <SceneHeading title="WHAT DRIVES YOU?" subtitle="Choose what matters most to you." />
    {portals.map((portal, index) => <PortalCard key={portal.id} portal={portal} selected={state.portal === portal.id} position={[index % 2 ? 1.1 : -1.1, index < 2 ? 1.8 : 0.75, -3.8]} onSelect={() => dispatch({ type: 'portal', portal: portal.id })} />)}
  </>
}
