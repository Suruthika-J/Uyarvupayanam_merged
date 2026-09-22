import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { C5, worldColor } from './class5Theme'
import { CATEGORY_META } from '../../../services/class5SeedData'
import { SLoader } from '../../ui'

// Skill Quest grid with category filter pills. Cards open the playable detail page.
export default function GameCardGrid({ games = [], loading }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')

  if (loading) return <SLoader />
  if (!games || !games.length) return null

  const categories = ['all', ...new Set(games.map((g) => g.category))]
  const list = filter === 'all' ? games : games.filter((g) => g.category === filter)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          background: C5.soft,
          border: `1px solid ${C5.line}`,
          borderRadius: 99,
          padding: 6,
          marginBottom: 18,
          width: 'fit-content',
        }}
      >
        {categories.map((c) => {
          const meta = CATEGORY_META[c]
          const sel = filter === c
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                background: sel ? C5.navy : 'transparent',
                color: sel ? '#fff' : C5.muted,
                border: 'none',
                borderRadius: 99,
                padding: '8px 15px',
                fontSize: 12.5,
                fontWeight: 800,
                fontFamily: 'var(--s-font-display)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {c === 'all' ? '✨ All' : `${meta?.emoji} ${meta?.label}`}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        {list.map((g) => {
          const cat = CATEGORY_META[g.category] || { label: g.category, emoji: '🎯', color: C5.navy }
          const best = g.bestPct
          return (
            <button
              key={g.id}
              onClick={() => navigate(`/student/class5/games/${g.key}`)}
              style={{
                textAlign: 'left',
                background: C5.bg,
                border: `1px solid ${C5.line}`,
                borderRadius: 26,
                paddingBottom: 16,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: C5.shadow,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                fontFamily: 'inherit',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = C5.shadowLg }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = C5.shadow }}
            >
              <div
                style={{
                  background: g.gradient || `linear-gradient(135deg, ${cat.color}, ${C5.navy})`,
                  padding: '18px 18px 14px',
                  color: '#fff',
                  position: 'relative',
                }}
              >
                <div style={{ fontSize: 38, lineHeight: 1 }} aria-hidden="true">{g.emoji}</div>
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(255,255,255,0.24)',
                    color: '#fff',
                    fontSize: 10.5,
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 99,
                  }}
                >
                  {cat.emoji} {cat.label}
                </span>
                {g.featured && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 12,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    ⭐ Featured
                  </span>
                )}
              </div>
              <div style={{ padding: '14px 16px 10px', flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: C5.ink, lineHeight: 1.25 }}>{g.title}</div>
                <p style={{ fontSize: 12.5, color: C5.muted, lineHeight: 1.55, margin: '6px 0 10px' }}>{g.oneLiner}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  {(g.skillTags || []).map((tag) => (
                    <span key={tag} style={{ fontSize: 10.5, fontWeight: 800, background: '#eef3f8', color: C5.muted, padding: '3px 9px', borderRadius: 99 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div
                style={{
                  margin: '0 16px',
                  paddingTop: 10,
                  borderTop: `1px solid ${C5.line}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 11.5, fontWeight: 800, color: C5.faint }}>+{g.xpValue} XP</span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 800,
                    color: worldColor('navy'),
                    background: '#e6f0f7',
                    padding: '6px 14px',
                    borderRadius: 99,
                  }}
                >
                  {best != null ? `Best ${best}% · Play again` : 'Play now →'}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}