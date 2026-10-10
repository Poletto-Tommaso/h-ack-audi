import { useJourney } from '../state/JourneyContext'
import { BUDGET_STEP, formatBudget, MAX_BUDGET, MIN_BUDGET } from '../logic/budget'
import { BudgetSlider } from '../components/BudgetSlider'
import { SceneHeading } from '../components/SceneHeading'
import { SceneLabel } from '../components/SceneLabel'
import { WorldButton } from '../components/WorldButton'

export function BudgetScene() {
  const { state, dispatch } = useJourney()
  return <>
    <SceneHeading title="WHAT'S YOUR BUDGET?" subtitle="Let's find an Audi that fits you." />
    <SceneLabel text={formatBudget(state.budget)} position={[0, 1.93, -3.2]} width={3} height={0.42} fontSize={0.3} />
    <BudgetSlider />
    <SceneLabel text="€25,000" position={[-1.24, 1.18, -3]} width={0.8} fontSize={0.085} />
    <SceneLabel text="€150,000+" position={[1.2, 1.18, -3]} width={1} fontSize={0.085} />
    <WorldButton label="− €5,000" position={[-0.8, 0.92, -3]} width={1.3} disabled={state.budget <= MIN_BUDGET} onClick={() => dispatch({ type: 'budget', budget: state.budget - BUDGET_STEP })} />
    <WorldButton label="+ €5,000" position={[0.8, 0.92, -3]} width={1.3} disabled={state.budget >= MAX_BUDGET} onClick={() => dispatch({ type: 'budget', budget: state.budget + BUDGET_STEP })} />
    <WorldButton label="CONTINUE" position={[0, 0.47, -3]} onClick={() => dispatch({ type: 'continue' })} />
  </>
}
