import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiArrowRight, FiCheckCircle, FiChevronDown, FiLayers, FiExternalLink
} from 'react-icons/fi'
import { SBadge } from '../ui'
import JOURNEY_DATA from '../../../data/journeyData'
import styles from './CareerJourneyExplorer.module.css'

const TRACKS = [JOURNEY_DATA.school, JOURNEY_DATA.college, JOURNEY_DATA.graduate]

/* ── Small content blocks inside an expanded stage panel ──────────────────── */

function BlockTitle({ children }) {
  return <h5 className={styles.blockTitle}>{children}</h5>
}

function GoalsBlock({ goals }) {
  return (
    <div className={styles.block}>
      <BlockTitle>Goals</BlockTitle>
      <ul className={styles.goalList}>
        {goals.map((g) => (
          <li key={g}>
            <FiCheckCircle className={styles.goalIcon} size={16} aria-hidden="true" />
            <span>{g}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActivitiesBlock({ activities }) {
  return (
    <div className={styles.block}>
      <BlockTitle>Skill-Building Activities</BlockTitle>
      <div className={styles.activityChips}>
        {activities.map((a) => (
          <span key={a.title} className={styles.activityChip}>
            <strong>{a.title}</strong>
            <em>{a.type} · {a.duration}</em>
          </span>
        ))}
      </div>
    </div>
  )
}

function ChipsBlock({ title, chips }) {
  if (!chips || chips.length === 0) return null
  return (
    <div className={styles.block}>
      <BlockTitle>{title}</BlockTitle>
      <div className={styles.chips}>
        {chips.map((c) => (
          <span key={c} className={styles.chip}>{c}</span>
        ))}
      </div>
    </div>
  )
}

function PathsBlock({ paths }) {
  return (
    <div className={styles.block}>
      <BlockTitle>Your Path Options</BlockTitle>
      <div className={styles.pathsGrid}>
        {paths.map((p) => (
          <div key={p.id} className={styles.pathCard}>
            <h6 className={styles.pathTitle}>{p.title}</h6>
            {p.subjects?.length > 0 && (
              <div className={styles.pathRow}>
                <span className={styles.pathLabel}>Subjects</span>
                <div className={styles.chips}>
                  {p.subjects.map((s) => <span key={s} className={styles.chip}>{s}</span>)}
                </div>
              </div>
            )}
            {p.courses?.length > 0 && (
              <div className={styles.pathRow}>
                <span className={styles.pathLabel}>Courses & Combinations</span>
                <ul className={styles.pathList}>
                  {p.courses.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </div>
            )}
            {p.careerAreas?.length > 0 && (
              <div className={styles.pathRow}>
                <span className={styles.pathLabel}>Careers You Can Explore</span>
                <div className={styles.chips}>
                  {p.careerAreas.map((c) => <span key={c} className={styles.chip}>{c}</span>)}
                </div>
              </div>
            )}
            {p.entranceExams?.length > 0 && (
              <div className={styles.pathRow}>
                <span className={styles.pathLabel}>Entrance Exams</span>
                <div className={styles.chips}>
                  {p.entranceExams.map((e) => <span key={e} className={styles.chip}>{e}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionsBlock({ sections }) {
  return (
    <div className={styles.block}>
      <BlockTitle>What Lies Ahead</BlockTitle>
      <div className={styles.sectionsGrid}>
        {Object.entries(sections).map(([name, items]) => (
          <div key={name} className={styles.sectionCard}>
            <h6 className={styles.sectionTitle}>{name}</h6>
            <ul className={styles.sectionList}>
              {items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanBlock({ plan }) {
  return (
    <div className={styles.block}>
      <BlockTitle>Your Next-Step Plan</BlockTitle>
      <ol className={styles.planList}>
        {plan.map((step, i) => (
          <li key={step}>
            <span className={styles.planNum}>{i + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ── Shared detail panel content (used by School cards + College/Grad accordion) ── */

function StageDetail({ stage, stages, onOpenNext }) {
  const next = stages.find((s) => s.id === stage.nextStage)

  return (
    <>
      {stage.desc && <p className={styles.panelDesc}>{stage.desc}</p>}
      {stage.subtitle && <p className={styles.panelSub}>{stage.subtitle}</p>}

      {stage.goals?.length > 0 && <GoalsBlock goals={stage.goals} />}
      {stage.activities?.length > 0 && <ActivitiesBlock activities={stage.activities} />}
      {stage.tags?.length > 0 && <ChipsBlock title="Key Highlights" chips={stage.tags} />}
      {stage.careerAreas?.length > 0 && <ChipsBlock title="Careers You Can Explore" chips={stage.careerAreas} />}
      {stage.paths?.length > 0 && <PathsBlock paths={stage.paths} />}
      {stage.sections && Object.keys(stage.sections).length > 0 && (
        <SectionsBlock sections={stage.sections} />
      )}
      {stage.nextStepPlan?.length > 0 && <PlanBlock plan={stage.nextStepPlan} />}

      <div className={styles.continueRow}>
        {stage.nextStage && next ? (
          <>
            {stage.link && (
              <Link to={stage.link} className={styles.ghostLink}>
                Open {stage.label} page <FiExternalLink size={14} aria-hidden="true" />
              </Link>
            )}
            <button
              type="button"
              className={styles.continueBtn}
              onClick={() => onOpenNext(next.id)}
            >
              Continue to {next.label} <FiArrowRight size={15} aria-hidden="true" />
            </button>
          </>
        ) : stage.link ? (
          <Link to={stage.link} className={styles.continueBtn}>
            {stage.ctaText || 'Continue'} <FiArrowRight size={15} aria-hidden="true" />
          </Link>
        ) : (
          <span className={styles.doneNote}>You have reached the end of this journey.</span>
        )}
      </div>
    </>
  )
}

/* ── Main component ───────────────────────────────────────────────────────── */

export default function CareerJourneyExplorer() {
  const [activeTrackId, setActiveTrackId] = useState(TRACKS[0].id)
  const [openStageId, setOpenStageId] = useState(null)

  const track = TRACKS.find((t) => t.id === activeTrackId) || TRACKS[0]
  const stages = track.stages
  const isSchool = track.id === 'school'
  const openStage = stages.find((s) => s.id === openStageId) || null

  const currentStage = stages.find((s) => s.id === openStageId) || stages[0]

  // TODO: replace with real user progress from dashboard API
  const totalItems = currentStage
    ? currentStage.activities?.length || currentStage.tags?.length || 4
    : 0
  const doneItems = Math.min(2, totalItems)
  const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0

  const switchTrack = (id) => {
    setActiveTrackId(id)
    setOpenStageId(null)
  }

  const toggleStage = (id) => {
    setOpenStageId((prev) => (prev === id ? null : id))
  }

  return (
    <div className={styles.root}>
      {/* Section header — reuses the app's s-section classes */}
      <div className="s-section-header" style={{ textAlign: 'center', marginBottom: 40 }}>
        <div
          className="s-section-tag"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#EDE6FB', color: '#7C3AED',
            border: '1px solid #E3D7F8', padding: '8px 20px', borderRadius: 999,
          }}
        >
          <FiLayers size={14} aria-hidden="true" /> Guided Progression
        </div>
        <h2 className="s-section-title" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.4rem)', margin: '8px 0' }}>
          {track.heading}
        </h2>
        <p className="s-section-desc" style={{ maxWidth: 680, margin: '0 auto' }}>
          {track.subheading}
        </p>
      </div>

      {/* ── Segmented control ── */}
      <div
        className={styles.tabs}
        role="tablist"
        aria-label="Choose your journey"
      >
        {TRACKS.map((t) => {
          const active = t.id === activeTrackId
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              style={{ '--acc': t.accent }}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              onClick={() => switchTrack(t.id)}
            >
              <span className={styles.tabName}>{t.tabName}</span>
              <span className={styles.tabSub}>{t.tabSub}</span>
            </button>
          )
        })}
      </div>

      {stages.length === 0 ? (
        <div className={styles.comingSoon}>This journey is coming soon — check back shortly.</div>
      ) : (
        <>
          {/* ── Your current stage ── */}
          <div className={styles.currentCard} style={{ '--j-acc': currentStage.accent || track.accent }}>
            <div className={styles.currentText}>
              <SBadge color={track.badgeColor}>{track.badgeText}</SBadge>
              <span className={styles.currentLabel}>Your current stage</span>
              <span className={styles.currentTitle}>{currentStage.title}</span>
            </div>
            <div className={styles.currentProgress}>
              <span>
                {doneItems} of {totalItems} activities completed
              </span>
              <span className={styles.progressTrack} aria-hidden="true">
                <span className={styles.progressFill} style={{ width: `${pct}%` }} />
              </span>
            </div>
          </div>

          {/* ── School: horizontal milestone cards + shared detail panel below ── */}
          {isSchool ? (
            <>
              <div className={styles.milestoneGrid}>
                {stages.map((stage, i) => {
                  const open = openStageId === stage.id
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      aria-expanded={open}
                      className={`${styles.milestoneCard} ${open ? styles.milestoneCardOpen : ''}`}
                      style={{ '--acc': stage.accent }}
                      onClick={() => toggleStage(stage.id)}
                    >
                      <span className={styles.cardArt}>
                        {stage.art ? (
                          <img src={stage.art} alt={stage.alt || `${stage.label} illustration`} loading="lazy" />
                        ) : (
                          <span className={styles.cardFallback}>{stage.label.replace('Class ', '')}</span>
                        )}
                      </span>
                      <span className={styles.cardLabel}>{stage.label}</span>
                      <span className={styles.cardTitle}>{stage.title}</span>
                      <span className={styles.cardDesc}>{stage.desc}</span>
                    </button>
                  )
                })}
              </div>

              {openStage && (
                <div
                  key={openStage.id}
                  className={styles.detailPanel}
                  role="region"
                  aria-label={`${openStage.label} details`}
                  style={{ '--acc': openStage.accent }}
                >
                  <StageDetail stage={openStage} stages={stages} onOpenNext={setOpenStageId} />
                </div>
              )}
            </>
          ) : (
            /* ── College / Graduate: vertical accordion timeline (unchanged) ── */
            <ol className={styles.timeline}>
              {stages.map((stage, i) => {
                const open = openStageId === stage.id
                return (
                  <li
                    key={stage.id}
                    className={`${styles.stageItem} ${open ? styles.stageItemOpen : ''}`}
                    style={{ '--acc': stage.accent }}
                  >
                    <button
                      type="button"
                      className={styles.stageRow}
                      aria-expanded={open}
                      onClick={() => toggleStage(stage.id)}
                    >
                      <span className={styles.numBadge}>{i + 1}</span>
                      <span className={styles.stageText}>
                        <span className={styles.stageLabel}>{stage.label}</span>
                        <span className={styles.stageTitle}>{stage.title}</span>
                      </span>
                      <FiChevronDown
                        className={`${styles.chev} ${open ? styles.chevOpen : ''}`}
                        size={20}
                        aria-hidden="true"
                      />
                    </button>

                    {open && (
                      <div className={styles.panel} role="region" aria-label={`${stage.label} details`}>
                        <StageDetail stage={stage} stages={stages} onOpenNext={setOpenStageId} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </>
      )}
    </div>
  )
}