import React, { useState } from 'react'
import { SCard, SSelect, SBtn } from '../../components/ui'
import { FiZap, FiCheckCircle, FiAlertCircle, FiPlusCircle, FiArrowRight } from 'react-icons/fi'

const CAREER_TARGETS = [
  'Machine Learning Engineer', 'Data Scientist', 'Software Developer',
  'Robotics Engineer', 'Artificial Intelligence Engineer', 'Cyber Security Specialist'
]

const SKILL_PROFILES = {
  'Machine Learning Engineer': {
    existing: ['Python', 'Basic Programming', 'SQL / Databases'],
    toImprove: ['Statistics & Probability', 'Data Structures & Algorithms'],
    toLearn: ['Machine Learning (Scikit-Learn)', 'Deep Learning (PyTorch/TensorFlow)', 'Model Deployment & MLOps']
  },
  'Data Scientist': {
    existing: ['Python', 'Data Wrangling (Pandas)', 'Excel'],
    toImprove: ['Statistical Modeling', 'SQL Query Optimization'],
    toLearn: ['Big Data Processing (Spark)', 'Data Visualization (Tableau)', 'Feature Engineering']
  },
  'Software Developer': {
    existing: ['JavaScript / Node.js', 'Git / GitHub', 'HTML & CSS'],
    toImprove: ['Data Structures & Algorithms', 'REST API Architecture'],
    toLearn: ['System Architecture & Scalability', 'Docker & CI/CD', 'Automated Testing']
  }
}

export default function SkillGapAnalysisPage() {
  const [targetRole, setTargetRole] = useState('Machine Learning Engineer')
  const gapData = SKILL_PROFILES[targetRole] || SKILL_PROFILES['Machine Learning Engineer']

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            <FiZap size={14} /> AI Skill Telemetry Gap Engine
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
            Target Career Skill Gap Analysis
          </h1>
          <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
            Compare your acquired skill profile against industry requirements for target roles.
          </p>
        </div>

        <div style={{ width: 260 }}>
          <SSelect
            label="Select Target Role"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            options={CAREER_TARGETS.map(c => ({ value: c, label: c }))}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }} className="s-grid-1col">
        
        {/* Acquired Skills */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #047857' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#047857', marginBottom: 16 }}>
            <FiCheckCircle size={18} /> Acquired Skills
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gapData.existing.map((s, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#d1fae5', color: '#047857', fontWeight: 700, fontSize: 13 }}>
                ✓ {s}
              </div>
            ))}
          </div>
        </SCard>

        {/* Skills to Improve */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #b45309' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#b45309', marginBottom: 16 }}>
            <FiAlertCircle size={18} /> Skills to Improve
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gapData.toImprove.map((s, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#fef3c7', color: '#b45309', fontWeight: 700, fontSize: 13 }}>
                ⚡ {s}
              </div>
            ))}
          </div>
        </SCard>

        {/* Skills to Learn */}
        <SCard style={{ padding: 24, borderRadius: 20, borderTop: '4px solid #6d28d9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 900, color: '#6d28d9', marginBottom: 16 }}>
            <FiPlusCircle size={18} /> Skills to Learn
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {gapData.toLearn.map((s, idx) => (
              <div key={idx} style={{ padding: 12, borderRadius: 12, background: '#ede9fe', color: '#6d28d9', fontWeight: 700, fontSize: 13 }}>
                + {s}
              </div>
            ))}
          </div>
        </SCard>

      </div>
    </div>
  )
}
