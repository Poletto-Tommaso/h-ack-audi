import { useEffect, useState } from 'react'
export function useOriginPhase(active: boolean, restartEpoch = 0) {
  const [phase, setPhase] = useState(false)
  useEffect(() => {
    setPhase(false)
    if (!active) return
    const timer = window.setTimeout(() => setPhase(true), 2800)
    return () => window.clearTimeout(timer)
  }, [active, restartEpoch])
  return phase
}
