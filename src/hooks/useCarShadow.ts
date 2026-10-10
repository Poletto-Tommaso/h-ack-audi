import { useLayoutEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Object3D } from 'three'
import { invalidateCarShadows } from '../logic/carLighting'

export function useCarShadow(object: Object3D, revision: string) {
  const scene = useThree(state => state.scene)
  const pending = useRef(true)
  useLayoutEffect(() => { pending.current = true }, [object, revision])
  useFrame(({ gl }) => {
    if (!pending.current || gl.xr.isPresenting) return
    // The reveal loads underneath a hidden group; wait until the actual car is visible.
    let ancestor: Object3D | null = object
    while (ancestor) {
      if (!ancestor.visible) return
      ancestor = ancestor.parent
    }
    invalidateCarShadows(scene)
    pending.current = false
  })
}
