import { portals } from '../data/portals'
import { useJourney } from '../state/JourneyContext'
import { PortalCard } from '../components/PortalCard'
import { SceneLabel } from '../components/SceneLabel'

export function FindYourWorldScene() {
  const { state, dispatch } = useJourney()
  return <>
    <SceneLabel text="WHAT DRIVES YOU?" position={[0, 3.4, -5]} width={5.6} height={0.42} fontSize={0.24} />
    <SceneLabel text="Choose what matters most to you." position={[0, 3.02, -5]} width={5.6} fontSize={0.14} color="#b9c4d2" />
    {portals.map((portal, index) => {
      const angle = (-33 + index * 22) * Math.PI / 180
      return <PortalCard key={portal.id} portal={portal} selected={state.portal === portal.id} rotation={-angle} position={[Math.sin(angle) * 5.4, 1.6, -Math.cos(angle) * 5.4]} onSelect={() => dispatch({ type: 'portal', portal: portal.id })} />
    })}
  </>
}
