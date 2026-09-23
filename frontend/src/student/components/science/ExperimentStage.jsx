import React, { useState } from 'react'
import { runScienceExperiment } from '../../services/scienceService'
import SciArt from './art'
import { ScienceGuide } from './characters'
import './science.css'

// ExperimentStage: the "try it" step of each Science Adventure world. The
// student predicts how each cup/object/action will end by placing items into
// prediction buckets, then taps "Run it" to compare with what really happens.
// The server holds the true outcomes; this stage just asks for the prediction.

export default function ExperimentStage({ world, onContinue, onMap }) {
  const { experiment } = world || {}
  const buckets = (experiment && experiment.buckets) || []
  const items = (experiment && experiment.items) || []
  const [placed, setPlaced] = useState({})
  const [inHand, setInHand] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  function pick(key) {
    if (result || busy) return
    setInHand(key)
  }

  function drop(bucket) {
    if (result || busy || inHand == null) return
    const next = { ...placed, [inHand]: bucket }
    setPlaced(next)
    setInHand(null)
    setError('')
  }

  function unplace(key) {
    if (result || busy) return
    const next = { ...placed }
    delete next[key]
    setPlaced(next)
  }

  const allPlaced = items.every((it) => placed[it.key])

  async function run() {
    if (!allPlaced || busy || result) return
    setBusy(true)
    setError('')
    try {
      const res = await runScienceExperiment(world.id, placed)
      setResult(res)
    } catch (err) {
      if (err && err.auth) {
        onMap(true)
        return
      }
      setError('The experiment needs a moment. Tap Run it again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`sci-exp${result ? ' is-done' : ''}`}>
      <div className="sci-exp-head">
        <span className="sci-intro-eyebrow">{world.name} · {world.nameEn} · Try it</span>
        <h2 className="sci-exp-prompt">{experiment.prompt}</h2>
        <p className="sci-exp-instruction">{experiment.instruction}</p>
      </div>

      {!result ? (
        <>
          <div className="sci-exp-buckets" role="group" aria-label="prediction buckets">
            {buckets.map((b) => {
              const inside = items.filter((it) => placed[it.key] === b)
              return (
                <div
                  key={String(b)}
                  className={`sci-exp-bucket${inHand != null ? ' is-open' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => drop(String(b))}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop(String(b)) } }}
                  aria-label={`place item in ${b}`}
                >
                  <div className="sci-exp-bucket-label">{String(b)}</div>
                  <div className="sci-exp-bucket-items">
                    {inside.map((it) => (
                      <button
                        key={String(it.key)}
                        type="button"
                        className="sci-exp-chip"
                        onClick={() => unplace(it.key)}
                        disabled={busy}
                        aria-label={`take back ${it.label}`}
                      >
                        {it.art ? <SciArt k={it.art} size={26} /> : null}
                        <span>{it.label}</span>
                      </button>
                    ))}
                    {inside.length === 0 ? <span className="sci-exp-empty">tap a card, then this bucket</span> : null}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="sci-exp-tray" role="group" aria-label="experiment cards">
            {items.map((it) => {
              if (placed[it.key] != null) {
                return (
                  <button
                    key={String(it.key)}
                    type="button"
                    className="sci-exp-chip is-placed"
                    onClick={() => unplace(it.key)}
                    disabled={busy}
                  >
                    {it.art ? <SciArt k={it.art} size={26} /> : null}
                    <span>{it.label}</span>
                  </button>
                )
              }
              return (
                <button
                  key={String(it.key)}
                  type="button"
                  className={`sci-exp-chip${inHand === it.key ? ' is-hand' : ''}`}
                  onClick={() => pick(it.key)}
                  disabled={busy}
                >
                  {it.art ? <SciArt k={it.art} size={26} /> : null}
                  <span>{it.label}</span>
                </button>
              )
            })}
          </div>

          {error ? <p className="sci-error">{error}</p> : null}

          <div className="sci-action-row">
            <button type="button" className="sci-btn sci-btn-ghost" onClick={() => onMap(true)}>Science map</button>
            <button
              type="button"
              className="sci-btn sci-btn-main sci-btn-big"
              onClick={run}
              disabled={busy || !allPlaced}
            >
              {busy ? 'Running…' : allPlaced ? 'Run it!' : 'Place every card first'}
            </button>
          </div>
        </>
      ) : (
        <div className="sci-exp-result" aria-live="polite">
          <div className="sci-feedback-guide"><ScienceGuide size={52} bot={false} /></div>

          <div className="sci-exp-observe">
            <span className="sci-intro-eyebrow">What happened</span>
            <p className="sci-exp-text">{result.observe}</p>
          </div>

          <div className="sci-exp-results" role="group" aria-label="prediction results">
            {items.map((it) => {
              const right = Boolean(result.results && result.results[it.key])
              return (
                <div key={String(it.key)} className={`sci-exp-result-row${right ? ' is-right' : ' is-miss'}`}>
                  {it.art ? <SciArt k={it.art} size={26} /> : null}
                  <span className="sci-exp-result-label">{it.label}</span>
                  <span className="sci-exp-result-bucket">{placed[it.key]}</span>
                  <span className="sci-exp-result-mark" aria-hidden="true">{right ? '✓' : '✗'}</span>
                </div>
              )
            })}
          </div>

          <div className="sci-exp-explain">
            <span className="sci-intro-eyebrow">Why</span>
            <p className="sci-exp-text">{result.reveal}</p>
          </div>

          {result.guide ? <p className="sci-exp-guide">{result.guide}</p> : null}
          {result.followUp ? <p className="sci-exp-follow">{result.followUp}</p> : null}

          <div className="sci-action-row">
            <button type="button" className="sci-btn sci-btn-ghost" onClick={() => onMap(true)}>Science map</button>
            <button type="button" className="sci-btn sci-btn-main sci-btn-big" onClick={onContinue}>
              {result.alreadyRun ? 'Back to the questions →' : 'Now the questions →'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}