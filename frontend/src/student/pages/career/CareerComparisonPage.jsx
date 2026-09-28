import React, { useState } from 'react'
import { SCard, SSelect } from '../../components/ui'
import { FiSliders, FiCheck, FiBookOpen, FiAward } from 'react-icons/fi'

const CAREER_DATA = {
  'Software Engineer': {
    title: 'Software Engineer',
    academicBackground: 'B.E./B.Tech Computer Science / IT / Circuit Branches',
    requiredSkills: ['Data Structures & Algorithms', 'System Architecture', 'Git', 'REST APIs'],
    recommendedCerts: ['AWS Certified Developer', 'Oracle Java Professional'],
    avgSalary: '₹6L - ₹18L / year'
  },
  'Data Scientist': {
    title: 'Data Scientist',
    academicBackground: 'B.Tech CS/Data Science / B.Sc Statistics / Mathematics',
    requiredSkills: ['Python & Pandas', 'Statistics & Probability', 'Machine Learning', 'SQL'],
    recommendedCerts: ['IBM Data Science Professional', 'TensorFlow Developer'],
    avgSalary: '₹7L - ₹20L / year'
  },
  'Machine Learning Engineer': {
    title: 'Machine Learning Engineer',
    academicBackground: 'B.E./B.Tech AI & Data Science / Computer Science',
    requiredSkills: ['PyTorch / TensorFlow', 'MLOps & Deployment', 'Python', 'Linear Algebra'],
    recommendedCerts: ['AWS Machine Learning Specialty', 'Deep Learning Specialization'],
    avgSalary: '₹8L - ₹22L / year'
  }
}

export default function CareerComparisonPage() {
  const [role1, setRole1] = useState('Software Engineer')
  const [role2, setRole2] = useState('Data Scientist')

  const d1 = CAREER_DATA[role1] || CAREER_DATA['Software Engineer']
  const d2 = CAREER_DATA[role2] || CAREER_DATA['Data Scientist']

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          <FiSliders size={14} /> Side-by-Side Evaluation
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--s-text)', margin: 0, fontFamily: 'var(--s-font-display)' }}>
          Career Options Comparison
        </h1>
        <p style={{ fontSize: 14, color: 'var(--s-text3)', margin: '4px 0 0' }}>
          Evaluate academic requirements, skill sets, certifications, and pathways side by side.
        </p>
      </div>

      {/* Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <SSelect
          label="Career Role 1"
          value={role1}
          onChange={e => setRole1(e.target.value)}
          options={Object.keys(CAREER_DATA).map(k => ({ value: k, label: k }))}
        />
        <SSelect
          label="Career Role 2"
          value={role2}
          onChange={e => setRole2(e.target.value)}
          options={Object.keys(CAREER_DATA).map(k => ({ value: k, label: k }))}
        />
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="s-grid-1col">
        {[d1, d2].map((data, idx) => (
          <SCard key={idx} style={{ padding: 28, borderRadius: 20 }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: 'var(--s-primary)', margin: '0 0 16px' }}>{data.title}</h2>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Academic Background</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-text)', marginTop: 4 }}>{data.academicBackground}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Required Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {data.requiredSkills.map(s => (
                  <span key={s} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: '#d1fae5', color: '#047857', fontWeight: 700 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Recommended Certifications</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {data.recommendedCerts.map(c => (
                  <span key={c} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: '#ede9fe', color: '#6d28d9', fontWeight: 700 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Estimated Industry Compensation</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#047857', marginTop: 4 }}>{data.avgSalary}</div>
            </div>
          </SCard>
        ))}
      </div>
    </div>
  )
}
