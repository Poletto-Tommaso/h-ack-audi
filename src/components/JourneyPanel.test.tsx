// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { JourneyProvider } from '../state/JourneyContext'
import { JourneyPanel } from './JourneyPanel'
import { portals } from '../data/portals'
import { questions } from '../data/questions'

vi.mock('../logic/xrStore', () => ({ xrStore: { getState: () => ({ session: undefined }), subscribe: () => () => {} } }))
afterEach(cleanup)
const mount = () => render(<JourneyProvider><JourneyPanel /></JourneyProvider>)
const start = (title: string) => {
  fireEvent.click(screen.getByRole('button', { name: /START YOUR JOURNEY/ }))
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${title}`) }))
}

describe('complete desktop journeys through shared application state', () => {
  it.each(portals)('completes $title, explores, previews and restarts', (portal) => {
    mount()
    start(portal.title)
    const range = screen.getByRole('slider', { name: 'Budget' }) as HTMLInputElement
    expect(range.value).toBe('45000')
    fireEvent.change(range, { target: { value: '75000' } })
    fireEvent.click(screen.getByRole('button', { name: /CONTINUE/ }))
    for (const question of questions[portal.id]) {
      expect(screen.getByRole('heading').textContent).toBe(question.text)
      expect((screen.getByRole('button', { name: /NEXT QUESTION|FIND MY AUDI/ }) as HTMLButtonElement).disabled).toBe(true)
      fireEvent.click(screen.getByRole('button', { name: `A ${question.answers[0]}` }))
      fireEvent.click(screen.getByRole('button', { name: /NEXT QUESTION|FIND MY AUDI/ }))
    }
    expect(screen.getByText(/PROTOTYPE SUGGESTION/)).toBeDefined()
    expect(screen.getByText(new RegExp(`${portal.title} · €75,000`))).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: /EXPLORE YOUR AUDI/ }))
    fireEvent.click(screen.getByRole('button', { name: 'ROTATE LEFT' }))
    if (portal.id === 'comfort' || portal.id === 'emotion') {
      expect(screen.getByText(/3D asset:/)).toBeDefined()
      // Source materials are preserved: paint controls apply only to procedural placeholders.
      expect(screen.queryByRole('button', { name: 'ROUTE COLOR' })).toBeNull()
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'ROUTE COLOR' }))
      expect(screen.getByRole('button', { name: 'ROUTE COLOR' }).getAttribute('aria-pressed')).toBe('true')
    }
    fireEvent.click(screen.getByRole('button', { name: /BACK/ }))
    fireEvent.click(screen.getByRole('button', { name: 'EXPERIENCE YOUR DRIVE' }))
    fireEvent.click(screen.getByRole('button', { name: 'PLAY PREVIEW' }))
    expect(screen.getByRole('button', { name: 'PAUSE PREVIEW' })).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'LEFT' }))
    expect((screen.getByRole('button', { name: 'LEFT' }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /BACK/ }))
    fireEvent.click(screen.getByRole('button', { name: 'BOOK A TEST DRIVE' }))
    expect(screen.getByRole('status').textContent).toContain('No booking has been made.')
    fireEvent.click(screen.getByRole('button', { name: 'RESTART' }))
    expect(screen.getByRole('button', { name: /START YOUR JOURNEY/ })).toBeDefined()
  })

  it('shows no-match at the minimum budget and allows budget correction without losing answers', () => {
    mount()
    start('PERFORMANCE')
    fireEvent.change(screen.getByRole('slider'), { target: { value: '25000' } })
    fireEvent.click(screen.getByRole('button', { name: /CONTINUE/ }))
    for (const question of questions.performance) {
      fireEvent.click(screen.getByRole('button', { name: `B ${question.answers[1]}` }))
      fireEvent.click(screen.getByRole('button', { name: /NEXT QUESTION|FIND MY AUDI/ }))
    }
    expect(screen.queryByRole('button', { name: /EXPLORE YOUR AUDI/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'ADJUST BUDGET' }))
    fireEvent.change(screen.getByRole('slider'), { target: { value: '65000' } })
    fireEvent.click(screen.getByRole('button', { name: /CONTINUE/ }))
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: /NEXT QUESTION|FIND MY AUDI/ }))
    expect(screen.getByText(/PROTOTYPE SUGGESTION/)).toBeDefined()
  })
})
