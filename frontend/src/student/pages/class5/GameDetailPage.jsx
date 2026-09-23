import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import MiniPlay from '../../components/class5/redesign/MiniPlay'
import { C5, categoryIcon } from '../../components/class5/redesign/class5Theme'
import { CATEGORY_META } from '../../services/class5SeedData'
import { getGame } from '../../services/class5DiscoveryService'
import { SLoader, SAlert } from '../../components/ui'

export default function GameDetailPage() {
  const { key } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [recentResult, setRecentResult] = useState(null)

  useEffect(() => {
    let mounted = true
    getGame(key).then((g) => mounted && setGame(g))
    return () => { mounted = false }
  }, [key])

  if (!game) return <SLoader />

  const cat = CATEGORY_META[game.category] || { label: game.category, color: C5.navy }

  return (
    <div>
      <button
        onClick={() => navigate('/student/class5/skill-quests')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: C5.navy,
          fontSize: 13.5,
          fontWeight: 800,
          fontFamily: 'var(--s-font-display)',
          cursor: 'pointer',
          marginBottom: 18,
        }}
      >
        <FiArrowLeft /> Back to Skill Quests
      </button>

      <div
        style={{
          background: game.gradient || `linear-gradient(135deg, ${cat.color}, ${C5.navy})`,
          borderRadius: 32,
          color: '#fff',
          padding: 22,
          boxShadow: C5.shadowLg,
          marginBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 22,
              background: 'rgba(255,255,255,0.2)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 38,
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            {game.image ? (
              <img
                src={game.image}
                alt=""
                style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 22, flexShrink: 0, display: 'block' }}
              />
            ) : (
              <span style={{ color: '#fff' }}>{categoryIcon(game.category)}</span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>
              {categoryIcon(game.category)} {cat.label} Quest
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, lineHeight: 1.2 }}>{game.title}</h1>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, opacity: 0.92, lineHeight: 1.55, maxWidth: 520 }}>
              {game.oneLiner}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 99, padding: '6px 12px', fontSize: 12.5, fontWeight: 800 }}>
              +{game.xpValue} XP
            </span>
            <span style={{ background: 'rgba(255,255,255,0.22)', borderRadius: 99, padding: '6px 12px', fontSize: 12.5, fontWeight: 800 }}>
              {(game.skillTags || []).join(' · ')}
            </span>
          </div>
        </div>
      </div>

      <p style={{ color: C5.muted, fontSize: 14.5, lineHeight: 1.7, margin: '0 0 6px' }}>{game.description}</p>
      <p style={{ color: C5.faint, fontSize: 12.5, margin: '0 0 22px' }}>
        Your result adds XP to the whole-class Expedition goal in Squad — everyone grows together.
      </p>

      <div
        style={{
          background: '#fff',
          borderRadius: 32,
          border: '1px solid #eaf0f6',
          boxShadow: C5.shadow,
          padding: 22,
        }}
      >
        <MiniPlay
          game={game}
          onComplete={(res) => setRecentResult(res)}
        />
      </div>

      {recentResult && (
        <div style={{ marginTop: 18 }}>
          <SAlert type="success">
            <FiCheckCircle /> Quest logged: {recentResult.pct}% · +{recentResult.xp} XP added to your squad goal.
          </SAlert>
        </div>
      )}
    </div>
  )
}