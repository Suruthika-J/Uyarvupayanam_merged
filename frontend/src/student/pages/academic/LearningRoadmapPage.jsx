import React, { useState } from 'react'
import { SCard, SBtn } from '../../components/ui'
import { FiTarget, FiCheckCircle, FiCircle, FiArrowRight, FiAward, FiBriefcase, FiBookOpen, FiCode } from 'react-icons/fi'

const MILESTONES = [
  {
    phase: 'Phase 1: Academic Foundation',
    status: 'completed',
    title: 'Core Degree & Fundamentals',
    description: 'Master core discipline subjects, algorithms, logic, and core theory.',
    items: ['Data Structures & Algorithms', 'Database Systems & SQL', 'Object Oriented Design'],
    icon: FiBookOpen
  },
  {
    phase: 'Phase 2: Applied Skill Mastery',
    status: 'current',
    title: 'Domain Specialization Skills',
    description: 'Acquire high-demand domain technical skills and industry tools.',
    items: ['Python / Full Stack React', 'RESTful API Engineering', 'Version Control & Git'],
    icon: FiCode
  },
  {
    phase: 'Phase 3: Portfolio Development',
    status: 'upcoming',
    title: 'Practical Industry Projects',
    description: 'Build 2 full-scale portfolio applications with complete documentation.',
    items: ['AI / Web Portfolio App', 'Database Integration Project', 'Open Source Contribution'],
    icon: FiBriefcase
  },
  {
    phase: 'Phase 4: Certification & Placements',
    status: 'upcoming',
    title: 'Industry Certifications & Internship',
    description: 'Earn recognized domain certifications and secure placement internship.',
    items: ['Cloud Practitioner Cert', 'Mock Technical Interviews', 'Resume & Portfolio Review'],
    icon: FiAward
  }
]

export default function LearningRoadmapPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#d1fae5', color: '#047857', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiTarget size={14} /> Career Milestone Roadmap
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Long-Term Learning Roadmap
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Step-by-step progress trajectory from college admission to target career placement.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {MILESTONES.map((m, idx) => {
          const isDone = m.status === 'completed'
          const isCurrent = m.status === 'current'
          const IconComp = m.icon
          return (
            <SCard
              key={idx}
              style={{
                padding: 24, borderRadius: 20,
                borderLeft: isCurrent ? '5px solid var(--s-primary)' : isDone ? '5px solid #047857' : '1px solid var(--s-border)',
                background: isCurrent ? '#f0fdf4' : '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: isDone ? '#047857' : isCurrent ? 'var(--s-primary)' : '#64748b' }}>
                  {m.phase}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 12,
                  background: isDone ? '#d1fae5' : isCurrent ? '#dbeafe' : '#f1f5f9',
                  color: isDone ? '#047857' : isCurrent ? '#1e40af' : '#64748b'
                }}>
                  {isDone ? '✓ Completed' : isCurrent ? '⚡ In Active Progress' : '⏳ Upcoming Milestone'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: isDone ? '#047857' : isCurrent ? 'var(--s-primary)' : '#f1f5f9', color: isDone || isCurrent ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 900, color: 'var(--s-text)', margin: 0 }}>{m.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--s-text3)', margin: '2px 0 0' }}>{m.description}</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 14, borderTop: '1px solid var(--s-border)' }}>
                {m.items.map((item, iIdx) => (
                  <span key={iIdx} style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 10, background: '#fff', border: '1px solid var(--s-border)', color: 'var(--s-text)' }}>
                    • {item}
                  </span>
                ))}
              </div>
            </SCard>
          )
        })}
      </div>
    </div>
  )
}
