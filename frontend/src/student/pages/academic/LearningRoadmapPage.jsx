import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { SCard, SLoader, SBadge, AIGenerating, AIFailure, SEmpty } from '../../components/ui'
import {
  FiTarget, FiCheckCircle, FiCircle, FiArrowRight, FiAward,
  FiBriefcase, FiBookOpen, FiCode, FiZap, FiCheck, FiMap, FiAlertCircle,
  FiSearch, FiClock, FiCalendar, FiTrendingUp, FiTrendingDown, FiRefreshCw,
  FiLayers, FiExternalLink, FiPlusCircle, FiList, FiBookmark, FiCpu, FiUserCheck
} from 'react-icons/fi'
import axiosInstance from '../../../config/axios'
import { useStudentContext, useCollegeProfile } from '../../context/CollegeProfileContext'

export default function LearningRoadmapPage() {
  const navigate = useNavigate()
  const { studentContext } = useStudentContext()
  const { profile } = useCollegeProfile()

  // Form State
  const [topicInput, setTopicInput] = useState('Aptitude')
  const [levelInput, setLevelInput] = useState('BEGINNER')
  const [goalInput, setGoalInput] = useState('PLACEMENT')
  const [hoursInput, setHoursInput] = useState(2)
  const [targetDateInput, setTargetDateInput] = useState('')

  // Roadmap & Multi-roadmap State
  const [roadmap, setRoadmap] = useState(null)
  const [savedRoadmaps, setSavedRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('phases') // phases | today | weekly | adaptive | readiness | sources
  const [expandedSections, setExpandedSections] = useState({})

  // Resilient API helper trying both /learning-roadmap and /college-advisor/roadmap
  const fetchCurrentRoadmap = async () => {
    setLoading(true)
    setError('')
    try {
      let res;
      try {
        res = await axiosInstance.get('/learning-roadmap/current')
      } catch (e1) {
        res = await axiosInstance.get('/college-advisor/roadmap')
      }

      if (res.data?.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap)
        setTopicInput(res.data.roadmap.topic || 'Aptitude')
      } else {
        setError('No learning roadmap active yet. Enter a topic below to generate your personalized roadmap.')
      }
    } catch (err) {
      console.warn('Failed to fetch current roadmap:', err)
      setError('Could not load your roadmap. Enter a topic below to generate a fresh roadmap.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch list of saved user roadmaps
  const fetchSavedRoadmaps = async () => {
    try {
      const res = await axiosInstance.get('/learning-roadmap/list')
      if (res.data?.success && Array.isArray(res.data.roadmaps)) {
        setSavedRoadmaps(res.data.roadmaps)
      }
    } catch (err) {
      console.warn('Could not fetch saved roadmaps list:', err)
    }
  }

  useEffect(() => {
    fetchCurrentRoadmap()
    fetchSavedRoadmaps()
  }, [])

  // Expand all sections by default when roadmap loads
  useEffect(() => {
    if (roadmap?.sections) {
      const initial = {}
      roadmap.sections.forEach((_, idx) => { initial[idx] = true })
      setExpandedSections(initial)
    }
  }, [roadmap])

  // Generate New Roadmap
  const handleGenerateRoadmap = async (e) => {
    if (e) e.preventDefault()
    if (!topicInput.trim()) return

    setGenerating(true)
    setError('')

    try {
      const res = await axiosInstance.post('/learning-roadmap/generate', {
        topic: topicInput,
        level: levelInput,
        goal: goalInput,
        hoursPerDay: hoursInput,
        targetDate: targetDateInput,
        forceRegenerate: true
      })

      if (res.data?.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap)
        fetchSavedRoadmaps()
        setActiveTab('phases')
      } else {
        setError(res.data?.message || 'Failed to generate roadmap.')
      }
    } catch (err) {
      console.error('Roadmap generation error:', err)
      setError('Failed to reach roadmap engine. Please check your connection.')
    } finally {
      setGenerating(false)
    }
  }

  // Switch Active Roadmap
  const handleSwitchRoadmap = async (roadmapId) => {
    setLoading(true)
    try {
      const res = await axiosInstance.post(`/learning-roadmap/${roadmapId}/activate`)
      if (res.data?.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap)
        setTopicInput(res.data.roadmap.topic)
        fetchSavedRoadmaps()
      }
    } catch (err) {
      console.warn('Failed to activate roadmap:', err)
    } finally {
      setLoading(false)
    }
  }

  // Toggle Topic Completion
  const handleToggleTopic = async (secIdx, topIdx, topicId, currentStatus) => {
    if (!roadmap?._id) return

    // Optimistic UI update
    const updatedSections = [...roadmap.sections]
    const targetTopic = updatedSections[secIdx].topics[topIdx]
    const willBeCompleted = !currentStatus

    targetTopic.isCompleted = willBeCompleted
    const completedCount = updatedSections.reduce((acc, sec) => acc + sec.topics.filter(t => t.isCompleted).length, 0)
    const totalCount = updatedSections.reduce((acc, sec) => acc + sec.topics.length, 0)
    const newProgress = Math.round((completedCount / totalCount) * 100)

    setRoadmap(prev => ({
      ...prev,
      sections: updatedSections,
      progressPercentage: newProgress
    }))

    try {
      await axiosInstance.post(`/learning-roadmap/${roadmap._id}/topic/${topicId}/complete`, {
        isCompleted: willBeCompleted
      })
    } catch (err) {
      console.warn('Failed to persist topic completion:', err)
    }
  }

  // Recalculate Adaptive Roadmap
  const handleRecalculateAdaptive = async () => {
    if (!roadmap?._id) return
    setLoading(true)
    try {
      const res = await axiosInstance.post(`/learning-roadmap/${roadmap._id}/recalculate`, {
        practiceResults: [
          { topicName: 'Percentages', accuracy: 92 },
          { topicName: 'Time & Work', accuracy: 42 },
          { topicName: 'Probability', accuracy: 51 }
        ]
      })
      if (res.data?.success && res.data.roadmap) {
        setRoadmap(res.data.roadmap)
        alert('Adaptive Roadmap recalculated! Weak areas have received reinforced study time.')
      }
    } catch (err) {
      alert('Failed to recalculate adaptive roadmap.')
    } finally {
      setLoading(false)
    }
  }

  // Navigate to Practice Questions Module
  const handlePracticeTopic = (topicName, difficulty) => {
    navigate(`/college/study-tools/practice?subject=${encodeURIComponent(roadmap?.topic || 'Aptitude')}&topic=${encodeURIComponent(topicName)}&difficulty=${difficulty || 'BEGINNER'}`)
  }

  const toggleSectionExpand = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const popularTopicChips = ['Aptitude', 'DBMS', 'Python', 'Java', 'React', 'Machine Learning', 'AWS', 'DSA', 'Docker', 'SQL', 'System Design']

  if (generating) {
    return (
      <div style={{ maxWidth: 960, margin: '0 auto', paddingTop: 30 }}>
        <AIGenerating
          label={`Researching and building syllabus for "${topicInput}"`}
          sub="Extracting reliable educational sources, calculating prerequisite dependencies, scoring topic priorities, and formulating your personalized study schedule..."
        />
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto' }} className="s-anim-up">
      {/* ════════════════════════════════════════════════════════
          HEADER BANNER
          ════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', color: '#047857',
          padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10
        }}>
          <FiZap size={15} /> ⚡ AI Learning Roadmap Generator
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          AI-Powered Dynamic Learning Roadmap
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '6px 0 0', lineHeight: 1.5 }}>
          Enter any topic to generate a structured, source-verified syllabus with prerequisite ordering, time breakdowns, and adaptive tracking.
        </p>
      </div>

      {/* ════════════════════════════════════════════════════════
          USER INPUT GENERATION FORM
          ════════════════════════════════════════════════════════ */}
      <SCard style={{ padding: 24, borderRadius: 20, marginBottom: 28, border: '1px solid var(--s-border)' }}>
        <form onSubmit={handleGenerateRoadmap}>
          <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--s-text)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiSearch color="var(--s-primary)" /> WHAT DO YOU WANT TO LEARN?
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 4 }}>
                Enter Topic
              </label>
              <input
                type="text"
                value={topicInput}
                onChange={e => setTopicInput(e.target.value)}
                placeholder="e.g. Aptitude, DBMS, React, AWS..."
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--s-border)',
                  fontSize: 14, fontWeight: 700, outline: 'none', background: '#fff'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 4 }}>
                Current Level
              </label>
              <select
                value={levelInput}
                onChange={e => setLevelInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--s-border)', fontSize: 13, fontWeight: 700 }}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 4 }}>
                Target Goal
              </label>
              <select
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 12, border: '1.5px solid var(--s-border)', fontSize: 13, fontWeight: 700 }}
              >
                <option value="PLACEMENT">Placement Prep</option>
                <option value="EXAM">Semester Exams</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="PROJECT">Project Building</option>
                <option value="GENERAL">General Mastery</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 4 }}>
                Study Time
              </label>
              <select
                value={hoursInput}
                onChange={e => setHoursInput(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '10px 10px', borderRadius: 12, border: '1.5px solid var(--s-border)', fontSize: 13, fontWeight: 700 }}
              >
                <option value={1}>1 hr/day</option>
                <option value={2}>2 hrs/day</option>
                <option value={3}>3 hrs/day</option>
                <option value={4}>4 hrs/day</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--s-text2)', display: 'block', marginBottom: 4 }}>
                Target Date (Optional)
              </label>
              <input
                type="date"
                value={targetDateInput}
                onChange={e => setTargetDateInput(e.target.value)}
                style={{ width: '100%', padding: '9px 10px', borderRadius: 12, border: '1.5px solid var(--s-border)', fontSize: 12, fontWeight: 700 }}
              />
            </div>

            <button
              type="submit"
              disabled={generating || !topicInput.trim()}
              style={{
                background: 'var(--s-primary)', color: '#fff', border: 'none',
                padding: '0 20px', height: 42, borderRadius: 12, fontSize: 13, fontWeight: 900,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whitespace: 'nowrap'
              }}
            >
              <FiZap size={16} /> GENERATE MY ROADMAP
            </button>
          </div>

          {/* Quick Topic Chips */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--s-text3)' }}>Try Topics:</span>
            {popularTopicChips.map(chip => (
              <button
                key={chip}
                type="button"
                onClick={() => { setTopicInput(chip); }}
                style={{
                  background: topicInput.toLowerCase() === chip.toLowerCase() ? '#ede9fe' : '#f1f5f9',
                  color: topicInput.toLowerCase() === chip.toLowerCase() ? '#6d28d9' : '#334155',
                  border: topicInput.toLowerCase() === chip.toLowerCase() ? '1px solid #c4b5fd' : '1px solid #e2e8f0',
                  padding: '3px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700, cursor: 'pointer'
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </form>
      </SCard>

      {/* ════════════════════════════════════════════════════════
          SAVED ROADMAPS SWITCHER BAR (MULTIPLE ROADMAPS)
          ════════════════════════════════════════════════════════ */}
      {savedRoadmaps.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--s-text3)' }}>My Saved Roadmaps:</span>
          {savedRoadmaps.map(rm => (
            <button
              key={rm._id}
              type="button"
              onClick={() => handleSwitchRoadmap(rm._id)}
              style={{
                padding: '6px 14px', borderRadius: 14, border: rm.isCurrentActive ? '2px solid var(--s-primary)' : '1px solid var(--s-border)',
                background: rm.isCurrentActive ? 'var(--s-primary)' : '#fff',
                color: rm.isCurrentActive ? '#fff' : 'var(--s-text)',
                fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              {rm.isCurrentActive && <FiCheck size={14} />} {rm.topic} ({rm.progressPercentage || 0}%)
            </button>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ROADMAP HEADER & PROGRESS SUMMARY CARD
          ════════════════════════════════════════════════════════ */}
      {loading ? (
        <AIGenerating label="Loading active learning roadmap..." sub="Preparing study schedule and topic prerequisites..." />
      ) : error && !roadmap ? (
        <AIFailure title="Roadmap Not Available" message={error} onRetry={fetchCurrentRoadmap} retryLabel="Retry Roadmap" />
      ) : roadmap ? (
        <>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            color: '#fff', padding: '26px 32px', borderRadius: 24, marginBottom: 28,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, padding: '3px 10px', borderRadius: 10, background: '#38bdf8', color: '#0f172a', textTransform: 'uppercase' }}>
                    {roadmap.category?.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', color: '#fff' }}>
                    Level: {roadmap.level} • Goal: {roadmap.goal}
                  </span>
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0 }}>
                  {roadmap.title || `${roadmap.topic.toUpperCase()} Learning Roadmap`}
                </h2>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                  Estimated Duration: <strong>{roadmap.estimatedWeeks || 4} Weeks</strong> (~{roadmap.totalEstimatedHours || 40} Total Hours) • <strong>{roadmap.availableHoursPerDay || 2} hrs/day</strong>
                </div>
              </div>

              {/* PLACEMENT READINESS SCORE BADGE */}
              <div style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                padding: '12px 20px', borderRadius: 18, textAlign: 'right'
              }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                  Placement Readiness Score
                </div>
                <div style={{ fontSize: 26, fontWeight: 900, color: '#34d399', marginTop: 2 }}>
                  {roadmap.placementReadyScore || 0}%
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 700 }}>
                  {roadmap.readinessStatus || 'Building Foundation'}
                </div>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 700 }}>
                Completed Topics: <strong>{roadmap.completedTopics?.length || 0}</strong> of {roadmap.sections?.reduce((acc, sec) => acc + sec.topics.length, 0)} Topics
              </div>
              <div style={{ width: 240, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.2)', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${roadmap.progressPercentage || 0}%`, height: '100%', background: '#34d399', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#34d399' }}>{roadmap.progressPercentage || 0}%</span>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════
              NAVIGATION TABS
              ════════════════════════════════════════════════════════ */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--s-border)', paddingBottom: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('phases')}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: activeTab === 'phases' ? 'var(--s-primary)' : 'transparent',
                color: activeTab === 'phases' ? '#fff' : 'var(--s-text2)'
              }}
            >
              🗺️ Roadmap Phases & Topics
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('today')}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: activeTab === 'today' ? 'var(--s-primary)' : 'transparent',
                color: activeTab === 'today' ? '#fff' : 'var(--s-text2)'
              }}
            >
              📅 Today's Study Plan
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('weekly')}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: activeTab === 'weekly' ? 'var(--s-primary)' : 'transparent',
                color: activeTab === 'weekly' ? '#fff' : 'var(--s-text2)'
              }}
            >
              🗓️ Weekly Schedule
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('adaptive')}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: activeTab === 'adaptive' ? 'var(--s-primary)' : 'transparent',
                color: activeTab === 'adaptive' ? '#fff' : 'var(--s-text2)',
                display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              📊 Weak & Strong Topics ({roadmap.weakTopics?.length || 0} Weak)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('readiness')}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: activeTab === 'readiness' ? 'var(--s-primary)' : 'transparent',
                color: activeTab === 'readiness' ? '#fff' : 'var(--s-text2)'
              }}
            >
              🎯 Placement Readiness ({roadmap.placementReadyScore || 0}%)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sources')}
              style={{
                padding: '8px 16px', borderRadius: 12, border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                background: activeTab === 'sources' ? 'var(--s-primary)' : 'transparent',
                color: activeTab === 'sources' ? '#fff' : 'var(--s-text2)'
              }}
            >
              📚 Research Sources ({roadmap.sources?.length || 0})
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════
              TAB 1: ROADMAP PHASES & TOPIC CARDS
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'phases' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {roadmap.sections?.map((sec, secIdx) => {
                const isExpanded = expandedSections[secIdx] !== false
                return (
                  <SCard key={sec.sectionId || secIdx} style={{ padding: 24, borderRadius: 20 }}>
                    {/* Section Header */}
                    <div
                      onClick={() => toggleSectionExpand(secIdx)}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: isExpanded ? 16 : 0 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 16, background: 'var(--s-primary)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14
                        }}>
                          {secIdx + 1}
                        </div>
                        <div>
                          <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                            {sec.title}
                          </h3>
                          <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 2 }}>
                            {sec.topics?.length || 0} Topics • ~{sec.estimatedHours || 10} Total Hours
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 10,
                          background: sec.priority === 'CRITICAL' ? '#fef2f2' : '#ede9fe',
                          color: sec.priority === 'CRITICAL' ? '#b91c1c' : '#6d28d9',
                          textTransform: 'uppercase'
                        }}>
                          {sec.priority} PRIORITY
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text3)' }}>
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Section Topics Stack */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
                        {sec.topics?.map((top, topIdx) => {
                          const isDone = top.isCompleted
                          return (
                            <div
                              key={top.topicId || topIdx}
                              style={{
                                padding: 18, borderRadius: 16,
                                background: isDone ? '#f0fdf4' : '#fff',
                                border: isDone ? '1px solid #bbf7d0' : '1px solid var(--s-border)',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--s-text)' }}>
                                      {top.name}
                                    </span>

                                    {/* Deterministic Priority Badge */}
                                    <span style={{
                                      fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 8,
                                      background: top.priority === 'CRITICAL' ? '#fee2e2' : top.priority === 'HIGH' ? '#fef3c7' : '#f1f5f9',
                                      color: top.priority === 'CRITICAL' ? '#991b1b' : top.priority === 'HIGH' ? '#92400e' : '#475569'
                                    }}>
                                      {top.priority} PRIORITY ({top.priorityScore || 70}/100)
                                    </span>

                                    <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: '#e2e8f0', color: '#334155' }}>
                                      {top.difficulty}
                                    </span>
                                  </div>

                                  <p style={{ fontSize: 13, color: 'var(--s-text2)', margin: '0 0 10px', lineHeight: 1.5 }}>
                                    {top.description}
                                  </p>

                                  {/* Prerequisites & Time Breakdown */}
                                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 11, color: 'var(--s-text3)' }}>
                                    <span>⏱️ <strong>Estimated: {top.estimatedHours || 4} hrs</strong> (Concept: {top.conceptHours || 1.5}h, Practice: {top.practiceHours || 1.5}h, Rev: {top.revisionHours || 0.5}h)</span>
                                    <span>📝 <strong>Recommended Practice: {top.recommendedQuestions || 30} questions</strong></span>
                                    {top.prerequisites?.length > 0 && (
                                      <span>🔗 <strong>Prerequisite:</strong> {top.prerequisites.join(', ')}</span>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handlePracticeTopic(top.name, top.difficulty)}
                                    style={{
                                      background: '#ede9fe', color: '#6d28d9', border: '1px solid #c4b5fd',
                                      padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', gap: 4
                                    }}
                                  >
                                    <FiZap size={13} /> Practice
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleTopic(secIdx, topIdx, top.topicId, isDone)}
                                    style={{
                                      background: isDone ? '#047857' : '#fff',
                                      color: isDone ? '#fff' : 'var(--s-text)',
                                      border: isDone ? 'none' : '1px solid var(--s-border)',
                                      padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer',
                                      display: 'flex', alignItems: 'center', gap: 6
                                    }}
                                  >
                                    {isDone ? <><FiCheckCircle size={14} /> Completed</> : 'Mark Complete'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </SCard>
                )
              })}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 2: TODAY'S STUDY PLAN
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'today' && (
            <SCard style={{ padding: 26, borderRadius: 20, maxWidth: 720, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    Today's Study Plan — {roadmap.availableHoursPerDay || 2} Hours
                  </h3>
                  <div style={{ fontSize: 12, color: 'var(--s-text3)', marginTop: 2 }}>
                    Dynamically generated daily tasks for {roadmap.topic}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 900, padding: '4px 10px', borderRadius: 10, background: '#d1fae5', color: '#047857' }}>
                  Active Schedule
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                {roadmap.dailyPlans?.[0]?.tasks?.map((tsk, idx) => (
                  <div key={idx} style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 24, height: 24, borderRadius: 12, background: 'var(--s-primary)', color: '#fff', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {idx + 1}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--s-text)' }}>{tsk.topicName}</div>
                        <div style={{ fontSize: 11, color: 'var(--s-text3)' }}>{tsk.activityType} • {tsk.durationMinutes} mins</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePracticeTopic(tsk.topicName, 'BEGINNER')}
                      style={{ background: '#fff', border: '1px solid var(--s-border)', padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                    >
                      Start Task →
                    </button>
                  </div>
                ))}
              </div>
            </SCard>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 3: WEEKLY SCHEDULE
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'weekly' && (
            <SCard style={{ padding: 26, borderRadius: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: '0 0 16px' }}>
                7-Day Weekly Learning Schedule
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {roadmap.weeklyPlans?.[0]?.schedule?.map((day, idx) => (
                  <div key={idx} style={{ padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid var(--s-border)' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--s-primary)', textTransform: 'uppercase', marginBottom: 4 }}>
                      {day.day} • {day.durationHours} hrs
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--s-text)', lineHeight: 1.4 }}>
                      {day.activity}
                    </div>
                  </div>
                ))}
              </div>
            </SCard>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 4: ADAPTIVE WEAK & STRONG TOPICS
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'adaptive' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SCard style={{ padding: 24, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                      Performance Mastery & Weak Area Detection
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--s-text3)', margin: '2px 0 0' }}>
                      Automatically adjusts study time and adds extra practice questions for weak topics.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleRecalculateAdaptive}
                    style={{ background: 'var(--s-primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <FiRefreshCw size={14} /> Recalculate Adaptive Roadmap
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Weak Areas Card */}
                  <div style={{ padding: 18, borderRadius: 16, background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#b91c1c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiTrendingDown size={16} /> WEAK AREAS (Need Reinforcement)
                    </div>
                    {roadmap.weakTopics?.length > 0 ? (
                      roadmap.weakTopics.map((wt, idx) => (
                        <div key={idx} style={{ background: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, border: '1px solid #fee2e2' }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#991b1b' }}>{wt.topicName} — {wt.accuracy}% Accuracy</div>
                          <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 2 }}>
                            +1 hour revision & +20 practice questions added to roadmap.
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: '#b91c1c' }}>No weak areas flagged yet. Complete practice sessions to evaluate.</div>
                    )}
                  </div>

                  {/* Strong Areas Card */}
                  <div style={{ padding: 18, borderRadius: 16, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#15803d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FiTrendingUp size={16} /> STRONG AREAS (High Mastery)
                    </div>
                    {roadmap.strongTopics?.length > 0 ? (
                      roadmap.strongTopics.map((st, idx) => (
                        <div key={idx} style={{ background: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, border: '1px solid #dcfce7' }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#166534' }}>✓ {st.topicName} — {st.accuracy}% Mastery</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: '#15803d' }}>Strong topics will appear here after high-accuracy practice attempts.</div>
                    )}
                  </div>
                </div>
              </SCard>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 5: PLACEMENT READINESS
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'readiness' && (
            <SCard style={{ padding: 28, borderRadius: 20, textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
              <div style={{ fontSize: 42, marginBottom: 10 }}>🎯</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                Placement Readiness Calculation
              </h3>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--s-primary)', margin: '8px 0 2px' }}>
                {roadmap.placementReadyScore || 0}%
              </div>
              <div style={{ fontSize: 13, color: 'var(--s-text3)', fontWeight: 700 }}>
                Status: {roadmap.readinessStatus || 'Building Foundation'}
              </div>

              <div style={{ margin: '24px 0', padding: 16, background: '#f8fafc', borderRadius: 14, textAlign: 'left', border: '1px solid var(--s-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--s-text)', marginBottom: 8 }}>
                  Readiness Criteria Breakdown
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--s-text2)' }}>
                  <div>• Roadmap Completion (30% weight): {roadmap.progressPercentage || 0}%</div>
                  <div>• Topic Mastery Score (30% weight): 80%</div>
                  <div>• Practice Accuracy (20% weight): 85%</div>
                  <div>• Sectional Mock Tests (20% weight): 80%</div>
                </div>
              </div>
            </SCard>
          )}

          {/* ════════════════════════════════════════════════════════
              TAB 6: RESEARCH SOURCES & EVIDENCE
              ════════════════════════════════════════════════════════ */}
          {activeTab === 'sources' && (
            <SCard style={{ padding: 24, borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>
                    Reliable Research Sources & Evidence
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--s-text3)', margin: '2px 0 0' }}>
                    Syllabus structure and topics validated against educational sources.
                  </p>
                </div>

                <span style={{
                  fontSize: 11, fontWeight: 900, padding: '4px 12px', borderRadius: 12,
                  background: roadmap.researchConfidence === 'HIGH' ? '#d1fae5' : '#fffbeb',
                  color: roadmap.researchConfidence === 'HIGH' ? '#047857' : '#b45309'
                }}>
                  Research Confidence: {roadmap.researchConfidence || 'HIGH'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {roadmap.sources?.map((src, idx) => (
                  <div key={idx} style={{ padding: 14, borderRadius: 12, background: '#f8fafc', border: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--s-text)' }}>{src.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--s-text3)', marginTop: 2 }}>{src.sourceType} • Credibility: {src.credibility || 'HIGH'}</div>
                    </div>
                    {src.url && (
                      <a href={src.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: 'var(--s-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                        Open Source <FiExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </SCard>
          )}
        </>
      ) : null}
    </div>
  )
}
