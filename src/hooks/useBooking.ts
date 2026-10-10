import { useState } from 'react'
import { getBookingUrl } from '../data/booking'
import { useXRSession } from './useXRSession'

export function useBooking() {
  const { isPresenting } = useXRSession()
  const [message, setMessage] = useState('')
  const url = getBookingUrl()
  return { url, message, open: () => {
    if (!url) setMessage('BOOKING PLACEHOLDER — No verified official Audi test-drive URL is configured. No booking has been made.')
    else if (isPresenting) setMessage('Exit VR, then select BOOK A TEST DRIVE on the page to open the verified official link. No booking has been made.')
    else { window.open(url, '_blank', 'noopener,noreferrer'); setMessage('Official Audi page opened. Complete any booking there; this prototype has not booked a test drive.') }
  } }
}
