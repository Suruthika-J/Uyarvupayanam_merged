import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SLoader } from '../../components/UI'
import { seatMatrixService, streamSlug } from '../../../services/seatMatrixService'

const STREAM_ICONS = {
  Engineering: '⚙️',
  Medical: '🩺',
  'Arts & Science': '🎨',
  Law: '⚖️',
  Commerce: '📊',
  Management: '📈',
  'IT & Computer': '💻',
  Agriculture: '🌾',
  Architecture: '🏛️',
  Design: '🎯',
  'Hotel Management': '🏨',
  ITI: '🔧',
  Polytechnic: '🛠️',
  'Media & Journalism': '📰',
  Others: '🗂️',
}

export default function StreamSelectorPage() {
  const navigate = useNavigate()
  const [streams, setStreams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    seatMatrixService
      .getStreamsSummary()
      .then((res) => setStreams(res.data || []))
      .catch((err) => {
        console.error('Failed to load stream summary:', err)
        setError('Failed to load streams. Check your connection and try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  const open = (stream) => navigate(`/admin/courses-colleges/${streamSlug(stream)}`)

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      {loading ? (
        <Card><SLoader /></Card>
      ) : error ? (
        <Card>
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>{error}</div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {streams.map((s) => {
            const enabled = s.courseCount > 0
            return (
              <button
                key={s.stream}
                onClick={() => enabled && open(s.stream)}
                disabled={!enabled}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  background: 'var(--surface)', border: `1.5px solid ${enabled ? 'var(--border)' : '#e2e8f0'}`,
                  borderRadius: 20, padding: '26px 18px', cursor: enabled ? 'pointer' : 'not-allowed',
                  opacity: enabled ? 1 : 0.55, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontFamily: 'Outfit, sans-serif', color: 'var(--text)',
                  boxShadow: enabled ? 'none' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (enabled) {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 34, lineHeight: 1 }}>{STREAM_ICONS[s.stream] || '📁'}</div>
                <div style={{ fontWeight: 800, fontSize: 16, textAlign: 'center' }}>{s.stream}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: enabled ? 'var(--primary)' : 'var(--text3)' }}>
                  {s.courseCount} course{s.courseCount !== 1 ? 's' : ''} · {s.collegeCount} college{s.collegeCount !== 1 ? 's' : ''}
                </div>
                {!enabled && (
                  <div style={{
                    marginTop: 2, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.4px',
                    textTransform: 'uppercase', color: 'var(--text3)',
                  }}>
                    No data imported yet
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}