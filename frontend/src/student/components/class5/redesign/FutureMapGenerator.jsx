import React, { useState } from 'react'
import { C5, worldColor } from './class5Theme'
import { seedWorldByKey } from '../../../services/class5SeedData'
import { generateFutureMap } from '../../../services/class5DiscoveryService'
import { SAlert } from '../../ui'

// Draw-your-future poster generator: pick a home world + explored worlds,
// then produce (or generate) a PrintableFuture stub.
export default function FutureMapGenerator({ profile, explorerWorlds = [] }) {
  const [homeKey, setHomeKey] = useState(profile?.lastWorld?.key || 'ocean-explorer')
  const [explored, setExplored] = useState(explorerWorlds.slice(0, 3))
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const toggleExplored = (key) => {
    setExplored((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const onGenerate = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await generateFutureMap({
        worldKey: homeKey,
        exploredWorldKeys: explored,
        skills: profile?.skills,
      })
      setMsg(
        res.downloadUrl
          ? 'Your Future Map PDF started downloading.'
          : 'Your Future Map is ready! In the full version a poster PDF downloads — this preview shows your map on screen.'
      )
    } catch {
      setMsg('Could not generate the poster right now — please try again.')
    } finally {
      setBusy(false)
    }
  }

  const home = seedWorldByKey[homeKey] || seedWorldByKey['ocean-explorer']

  return (
    <div
      style={{
        background: C5.bg,
        border: `1px solid ${C5.line}`,
        borderRadius: C5.radiusLg,
        boxShadow: C5.shadow,
        padding: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: '#e6f0f7',
            display: 'grid',
            placeItems: 'center',
            fontSize: 22,
          }}
          aria-hidden="true"
        >
          🗺️
        </span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, color: C5.ink }}>My Future Map</div>
          <div style={{ fontSize: 12.5, color: C5.faint }}>Pick your home world and the worlds you explored.</div>
        </div>
      </div>

      <label style={{ fontSize: 12, fontWeight: 800, color: C5.muted, display: 'block', marginBottom: 8 }}>Home world</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {Object.keys(seedWorldByKey).map((key) => {
          const w = seedWorldByKey[key]
          const sel = key === homeKey
          return (
            <button
              key={key}
              onClick={() => setHomeKey(key)}
              style={{
                background: sel ? C5.navy : '#fff',
                color: sel ? '#fff' : C5.muted,
                border: `1.5px solid ${sel ? C5.navy : C5.line}`,
                borderRadius: 99,
                padding: '7px 13px',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: 'var(--s-font-display)',
                cursor: 'pointer',
              }}
            >
              {w.emoji} {w.name}
            </button>
          )
        })}
      </div>

      <label style={{ fontSize: 12, fontWeight: 800, color: C5.muted, display: 'block', marginBottom: 8 }}>
        Worlds explored with your squad
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {Object.keys(seedWorldByKey).map((key) => {
          const w = seedWorldByKey[key]
          const sel = explored.includes(key)
          return (
            <button
              key={key}
              onClick={() => toggleExplored(key)}
              style={{
                background: sel ? '#e6f0f7' : '#fff',
                color: sel ? worldColor(w.colorTag) : C5.faint,
                border: `1.5px solid ${sel ? worldColor(w.colorTag) : C5.line}`,
                borderRadius: 99,
                padding: '7px 13px',
                fontSize: 12.5,
                fontWeight: 700,
                fontFamily: 'var(--s-font-display)',
                cursor: 'pointer',
              }}
            >
              {sel ? '✓ ' : ''}{w.emoji} {w.name}
            </button>
          )
        })}
      </div>

      <div
        style={{
          borderRadius: 22,
          overflow: 'hidden',
          border: `1px solid ${C5.line}`,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${worldColor(home.colorTag)} 0%, ${C5.navy} 140%)`,
            color: '#fff',
            padding: '26px 22px',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.85 }}>
              My Future Map · Class 5
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6, lineHeight: 1.1 }}>
              {home.emoji} {home.name}
            </div>
            <div style={{ fontSize: 13, opacity: 0.92, marginTop: 6 }}>{home.tagline}</div>
          </div>
          <div style={{ fontSize: 48 }} aria-hidden="true">{home.emoji}</div>
        </div>
        <div style={{ padding: 16, background: '#fbfdff' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C5.faint, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Explored with my squad
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {explored.length ? (
              explored.map((k) => {
                const w = seedWorldByKey[k]
                return (
                  w && (
                    <span key={k} style={{ fontSize: 12, fontWeight: 700, background: '#eef3f8', color: C5.muted, padding: '6px 10px', borderRadius: 99 }}>
                      {w.emoji} {w.name}
                    </span>
                  )
                )
              })
            ) : (
              <span style={{ fontSize: 12, color: C5.faint }}>Add worlds you explored together.</span>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onGenerate}
        disabled={busy || !homeKey}
        style={{
          width: '100%',
          background: C5.navy,
          color: '#fff',
          border: 'none',
          borderRadius: 14,
          padding: '11px 16px',
          fontSize: 14,
          fontWeight: 800,
          fontFamily: 'var(--s-font-display)',
          cursor: busy ? 'not-allowed' : 'pointer',
          opacity: busy ? 0.7 : 1,
          boxShadow: '0 8px 16px -6px rgba(15,76,117,0.55)',
        }}
      >
        {busy ? 'Drawing your map…' : 'Generate my Future Map poster'}
      </button>

      {msg && (
        <div style={{ marginTop: 14 }}>
          <SAlert type="success">{msg}</SAlert>
        </div>
      )}
    </div>
  )
}