import type { PortalId } from '../data/portals'
import type { AnswerIndex } from '../data/questions'
import { DEFAULT_BUDGET, normalizeBudget } from './budget'
import type { Answers } from './recommendation'
import { recommend } from './recommendation'

export type JourneyScene = 'origin' | 'world' | 'budget' | 'discovery' | 'result'
export type RevealMode = 'reveal' | 'explore' | 'drive'
export type JourneyState = { scene: JourneyScene; portal: PortalId | null; budget: number; answers: Answers; questionIndex: number; mode: RevealMode; playing: boolean; lane: number; rotation: number; vehicleColor: string; restartEpoch: number }
export const initialJourney: JourneyState = { scene: 'origin', portal: null, budget: DEFAULT_BUDGET, answers: [null, null, null, null], questionIndex: 0, mode: 'reveal', playing: false, lane: 0, rotation: Math.PI / 5, vehicleColor: '#d8dde6', restartEpoch: 0 }
export type JourneyAction =
  | { type: 'start' } | { type: 'portal'; portal: PortalId } | { type: 'budget'; budget: number }
  | { type: 'continue' } | { type: 'answer'; answer: AnswerIndex }
  | { type: 'back' } | { type: 'restart' } | { type: 'mode'; mode: RevealMode } | { type: 'edit-budget' }
  | { type: 'preview-toggle' } | { type: 'lane'; delta: number } | { type: 'rotate'; delta: number } | { type: 'paint'; color: string }

export function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case 'start': return state.scene === 'origin' ? { ...state, scene: 'world' } : state
    case 'portal': return state.scene === 'world' ? { ...state, portal: action.portal, scene: 'budget', questionIndex: 0, answers: state.portal === action.portal ? state.answers : [null, null, null, null] } : state
    case 'budget': {
      const budget = normalizeBudget(action.budget)
      return budget === state.budget ? state : { ...state, budget }
    }
    case 'answer': {
      if (state.scene !== 'discovery' || ![0, 1, 2].includes(action.answer)) return state
      const answers: Answers = [...state.answers]
      answers[state.questionIndex] = action.answer
      return { ...state, answers }
    }
    case 'continue': {
      if (state.scene === 'budget' && state.portal) return { ...state, scene: 'discovery', questionIndex: 0 }
      if (state.scene !== 'discovery' || state.answers[state.questionIndex] === null) return state
      return state.questionIndex < 3 ? { ...state, questionIndex: state.questionIndex + 1 } : { ...state, scene: 'result', mode: 'reveal' }
    }
    case 'mode': return state.scene === 'result' && recommend(state.portal, state.budget, state.answers).status === 'prototype' ? { ...state, mode: action.mode, playing: false } : state
    case 'preview-toggle': return state.mode === 'drive' ? { ...state, playing: !state.playing } : state
    case 'lane': return state.mode === 'drive' ? { ...state, lane: Math.min(1, Math.max(-1, state.lane + action.delta)) } : state
    case 'rotate': return state.mode === 'explore' ? { ...state, rotation: state.rotation + action.delta } : state
    case 'paint': return state.mode === 'explore' ? { ...state, vehicleColor: action.color } : state
    case 'edit-budget': return state.scene === 'result' ? { ...state, scene: 'budget', mode: 'reveal' } : state
    case 'back': {
      if (state.scene === 'result') return state.mode !== 'reveal' ? { ...state, mode: 'reveal' } : { ...state, scene: 'discovery', questionIndex: 3 }
      if (state.scene === 'discovery' && state.questionIndex > 0) return { ...state, questionIndex: state.questionIndex - 1 }
      const previous: Partial<Record<JourneyScene, JourneyScene>> = { discovery: 'budget', budget: 'world', world: 'origin' }
      return previous[state.scene] ? { ...state, scene: previous[state.scene]! } : state
    }
    case 'restart': return { ...initialJourney, answers: [null, null, null, null], restartEpoch: state.restartEpoch + 1 }
  }
}
