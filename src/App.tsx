import { useState } from 'react'
import { AudiRings } from './components/AudiRings'
import { ExperienceCanvas } from './components/ExperienceCanvas'
import { EnterVRButton } from './components/EnterVRButton'
import { chapters } from './data/chapters'
import { useXRSession } from './hooks/useXRSession'
import './App.css'

export default function App() {
  const [awakened, setAwakened] = useState(false)
  const { isPresenting } = useXRSession()
  return (
    <main className={`experience ${isPresenting ? 'is-immersive' : ''}`}>
      <header className="masthead desktop-ui">
        <a className="brand" href="./" aria-label="Audi — Find your drive"><AudiRings /></a>
        <span className="project-name">FIND YOUR DRIVE</span>
        <span className="prototype-label"><i /> AN IMMERSIVE EXPERIENCE</span>
      </header>
      <section className="introduction desktop-ui" aria-labelledby="intro-title">
        <p className="eyebrow"><span>01 / 05</span> THE ORIGIN</p>
        <h1 id="intro-title">Before the road.<br />Before the car.<br /><em>There is you.</em></h1>
        <p className="intro-copy">A journey beyond specifications. Explore what moves you, and discover where it could take you.</p>
        <div className="actions">
          <EnterVRButton />
          <button className="desktop-button" onClick={() => setAwakened((value) => !value)}>
            {awakened ? 'Reset experience' : 'Explore on desktop'} <span aria-hidden="true">↗</span>
          </button>
        </div>
        <p className="device-note">Designed for Meta Quest. Open to your curiosity.</p>
      </section>
      <section className="scene-viewport" aria-label="Interactive three-dimensional Audi introduction">
        <ExperienceCanvas awakened={awakened} onActivate={() => setAwakened((value) => !value)} onReset={() => setAwakened(false)} />
        <div className="scene-caption desktop-ui" aria-live="polite">
          <span className={`status-dot ${awakened ? 'active' : ''}`} />
          <div><strong>{awakened ? 'Your journey starts within.' : 'Every journey begins with a spark.'}</strong>
            <p>{awakened ? 'You have awakened the origin. Select the rings to reset.' : 'Click the rings to awaken the origin.'}</p></div>
        </div>
        <span className="coordinate desktop-ui" aria-hidden="true">48°46′ N &nbsp; 11°25′ E · INGOLSTADT</span>
      </section>
      <footer className="journey desktop-ui">
        <div className="journey-label">YOUR JOURNEY <span>01 — THE ORIGIN</span></div>
        <ol>{chapters.map((chapter, index) => (
          <li key={chapter.id} className={index === 0 ? 'current' : ''} aria-current={index === 0 ? 'step' : undefined}>
            <span className="chapter-number">0{index + 1}</span><span>{chapter.title}</span>
            {index > 0 && <span className="chapter-soon">COMING NEXT</span>}
          </li>
        ))}</ol>
        <p className="prototype-note">AUDI · HACKATHON PROTOTYPE</p>
      </footer>
    </main>
  )
}
