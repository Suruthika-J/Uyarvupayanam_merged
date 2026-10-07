import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SCard, SLoader, SEmpty, SBadge, SBtn } from '../../../components/UI'
import { graduateExamService } from '../../../../services/graduateExamService'
import GraduateOrgModal from './GraduateOrgModal'

/**
 * GraduateCentralPage — Central Government tab: organizations (UPSC, SSC,
 * IBPS/SBI, Railways, other central bodies) each linking to their exam table.
 */
export default function GraduateCentralPage() {
  const navigate = useNavigate()
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orgModal, setOrgModal] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await graduateExamService.getOrganizations({ governmentType: 'Central', includeInactive: 1 })
      setOrgs(res.data || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load organizations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  return (
    <div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text3)' }}>
        <Link to="/admin/graduate-exams" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Graduate Exams</Link>
        {' '}→ Central Government
      </span>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, margin: '12px 0 6px', flexWrap: 'wrap' }}>
        <h2 style={{ fontFamily: 'Nunito', fontSize: 22, fontWeight: 900, color: 'var(--text)', margin: 0 }}>
          Central Government
        </h2>
        <SBtn variant="outline" onClick={() => setOrgModal(true)}>＋ Add Organization</SBtn>
      </div>
      <p style={{ margin: '0 0 22px', color: 'var(--text3)', fontSize: 14, fontWeight: 600 }}>
        Union-level recruitment organizations — open one to manage its examinations.
      </p>

      {error && <div style={{ marginBottom: 16, color: '#b91c1c' }}>{error}</div>}
      {loading && <SLoader />}

      {!loading && !error && (
        orgs.length === 0 ? (
          <SEmpty icon="🏢" title="No central organizations yet" desc="Add a Central organization (e.g. UPSC) and it will appear here." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {orgs.map((org) => (
              <SCard key={org._id} hover style={{ cursor: 'pointer' }} >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 26 }}>🏢</span>
                  <SBadge color={org.isActive ? 'green' : 'gray'}>{org.isActive ? 'Active' : 'Archived'}</SBadge>
                </div>
                <h3 style={{ margin: '0 0 8px', fontFamily: 'Nunito', fontSize: 18, fontWeight: 900, color: 'var(--text)', lineHeight: 1.3 }}>
                  {org.name}
                </h3>
                {org.description && (
                  <p style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text2)' }}>{org.description}</p>
                )}
                {org.officialWebsite && (
                  <p style={{ margin: '0 0 16px', fontSize: 13 }}>
                    <a href={org.officialWebsite} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      Official website ↗
                    </a>
                  </p>
                )}
                <button
                  onClick={() => navigate(`/admin/graduate-exams/organization/${org._id}`)}
                  style={{
                    background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 0', width: '100%', fontFamily: 'Outfit', fontWeight: 800, fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Manage Examinations →
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
          org={{ governmentType: 'Central', state: '' }}
        />
      )}
    </div>
  )
}