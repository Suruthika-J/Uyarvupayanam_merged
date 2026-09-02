import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { SCard, SBtn, SLoader } from '../../components/ui'
import { FiUser, FiStar, FiMessageSquare, FiCheckCircle } from 'react-icons/fi'

export default function PeerMentorshipPage() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [requested, setRequested] = useState({})

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('studentToken')
        const res = await axios.get('http://localhost:5000/api/study-tools/mentors', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.success && Array.isArray(res.data.mentors)) {
          setMentors(res.data.mentors)
        }
      } catch (err) {
        console.warn('Failed to fetch mentors')
      } finally {
        setLoading(false)
      }
    }
    fetchMentors()
  }, [])

  const handleConnect = (id) => {
    setRequested(prev => ({ ...prev, [id]: true }))
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiUser size={14} /> Peer & Senior Academic Support
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Peer Mentor Matching
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Connect with verified senior college mentors in your degree domain for study guidance and placement advice.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <SLoader label="Matching top peer mentors in your domain..." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {mentors.map((m) => {
            const isReq = requested[m.id]
            return (
              <SCard key={m.id} style={{ padding: 24, borderRadius: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ fontSize: 32 }}>{m.avatar}</div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>{m.name}</h3>
                    <div style={{ fontSize: 12, color: 'var(--s-primary)', fontWeight: 700 }}>{m.degree}</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: 'var(--s-text3)', marginBottom: 12 }}>
                  🏫 {m.college}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {m.expertise?.map((exp, idx) => (
                    <span key={idx} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: '#f1f5f9', color: 'var(--s-text2)', fontWeight: 700 }}>
                      • {exp}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#b45309' }}>
                    ⭐ {m.rating} Rating
                  </span>

                  <SBtn
                    variant={isReq ? 'secondary' : 'primary'}
                    onClick={() => handleConnect(m.id)}
                    disabled={isReq}
                    style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12 }}
                  >
                    {isReq ? '✓ Request Sent' : 'Connect with Mentor'}
                  </SBtn>
                </div>
              </SCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
