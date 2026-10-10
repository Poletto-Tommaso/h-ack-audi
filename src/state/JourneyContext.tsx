import { createContext, useContext, useReducer } from 'react'
import type { Dispatch, ReactNode } from 'react'
import { initialJourney, journeyReducer } from '../logic/journeyState'
import type { JourneyAction, JourneyState } from '../logic/journeyState'

const JourneyContext = createContext<{ state: JourneyState; dispatch: Dispatch<JourneyAction> } | null>(null)
export function JourneyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(journeyReducer, initialJourney)
  return <JourneyContext.Provider value={{ state, dispatch }}>{children}</JourneyContext.Provider>
}
export function useJourney() {
  const context = useContext(JourneyContext)
  if (!context) throw new Error('useJourney must be used within JourneyProvider')
  return context
}
