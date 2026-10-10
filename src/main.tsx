import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Vite removes the dev branch (including the viewer) from production output.
const Entry = import.meta.env.DEV && window.location.pathname.replace(/\/$/, '') === '/dev/models'
  ? lazy(() => import('./dev/ModelViewer'))
  : lazy(() => import('./App'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<p>Loading Audi experience…</p>}><Entry /></Suspense>
  </StrictMode>,
)
