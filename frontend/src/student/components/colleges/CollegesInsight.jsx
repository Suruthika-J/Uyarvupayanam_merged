import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiBookOpen, FiMapPin, FiArrowRight, FiRefreshCw, FiLayers
} from 'react-icons/fi'
import { SBtn, SEmpty } from '../ui'
import { collegesInsightService } from '../../../services/collegesInsightService'

/**
 * Class 12 "Colleges" tab — live insight summary cards.
 * Numbers come from GET /api/colleges-insight (computed over the admin's
 * College-Course Mapping data, not hardcoded). Clicking a card's arrow
 * drills into /student/class12/colleges/:category.
 */
export default function CollegesInsight() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await collegesInsightService.getSummary()
      if (res.success) setRows(res.data || [])
      else setError(true)
    } catch (err) {
      console.error('Error fetching colleges insight', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9',
              padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)' }} />
              <div>
                <div style={{ width: 180, height: 22, borderRadius: 8, background: '#f1f5f9', marginBottom: 10 }} />
                <div style={{ width: 240, height: 14, borderRadius: 8, background: '#f8fafc' }} />
              </div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f8fafc' }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
        <div style={{ fontSize: 40, marginBottom: 12, color: '#94a3b8' }}><FiLayers /></div>
        <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#334155' }}>Colleges insight is temporarily unavailable</p>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64748b' }}>Please try again in a moment.</p>
        <SBtn variant="outline" size="sm" onClick={load}><FiRefreshCw size={14} /> Retry</SBtn>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 32, border: '1px dashed #cbd5e1' }}>
        <SEmpty
          icon={<FiMapPin size={48} />}
          title="No colleges data yet"
          desc="Ask your admin to add courses and map them to colleges — the numbers will show up here automatically."
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {rows.map((row) => (
        <div
          key={row.category}
          onClick={() => navigate(`/student/class12/colleges/${row.category}`)}
          className="insight-header-hover hover-lift"
          style={{
            background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9',
            padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)', cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 24,
              boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
            }}>
              {(row.label || 'C').substring(0, 1).toUpperCase()}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>{row.label}</h3>
              <div style={{ display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiBookOpen size={16} color="#6366f1" /> {row.courseCount} Specialized Courses
                </span>
                <span style={{ fontSize: 14, color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiMapPin size={16} color="#f59e0b" /> {row.collegeCount} Recognized Colleges
                </span>
              </div>
            </div>
          </div>
          <div style={{ background: '#f8fafc', width: 48, height: 48, borderRadius: 12, display: 'grid', placeItems: 'center', color: '#64748b', flexShrink: 0 }}>
            <FiArrowRight size={22} />
          </div>
        </div>
      ))}
    </div>
  )
}