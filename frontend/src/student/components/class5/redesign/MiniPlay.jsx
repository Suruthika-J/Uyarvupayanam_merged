import React, { useState } from 'react'
import { FiZap } from 'react-icons/fi'
import { C5, ICONS } from './class5Theme'
import { submitGameAttempt } from '../../../services/class5DiscoveryService'

// Playable mini interaction per game category:
//  - choose: pick correct option
//  - order:  tap steps in the right order
//  - write:  short guided creation (self-checked)
export default function MiniPlay({ game, onComplete }) {
  const [step, setStep] = useState('intro')
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [seq, setSeq] = useState([])
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)

  const play = game?.play
  const col = C5.navy

  if (!play) return null

  const startPlay = () => {
    setSeq([])
    setSelected(null)
    setText('')
    setRevealed(false)
    setResult(null)
    setStep('play')
  }

  const finish = async (correct, pct) => {
    const res = await submitGameAttempt(game.id, { pct })
    const xp = Math.round((pct / 100) * (game.xpValue || 20) + ((game.xpValue || 20) * (correct ? 1 : 0.25)))
    setResult({ correct, pct, xp: res?.xpEarned ?? xp })
    setStep('result')
    onComplete?.({ correct, pct, xp: res?.xpEarned ?? xp })
  }

  const checkChoose = () => {
    setRevealed(true)
    const correct = selected === play.correctIndex
    setTimeout(() => finish(correct, correct ? 100 : 50), 900)
  }

  const checkOrder = () => {
    const ordered = [...seq]
    const correct = ordered.length === play.items.length && ordered.every((item, i) => item === play.items[i])
    setRevealed(true)
    setTimeout(() => finish(correct, correct ? 100 : 60), 900)
  }

  const checkWrite = () => {
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const correct = words >= 8
    finish(correct, correct ? 100 : 70)
  }

  if (step === 'intro') {
    return (
      <div style={{ textAlign: 'center', padding: '26px 18px' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            overflow: 'hidden',
            margin: '0 auto 12px',
            background: `linear-gradient(135deg, ${C5.navy}, #3b82f6)`,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
          }}
          aria-hidden="true"
        >
          {game.image ? (
            <span style={{ width: '100%', height: '100%', backgroundImage: `url(${game.image})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }} />
          ) : (
            <ICONS.play size={30} strokeWidth={2} />
          )}
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: C5.ink, margin: '8px 0 6px' }}>{play.prompt}</h3>
        {play.hint && (
          <p style={{ fontSize: 13, color: C5.faint, margin: '0 auto 18px', maxWidth: 380, lineHeight: 1.55, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 6 }}>
            <FiZap size={14} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" /> {play.hint}
          </p>
        )}
        <button
          onClick={startPlay}
          style={{
            background: C5.navy,
            color: '#fff',
            border: 'none',
            borderRadius: 99,
            padding: '12px 30px',
            fontSize: 14.5,
            fontWeight: 800,
            fontFamily: 'var(--s-font-display)',
            cursor: 'pointer',
            boxShadow: '0 10px 18px -8px rgba(15,76,117,0.6)',
          }}
        >
          Play now →
        </button>
      </div>
    )
  }

  if (step === 'play') {
    if (play.type === 'choose') {
      return (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C5.ink, lineHeight: 1.55, margin: '0 0 16px' }}>{play.prompt}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {play.options.map((opt, i) => {
              const chosen = selected === i
              let extra = {}
              if (revealed) {
                extra = i === play.correctIndex
                  ? { background: '#ecfdf5', borderColor: '#059669', color: '#065f46' }
                  : chosen ? { background: '#fef2f2', borderColor: '#dc2626', color: '#991b1b' } : {}
              }
              return (
                <button
                  key={i}
                  onClick={() => !revealed && setSelected(i)}
                  style={{
                    flex: '1 1 160px',
                    padding: '14px 12px',
                    borderRadius: 14,
                    border: `1.5px solid ${chosen && !revealed ? col : C5.line}`,
                    background: chosen && !revealed ? `${col}12` : '#fff',
                    fontSize: 13.5,
                    fontWeight: chosen ? 800 : 600,
                    color: C5.ink,
                    cursor: revealed ? 'default' : 'pointer',
                    fontFamily: 'var(--s-font-body)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    ...extra,
                  }}
                >
                  {revealed && i === play.correctIndex ? <ICONS.check size={15} strokeWidth={2.8} /> : null}
                  {opt}
                </button>
              )
            })}
          </div>
          {selected != null && !revealed && (
            <button
              onClick={checkChoose}
              style={{
                marginTop: 18,
                background: col,
                color: '#fff',
                border: 'none',
                borderRadius: 99,
                padding: '11px 24px',
                fontSize: 14,
                fontWeight: 800,
                fontFamily: 'var(--s-font-display)',
                cursor: 'pointer',
              }}
            >
              Check answer
            </button>
          )}
        </div>
      )
    }

    if (play.type === 'order') {
      const remaining = play.items.filter((item) => !seq.includes(item))
      const complete = seq.length === play.items.length
      return (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C5.ink, lineHeight: 1.55, margin: '0 0 16px' }}>{play.prompt}</p>
          <div style={{ minHeight: 52, border: '1.5px dashed #cbd5e1', borderRadius: 14, padding: 10, display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {seq.length === 0 && <span style={{ fontSize: 12.5, color: '#94a3b8', padding: 6 }}>Tap the steps below in the right order…</span>}
            {seq.map((item, i) => (
              <span key={item + i} style={{ background: C5.navy, color: '#fff', borderRadius: 99, padding: '7px 12px', fontSize: 12.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {i + 1}. {item}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {remaining.map((item) => (
              <button
                key={item}
                onClick={() => setSeq((s) => [...s, item])}
                style={{ background: '#fff', border: `1.5px solid ${C5.line}`, borderRadius: 99, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, color: C5.ink, cursor: 'pointer' }}
              >
                {item}
              </button>
            ))}
          </div>
          {complete && !revealed && (
            <button
              onClick={checkOrder}
              style={{
                marginTop: 18,
                background: col,
                color: '#fff',
                border: 'none',
                borderRadius: 99,
                padding: '11px 24px',
                fontSize: 14,
                fontWeight: 800,
                fontFamily: 'var(--s-font-display)',
                cursor: 'pointer',
              }}
            >
              Check order
            </button>
          )}
          {complete && revealed && <p style={{ marginTop: 12, fontSize: 13, fontWeight: 800, color: '#059669' }}>Order submitted — checking!</p>}
        </div>
      )
    }

    if (play.type === 'write') {
      return (
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C5.ink, lineHeight: 1.55, margin: '0 0 12px' }}>{play.prompt}</p>
          {play.hint && (
            <p style={{ fontSize: 12.5, color: C5.faint, margin: '0 0 12px', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <FiZap size={13} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" /> {play.hint}
            </p>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Write here…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: `1.5px solid ${C5.line}`,
              borderRadius: 14,
              padding: 12,
              fontSize: 14,
              fontFamily: 'var(--s-font-body)',
              color: C5.ink,
              resize: 'vertical',
            }}
          />
          <button
            onClick={checkWrite}
            disabled={!text.trim()}
            style={{
              marginTop: 16,
              background: col,
              color: '#fff',
              border: 'none',
              borderRadius: 99,
              padding: '11px 24px',
              fontSize: 14,
              fontWeight: 800,
              fontFamily: 'var(--s-font-display)',
              cursor: text.trim() ? 'pointer' : 'not-allowed',
              opacity: text.trim() ? 1 : 0.6,
            }}
          >
            Finish my creation
          </button>
        </div>
      )
    }
    return null
  }

  if (step === 'result') {
    return (
      <div style={{ textAlign: 'center', padding: '18px 12px' }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            margin: '0 auto 12px',
            display: 'grid',
            placeItems: 'center',
            color: result.correct ? '#059669' : '#c2410c',
            background: result.correct ? '#ecfdf5' : '#fff7ed',
          }}
          aria-hidden="true"
        >
          {result.correct ? <ICONS.checkCircle size={40} strokeWidth={2} /> : <ICONS.refresh size={36} strokeWidth={2} />}
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 900, color: C5.ink, margin: '8px 0 4px' }}>
          {result.correct ? 'Nice work!' : 'Great try!'}
        </h3>
        <p style={{ color: C5.muted, fontSize: 14, margin: '0 0 8px' }}>Score {result.pct}% · +{result.xp} XP</p>
        <p style={{ color: C5.faint, fontSize: 12.5, margin: '0 0 16px', maxWidth: 320, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
          {result.correct
            ? 'You nailed this one — your skills just grew!'
            : 'The best creators try again. Play once more to level up your skills!'}
        </p>
        <button
          onClick={startPlay}
          style={{
            background: '#fff',
            color: C5.navy,
            border: `1.5px solid ${C5.navy}`,
            borderRadius: 99,
            padding: '10px 22px',
            fontSize: 13.5,
            fontWeight: 800,
            fontFamily: 'var(--s-font-display)',
            cursor: 'pointer',
          }}
        >
          Play again
        </button>
      </div>
    )
  }

  return null
}