import React, { useEffect, useMemo, useState } from 'react'
import {
  FiLayers, FiBookOpen, FiCheckCircle, FiArrowLeft, FiRotateCcw,
  FiBox, FiPlus, FiInbox, FiChevronRight, FiBriefcase, FiGrid, FiTool, FiTag,
} from 'react-icons/fi'
import { streamService } from '../../../services/streamService'
import { STREAM_CATEGORIES, DIPLOMA_SUB_CATEGORIES } from '../../../constants/streamThemes'
import './streams.css'

const PAGE_SIZE = 12

const TAB_BLURBS = {
  all: 'Pick the broad direction that fits you, then explore the exact subject groups inside it.',
  science: 'Core science groups — engineering, medical, research and analytics pathways.',
  commerce: 'Commerce groups — finance, management, accountancy and business pathways.',
  arts: 'Arts & humanities groups — civil services, law, media and liberal studies.',
  diploma: 'Vocational diploma courses across eight practical, career-ready fields.',
  polytechnic: 'Three-year standalone diploma courses in engineering, technology and design fields.',
}

// Category names for the per-card badge (gives each card a meaningful label).
const CATEGORY_LABELS = {
  science: 'Science',
  commerce: 'Commerce',
  arts: 'Arts',
  diploma: 'Diploma',
  polytechnic: 'Polytechnic',
}

// Guided "choose a path" step — each broad direction becomes a card.
const PATH_META = {
  science: { icon: FiLayers, blurb: 'Core science groups — engineering, medical, research and analytics pathways.' },
  commerce: { icon: FiBriefcase, blurb: 'Commerce groups — finance, management, accountancy and business pathways.' },
  arts: { icon: FiBookOpen, blurb: 'Arts & humanities groups — civil services, law, media and liberal studies.' },
  diploma: { icon: FiGrid, blurb: 'Vocational diploma courses across eight practical, career-ready fields.' },
  polytechnic: { icon: FiTool, blurb: 'Three-year standalone diploma courses in engineering, technology and design.' },
}

function StreamCard({ stream, flipped, onFlip }) {
  return (
    <div
      className={`stream-flip-card ${flipped ? 'flipped' : ''}`}
      onClick={onFlip}
      role="button"
      aria-pressed={flipped}
      aria-label={`${stream.groupName} details`}
    >
      <div className="stream-flip-inner">
        {/* ── Front face ── */}
        <div className="stream-flip-face stream-flip-front">
          <div className="stream-front-media">
            <div className="stream-banner" aria-hidden="true" />
            <span className="stream-code-badge">
              <FiTag size={13} /> {CATEGORY_LABELS[stream.category] || 'Group'} · Group {stream.code}
            </span>
            <h3 className="stream-group-name">{stream.groupName}</h3>
          </div>

          <div className="stream-front-body">
            <div>
              <span className="stream-subjects-title">
                <FiBookOpen size={12} /> Subjects
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {(stream.subjects || []).slice(0, 5).map((s) => (
                  <span key={s} className="stream-subject-chip">{s}</span>
                ))}
                {(stream.subjects || []).length > 5 && (
                  <span className="stream-subject-chip">+{(stream.subjects || []).length - 5} more</span>
                )}
              </div>
            </div>
            <p className="stream-best-for">{stream.bestFor}</p>
            <div className="stream-front-caption">
              <span className="stream-cap-caption">
                <FiRotateCcw size={13} /> Tap to see details
              </span>
            </div>
          </div>
        </div>

        {/* ── Back face ── */}
        <div className="stream-flip-face stream-flip-back">
          <div className="stream-back-pad">
            <div>
              <span className="stream-back-sub">Group {stream.code} · Full Subjects</span>
              <h4 className="stream-back-title">
                <FiBox size={15} /> {stream.groupName}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {(stream.subjects || []).map((s) => (
                  <span key={s} className="stream-back-chip">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <span className="stream-back-sub">What You Can Pursue Next</span>
              <ul className="stream-back-list">
                {(stream.progression || []).map((p) => (
                  <li key={p}>
                    <FiCheckCircle size={15} /> {p}
                  </li>
                ))}
              </ul>
            </div>

            <button type="button" className="stream-back-flip">
              <FiArrowLeft size={15} /> Back to details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StreamsInsight() {
  const [facets, setFacets] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [activeChip, setActiveChip] = useState('all-diploma')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [flippedIds, setFlippedIds] = useState(() => new Set())

  // Facets (tab counts) come from one unfiltered public read
  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await streamService.getStreams()
        if (alive && res.success) setFacets(res.facets)
      } catch {
        // Facets are an enhancement; the grid still works without them.
      }
    }
    load()
    return () => { alive = false }
  }, [])

  // Main grid follows the active tab + (diploma) sub-category chip, served
  // by the public API so the sections always reflect the published data.
  useEffect(() => {
    let alive = true
    if (activeTab === 'all') {
      // Step 1 is the guided path chooser — no need to pull all groups yet.
      setData([])
      setError('')
      setLoading(false)
      setVisible(PAGE_SIZE)
      setFlippedIds(new Set())
      return () => { alive = false }
    }
    const load = async () => {
      setLoading(true)
      setVisible(PAGE_SIZE)
      setFlippedIds(new Set())
      try {
        const params = {}
        if (activeTab !== 'all') params.category = activeTab
        if (activeTab === 'diploma' && activeChip !== 'all-diploma') params.subCategory = activeChip
        const res = await streamService.getStreams(params)
        if (!alive) return
        setData(res.data || [])
        setError('')
      } catch {
        if (alive) setError('Could not load streams right now. Please try again.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [activeTab, activeChip])

  // Tabs are derived from the API facets (counts), with a stable order.
  const tabs = useMemo(() => {
    const counts = facets?.categories || {}
    const base = STREAM_CATEGORIES.map((c) => ({
      ...c,
      count: c.key === 'all' ? (facets?.total ?? 0) : counts[c.key],
    }))
    // Drop tabs the API reports as empty (keeps it data-driven).
    if (facets) return base.filter((t) => t.key === 'all' || (t.count ?? 0) > 0)
    return base
  }, [facets])

  const chipCounts = facets?.subCategories || {}
  const activeBlurb = TAB_BLURBS[activeTab] || TAB_BLURBS.all
  const hasMore = visible < data.length

  const toggleFlip = (id) => {
    setFlippedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="streams-root">
      {/* Intro row */}
      <div className="streams-header-row">
        <p style={{ margin: 0, color: '#1F2937', fontSize: 15, fontWeight: 600, maxWidth: 720 }}>
          {activeBlurb}
        </p>
        <div className="streams-summary">
          <FiLayers size={15} color="#7C3AED" />{' '}
          {activeTab === 'all'
            ? `${tabs.filter((t) => t.key !== 'all').length} career paths · ${facets?.total ?? '…'} groups total`
            : `${data.length} group${data.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {/* Top-level tabs */}
      <div className="streams-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`streams-tab ${activeTab === tab.key ? 'is-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && <span className="streams-tab-count">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Diploma sub-category chips */}
      {activeTab === 'diploma' && (
        <div className="streams-chips">
          {DIPLOMA_SUB_CATEGORIES.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className={`streams-chip ${activeChip === chip.key ? 'is-active' : ''}`}
              onClick={() => setActiveChip(chip.key)}
            >
              {chip.label}
              {chip.key !== 'all-diploma' && chipCounts[chip.key] !== undefined && (
                <span style={{ opacity: 0.75, marginLeft: 5, fontSize: 11, fontWeight: 800 }}>
                  {chipCounts[chip.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === 'all' ? (
        <div className="streams-path-grid">
          {tabs.filter((t) => t.key !== 'all').map((p) => {
            const meta = PATH_META[p.key] || {}
            const PIcon = meta.icon || FiLayers
            return (
              <button
                key={p.key}
                type="button"
                className="streams-path-card"
                onClick={() => { setActiveTab(p.key); setActiveChip('all-diploma'); }}
              >
                <span className="streams-path-icon"><PIcon size={22} /></span>
                <span className="streams-path-name">{p.label}</span>
                <span className="streams-path-blurb">{meta.blurb || ''}</span>
                <span className="streams-path-meta">
                  {p.count !== undefined ? `${p.count} group${p.count === 1 ? '' : 's'} inside` : 'Explore'}
                  <FiChevronRight size={15} />
                </span>
              </button>
            )
          })}
        </div>
      ) : loading ? (
        <div className="streams-skeleton-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="stream-skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <div className="streams-empty">
          <FiInbox size={34} style={{ marginBottom: 10, color: '#94a3b8' }} />
          <p style={{ margin: 0, fontWeight: 700 }}>{error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="streams-empty">
          <FiInbox size={34} style={{ marginBottom: 10, color: '#94a3b8' }} />
          <p style={{ margin: 0, fontWeight: 700 }}>No streams added yet for this category.</p>
        </div>
      ) : (
        <>
          <button type="button" className="streams-back-path" onClick={() => setActiveTab('all')}>
            <FiArrowLeft size={14} /> Choose another stream path
          </button>
          <div className="streams-grid">
            {data.slice(0, visible).map((stream) => (
              <StreamCard
                key={stream._id || stream.code}
                stream={stream}
                flipped={flippedIds.has(stream._id || stream.code)}
                onFlip={() => toggleFlip(stream._id || stream.code)}
              />
            ))}
          </div>
          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="streams-show-more"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                <FiPlus size={16} /> Show more ({data.length - visible} remaining)
              </button>
            </div>
          )}
          <p
            style={{
              marginTop: 18,
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <FiChevronRight size={13} /> Cards flip over to reveal the full subject list and next steps.
          </p>
        </>
      )}
    </div>
  )
}