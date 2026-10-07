import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SCard, SLoader, SEmpty, SBadge, SBtn } from '../../../components/UI'
import { slugify } from '../../../../utils/slugify'
import { graduateExamService } from '../../../../services/graduateExamService'
import GraduateOrgModal from './GraduateOrgModal'

/**
 * GraduateStatesPage — "State Government" tab. States are derived from the
 * database (organizations with governmentType State) — nothing is hardcoded,
 * so a newly added state organization surfaces here automatically.
 */
export default function GraduateStatesPage() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orgModal, setOrgModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await graduateExamService.getOrganizations({ governmentType: 'State', includeInactive: 1 })
      setOrgs(res.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load organizations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const stateMap = new Map()
  orgs.forEach((o) => {
    if (!o.state) return
    const key = slugify(o.state)
    if (!stateMap.has(key)) {
      stateMap.set(key, { name: o.state, slug: key, orgs: [] })
    }
    stateMap.get(key).orgs.push(o)
  })
  const states = [...stateMap.values()].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)' }}>
        <Link to="/admin/graduate-exams" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Graduate Exams</Link>
        {' '}→ State Government
      </span>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '12px 0 6px', flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'Nunito', fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: 0 }}>
          State Government
        </h2>
        <SBtn variant="outline" onClick={() => setOrgModal(true)}>＋ Add Organization</SBtn>
      </div>
      <p style={{ margin: '0 0 22px', color: 'var(--text3)', fontSize: 14, fontWeight: 600 }}>
        Select a state to manage its recruitment organizations and examinations.
      </p>

      {error && <div style={{ marginBottom: 16, color: '#b91c1c' }}>{error}</div>}
      {loading && <SLoader />}

      {!loading && !error && (
        states.length === 0 ? (
          <SEmpty icon="🗺️" title="No states yet" desc="Add a State organization (e.g. Tamil Nadu → TNPSC) and it will appear here." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {states.map((s) => (
              <SCard key={s.slug} hover style={{ cursor: 'pointer' }} >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 26 }}>🗺️</span>
                  <SBadge color="blue">{s.orgs.length} {s.orgs.length === 1 ? 'Organization' : 'Organizations'}</SBadge>
                </div>
                <h3 style={{ margin: '0 0 4px', fontFamily: 'Nunito', fontSize: 19, fontWeight: 900, color: 'var(--text)' }}>{s.name}</h3>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.55 }}>
                  {s.orgs.map((o) => o.name).join(', ')}
                </p>
                <button
                  onClick={() => navigate(`/admin/graduate-exams/state/${s.slug}`)}
                  style={{
                    background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 0', width: '100%', fontFamily: 'Outfit', fontWeight: 800, fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Open {s.name} →
                </button>
              </SCard>
            ))}
          </div>
        )
      )}

      {orgModal && (
        <GraduateOrgModal
          open
          onClose={() => setOrgModal(false)}
          onSaved={() => { fetchData() }}
        />
      )}
    </div>
  )
}