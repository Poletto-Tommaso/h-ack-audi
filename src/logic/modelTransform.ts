import { Box3, Vector3 } from 'three'
import type { Object3D } from 'three'

/** Preserve source transforms, normalize length to the existing 2.25-unit blockout, ground at Y=0. */
export function getModelTransform(object: Object3D, targetLength = 2.25) {
  object.updateMatrixWorld(true)
  const bounds = new Box3().setFromObject(object, true)
  const size = bounds.getSize(new Vector3())
  const center = bounds.getCenter(new Vector3())
  const longest = Math.max(size.x, size.y, size.z)
  if (!Number.isFinite(longest) || longest <= 0) throw new Error('Model has empty or invalid bounds')
  return { factor: targetLength / longest, offset: [-center.x, -bounds.min.y, -center.z] as [number, number, number] }
}
