import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { useJourney } from '../state/JourneyContext'
import { portals, getPortal } from '../data/portals'
import { questions } from '../data/questions'
import type { AnswerIndex } from '../data/questions'
import { BUDGET_STEP, MIN_BUDGET, MAX_BUDGET, formatBudget } from '../logic/budget'
import { recommend } from '../logic/recommendation'
import { useOriginPhase } from '../hooks/useOriginPhase'
import { useBooking } from '../hooks/useBooking'
import { getAssetDescription, getRecommendationAsset } from '../data/recommendationAssets'

export function JourneyPanel() {
  const { state, dispatch } = useJourney()
  const phase = useOriginPhase(state.scene === 'origin', state.restartEpoch)
  const booking = useBooking()
  const heading = useRef<HTMLDivElement>(null)
  useEffect(() => { heading.current?.focus({ preventScroll: true }) }, [state.scene, state.questionIndex, state.mode])
  const next = () => dispatch({ type: 'continue' })
  const result = recommend(state.portal, state.budget, state.answers)
  let content
  switch (state.scene) {
    case 'origin': content = <>
      <p className="eyebrow">01 / THE ORIGIN</p>
      <h1>{phase ? 'WHAT DRIVES YOU?' : 'WELCOME TO AUDI.'}</h1>
      <p className="lead">{phase ? 'Discover the Audi that moves you.' : 'Your journey starts here.'}</p>
      <p className="intro-copy">A journey beyond specifications. Explore what moves you, and discover where it could take you.</p>
      <button className="primary-button" onClick={() => dispatch({ type: 'start' })}>START YOUR JOURNEY <span aria-hidden="true">↗</span></button>
      <p className="fine-print">An abstract architectural setting. No historical reconstruction is claimed.</p>
    </>; break
    case 'world': content = <>
      <p className="eyebrow">02 / CHOOSE YOUR WORLD</p><h1>WHAT DRIVES YOU?</h1><p className="lead">Choose what matters most to you.</p>
      <div className="portal-options">{portals.map((portal) => <button key={portal.id} className="portal-option" aria-pressed={state.portal === portal.id} style={{ '--portal-color': portal.color } as CSSProperties} onClick={() => dispatch({ type: 'portal', portal: portal.id })}>
        <span className="portal-orb" aria-hidden="true" /><span><strong>{portal.title}</strong><small>{portal.description}</small><em>{portal.environment}</em></span><span aria-hidden="true">↗</span>
      </button>)}</div>
    </>; break
    case 'budget': content = <>
      <p className="eyebrow">03 / SET YOUR BUDGET</p><h1>WHAT'S YOUR BUDGET?</h1><p className="lead">Let's find an Audi that fits you.</p>
      <label className="budget-value" htmlFor="budget-range">{formatBudget(state.budget)}</label>
      <input id="budget-range" type="range" min={MIN_BUDGET} max={MAX_BUDGET} step={BUDGET_STEP} value={state.budget} aria-label="Budget" aria-valuetext={formatBudget(state.budget)} onChange={(event) => dispatch({ type: 'budget', budget: Number(event.target.value) })} />
      <div className="budget-limits"><span>€25,000</span><span>€150,000+</span></div>
      <div className="button-row"><button className="secondary-button" disabled={state.budget <= MIN_BUDGET} onClick={() => dispatch({ type: 'budget', budget: state.budget - BUDGET_STEP })}>− €5,000</button><button className="secondary-button" disabled={state.budget >= MAX_BUDGET} onClick={() => dispatch({ type: 'budget', budget: state.budget + BUDGET_STEP })}>+ €5,000</button></div>
      <button className="primary-button" onClick={next}>CONTINUE <span aria-hidden="true">↗</span></button>
      <p className="fine-print">Demo matching uses synthetic budget tiers. Real Audi pricing and affordability are unverified.</p>
    </>; break
    case 'discovery': {
      if (!state.portal) break
      const question = questions[state.portal][state.questionIndex]
      content = <>
        <p className="eyebrow">04 / {getPortal(state.portal).title} <span>QUESTION {state.questionIndex + 1} OF 4</span></p>
        <h1 className="question-title">{question.text}</h1>
        <div className="question-progress" aria-label={`Question ${state.questionIndex + 1} of 4`}>{[0, 1, 2, 3].map((index) => <i key={index} className={index <= state.questionIndex ? 'filled' : ''} />)}</div>
        <div className="answer-options" role="group" aria-label="Choose one answer">{question.answers.map((answer, index) => <button className="answer-option" key={answer} aria-pressed={state.answers[state.questionIndex] === index} onClick={() => dispatch({ type: 'answer', answer: index as AnswerIndex })}><span>{String.fromCharCode(65 + index)}</span>{' '}{answer}</button>)}</div>
        <button className="primary-button" disabled={state.answers[state.questionIndex] === null} onClick={next}>{state.questionIndex === 3 ? 'FIND MY AUDI' : 'NEXT QUESTION'} <span aria-hidden="true">↗</span></button>
      </>
      break
    }
    case 'result': {
      if (result.status !== 'prototype') {
        content = <><p className="eyebrow">05 / YOUR AUDI</p><h1>No match.<br /><em>Let's be honest.</em></h1><p className="lead">{result.message}</p><p className="selection-summary">{state.portal && getPortal(state.portal).title} · {formatBudget(state.budget)}</p><button className="primary-button" onClick={() => dispatch({ type: 'edit-budget' })}>ADJUST BUDGET</button></>
        break
      }
      if (state.mode === 'explore') {
        content = <><p className="eyebrow">05 / EXPLORE YOUR AUDI</p><h1>{result.model.name}</h1><p className="lead">Look around your possibility.</p><p className="intro-copy">{getAssetDescription(result.model.id)} Rotate using the controls below.</p>
          <div className="button-row"><button className="secondary-button" onClick={() => dispatch({ type: 'rotate', delta: -Math.PI / 6 })}>ROTATE LEFT</button><button className="secondary-button" onClick={() => dispatch({ type: 'rotate', delta: Math.PI / 6 })}>ROTATE RIGHT</button></div>
          {!getRecommendationAsset(result.model.id) && <div className="button-row"><button className="secondary-button" aria-pressed={state.vehicleColor === '#d8dde6'} onClick={() => dispatch({ type: 'paint', color: '#d8dde6' })}>SILVER</button><button className="secondary-button" aria-pressed={state.vehicleColor !== '#d8dde6'} onClick={() => dispatch({ type: 'paint', color: getPortal(state.portal!).color })}>ROUTE COLOR</button></div>}
        </>
        break
      }
      if (state.mode === 'drive') {
        content = <><p className="eyebrow">05 / EXPERIENCE YOUR DRIVE</p><h1>A glimpse of<br /><em>the road ahead.</em></h1><p className="lead">{result.model.name} · miniature preview</p><p className="intro-copy">Play or pause the road markers and switch lanes. The camera stays still. This simulation does not represent vehicle performance.</p>
          <button className="primary-button" onClick={() => dispatch({ type: 'preview-toggle' })}>{state.playing ? 'PAUSE PREVIEW' : 'PLAY PREVIEW'}</button>
          <div className="button-row"><button className="secondary-button" disabled={state.lane <= -1} onClick={() => dispatch({ type: 'lane', delta: -1 })}>LEFT</button><button className="secondary-button" disabled={state.lane >= 1} onClick={() => dispatch({ type: 'lane', delta: 1 })}>RIGHT</button></div>
        </>
        break
      }
      content = <>
        <p className="eyebrow">05 / WE FOUND YOUR DRIVE.</p><h1>YOUR AUDI<br /><em>{result.model.name}</em></h1>
        <p className="selection-summary">{getPortal(state.portal!).title} · {formatBudget(state.budget)}</p>
        <p className="fine-print">{getAssetDescription(result.model.id)}</p>
        <ol className="match-reasons">{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ol>
        <p className="mock-notice"><strong>PROTOTYPE SUGGESTION</strong> Synthetic budget tier {result.demoTier}/5 and fictional matching traits. No official model price, specification, availability, or affordability is confirmed.</p>
        <div className="result-actions"><button className="primary-button" onClick={() => dispatch({ type: 'mode', mode: 'explore' })}>EXPLORE YOUR AUDI <span aria-hidden="true">↗</span></button><button className="secondary-button" onClick={() => dispatch({ type: 'mode', mode: 'drive' })}>EXPERIENCE YOUR DRIVE</button><button className="secondary-button" onClick={booking.open}>BOOK A TEST DRIVE</button></div>
        <p className="fine-print" role="status">{booking.message || (!booking.url ? 'Booking placeholder — no verified official URL supplied.' : 'Opens the configured official Audi page. No booking is made here.')}</p>
      </>
      break
    }
  }
  return <section className="journey-panel desktop-ui" aria-label="Journey controls"><div tabIndex={-1} ref={heading} className="panel-content">{content}</div>
    <nav className="panel-navigation" aria-label="Journey navigation">{state.scene !== 'origin' && <button className="text-button" onClick={() => dispatch({ type: 'back' })}>← BACK</button>}<button className="text-button" onClick={() => dispatch({ type: 'restart' })}>RESTART</button></nav>
  </section>
}
