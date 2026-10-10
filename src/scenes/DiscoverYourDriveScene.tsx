import { questions } from '../data/questions'
import type { AnswerIndex } from '../data/questions'
import { getPortal } from '../data/portals'
import { useJourney } from '../state/JourneyContext'
import { SceneHeading } from '../components/SceneHeading'
import { SceneLabel } from '../components/SceneLabel'
import { WorldButton } from '../components/WorldButton'

export function DiscoverYourDriveScene() {
  const { state, dispatch } = useJourney()
  if (!state.portal) return null
  const question = questions[state.portal][state.questionIndex]
  const portal = getPortal(state.portal)
  return <>
    <SceneHeading title="DISCOVER YOUR DRIVE" subtitle={`${portal.title} · QUESTION ${state.questionIndex + 1} / 4`} />
    <SceneLabel text={question.text} position={[0, 1.99, -3.3]} width={3.8} height={0.48} fontSize={0.125} />
    {question.answers.map((answer, index) => <WorldButton key={answer} label={`${String.fromCharCode(65 + index)}. ${answer}`} position={[0, 1.5 - index * 0.36, -3.1]} width={3.6} height={0.3} fontSize={0.09} color={portal.color} selected={state.answers[state.questionIndex] === index} onClick={() => dispatch({ type: 'answer', answer: index as AnswerIndex })} />)}
    <WorldButton label={state.questionIndex === 3 ? 'FIND MY AUDI' : 'NEXT QUESTION'} position={[0, 0.37, -3.1]} width={2.5} height={0.3} disabled={state.answers[state.questionIndex] === null} onClick={() => dispatch({ type: 'continue' })} />
  </>
}
