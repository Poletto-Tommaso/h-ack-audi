import { Suspense, lazy } from 'react'
import { AudiRings } from './components/AudiRings'
import { EnterVRButton } from './components/EnterVRButton'
import { JourneyPanel } from './components/JourneyPanel'
import { chapters } from './data/chapters'
import { useXRSession } from './hooks/useXRSession'
import { JourneyProvider, useJourney } from './state/JourneyContext'
import { getPortal } from './data/portals'
import { formatBudget } from './logic/budget'
import './App.css'

const ExperienceCanvas = lazy(() => import('./components/ExperienceCanvas').then((module) => ({ default: module.ExperienceCanvas })))

function JourneyApp() {
  const { state } = useJourney()
  const { isPresenting } = useXRSession()
  const current = chapters.findIndex((chapter) => chapter.id === state.scene)
  return <main className={`experience ${isPresenting ? 'is-immersive' : ''}`}>
    <header className="masthead desktop-ui">
      <a className="brand" href="./" aria-label="Audi — Find your drive"><AudiRings /></a>
      <span className="project-name">FIND YOUR DRIVE</span>
      <span className="prototype-label"><i /> INTERACTIVE PROTOTYPE</span>
    </header>
    <div className="experience-body">
      <JourneyPanel />
      <section className="scene-viewport" aria-label="Interactive 3D journey">
        <Suspense fallback={<div className="canvas-fallback" role="status">Loading your world…</div>}><ExperienceCanvas /></Suspense>
        <div className="scene-caption desktop-ui"><span className="status-dot active" /><p>POINT. SELECT. DISCOVER.<small>Mouse or Quest controller · same journey</small></p></div>
      </section>
    </div>
    <div className="session-bar desktop-ui"><EnterVRButton /><p>{state.portal ? getPortal(state.portal).title : 'YOUR JOURNEY STARTS WITHIN'}<span>{state.portal ? formatBudget(state.budget) : 'DESKTOP + META QUEST 3S'}</span></p></div>
    <footer className="journey desktop-ui">
      <ol>{chapters.map((chapter, index) => <li key={chapter.id} className={index === current ? 'current' : index < current ? 'complete' : ''} aria-current={index === current ? 'step' : undefined}><span className="chapter-number">0{index + 1}</span><span>{chapter.title}</span></li>)}</ol>
      <p className="prototype-note">AUDI · FIND YOUR DRIVE · HACKATHON PROTOTYPE</p>
    </footer>
    <span className="sr-only" aria-live="polite">Scene {current + 1}: {chapters[current].title}{state.scene === 'discovery' ? `, question ${state.questionIndex + 1} of 4` : ''}</span>
  </main>
}

export default function App() { return <JourneyProvider><JourneyApp /></JourneyProvider> }
