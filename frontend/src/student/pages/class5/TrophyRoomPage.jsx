import React, { useState, useEffect } from 'react'
import SectionHeader, { SubSection } from '../../components/class5/redesign/SectionHeader'
import StreakWidget from '../../components/class5/redesign/StreakWidget'
import BadgeShelf from '../../components/class5/redesign/BadgeShelf'
import { getStreak, getBadges, getCertificates, getCertificatePdfUrl } from '../../services/class5DiscoveryService'
import { SLoader, SAlert, SEmpty } from '../../components/ui'

export default function TrophyRoomPage() {
  const [streak, setStreak] = useState(null)
  const [badges, setBadges] = useState(null)
  const [certs, setCerts] = useState(null)

  useEffect(() => {
    let mounted = true
    getStreak().then((s) => mounted && setStreak(s))
    getBadges().then((b) => mounted && setBadges(b))
    getCertificates().then((c) => mounted && setCerts(c))
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <SectionHeader
        eyebrow="🏆 Trophy Room"
        title="Your growth, celebrated"
        subtitle="Your keepsakes: streaks, badges and certificates. Every one is yours — earned by effort, never by beating someone else."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
        <StreakWidget streak={streak} />
        <div
          style={{
            background: '#fff',
            borderRadius: 32,
            border: '1px solid #eaf0f6',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ width: 46, height: 46, borderRadius: 16, background: 'linear-gradient(135deg,#fff0f6,#ffe4ef)', display: 'grid', placeItems: 'center', fontSize: 24 }} aria-hidden="true">
              📜
            </span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#1e293b' }}>Certificates</div>
              <div style={{ fontSize: 12.5, color: '#8ea0b4', fontWeight: 600 }}>
                {certs?.length ? `${certs.length} earned` : 'Finish quests to earn poster PDFs'}
              </div>
            </div>
          </div>
          {certs && certs.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {certs.map((c, i) => (
                <a
                  key={i}
                  href={c.downloadUrl || getCertificatePdfUrl(c.id)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f8fafc',
                    border: '1px solid #eef3f8',
                    borderRadius: 14,
                    padding: '12px 14px',
                    textDecoration: 'none',
                  }}
                >
                  <span>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: '#1e293b' }}>{c.title}</span>
                    <span style={{ fontSize: 12, color: '#8ea0b4' }}>{c.issuedLabel || 'Career discovery'}</span>
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#0f4c75' }}>Download PDF ↓</span>
                </a>
              ))}
            </div>
          ) : (
            <SEmpty icon="🖨️" title="No certificates yet" desc="Your Future Map and badge certificates will appear here as downloadable PDFs." />
          )}
        </div>
      </div>

      <SubSection title="Badges I've earned" subtitle="Explore more quests to unlock the sealed ones.">
      </SubSection>
      {badges ? <BadgeShelf shelf={badges} /> : <SLoader />}

      <div style={{ marginTop: 22 }}>
        <SAlert type="info">
          💡 Progress here is about your personal growth — streaks, effort and new skills. No one is ranked or compared.
        </SAlert>
      </div>
    </div>
  )
}