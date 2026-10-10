import { describe, expect, it } from 'vitest'
import { Matrix4, Quaternion, Ray, Vector3 } from 'three'
import { budgetFromRay } from './slider'

describe('mouse/controller slider projection', () => {
  const transform = new Matrix4().makeTranslation(0, 1.45, -3)
  const rayTo = (x: number) => {
    const origin = new Vector3(0, 1.6, 0)
    return new Ray(origin, new Vector3(x, 1.45, -3).sub(origin).normalize())
  }
  it('selects stepped values and clamps captured rays outside the track', () => {
    expect(budgetFromRay(rayTo(-1.5), transform)).toBe(25_000)
    expect(budgetFromRay(rayTo(-1.02), transform)).toBe(45_000)
    expect(budgetFromRay(rayTo(1.5), transform)).toBe(150_000)
    expect(budgetFromRay(rayTo(4), transform)).toBe(150_000)
    expect(budgetFromRay(rayTo(-4), transform)).toBe(25_000)
  })
  it('remains correct with a rotated/scaled track', () => {
    const matrix = new Matrix4().compose(new Vector3(2, 1.4, -4), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0.4), new Vector3(0.8, 0.8, 0.8))
    const target = new Vector3(1.5, 0, 0).applyMatrix4(matrix)
    const origin = new Vector3(0, 1.6, 0)
    expect(budgetFromRay(new Ray(origin, target.sub(origin).normalize()), matrix)).toBe(150_000)
  })
  it('ignores parallel or backward rays', () => {
    expect(budgetFromRay(new Ray(new Vector3(), new Vector3(1, 0, 0)), transform)).toBeNull()
    expect(budgetFromRay(new Ray(new Vector3(), new Vector3(0, 0, 1)), transform)).toBeNull()
  })
})
