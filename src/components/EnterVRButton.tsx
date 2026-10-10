import { useState } from 'react'
import { useVRSupport } from '../hooks/useVRSupport'
import { useXRSession } from '../hooks/useXRSession'
import { xrStore } from '../logic/xrStore'

export function EnterVRButton() {
  const support = useVRSupport()
  const { session } = useXRSession()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const messages = {
    checking: 'Checking your browser for immersive VR…',
    supported: 'Put on your headset and enter the experience.',
    unsupported: 'VR is unavailable here. Continue on desktop or open in Meta Quest Browser.',
    insecure: 'VR requires HTTPS. See the README for headset setup.',
    error: 'Could not check VR support. Check browser permissions and reload.',
  }
  const enter = async () => {
    setPending(true)
    setError('')
    try {
      if (session) await session.end()
      else {
        // Keep the session request directly in the user gesture.
        const started = await xrStore.enterVR()
        if (!started) setError('VR did not start. Check headset permissions and try again.')
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'VR could not start. Please try again.')
    } finally { setPending(false) }
  }
  return <div className="vr-action">
    <button className="vr-button" disabled={pending || (!session && support !== 'supported')} onClick={() => void enter()} aria-describedby="vr-status">
      <svg viewBox="0 0 24 18" fill="none" aria-hidden="true"><path d="M3 2h18l1 11c0 2-2 3-4 2l-4-3h-4l-4 3c-2 1-4 0-4-2L3 2Z" stroke="currentColor" strokeWidth="1.3" /><path d="M6 6h4v3H6zm8 0h4v3h-4z" stroke="currentColor" /></svg>
      {pending ? 'PLEASE WAIT…' : session ? 'EXIT VR' : 'ENTER VR'} <span aria-hidden="true">↗</span>
    </button>
    <p id="vr-status" className="vr-status" role={error ? 'alert' : 'status'}>{error || messages[support]}</p>
  </div>
}
