import { describe, expect, it } from 'vitest'
import { portals } from '../data/portals'
import { questions } from '../data/questions'
import type { AnswerIndex } from '../data/questions'
import { mockModels } from '../data/mockModels'
import { demoBudgetTier, formatBudget, normalizeBudget } from './budget'
import { initialJourney, journeyReducer } from './journeyState'
import { recommend } from './recommendation'
import type { Answers } from './recommendation'
import { getBookingUrl } from '../data/booking'
import { getRecommendationAsset } from '../data/recommendationAssets'

describe('journey state', () => {
  it('preserves budget/answers through back navigation and invalidates only on portal change', () => {
    let state = journeyReducer(initialJourney, { type: 'start' })
    state = journeyReducer(state, { type: 'portal', portal: 'comfort' })
    state = journeyReducer(state, { type: 'budget', budget: 70_000 })
    state = journeyReducer(state, { type: 'continue' })
    expect(journeyReducer(state, { type: 'continue' })).toEqual(state)
    for (const answer of [0, 1, 2, 0] as AnswerIndex[]) {
      state = journeyReducer(state, { type: 'answer', answer })
      state = journeyReducer(state, { type: 'continue' })
    }
    expect(state.scene).toBe('result')
    state = journeyReducer(state, { type: 'mode', mode: 'explore' })
    state = journeyReducer(state, { type: 'back' })
    expect(state.scene).toBe('result')
    expect(state.mode).toBe('reveal')
    state = journeyReducer(state, { type: 'back' })
    expect(state.questionIndex).toBe(3)
    expect(state.answers).toEqual([0, 1, 2, 0])
    for (let i = 0; i < 5; i++) state = journeyReducer(state, { type: 'back' })
    expect(state.scene).toBe('world')
    state = journeyReducer(state, { type: 'portal', portal: 'comfort' })
    expect(state.answers).toEqual([0, 1, 2, 0])
    state = journeyReducer(state, { type: 'back' })
    state = journeyReducer(state, { type: 'portal', portal: 'emotion' })
    expect(state.answers).toEqual([null, null, null, null])
    expect(state.budget).toBe(70_000)
    state = journeyReducer(state, { type: 'restart' })
    expect(state).toEqual({ ...initialJourney, restartEpoch: 1 })
    expect(journeyReducer(state, { type: 'restart' }).restartEpoch).toBe(2)
  })

  it('clamps and steps the budget and treats the maximum as open-ended', () => {
    expect(normalizeBudget(1)).toBe(25_000)
    expect(normalizeBudget(999_000)).toBe(150_000)
    expect(normalizeBudget(47_300)).toBe(45_000)
    expect(normalizeBudget(NaN)).toBe(45_000)
    expect(formatBudget(150_000)).toBe('€150,000+')
  })
})

describe('deterministic prototype matching', () => {
  it('contains exactly four approved questions with three answers per portal', () => {
    expect(Object.values(questions).flat()).toHaveLength(16)
    for (const list of Object.values(questions)) for (const question of list) expect(question.answers).toHaveLength(3)
    expect(questions.everyday[1].answers[1]).toBe('Good visibility and easy manoeuvring.')
    expect(questions.emotion[1].answers[1]).toBe('Having clear information about battery level and remaining range.')
  })

  it('returns honest no-match and incomplete states', () => {
    expect(recommend('performance', 25_000, [0, 0, 0, 0]).status).toBe('no-match')
    expect(recommend('comfort', 150_000, [0, null, 0, 0]).status).toBe('incomplete')
    expect(recommend(null, 45_000, [0, 0, 0, 0]).status).toBe('incomplete')
  })

  it('uses answers and budget to change suggestions without randomness', () => {
    const compact = recommend('emotion', 150_000, [0, 0, 0, 0])
    const sporty = recommend('emotion', 150_000, [2, 2, 2, 2])
    const constrained = recommend('emotion', 45_000, [2, 2, 2, 2])
    expect(compact.status === 'prototype' && compact.model.id).toBe('q4')
    expect(sporty.status === 'prototype' && sporty.model.id).toBe('etron-gt')
    expect(constrained.status === 'prototype' && constrained.model.id).toBe('q4')
  })

  it('fixes the reported PERFORMANCE / €65,000 path with the real RS 3 and reaches all nine imported cars', () => {
    const result = recommend('performance', 65_000, [0, 0, 0, 0])
    expect(result.status === 'prototype' && result.model.name).toBe('Audi RS 3 Sportback')
    expect(result.status === 'prototype' && getRecommendationAsset(result.model.id)?.modelPath).toBe('/models/cars/audi-rs3/model.glb')
    const reached = new Set<string>()
    for (const portal of portals) for (let permutation = 0; permutation < 81; permutation++) {
      const answers = [0, 1, 2, 3].map(i => Math.floor(permutation / 3 ** i) % 3) as Answers
      const match = recommend(portal.id, 150_000, answers)
      if (match.status === 'prototype') reached.add(match.model.assetId)
    }
    expect(reached).toEqual(new Set(mockModels.map(model => model.assetId)))
  })

  it('never exceeds synthetic eligibility for all 8,424 budget/answer/portal combinations', () => {
    for (const portal of portals) for (let budget = 25_000; budget <= 150_000; budget += 5_000) for (let permutation = 0; permutation < 81; permutation++) {
      const answers = [0, 1, 2, 3].map((i) => Math.floor(permutation / 3 ** i) % 3) as Answers
      const result = recommend(portal.id, budget, answers)
      const eligible = mockModels.filter((model) => model.portals.includes(portal.id) && model.demoTier <= demoBudgetTier(budget))
      expect(result).toEqual(recommend(portal.id, budget, answers))
      if (result.status === 'prototype') {
        expect(eligible).toContainEqual(result.model)
        expect(result.reasons).toHaveLength(3)
        expect(getRecommendationAsset(result.model.id)?.name).toBe(result.model.name)
      } else expect(eligible).toHaveLength(0)
    }
  })
})

describe('booking configuration', () => {
  it('stays a placeholder without explicit verification metadata', () => {
    expect(getBookingUrl({ url: 'https://www.audi.it/example', verifiedOn: '', source: '' })).toBeNull()
    expect(getBookingUrl({ url: '', verifiedOn: '', source: '' })).toBeNull()
  })
  it('rejects non-official, insecure and malformed URLs', () => {
    const config = { url: 'https://audi.it.attacker.example/book', verifiedOn: '2026-10-10', source: 'https://www.audi.it/' }
    expect(getBookingUrl(config)).toBeNull()
    expect(getBookingUrl({ ...config, url: 'http://www.audi.it/' })).toBeNull()
    expect(getBookingUrl({ ...config, url: 'javascript:alert(1)' })).toBeNull()
    expect(getBookingUrl({ ...config, url: 'https://www.audi.it/', source: 'https://example.com/' })).toBeNull()
  })
})
