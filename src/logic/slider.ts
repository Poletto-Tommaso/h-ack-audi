import { Plane, Vector3 } from 'three'
import type { Matrix4, Ray } from 'three'
import { MIN_BUDGET, MAX_BUDGET, normalizeBudget } from './budget'

// Project the live pointer ray rather than reusing a captured/stale intersection.
// Works with either an R3F mouse ray or a WebXR controller ray, in any transform.
export function budgetFromRay(ray: Ray, matrixWorld: Matrix4, width = 3): number | null {
  const localRay = ray.clone().applyMatrix4(matrixWorld.clone().invert())
  const point = localRay.intersectPlane(new Plane(new Vector3(0, 0, 1), 0), new Vector3())
  if (!point) return null
  const fraction = Math.min(1, Math.max(0, point.x / width + 0.5))
  return normalizeBudget(MIN_BUDGET + fraction * (MAX_BUDGET - MIN_BUDGET))
}
