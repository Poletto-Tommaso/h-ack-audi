import { useSyncExternalStore } from 'react'
import { xrStore } from '../logic/xrStore'

const subscribe = (onChange: () => void) => xrStore.subscribe(onChange)
const getSession = () => xrStore.getState().session

export function useXRSession() {
  const session = useSyncExternalStore(subscribe, getSession, () => undefined)
  return { session, isPresenting: session != null }
}
