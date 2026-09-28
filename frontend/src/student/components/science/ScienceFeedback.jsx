import React, { useEffect, useRef } from 'react'
import SciArt from './art'
import { ScienceGuide } from './characters'

// ScienceFeedback: the friendly panel after a student answers. It celebrates a
// correct answer, shows the hint + explanation + the revealed answer when
// missed, and offers one tap for the next step. No ranks, no scores — just the
// wonder of understanding.

export default function ScienceFeedback({
  status,
  result,
  worldNameEn,
  complete,
  finalWorld,
  completeNextName,
  reporting,
  onMap,
  onTryAgain,
  onShowExplanation,
  onNext,
  nextLabel,
  onCompleteContinue,
}) {
  const pilot = useRef(null)
  useEffect(() => {
    pilot.current = window.setTimeout(() => {
      const node = document.querySelector('.sci-feedback')
      if (node) node.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 60)
    return () => window.clearTimeout(pilot.current)
  }, [status])

  if (complete) {
    return (
      <div className="sci-feedback sci-feedback-complete" aria-live="polite">
        <div className="sci-feedback-flag" aria-hidden="true">
          <SciArt k="star" size={54} />
        </div>
        <h2 className="sci-feedback-title">Wonderful — {worldNameEn} solved!</h2>
        <p className="sci-feedback-text">
          Every question is answered and every discovery inside you is a little real-life scientist.
        </p>
        <div className="sci-feedback-actions">
          <button type="button" className="sci-btn sci-btn-ghost" onClick={onMap}>Science map</button>
          {finalWorld ? (
            <button type="button" className="sci-btn sci-btn-main" onClick={onCompleteContinue}>Back to the Science map</button>
          ) : (
            <button type="button" className="sci-btn sci-btn-main" onClick={onCompleteContinue}>
              On to {completeNextName} →
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!status || status === 'asking') return null

  const correct = Boolean(result && result.correct)

  if (status === 'retry') {
    return (
      <div className="sci-feedback sci-feedback-retry" aria-live="polite">
        <span className="sci-feedback-guide"><ScienceGuide size={52} bot={false} /></span>
        <div className="sci-feedback-body">
          <h2 className="sci-feedback-title">Almost — give it one more think!</h2>
          {result && result.hint ? (
            <p className="sci-feedback-hint">Hint: <strong>{result.hint}</strong></p>
          ) : null}
          <div className="sci-feedback-actions">
            <button type="button" className="sci-btn sci-btn-main" onClick={onTryAgain} disabled={reporting}>Try again</button>
            <button type="button" className="sci-btn sci-btn-ghost" onClick={onShowExplanation}>Show me the answer</button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'reveal') {
    return (
      <div className="sci-feedback sci-feedback-reveal" aria-live="polite">
        <span className="sci-feedback-guide"><ScienceGuide size={52} bot={false} /></span>
        <div className="sci-feedback-body">
          <h2 className="sci-feedback-title">{correct ? 'Right — you nailed the science!' : 'Here is how it works'}</h2>
          {correct ? (
            <p className="sci-feedback-text">Look how naturally you thought like a scientist.</p>
          ) : (
            <p className="sci-feedback-text">
              The answer was <strong className="sci-feedback-answer">{String(result.answer != null ? result.answer : '')}</strong>.
            </p>
          )}
          {result && result.explanation ? <p className="sci-feedback-explain">{result.explanation}</p> : null}
          <div className="sci-feedback-actions">
            <button type="button" className="sci-btn sci-btn-main" onClick={onNext} disabled={reporting}>{nextLabel}</button>
            <button type="button" className="sci-btn sci-btn-ghost" onClick={onMap}>Science map</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="sci-feedback sci-feedback-correct" aria-live="polite">
      <span className="sci-feedback-guide"><ScienceGuide size={52} bot={false} /></span>
      <div className="sci-feedback-body">
        <h2 className="sci-feedback-title">Correct — what a discovery!</h2>
        {result && result.explanation ? <p className="sci-feedback-explain">{result.explanation}</p> : null}
        <div className="sci-feedback-actions">
          <button type="button" className="sci-btn sci-btn-main" onClick={onNext} disabled={reporting}>{nextLabel}</button>
          <button type="button" className="sci-btn sci-btn-ghost" onClick={onMap}>Science map</button>
        </div>
      </div>
    </div>
  )
}