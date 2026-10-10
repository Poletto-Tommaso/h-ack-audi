import { useCallback, useEffect, useRef } from 'react'
import type { ThreeEvent } from '@react-three/fiber'

type CaptureTarget = { setPointerCapture?: (id: number) => void; releasePointerCapture?: (id: number) => void }

/** Keep one drag owner and release its actual XR/desktop target when a scene unmounts. */
export function useDragCapture() {
  const capture = useRef<{ id: number; target: CaptureTarget } | null>(null)
  const releasePointer = useCallback((id?: number) => {
    const owner = capture.current
    if (!owner || (id !== undefined && owner.id !== id)) return
    capture.current = null
    owner.target.releasePointerCapture?.(owner.id)
  }, [])
  useEffect(() => () => releasePointer(), [releasePointer])
  const capturePointer = (event: ThreeEvent<PointerEvent>) => {
    if (capture.current) return false
    const target = event.target as unknown as CaptureTarget
    capture.current = { id: event.pointerId, target }
    target.setPointerCapture?.(event.pointerId)
    return true
  }
  return { capture, capturePointer, releasePointer }
}
