import React, { useState } from 'react'
import { C5, worldColor, worldImage, ICONS } from './class5Theme'
import { SLoader } from '../../ui'

// Career-story video grid. Tapping opens a full-screen player overlay.
export default function VideoCardGrid({ videos = [], worldId, loading }) {
  const [active, setActive] = useState(null)

  if (loading) return <SLoader />
  if (!videos || !videos.length) return null

  const list = worldId ? videos.filter((v) => v.careerWorldKey === worldId || (v.world && v.world.name === worldId)) : videos

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {list.map((v) => {
        const col = worldColor(v.world?.colorTag)
        const thumb = v.thumbnail || worldImage(v.careerWorldKey)
        return (
          <button
            key={v.id}
            onClick={() => setActive(v)}
            style={{
              textAlign: 'left',
              background: C5.bg,
              border: `1px solid ${C5.line}`,
              borderRadius: 24,
              padding: 0,
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: C5.shadow,
              transition: 'transform 0.18s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <div
              style={{
                position: 'relative',
                height: 120,
                background: thumb
                  ? `linear-gradient(180deg, rgba(15,76,117,0.1) 0%, rgba(8,41,64,0.35) 100%), url(${thumb}) center/cover no-repeat`
                  : `linear-gradient(135deg, ${col}22 0%, ${C5.navy} 130%)`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.92)',
                  color: C5.navy,
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 8px 18px -6px rgba(8,30,48,0.6)',
                }}
                aria-hidden="true"
              >
                <ICONS.play size={20} strokeWidth={2.4} style={{ marginLeft: 2 }} />
              </span>
              <span
                style={{
                  position: 'absolute',
                  bottom: 10,
                  right: 12,
                  background: 'rgba(0,0,0,0.45)',
                  color: '#fff',
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 99,
                }}
              >
                {Math.floor((v.durationSec || 0) / 60)}:{(v.durationSec || 0) % 60 < 10 ? '0' : ''}
                {(v.durationSec || 0) % 60} min
              </span>
            </div>
            <div style={{ padding: '12px 16px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: col, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {v.world?.name}
              </div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: C5.ink, marginTop: 3, lineHeight: 1.4 }}>{v.title}</div>
              {v.featured && (
                <span style={{ fontSize: 10.5, fontWeight: 800, color: '#d97706', background: '#fff7ed', padding: '2px 8px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
                  <ICONS.star size={11} strokeWidth={2.6} /> Featured
                </span>
              )}
            </div>
          </button>
        )
      })}

      {active && (
        <div
          onClick={() => setActive(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(8,30,48,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 760,
              background: '#000',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setActive(null)}
              aria-label="Close video"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 2,
                background: 'rgba(0,0,0,0.55)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: 34,
                height: 34,
                cursor: 'pointer',
              }}
            >
              <ICONS.close size={18} />
            </button>
            <video
              src={active.url}
              controls
              autoPlay
              poster={active.thumbnail || worldImage(active.careerWorldKey) || undefined}
              style={{ width: '100%', maxHeight: '76vh', display: 'block', background: '#000' }}
            >
              {active.subtitlesUrl && <track kind="captions" src={active.subtitlesUrl} />}
            </video>
            <div style={{ padding: '14px 20px', color: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{active.title}</div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>{active.world?.name} · a story from a real career</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}