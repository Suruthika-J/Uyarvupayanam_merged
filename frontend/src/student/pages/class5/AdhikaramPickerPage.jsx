import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdhikaramList } from '../../services/adhikaramService'
import { SCENES, CHARACTERS } from '../../data/adhikaramEnvironments'
import '../../components/adhikaram/adhikaram.css'

export default function AdhikaramPickerPage() {
  const [worlds, setWorlds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const all = await getAdhikaramList()
      if (cancelled) return
      setWorlds(Array.isArray(all) ? all : [])
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 18,
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              height: 260,
              borderRadius: 22,
              background: 'linear-gradient(180deg, #eaf3fb 0%, #fbfdff 100%)',
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="adh-intro" style={{ marginBottom: 22 }}>
        <span className="adh-intro-eyebrow">Thirukkural story worlds</span>
        <h1 className="adh-intro-title">Six worlds, one verse each chapter</h1>
        <p className="adh-intro-text">
          Each Kural chapter lives inside its own illustrated cartoon world. Pick a world, read the ten kurals,
          and open any kural to see its simple meaning and a story example.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
          gap: 18,
        }}
      >
        {worlds.map((w) => {
          const Scene = SCENES[w.environment]
          const Kid = CHARACTERS[w.environment]
          const palette = w.theme?.palette || {}
          const first = w.kurals?.[0]?.number
          const last = w.kurals?.[w.kurals.length - 1]?.number
          return (
            <Link
              key={w.id}
              to={`/student/class5/adhikaram/${w.id}`}
              style={{
                textDecoration: 'none',
                borderRadius: 22,
                overflow: 'hidden',
                border: '1px solid #e4edf5',
                background: '#fff',
                boxShadow: '0 10px 24px -14px rgba(15,76,117,0.25)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 18px 34px -16px rgba(15,76,117,0.35)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none'
                e.currentTarget.style.boxShadow = '0 10px 24px -14px rgba(15,76,117,0.25)'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  height: 150,
                  overflow: 'hidden',
                  background: `linear-gradient(180deg, ${palette.skyTop || '#2b2147'} 0%, ${palette.skyBottom || '#ffb37b'} 100%)`,
                }}
              >
                <div className="adh-pick-scene">
                  <Scene />
                </div>
                <div style={{ position: 'absolute', right: '4%', bottom: 0, width: 92 }}>
                  <Kid />
                </div>
              </div>
              <div style={{ padding: '16px 18px 18px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: w.accent || palette.accent,
                    background: `${w.accent || palette.accent}1a`,
                    borderRadius: 99,
                    padding: '3px 10px',
                    marginBottom: 8,
                  }}
                >
                  Chapter {w.number} · Kural {first}–{last}
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: 'var(--s-font-display)',
                    fontWeight: 900,
                    fontSize: 20,
                    color: '#1e293b',
                  }}
                >
                  {w.nameTamil}
                </h3>
                <p
                  style={{
                    margin: '3px 0 0',
                    fontFamily: 'var(--s-font-display)',
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: w.accent || palette.accent,
                  }}
                >
                  {w.nameEn}
                </p>
                <p
                  style={{
                    margin: '10px 0 0',
                    fontFamily: 'var(--s-font-body)',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: '#5b6b80',
                  }}
                >
                  {w.intro}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}