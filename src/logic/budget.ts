export const MIN_BUDGET = 25_000
export const MAX_BUDGET = 150_000
export const BUDGET_STEP = 5_000
export const DEFAULT_BUDGET = 45_000
export function normalizeBudget(value: number) {
  if (!Number.isFinite(value)) return DEFAULT_BUDGET
  return Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, Math.round(value / BUDGET_STEP) * BUDGET_STEP))
}
export const formatBudget = (value: number) => `€${value.toLocaleString('en-IE')}${value >= MAX_BUDGET ? '+' : ''}`

// Synthetic demonstration tiers, NOT model prices, price estimates or market data.
export function demoBudgetTier(budget: number) {
  if (budget < 35_000) return 0
  if (budget < 50_000) return 1
  if (budget < 70_000) return 2
  if (budget < 95_000) return 3
  if (budget < 120_000) return 4
  return 5
}
