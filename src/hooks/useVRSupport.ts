import { useEffect, useState } from 'react'

type VRSupport = 'checking' | 'supported' | 'unsupported' | 'insecure' | 'error'

export function useVRSupport() {
  const [support, setSupport] = useState<VRSupport>('checking')
  useEffect(() => {
    let cancelled = false
    const xr = navigator.xr
    const check = async () => {
      if (!window.isSecureContext) return setSupport('insecure')
      if (!xr) return setSupport('unsupported')
      try {
        const supported = await xr.isSessionSupported('immersive-vr')
        if (!cancelled) setSupport(supported ? 'supported' : 'unsupported')
      } catch {
        if (!cancelled) setSupport('error')
      }
    }
    void check()
    xr?.addEventListener('devicechange', check)
    return () => { cancelled = true; xr?.removeEventListener('devicechange', check) }
  }, [])
  return support
}
