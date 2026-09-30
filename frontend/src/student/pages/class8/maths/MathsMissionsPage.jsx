import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiAward, FiLoader, FiMap, FiRefreshCw } from 'react-icons/fi'
import SpaceScene from '../../../components/class8/SpaceScene'
import Planet from '../../../components/class8/Planet'
import {
  AdventureMap,
  MathsJourneyHeader,
} from '../../../components/class8/MathsAdventureMap'
import { getMathsProgress, resetMathsProgress } from '../../../services/mathsMissionsApi'
import './mathsMissions.css'

const ACCENT = '#1a7a50'
const ACCENT_DEEP = '#145c3d'
const INK = '#0f172a'
const MUTED = '#64748b'
const GOLD = '#b45309'
const GOLD_SOFT = '#fff7e6'
const GOLD_EDGE = '#eccd97'

export default function MathsMissionsPage() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState(null)
  const [showTrophy, setShowTrophy] = useState(false)
  const [guideMsg, setGuideMsg] = useState('')

  async function load() {
    setLoadState('loading')
    setLoadError(null)
    try {
      const data = await getMathsProgress()
      setOverview(data)
      setLoadState('ready')
    } catch (err) {
      setLoadError(err)
      setLoadState('error')
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Guide greeting adapts to where the explorer is in the journey.
  useEffect(() => {
    if (!overview) return
    if (overview.currentTopic) {
      const t = overview.currentTopic
      setGuideMsg(t.completedMissions > 0
        ? `Your voyage continues at ${t.worldName}. Follow the glowing trail — the Master Challenge awaits!`
        : `Welcome aboard! First stop: ${t.worldName}. Tap the glowing world to begin your first mission.`)
    } else if (overview.totalScore === 0) {
      setGuideMsg('Welcome to the Math Explorer! Every world is a new topic — start with Fraction Planet.')
    } else {
      setGuideMsg('Unbelievable — you conquered every world in the Math Galaxy. The trophy is yours!')
    }
  }, [overview])

  const topics = useMemo(() => (overview ? overview.topics : []), [overview])
  const allDone = Boolean(overview && topics.length > 0 && topics.every((t) => t.completed))
  const currentTopic = overview ? overview.currentTopic : null

  function openTopic(topicId) {
    navigate(`/student/class8/maths/topic/${topicId}`)
  }

  async function handleReset() {
    if (!window.confirm('Reset all Maths Mission progress for this account?')) return
    await resetMathsProgress()
    load()
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loadState === 'loading') {
    return (
      <SpaceScene compact light stars={60} salt={3} style={{ minHeight: '100vh' }}>
        <div style={{ padding: '110px 24px', textAlign: 'center' }}>
          <div className="mm-spin" style={{ color: ACCENT, margin: '0 auto 16px', width: 42, height: 42 }}>
            <FiLoader size={42} strokeWidth={2.2} />
          </div>
          <div style={{ fontSize: 19, fontWeight: 900, color: INK }}>Plotting your course…</div>
          <div style={{ fontSize: 14.5, color: MUTED, marginTop: 6 }}>Charting all 15 worlds of the Math Galaxy.</div>
        </div>
      </SpaceScene>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (loadState === 'error') {
    const net = loadError && loadError.network
    return (
      <SpaceScene compact light stars={50} salt={4} style={{ minHeight: '100vh' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fff', border: '1px solid #dce4ee', color: ACCENT, boxShadow: '0 16px 40px -20px rgba(15,23,42,0.3)', display: 'grid', placeItems: 'center', margin: '0 auto 18px' }}>
            <FiMap size={28} />
          </div>
          <h2 style={{ fontSize: 25, fontWeight: 900, color: INK, margin: '0 0 8px' }}>
            {net ? 'The flight deck is resting' : 'Map not found'}
          </h2>
          <p style={{ fontSize: 15.5, color: '#475569', lineHeight: 1.7, margin: '0 0 22px' }}>
            {net
              ? 'We could not reach the learning hub. Check your connection and press retry — nothing is lost.'
              : 'This map is not available right now. Please try again.'}
          </p>
          <button type="button" onClick={load} style={{ background: ACCENT, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 26px', fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 14px 30px -14px rgba(26,122,80,0.55)' }}>
            <FiRefreshCw size={15} /> Try again
          </button>
        </div>
      </SpaceScene>
    )
  }

  return (
    <SpaceScene light stars={120} salt={11}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px 70px' }}>
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: MUTED, marginBottom: 20, flexWrap: 'wrap' }}>
          <Link to="/student/class8" style={{ color: '#334155', textDecoration: 'none' }}>Class 8</Link>
          <span aria-hidden="true" style={{ color: '#94a3b8' }}>›</span>
          <span style={{ color: INK }}>Maths — Space Adventure</span>
        </nav>

        {/* ── Header: MATH EXPLORER + compact progress ───────────────────── */}
        <MathsJourneyHeader
          overview={overview}
          topics={topics}
          currentTopic={currentTopic}
          allDone={allDone}
          guideMsg={guideMsg}
          showTrophy={showTrophy}
          onContinue={() => currentTopic && openTopic(currentTopic.id)}
          onToggleTrophy={() => setShowTrophy((s) => !s)}
        />

        {/* ── Math Master trophy (all 15 worlds conquered) ───────────────── */}
        {allDone && showTrophy && (
          <div className="mm-achievement" style={{ background: 'linear-gradient(165deg, #fffdf6 0%, #fff7e6 100%)', border: '1.5px solid #eccd97', borderRadius: 28, padding: '38px 28px', textAlign: 'center', marginBottom: 34, boxShadow: '0 30px 80px -44px rgba(180,83,9,0.55)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div className="mm-float"><Planet kind="trophy" accent="#f59e0b" size={120} glow /></div>
            </div>
            <div className="mm-space-kicker" style={{ color: GOLD }}>Final destination reached</div>
            <h2 className="mm-space-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', margin: '8px 0 6px' }}>
              MATH MASTER
            </h2>
            <p style={{ fontSize: 16, color: '#475569', maxWidth: 560, margin: '0 auto 20px', lineHeight: 1.65 }}>
              You travelled every route, solved every mission and conquered every Master Challenge
              in the Math Galaxy. Your name belongs among the stars!
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: '#fff', border: '1px solid #f0dfbf', borderRadius: 99, padding: '8px 16px', fontSize: 14.5, fontWeight: 800, color: INK }}>{topics.length} worlds</span>
              <span style={{ background: '#fff', border: '1px solid #f0dfbf', borderRadius: 99, padding: '8px 16px', fontSize: 14.5, fontWeight: 800, color: INK }}>{overview.totalMissions} missions</span>
              <span style={{ background: '#fff', border: '1px solid #f0dfbf', borderRadius: 99, padding: '8px 16px', fontSize: 14.5, fontWeight: 800, color: GOLD }}>{overview.totalStars} stars</span>
              <span style={{ background: '#fff', border: '1px solid #f0dfbf', borderRadius: 99, padding: '8px 16px', fontSize: 14.5, fontWeight: 800, color: INK }}>{overview.totalScore} XP</span>
            </div>
            <div style={{ marginTop: 26, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 14, padding: '13px 26px', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 14px 30px -14px rgba(245,158,11,0.7)' }}
              >
                <FiAward style={{ marginRight: 6, verticalAlign: '-2px' }} /> View achievement
              </button>
              <button
                type="button"
                onClick={() => setShowTrophy(false)}
                style={{ background: '#fff', color: ACCENT_DEEP, border: '1.5px solid #eccd97', borderRadius: 14, padding: '12px 24px', fontSize: 15.5, fontWeight: 800, cursor: 'pointer' }}
              >
                Explore the galaxy again
              </button>
            </div>
          </div>
        )}

        {/* ── The adventure map ──────────────────────────────────────────── */}
        <AdventureMap
          topics={topics}
          allDone={allDone}
          showTrophy={showTrophy}
          onOpenTopic={openTopic}
          onOpenTrophy={() => setShowTrophy(true)}
        />

        {/* ── Footer note + reset ────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 44, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <p style={{ fontSize: 13.5, color: MUTED, maxWidth: 560, margin: 0, lineHeight: 1.6 }}>
            Each world holds five missions and a Master Challenge. Finish a world and the next destination on the trail unlocks.
          </p>
          <button
            type="button"
            onClick={handleReset}
            style={{ background: '#fff', border: '1px solid #dce4ee', color: '#475569', borderRadius: 99, padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <FiRefreshCw size={13} /> Reset progress
          </button>
        </div>
      </div>
    </SpaceScene>
  )
}