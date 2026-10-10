// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EnterVRButton } from './EnterVRButton'

const mock = vi.hoisted(() => ({
  enterVR: vi.fn(),
  state: { session: undefined as { end: () => Promise<void> } | undefined },
  listeners: new Set<() => void>(),
}))
vi.mock('../logic/xrStore', () => ({ xrStore: {
  enterVR: mock.enterVR,
  getState: () => mock.state,
  subscribe: (listener: () => void) => {
    mock.listeners.add(listener)
    return () => mock.listeners.delete(listener)
  },
} }))

function browserXR(supported: boolean) {
  const xr = Object.assign(new EventTarget(), { isSessionSupported: vi.fn().mockResolvedValue(supported) })
  Object.defineProperty(navigator, 'xr', { configurable: true, value: xr })
  return xr
}

beforeEach(() => {
  mock.enterVR.mockReset()
  mock.state = { session: undefined }
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true })
  browserXR(true)
})
afterEach(cleanup)

describe('VR entry and fallback', () => {
  it('disables entry on browsers without VR while explaining desktop access', async () => {
    browserXR(false)
    render(<EnterVRButton />)
    await screen.findByText(/VR is unavailable here/)
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
    expect(mock.enterVR).not.toHaveBeenCalled()
  })

  it('requires a secure context before requesting immersive VR', async () => {
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false })
    const xr = browserXR(true)
    render(<EnterVRButton />)
    await screen.findByText(/VR requires HTTPS/)
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
    expect(xr.isSessionSupported).not.toHaveBeenCalled()
  })

  it('handles a missing WebXR API', async () => {
    Object.defineProperty(navigator, 'xr', { configurable: true, value: undefined })
    render(<EnterVRButton />)
    await screen.findByText(/VR is unavailable here/)
  })

  it('shows permission failures and lets the user retry', async () => {
    mock.enterVR.mockRejectedValueOnce(new Error('Permission denied')).mockResolvedValueOnce(undefined)
    render(<EnterVRButton />)
    await waitFor(() => expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(screen.getByRole('button'))
    expect(mock.enterVR).toHaveBeenCalledTimes(1)
    expect((await screen.findByRole('alert')).textContent).toContain('Permission denied')
    fireEvent.click(screen.getByRole('button'))
    await screen.findByText(/VR did not start/)
    expect(mock.enterVR).toHaveBeenCalledTimes(2)
  })

  it('prevents duplicate requests, tracks session exit, and permits re-entry', async () => {
    let resolve!: (value: object) => void
    mock.enterVR.mockImplementationOnce(() => new Promise((done) => { resolve = done }))
    render(<EnterVRButton />)
    await waitFor(() => expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(screen.getByRole('button'))
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button'))
    expect(mock.enterVR).toHaveBeenCalledTimes(1)
    const end = vi.fn().mockResolvedValue(undefined)
    await act(async () => {
      mock.state = { session: { end } }
      mock.listeners.forEach((notify) => notify())
      resolve(mock.state.session!)
    })
    fireEvent.click(screen.getByRole('button', { name: /EXIT VR/ }))
    await waitFor(() => expect(end).toHaveBeenCalledOnce())
    act(() => {
      mock.state = { session: undefined }
      mock.listeners.forEach((notify) => notify())
    })
    await waitFor(() => expect((screen.getByRole('button', { name: /ENTER VR/ }) as HTMLButtonElement).disabled).toBe(false))
  })

  it('updates availability when a headset connects', async () => {
    const xr = browserXR(false)
    render(<EnterVRButton />)
    await screen.findByText(/VR is unavailable/)
    xr.isSessionSupported.mockResolvedValue(true)
    act(() => xr.dispatchEvent(new Event('devicechange')))
    await waitFor(() => expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(false))
  })
})
