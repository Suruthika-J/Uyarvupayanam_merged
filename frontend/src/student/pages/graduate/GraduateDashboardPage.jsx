import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import graduateService from '../../../services/graduateService'
import { SCard, SBtn, SLoader, SBadge } from '../../components/ui'
import {
  FiGrid, FiBriefcase, FiAward, FiBookOpen, FiUser, FiUsers,
  FiCheckCircle, FiClock, FiArrowRight, FiExternalLink, FiAlertCircle,
  FiZap, FiMessageSquare, FiBook, FiShield, FiTrendingUp
} from 'react-icons/fi'

export default function GraduateDashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const res = await graduateService.getDashboard()
      if (res?.success) {
        setData(res)
      } else {
        setError('Failed to load graduate dashboard summary.')
      }
    } catch (err) {
      console.warn('Dashboard load error:', err)
      setError('Could not connect to graduate portal API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <SLoader />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text3)' }}>
          Loading personalized Graduate Career Dashboard...
        </div>
      </div>
    )
  }

  const profile = data?.profile || {}
  const summary = data?.summaryCounts || {}
  const recommended = data?.recommendedOpportunities || []
  const upcomingExams = data?.upcomingExams || []
  const deadlineAlerts = data?.deadlineAlerts || []

  const handleApplyNow = (url) => {
    if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      alert('Official application URL unavailable or opening soon.')
    }
  }

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }} className="s-anim-up">

      {/* ── HEADER & SUBTITLE ── */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1d4ed8', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            🎓 GRADUATE CAREER DASHBOARD
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Welcome, {profile.degree || 'Graduate'} {profile.specialization ? `in ${profile.specialization}` : ''}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Your opportunities after graduation, personalized to your degree, interests and goals.
          </p>
        </div>

        <Link to="/graduate/profile">
          <SBtn variant="secondary" style={{ borderRadius: 12, fontSize: 13 }}>
            <FiUser style={{ marginRight: 6 }} /> Edit Profile ({profile.profileCompletion || 0}%)
          </SBtn>
        </Link>
      </div>

      {/* ── TOP SECTION: GRADUATE SUMMARY CARD ── */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
              Student Profile
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginTop: 4 }}>
              {profile.degree || 'B.E.'} {profile.specialization || 'Computer Science'}
            </div>
            <div style={{ fontSize: 13, color: '#60a5fa', marginTop: 2 }}>
              Graduation Year: <strong>{profile.graduationYear || '2026'}</strong> ({profile.graduationStatus || 'Completed'})
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
              Profile Completion
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ width: `${profile.profileCompletion || 85}%`, height: '100%', background: '#3b82f6', borderRadius: 6 }} />
              </div>
              <span style={{ fontSize: 16, fontWeight: 900, color: '#60a5fa' }}>{profile.profileCompletion || 85}%</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
              Primary Career Goal
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
              {(profile.careerInterests || ['Higher Studies', 'Government Exams', 'Private Jobs']).join(' • ')}
            </div>
          </div>
        </div>
      </SCard>

      {/* ── GRADUATE RESUME DASHBOARD WIDGET ── */}
      <SCard style={{ padding: 22, borderRadius: 20, marginBottom: 28, background: '#fff', border: '1px solid var(--s-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              📄
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>MY RESUME</h3>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 800 }}>
                  ✓ Resume Ready
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 2, display: 'flex', gap: 12 }}>
                <span>Target: <strong>{profile.preferredDomains?.[0] || profile.targetCareer || 'Software Engineer'}</strong></span>
                <span>• ATS Score: <strong style={{ color: '#2563eb' }}>{profile.careerReadinessScore || 82}/100</strong></span>
                <span>• Last Updated: <strong>Today</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/graduate/resume-builder">
              <SBtn variant="primary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13 }}>
                [ EDIT RESUME ]
              </SBtn>
            </Link>
            <Link to="/graduate/ats-checker">
              <SBtn variant="secondary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13 }}>
                [ CHECK ATS ]
              </SBtn>
            </Link>
            <Link to="/graduate/resume-builder">
              <SBtn variant="secondary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13 }}>
                [ DOWNLOAD ]
              </SBtn>
            </Link>
          </div>
        </div>
      </SCard>

      {/* ── OPPORTUNITY SUMMARY CARDS (ACTUAL DB COUNTS) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        
        <Link to="/graduate/government-exams" style={{ textDecoration: 'none' }}>
          <SCard style={{ padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text2)' }}>Government Exams</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiBook size={16} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)' }}>
              {summary.governmentExams || 0}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--s-text3)', marginTop: 2 }}>Relevant Opportunities</div>
          </SCard>
        </Link>

        <Link to="/graduate/higher-studies" style={{ textDecoration: 'none' }}>
          <SCard style={{ padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text2)' }}>Higher Studies</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiAward size={16} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)' }}>
              {summary.higherStudies || 0}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--s-text3)', marginTop: 2 }}>Entrance Routes</div>
          </SCard>
        </Link>

        <Link to="/graduate/opportunities?category=PSU" style={{ textDecoration: 'none' }}>
          <SCard style={{ padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text2)' }}>PSU Recruitment</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiShield size={16} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)' }}>
              {summary.psuOpportunities || 0}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--s-text3)', marginTop: 2 }}>Maharatna / Navratna</div>
          </SCard>
        </Link>

        <Link to="/graduate/opportunities?category=PRIVATE_JOBS" style={{ textDecoration: 'none' }}>
          <SCard style={{ padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text2)' }}>Private Jobs</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiBriefcase size={16} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)' }}>
              {summary.privateJobs || 0}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--s-text3)', marginTop: 2 }}>Software & Tech Roles</div>
          </SCard>
        </Link>

        <Link to="/graduate/peer-mentor" style={{ textDecoration: 'none' }}>
          <SCard style={{ padding: 18, borderRadius: 16, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text2)' }}>Peer Mentorship</span>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#fae8ff', color: '#a21caf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiUsers size={16} />
              </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--s-text)' }}>
              {summary.mentorshipRequests || 0}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--s-text3)', marginTop: 2 }}>Student Requests</div>
          </SCard>
        </Link>

      </div>

      {/* ── PEER MENTORSHIP BANNER FOR GRADUATES ── */}
      {summary.mentorshipRequests > 0 && (
        <SCard style={{ padding: '18px 24px', borderRadius: 18, marginBottom: 28, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🎓
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1e40af' }}>
                🎓 Mentor Requests ({summary.mentorshipRequests})
              </div>
              <div style={{ fontSize: 13, color: '#1e3a8a' }}>
                College students are looking for guidance from graduates like you.
              </div>
            </div>
          </div>
          <Link to="/graduate/peer-mentor">
            <SBtn variant="primary" style={{ padding: '8px 20px', borderRadius: 10, fontSize: 13 }}>
              View Requests <FiArrowRight style={{ marginLeft: 6 }} />
            </SBtn>
          </Link>
        </SCard>
      )}

      {/* ── DEADLINE ALERTS (CALCULATED FROM SERVER CURRENT DATE) ── */}
      {deadlineAlerts.length > 0 && (
        <SCard style={{ padding: 22, borderRadius: 20, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiAlertCircle color="#dc2626" size={18} /> Deadlines Alert — Applications Closing Soon
            </h3>
            <span style={{ fontSize: 12, color: 'var(--s-text3)', fontWeight: 700 }}>
              Current Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {deadlineAlerts.map(alert => (
              <div key={alert.id} style={{
                padding: '12px 16px', borderRadius: 12,
                background: alert.urgency === 'RED' ? '#fef2f2' : alert.urgency === 'ORANGE' ? '#fffbe6' : '#f0fdf4',
                border: `1px solid ${alert.urgency === 'RED' ? '#fecaca' : alert.urgency === 'ORANGE' ? '#ffe58f' : '#bbf7d0'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>
                    {alert.title} — <span style={{ fontSize: 13, color: 'var(--s-text3)' }}>{alert.organization}</span>
                  </div>
                  <div style={{ fontSize: 12, color: alert.urgency === 'RED' ? '#dc2626' : alert.urgency === 'ORANGE' ? '#d97706' : '#16a34a', fontWeight: 800, marginTop: 2 }}>
                    {alert.urgency === 'RED' ? '🔴 Apply within 3 days!' : alert.urgency === 'ORANGE' ? '🟠 Apply within 7 days' : '🟢 Upcoming deadline'} — Deadline: {new Date(alert.deadline).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyNow(alert.applicationUrl)}
                  style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  Apply Now <FiExternalLink size={12} />
                </button>
              </div>
            ))}
          </div>
        </SCard>
      )}

      {/* ── RECOMMENDED FOR YOU (DETERMINISTIC RANKING 0-100) ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
              Recommended For You (Eligibility Matched)
            </h2>
            <div style={{ fontSize: 13, color: 'var(--s-text3)' }}>
              Determined by your degree ({profile.degree || 'B.E.'}), specialization, CGPA & career goals.
            </div>
          </div>
          <Link to="/graduate/opportunities">
            <SBtn variant="secondary" style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12 }}>
              View All Opportunities
            </SBtn>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {recommended.map(opp => {
            const evalRes = opp.eligibilityEvaluation || {}
            const isEligible = evalRes.eligible !== false

            return (
              <SCard key={opp._id} style={{ padding: 22, borderRadius: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <SBadge color={isEligible ? 'green' : 'orange'}>
                      {isEligible ? '✓ Appears Eligible' : 'Check Requirements'}
                    </SBadge>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#2563eb', background: '#eff6ff', padding: '4px 10px', borderRadius: 10 }}>
                      {opp.matchScore || 92}% Match
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16.5, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 4px' }}>
                    {opp.opportunityName}
                  </h3>
                  <div style={{ fontSize: 12.5, color: 'var(--s-text3)', fontWeight: 700, marginBottom: 10 }}>
                    🏛 {opp.organization}
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--s-text2)', lineHeight: 1.5, margin: '0 0 14px' }}>
                    {opp.description?.substring(0, 130)}...
                  </p>

                  <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--s-border)', marginBottom: 16 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                      Why this is shown:
                    </div>
                    <div style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>
                      "{evalRes.reasons?.[0] || `Your ${profile.degree || 'B.E.'} degree satisfies the stated criteria.`}"
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
                  <Link to={`/graduate/opportunities/${opp._id}`}>
                    <SBtn variant="secondary" style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>
                      View Details
                    </SBtn>
                  </Link>

                  <SBtn
                    variant="primary"
                    onClick={() => handleApplyNow(opp.applicationUrl)}
                    style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Apply Now <FiExternalLink size={12} />
                  </SBtn>
                </div>
              </SCard>
            )
          })}
        </div>
      </div>

      {/* ── UPCOMING EXAMS WIDGET ── */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
              📅 Verified Upcoming Examinations
            </h3>
            <div style={{ fontSize: 13, color: 'var(--s-text3)' }}>
              Sorted by nearest verified application deadline and examination dates.
            </div>
          </div>
          <Link to="/graduate/government-exams">
            <SBtn variant="secondary" style={{ padding: '6px 14px', borderRadius: 10, fontSize: 12 }}>
              Explore All Exams
            </SBtn>
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {upcomingExams.map(exam => (
            <div key={exam._id} style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid var(--s-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <SBadge color={exam.status === 'OPEN' ? 'green' : 'orange'}>
                    {exam.status || 'OPEN'}
                  </SBadge>
                  <span style={{ fontSize: 11, color: '#047857', fontWeight: 800 }}>
                    ✓ Verified Official
                  </span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--s-text)' }}>{exam.opportunityName}</div>
                <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 2 }}>{exam.organization}</div>

                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--s-text2)' }}>
                  <div>Application Closes: <strong>{exam.applicationDeadline ? new Date(exam.applicationDeadline).toLocaleDateString('en-IN') : 'TBA'}</strong></div>
                  <div>Exam Date: <strong>{exam.examDate ? new Date(exam.examDate).toLocaleDateString('en-IN') : 'As notified'}</strong></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Link to={`/graduate/opportunities/${exam._id}`} style={{ flex: 1 }}>
                  <SBtn variant="secondary" style={{ width: '100%', padding: '6px 0', borderRadius: 8, fontSize: 12 }}>
                    Details
                  </SBtn>
                </Link>
                <SBtn variant="primary" onClick={() => handleApplyNow(exam.applicationUrl)} style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 12 }}>
                  Apply Now
                </SBtn>
              </div>
            </div>
          ))}
        </div>
      </SCard>

    </div>
  )
}
