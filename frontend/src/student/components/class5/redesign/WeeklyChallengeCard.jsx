import React, { useState } from 'react'
import { C5, worldColor, worldImage, ICONS } from './class5Theme'
import { WhyItMatters } from './SectionHeader'
import { SAlert } from '../../ui'
import { submitChallenge } from '../../../services/class5DiscoveryService'

// Weekly 5-minute "try it" challenge with a playful answer sheet.
export default function WeeklyChallengeCard({ challenge, worldTag }) {
  const [open, setOpen] = useState(false)
  const [response, setResponse] = useState('')
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!challenge) return null
  const submitted = challenge.submitted || done
  const col = worldColor(worldTag || 'navy')
  const photo = challenge.image || worldImage(challenge.worldTag)

  const submit = async () => {
    if (challenge.taskType === 'choose' && selected == null) {
      setError('Pick one option first!')
      return
    }
    if (challenge.taskType !== 'choose' && !response.trim()) {
      setError('Write a little first — even two sentences counts!')
      return
    }
    setBusy(true)
    setError('')
    try {
      await submitChallenge(challenge.id, {
        response: challenge.taskType === 'choose' ? challenge.options[selected] : response.trim(),
        responseIndex: challenge.taskType === 'choose' ? selected : undefined,
      })
      setDone(true)
      setOpen(false)
    } catch {
      setError('Could not save your answer. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const watermark = photo
    ? { backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, ${col}, ${C5.navy})` }

  return (
    <div
      style={{
        background: 'linear-gradient(120deg,#0f4c75 0%,#1d5f96 60%,#2f7bb5 100%)',
        borderRadius: C5.radiusLg,
        color: '#fff',
        padding: 22,
        boxShadow: C5.shadowLg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: -24,
          top: -30,
          width: 150,
          height: 150,
          borderRadius: 40,
          opacity: 0.18,
          transform: 'rotate(8deg)',
          ...watermark,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ffe7b3' }}>
          This week's try-it · 5 minutes
        </span>
        {submitted && (
          <span style={{ fontSize: 11.5, fontWeight: 800, background: '#34d399', color: '#053b2a', padding: '3px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ICONS.check size={12} strokeWidth={3} /> Done
          </span>
        )}
      </div>

      <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.2, position: 'relative', zIndex: 1 }}>
        {challenge.title}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 14, padding: '12px 14px', marginTop: 14, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 12.5, opacity: 0.92, lineHeight: 1.6 }}>{challenge.description}</div>
        <WhyItMatters text={challenge.oneLiner?.replace(/^why it matters:\s*/i, '')} />
      </div>

      {submitted ? (
        <div style={{ position: 'relative', zIndex: 1, marginTop: 16, fontSize: 13.5, lineHeight: 1.6, background: 'rgba(255,255,255,0.16)', borderRadius: 12, padding: '10px 14px' }}>
          <strong>Your answer: </strong>
          {challenge.submission?.response || 'Saved!'}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: 16,
            width: '100%',
            background: '#fff',
            color: C5.navy,
            border: 'none',
            borderRadius: 14,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 800,
            fontFamily: 'var(--s-font-display)',
            cursor: 'pointer',
            boxShadow: '0 10px 20px -8px rgba(0,0,0,0.35)',
          }}
        >
          {challenge.taskType === 'choose' ? 'Pick the answer →' : 'Write my answer →'}
        </button>
      )}

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(8,30,48,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 26,
              padding: 24,
              width: '100%',
              maxWidth: 460,
              maxHeight: '86vh',
              overflowY: 'auto',
              color: C5.ink,
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: col }}>
                Weekly challenge
              </span>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C5.faint, display: 'grid', placeItems: 'center' }} aria-label="Close">
                <ICONS.close size={20} />
              </button>
            </div>
            <div style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.25 }}>{challenge.title}</div>
            <p style={{ fontSize: 14, color: C5.muted, lineHeight: 1.6, margin: '10px 0' }}>{challenge.taskPrompt}</p>

            {challenge.options?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
                {challenge.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    style={{
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 14,
                      border: `1.5px solid ${selected === i ? col : C5.line}`,
                      background: selected === i ? `${col}12` : '#fff',
                      color: C5.ink,
                      fontSize: 14,
                      fontWeight: selected === i ? 800 : 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--s-font-body)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    {selected === i ? <ICONS.check size={15} strokeWidth={2.6} color={col} /> : <span style={{ width: 15 }} />}
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                placeholder="Write or describe your idea here…"
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
            )}

            {error && <div style={{ marginTop: 10 }}><SAlert type="error">{error}</SAlert></div>}

            <button
              onClick={submit}
              disabled={busy}
              style={{
                marginTop: 16,
                width: '100%',
                background: col,
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                padding: '12px 16px',
                fontSize: 14.5,
                fontWeight: 800,
                fontFamily: 'var(--s-font-display)',
                cursor: busy ? 'not-allowed' : 'pointer',
                opacity: busy ? 0.7 : 1,
                boxShadow: `0 8px 16px -6px ${col}88`,
              }}
            >
              {busy ? 'Saving…' : 'Save my try-it'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}