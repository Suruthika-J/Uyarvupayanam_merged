import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { classContentService } from '../../../services/classContentService'
import { SCard, SBtn, SBadge, SLoader, SEmpty } from '../../components/UI'

const CLASS_LEVELS = [
  { level: "5", title: "After 5th", desc: "Foundation, curiosity and basic skill discovery stage.", color: "#8b5cf6" },
  { level: "8", title: "After 8th", desc: "Core interest exploration and pathway awareness.", color: "#f59e0b" },
  { level: "10", title: "After 10th", desc: "Stream selection, diploma & vocational guidance.", color: "#10b981" },
  { level: "12", title: "After 12th", desc: "Degree choices, entrance exams & professional career launch.", color: "#3b82f6" },
]

export default function CareersPage() {
  const navigate = useNavigate()
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummaries()
  }, [])

  const fetchSummaries = async () => {
    try {
      setLoading(true)
      const res = await classContentService.getAdminSummaries()
      if (res.success) setSummaries(res.data)
    } finally {
      setLoading(false)
    }
  }

  const getStatsForLevel = (lvl) => {
    return summaries.find(s => s.level === lvl) || { total: 0, published: 0, draft: 0 }
  }

  return (
    <div className="admin-page">
      <div className="admin-header" style={{ marginBottom: 30 }}>
        <div>
          <h1>Career Path Management</h1>
          <p>Select a class level to manage its guidance dashboard and curriculum.</p>
        </div>
      </div>

      {loading ? <SLoader /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {CLASS_LEVELS.map(item => {
            const stats = getStatsForLevel(item.level)
            return (
              <SCard key={item.level} hover style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div style={{ 
                     width: 50, height: 50, borderRadius: 12, background: `${item.color}11`, 
                     color: item.color, display: 'grid', placeItems: 'center', fontSize: 24, fontWeight: 'bold' 
                   }}>
                      {item.level}
                   </div>
                   <SBadge color={stats.draft > 0 ? "gold" : "green"}>
                      {stats.total} total items
                   </SBadge>
                </div>

                <div>
                   <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800 }}>{item.title}</h3>
                   <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{item.desc}</p>
                </div>

                <div style={{ display: 'flex', gap: 12, padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                   <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{stats.published}</div>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Published</div>
                   </div>
                   <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: "var(--text-muted)" }}>{stats.draft}</div>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Drafts</div>
                   </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                   <SBtn fullWidth onClick={() => navigate(`/admin/career-paths/class${item.level}`)}>
                      Manage Class {item.level} Dashboard →
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
