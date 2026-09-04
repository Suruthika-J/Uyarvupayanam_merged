import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import axios from 'axios'
import { SBtn, SCard, SBadge, SLoader } from '../../components/ui'
import {
  FiCompass, FiAward, FiFileText, FiBell,
  FiArrowRight, FiCheckCircle, FiTarget, FiZap, FiBookmark,
  FiTrendingUp, FiSliders, FiUser, FiCalendar, FiClock,
  FiBookOpen, FiUsers, FiHelpCircle, FiActivity, FiCheckSquare,
  FiAlertCircle
} from 'react-icons/fi'

export default function CollegeDashboardPage() {
  const { student } = useStudentAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchDashboardSummary = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('studentToken')
        if (token) {
          const res = await axios.get('http://localhost:5000/api/study-tools/dashboard-summary', {
            headers: { Authorization: `Bearer ${token}` }
          })
          if (res.data?.success) {
            setData(res.data)
          }
        }
      } catch (err) {
        console.warn('Failed to load dashboard summary:', err)
      } font-weight: 800; finally {
        setLoading(false)
      }
    }
    fetchDashboardSummary()
  }, [])

  if (loading) {
    return (
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SLoader />
      </div>
    )
  }

  const header = data?.header || {}
  const todaySec = data?.todaySection || {}
  const careerSec = data?.careerSection || {}
  const roadmapSec = data?.roadmapSection || {}
  const scholarshipSec = data?.scholarshipSection || {}
  const skillSec = data?.skillSection || {}
  const perfSec = data?.performanceSection || {}
  const commSec = data?.communitySection || {}

  const firstName = header.studentName?.split(' ')[0] || student?.name?.split(' ')[0] || 'Student'

  return (
    <div className="s-anim-up" style={{ paddingBottom: 40 }}>

      {/* ── DASHBOARD HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
        color: '#fff', padding: '32px 36px', borderRadius: 24,
        boxShadow: '0 10px 30px rgba(4, 120, 87, 0.2)', marginBottom: 28,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
          <FiCompass size={13} /> College Student Command Center
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 8px', fontFamily: 'var(--s-font-display)', color: '#fff' }}>
          {header.greeting || 'Good Morning'}, {firstName}! 👋
        </h1>
        <p style={{ fontSize: 14, color: '#a7f3d0', fontWeight: 700, margin: '0 0 20px' }}>
          Real-time Command Center for Academic Excellence & Career Readiness
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 14, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>Profile Completion</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiCheckCircle size={14} /> {header.profileCompletion}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>CGPA</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 2 }}>
              {header.cgpa || 'Not available yet'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>Career Readiness</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#34d399', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiTarget size={14} /> {header.careerReadiness ? `${header.careerReadiness}%` : 'Not available yet'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>Roadmap Progress</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginTop: 2 }}>
              {header.roadmapProgress}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 800 }}>Current Streak</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#fef08a', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <FiZap size={14} /> {header.currentStreak} Days 🔥
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN 2-COLUMN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28 }} className="s-grid-2col">

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* SECTION 1 — TODAY */}
          <SCard style={{ padding: 28, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiCalendar color="var(--s-primary)" size={18} /> Section 1 — Today's Overview
              </div>
              <SBtn variant="secondary" onClick={() => navigate('/college/academic/planner')} style={{ fontSize: 12, padding: '4px 12px' }}>
                Open Planner →
              </SBtn>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="s-grid-2col">
              {/* Today's Study Plan */}
              <div style={{ background: 'var(--s-surface2)', padding: 16, borderRadius: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#047857', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiClock size={13} /> Today's Study Routine
                </div>
                {todaySec.todayStudyPlan?.length > 0 ? (
                  todaySec.todayStudyPlan.map((task, i) => (
                    <div key={i} style={{ padding: '8px 10px', background: 'var(--s-card-bg)', borderRadius: 10, marginBottom: 6, borderLeft: task.priority === 'HIGH' ? '3px solid #ef4444' : '3px solid #10b981' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--s-text3)' }}>{task.timeSlot}</div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)' }}>{task.subject}: {task.topic}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>No study tasks scheduled for today.</div>
                )}
              </div>

              {/* Upcoming Exams & Pending Assessments */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: '#fef3c7', padding: 14, borderRadius: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#b45309', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiAlertCircle size={13} /> Upcoming Exams
                  </div>
                  {todaySec.upcomingExams?.length > 0 ? (
                    todaySec.upcomingExams.map((exam, i) => (
                      <div key={i} style={{ fontSize: 12, fontWeight: 700, color: '#78350f', marginTop: 2 }}>• {exam}</div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: '#78350f' }}>Not available yet</div>
                  )}
                </div>

                <div style={{ background: '#ede9fe', padding: 14, borderRadius: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#6d28d9', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiCheckSquare size={13} /> Pending Assessments
                  </div>
                  {todaySec.pendingAssessments?.length > 0 ? (
                    todaySec.pendingAssessments.map((ass, i) => (
                      <div key={i} style={{ fontSize: 12, fontWeight: 700, color: '#4c1d95', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                        <span>• {ass.title}</span>
                        <span style={{ fontSize: 10, opacity: 0.8 }}>{ass.estimatedTime}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: 12, color: '#4c1d95' }}>Not available yet</div>
                  )}
                </div>
              </div>
            </div>
          </SCard>

          {/* SECTION 2 — CAREER */}
          <SCard style={{ padding: 28, borderRadius: 20, borderLeft: '5px solid #047857' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiTarget color="#047857" size={18} /> Section 2 — Career Recommendation & Goal
              </div>
              <SBadge color="green">{careerSec.careerReadiness}% Career Readiness</SBadge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="s-grid-2col">
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-text3)' }}>Top Career Match</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', marginTop: 2 }}>
                  {careerSec.topCareerMatch?.title || 'Data Scientist / Software Engineer'}
                </div>
                <p style={{ fontSize: 13, color: 'var(--s-text3)', marginTop: 4, lineHeight: 1.4 }}>
                  {careerSec.topCareerMatch?.explanation || 'High alignment with your degree programme and technical skills.'}
                </p>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-text3)' }}>Target Career Goal</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#047857', marginTop: 2 }}>
                    🎯 {careerSec.targetCareer || 'Software Engineer'}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#b45309', marginBottom: 6 }}>
                  Top Skill Gaps Needed for Target Role
                </div>
                {careerSec.topSkillGaps?.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {careerSec.topSkillGaps.map((sg, idx) => (
                      <span key={idx} style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 8, fontWeight: 700 }}>
                        △ {sg}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>Not available yet</div>
                )}

                <div style={{ marginTop: 20 }}>
                  <SBtn variant="primary" onClick={() => navigate('/college/career/skill-gap')} style={{ width: '100%', justifyContent: 'center', borderRadius: 12, fontSize: 13 }}>
                    View Career Analysis →
                  </SBtn>
                </div>
              </div>
            </div>
          </SCard>

          {/* SECTION 3 — LEARNING ROADMAP */}
          <SCard style={{ padding: 28, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiTrendingUp color="#7c3aed" size={18} /> Section 3 — Learning Roadmap
              </div>
              <SBadge color="purple">{roadmapSec.progressPercentage}% Completed</SBadge>
            </div>

            <div style={{ background: 'var(--s-surface2)', padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>{roadmapSec.currentRoadmap}</div>
              <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 4 }}>
                Current Milestone: <strong style={{ color: '#7c3aed' }}>{roadmapSec.currentMilestone}</strong>
              </div>

              <div style={{ background: '#e2e8f0', height: 8, borderRadius: 99, overflow: 'hidden', margin: '12px 0' }}>
                <div style={{ width: `${roadmapSec.progressPercentage}%`, height: '100%', background: '#7c3aed', transition: 'width 0.5s ease' }} />
              </div>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: 6 }}>
                💡 Next Action: {roadmapSec.nextRecommendedAction}
              </div>
            </div>

            <div style={{ marginTop: 14, textAlign: 'right' }}>
              <Link to="/college/academic/roadmap" style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-primary)', textDecoration: 'none' }}>
                Full Roadmap Details →
              </Link>
            </div>
          </SCard>

          {/* SECTION 4 — SCHOLARSHIPS */}
          <SCard style={{ padding: 28, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--s-text)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiBookmark color="#0284c7" size={18} /> Section 4 — Scholarships Center
              </div>
              <SBadge color="blue">{scholarshipSec.savedScholarshipsCount} Saved</SBadge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="s-grid-2col">
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#0369a1', marginBottom: 8 }}>
                  Recommended Scholarships
                </div>
                {scholarshipSec.recommendedScholarships?.length > 0 ? (
                  scholarshipSec.recommendedScholarships.map(s => (
                    <div key={s.id} style={{ padding: 10, background: 'var(--s-surface2)', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)' }}>{s.scholarshipName}</div>
                      <div style={{ fontSize: 11, color: 'var(--s-text3)' }}>{s.provider} • {s.benefit}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>Not available yet</div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', color: '#b45309', marginBottom: 8 }}>
                  Deadlines Soon
                </div>
                {scholarshipSec.deadlineSoon?.length > 0 ? (
                  scholarshipSec.deadlineSoon.map((ds, i) => (
                    <div key={i} style={{ padding: 10, background: '#fef3c7', borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#78350f' }}>{ds.name}</div>
                      <div style={{ fontSize: 11, color: '#b45309' }}>Deadline: {ds.deadline}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--s-text3)' }}>Not available yet</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 14, textAlign: 'right' }}>
              <Link to="/college/scholarships" style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-primary)', textDecoration: 'none' }}>
                Browse All Scholarships →
              </Link>
            </div>
          </SCard>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* SECTION 5 — SKILLS */}
          <SCard style={{ padding: 24, borderRadius: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiZap color="#f59e0b" size={16} /> Section 5 — Skills Overview
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#047857' }}>Strong Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {skillSec.strongSkills?.map((s, i) => (
                  <span key={i} style={{ fontSize: 11, background: '#d1fae5', color: '#047857', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>✓ {s}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#1d4ed8' }}>Skills Improving</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {skillSec.skillsImproving?.map((s, i) => (
                  <span key={i} style={{ fontSize: 11, background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>⚡ {s}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#b45309' }}>Skills Needing Attention</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {skillSec.skillsNeedingAttention?.map((s, i) => (
                  <span key={i} style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 8, fontWeight: 700 }}>△ {s}</span>
                ))}
              </div>
            </div>
          </SCard>

          {/* SECTION 6 — PERFORMANCE */}
          <SCard style={{ padding: 24, borderRadius: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiActivity color="#10b981" size={16} /> Section 6 — Performance Analytics
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--s-surface2)', borderRadius: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>Assessment Avg</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#047857' }}>{perfSec.avgAssessmentScore || 80}%</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--s-surface2)', borderRadius: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>Study Consistency</span>
              <span style={{ fontSize: 13, fontWeight: 900, color: '#7c3aed' }}>{perfSec.studyConsistency || 85}%</span>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--s-text3)', marginTop: 8, marginBottom: 4 }}>CGPA Semester Trend</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {perfSec.cgpaTrend?.map((t, idx) => (
                <div key={idx} style={{ flex: 1, background: 'var(--s-surface2)', padding: '6px 8px', borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--s-text3)' }}>{t.semester}</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)' }}>{t.gpa}</div>
                </div>
              ))}
            </div>
          </SCard>

          {/* SECTION 7 — COMMUNITY */}
          <SCard style={{ padding: 24, borderRadius: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiUsers color="#6d28d9" size={16} /> Section 7 — Community & Support
            </div>

            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text)', marginBottom: 6 }}>Active Mentor Requests</div>
            {commSec.mentorRequests?.length > 0 ? (
              commSec.mentorRequests.map((r, i) => (
                <div key={i} style={{ padding: 8, background: 'var(--s-surface2)', borderRadius: 10, marginBottom: 6, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{r.mentorName} ({r.topic})</span>
                  <SBadge color={r.status === 'Accepted' ? 'green' : 'orange'}>{r.status}</SBadge>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: 'var(--s-text3)', marginBottom: 10 }}>No active mentor requests</div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--s-border)' }}>
              <Link to="/college/community/doubts" style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)', textDecoration: 'none' }}>
                Ask AI Doubt →
              </Link>
              <Link to="/college/community/mentors" style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-primary)', textDecoration: 'none' }}>
                Find Mentor →
              </Link>
            </div>
          </SCard>

          {/* SECTION 8 — QUICK ACTIONS */}
          <SCard style={{ padding: 24, borderRadius: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiSliders color="var(--s-primary)" size={16} /> Section 8 — Quick Actions
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Ask AI', path: '/college/advisor/chat', bg: '#ede9fe', color: '#6d28d9', icon: FiCompass },
                { label: 'Study Planner', path: '/college/academic/planner', bg: '#f1f5f9', color: '#475569', icon: FiSliders },
                { label: 'Take Assessment', path: '/college/study-tools/practice', bg: '#fef3c7', color: '#b45309', icon: FiAward },
                { label: 'View Roadmap', path: '/college/academic/roadmap', bg: '#d1fae5', color: '#047857', icon: FiTarget },
                { label: 'Find Scholarships', path: '/college/scholarships', bg: '#e0f2fe', color: '#0369a1', icon: FiBookmark },
                { label: 'Skill Gap', path: '/college/career/skill-gap', bg: '#dbeafe', color: '#1e40af', icon: FiZap },
                { label: 'Resume Builder', path: '/college/career/resume', bg: '#fce4ec', color: '#c62828', icon: FiFileText },
                { label: 'Interview Practice', path: '/college/career/interview-prep', bg: '#f3e8ff', color: '#7e22ce', icon: FiTrendingUp }
              ].map(({ label, path, bg, color, icon: Icon }) => (
                <Link key={path} to={path} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: 10, background: 'var(--s-surface2)', borderRadius: 12, textAlign: 'center', cursor: 'pointer' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text)' }}>{label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </SCard>

        </div>
      </div>
    </div>
  )
}
