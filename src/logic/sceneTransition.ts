import type { JourneyState } from './journeyState'

export const sceneKey = (state: JourneyState) => `${state.scene}:${state.mode}:${state.scene === 'discovery' ? state.questionIndex : 0}:${state.restartEpoch}`

// Exact cubic-bezier(.23, 1, .32, 1), used only for the fade's opacity.
export function fadeEase(progress: number) {
  const x = Math.max(0, Math.min(1, progress))
  if (x === 0 || x === 1) return x
  let low = 0, high = 1
  for (let i = 0; i < 18; i++) {
    const t = (low + high) / 2, u = 1 - t
    const sample = 3 * u * u * t * 0.23 + 3 * u * t * t * 0.32 + t * t * t
    if (sample < x) low = t
    else high = t
  }
  return 1 - (1 - (low + high) / 2) ** 3
}
