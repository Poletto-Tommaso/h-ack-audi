import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { initialJourney, journeyReducer } from '../logic/journeyState'
import type { JourneyAction, JourneyState } from '../logic/journeyState'

const JourneyContext = createContext<{ state: JourneyState; dispatch: Dispatch<JourneyAction>; answerPending: boolean } | null>(null)
export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, reduce] = useReducer(journeyReducer, initialJourney)
  const [answerPending, setAnswerPending] = useState(false)
  const latest = useRef(state)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useLayoutEffect(() => { latest.current = state }, [state])
  useEffect(() => () => clearTimeout(timer.current), [])
  const dispatch = useCallback<Dispatch<JourneyAction>>((action) => {
    clearTimeout(timer.current)
    setAnswerPending(false)
    reduce(action)
    // Deliberate answer selections advance; revisiting saved answers never starts a timer.
    if (action.type === 'answer' && latest.current.scene === 'discovery' && [0, 1, 2].includes(action.answer)) {
      setAnswerPending(true)
      timer.current = setTimeout(() => { setAnswerPending(false); reduce({ type: 'continue' }) }, 450)
    }
  }, [])
  return <JourneyContext.Provider value={{ state, dispatch, answerPending }}>{children}</JourneyContext.Provider>
}
/** The Canvas can retain its old scene until the fade is opaque; DOM state stays live. */
export function JourneyPresentation({ state, children }: { state: JourneyState; children: ReactNode }) {
  const journey = useJourney()
  return <JourneyContext.Provider value={{ ...journey, state }}>{children}</JourneyContext.Provider>
}
export function useJourney() {
  const context = useContext(JourneyContext)
  if (!context) throw new Error('useJourney must be used within JourneyProvider')
  return context
}
