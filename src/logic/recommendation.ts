import { mockModels } from '../data/mockModels'
import type { MockModel } from '../data/mockModels'
import { getPortal } from '../data/portals'
import type { PortalId } from '../data/portals'
import { questions } from '../data/questions'
import type { AnswerIndex } from '../data/questions'
import { demoBudgetTier, normalizeBudget } from './budget'

export type Answers = [AnswerIndex | null, AnswerIndex | null, AnswerIndex | null, AnswerIndex | null]
export type Recommendation =
  | { status: 'incomplete'; message: string }
  | { status: 'no-match'; message: string }
  | { status: 'prototype'; model: MockModel; reasons: [string, string, string]; demoTier: number }

export function recommend(portal: PortalId | null, budget: number, answers: Answers): Recommendation {
  if (!portal || answers.some((answer) => answer === null)) return { status: 'incomplete', message: 'Complete all four questions to discover your drive.' }
  const tier = demoBudgetTier(normalizeBudget(budget))
  const eligible = mockModels.filter((model) => model.portals.includes(portal) && model.demoTier <= tier)
  if (!eligible.length) return { status: 'no-match', message: 'No candidate qualifies in this synthetic budget tier. No real Audi price data is loaded, so we cannot confirm an affordable match.' }
  const selected = answers as [AnswerIndex, AnswerIndex, AnswerIndex, AnswerIndex]
  const traits = questions[portal].map((question, index) => question.traits[selected[index]])
  const score = (model: MockModel) => traits.reduce((total, trait) => total + (model.traits.includes(trait) ? 1 : 0), 0)
  // Prefer trait overlap, then the lower demo tier, then a stable ID. No random choice.
  eligible.sort((a, b) => score(b) - score(a) || a.demoTier - b.demoTier || a.id.localeCompare(b.id))
  return {
    status: 'prototype', model: eligible[0], demoTier: tier,
    reasons: [
      `Your ${getPortal(portal).title} route sets the candidate family.`,
      `Your priority: “${questions[portal][0].answers[selected[0]]}”`,
      `Your lifestyle: “${questions[portal][3].answers[selected[3]]}”`,
    ],
  }
}
