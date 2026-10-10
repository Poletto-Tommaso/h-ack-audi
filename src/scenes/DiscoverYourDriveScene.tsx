import { questions } from '../data/questions'
import type { AnswerIndex } from '../data/questions'
import { getPortal } from '../data/portals'
import { useJourney } from '../state/JourneyContext'
import { SceneHeading } from '../components/SceneHeading'
import { SceneLabel } from '../components/SceneLabel'
import { WorldButton } from '../components/WorldButton'
import { SpatialPanel } from '../components/SpatialPanel'

export function DiscoverYourDriveScene() {
  const { state, dispatch, answerPending } = useJourney()
  if (!state.portal) return null
  const question = questions[state.portal][state.questionIndex]
  const portal = getPortal(state.portal)
  return <>
    <SpatialPanel position={[0, 1.65, -3.7]} height={2.85} />
    <SceneHeading title="DISCOVER YOUR DRIVE" subtitle={`${portal.title} · 0${state.questionIndex + 1} / 04${answerPending ? ' · ANSWER SAVED' : ''}`} />
    <SceneLabel text={question.text} position={[0, 2.04, -3.3]} width={3.8} height={0.52} fontSize={0.14} />
    {question.answers.map((answer, index) => <WorldButton key={answer} label={`${String.fromCharCode(65 + index)}. ${answer}`} position={[0, 1.53 - index * 0.49, -3.1]} width={3.8} height={0.43} fontSize={0.115} color="#b9213d" selected={state.answers[state.questionIndex] === index} onClick={() => dispatch({ type: 'answer', answer: index as AnswerIndex })} />)}
    <group position={[0, 2.87, -3.45]} pointerEvents="none">{[0, 1, 2, 3].map(index => <mesh key={index} position={[(index - 1.5) * 0.22, 0, 0]}><boxGeometry args={[0.15, 0.025, 0.01]} /><meshBasicMaterial color={index <= state.questionIndex ? '#e6eaf1' : '#454e5c'} /></mesh>)}</group>
  </>
}
