import React, { useState, useEffect } from 'react'
import {
  FiBook, FiAward, FiCalendar, FiClock, FiCheckSquare,
  FiExternalLink, FiSearch, FiLayers, FiShield, FiBriefcase
} from 'react-icons/fi'
import graduateService from '../../../services/graduateService'

const EXAMS_CATALOG = [
  {
    id: 'gate',
    name: 'GATE (Graduate Aptitude Test in Engineering)',
    category: 'Engineering & PSUs',
    organizer: 'IITs / IISc',
    eligibility: 'Graduates in Engineering, Technology, Architecture, or Science (M.Sc)',
    frequency: 'Once a year (February)',
    opportunities: 'M.Tech in IITs/NITs + Direct Executive Trainee recruitment in IOCL, ONGC, NTPC, BHEL, DRDO, BARC (PSUs)',
    syllabus: 'Core Engineering Domain (72%) + Engineering Math (13%) + General Aptitude (15%)',
    timeline: '6 to 9 Months focused preparation',
    cutoffBrief: 'General qualifying: 25-33 / 100; PSU interview call typically requires 750+ score',
    popular: true
  },
  {
    id: 'cat',
    name: 'CAT (Common Admission Test)',
    category: 'Management & MBA',
    organizer: 'IIMs',
    eligibility: 'Any Bachelor’s Degree with at least 50% marks (45% for reserved)',
    frequency: 'Once a year (November)',
    opportunities: 'Admission to 21 IIMs, FMS, SPJIMR, MDI and top Indian B-Schools. Post-MBA average CTC: ₹22 - 35 LPA',
    syllabus: 'Verbal Ability & Reading Comprehension (VARC) + Data Interpretation & Logical Reasoning (DILR) + Quantitative Aptitude (QA)',
    timeline: '6 to 8 Months (Daily practice & mocks)',
    cutoffBrief: 'Top IIMs require 98 - 99.5+ percentile',
    popular: true
  },
  {
    id: 'upsc',
    name: 'UPSC Civil Services Examination (CSE)',
    category: 'Civil & Govt Services',
    organizer: 'Union Public Service Commission',
    eligibility: 'Degree from any recognized university; Age 21 - 32 years',
    frequency: 'Once a year (Prelims in May/June, Mains in September)',
    opportunities: 'Prestigious administrative roles: IAS, IPS, IFS, IRS, and Central Services',
    syllabus: 'Prelims: GS I + CSAT. Mains: 9 subjective papers (Essay, 4 GS papers, 2 Optional papers) + Personality Interview',
    timeline: '12 to 18 Months intensive daily study',
    cutoffBrief: 'Prelims GS Cutoff ~85-90 marks out of 200; CSAT qualifying at 33%',
    popular: true
  },
  {
    id: 'tnpsc',
    name: 'TNPSC Group I & Group II',
    category: 'State Civil Services',
    organizer: 'Tamil Nadu Public Service Commission',
    eligibility: 'Any recognized Bachelor’s degree. Proficiency in Tamil is advantageous.',
    frequency: 'Annual / Biennial recruitment notifications',
    opportunities: 'Deputy Collector, DSP, Commercial Tax Officer, Municipal Commissioner',
    syllabus: 'General Studies, Aptitude & Mental Ability, General Tamil / English, Tamil Society History',
    timeline: '8 to 12 Months',
    cutoffBrief: 'Rank-based merit list across Prelims and Subjective Mains',
    popular: true
  },
  {
    id: 'sbi-ibps-po',
    name: 'IBPS / SBI Probationary Officer (PO)',
    category: 'Banking & Financial Services',
    organizer: 'Institute of Banking Personnel Selection / SBI',
    eligibility: 'Any Graduate degree; Age 20 - 30 years',
    frequency: 'Annual cycles (Prelims Aug-Oct, Mains Nov-Jan)',
    opportunities: 'Assistant Manager / PO in Public Sector Banks. Fast-track promotion to Senior Manager & Branch Head',
    syllabus: 'Quantitative Aptitude, Reasoning Ability, English Language, General/Banking Awareness, Descriptive Writing',
    timeline: '4 to 6 Months (Speed & accuracy focus)',
    cutoffBrief: 'Prelims sectional & overall cutoffs; Mains score determines interview shortlisting',
    popular: true
  },
  {
    id: 'ssc-cgl',
    name: 'SSC CGL (Combined Graduate Level)',
    category: 'Central Govt Services',
    organizer: 'Staff Selection Commission',
    eligibility: 'Bachelor’s degree from a recognized university; Age 18 - 30/32 years',
    frequency: 'Annual',
    opportunities: 'Income Tax Inspector, Central Excise Inspector, Assistant Section Officer (CSS, MEA, IB)',
    syllabus: 'General Intelligence, General Awareness, Quantitative Aptitude, English Comprehension',
    timeline: '6 to 9 Months',
    cutoffBrief: 'Computer-based Tier 1 qualifying; Tier 2 scores dictate cadre and department allocation',
    popular: false
  },
  {
    id: 'gre',
    name: 'GRE (Graduate Record Examination)',
    category: 'Higher Studies Abroad',
    organizer: 'ETS (Educational Testing Service)',
    eligibility: 'Any graduate planning Master’s (MS) or Ph.D. abroad (USA, Germany, Singapore, etc.)',
    frequency: 'Available year-round on demand',
    opportunities: 'Admission to top global universities for MS in Computer Science, Data Science, Mechanical, etc. Score valid for 5 years.',
    syllabus: 'Analytical Writing, Verbal Reasoning, Quantitative Reasoning (Total score 340)',
    timeline: '2 to 4 Months',
    cutoffBrief: 'Top US Universities usually expect 315 - 325+ with strong Quant score (165+)',
    popular: false
  }
]

export default function GraduateExamsPage() {
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedExam, setSelectedExam] = useState(null)

  const categories = ['All', 'Engineering & PSUs', 'Management & MBA', 'Civil & Govt Services', 'State Civil Services', 'Banking & Financial Services', 'Higher Studies Abroad']

  const filteredExams = EXAMS_CATALOG.filter((exam) => {
    const matchCat = selectedCategory === 'All' || exam.category === selectedCategory
    const matchSearch = exam.name.toLowerCase().includes(search.toLowerCase()) || exam.opportunities.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#93c5fd', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiBook size={16} /> National Competitive Exams Guide
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Competitive Exams for Degree Holders
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, lineHeight: 1.5 }}>
            Comprehensive intelligence on GATE, CAT, UPSC, TNPSC, Banking PO, and SSC. Compare eligibility, syllabus, career opportunities, and timelines.
          </p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12, padding: '12px 18px', textAlign: 'center'
        }}>
          <div style={{ fontSize: 11, color: '#93c5fd', fontWeight: 700, textTransform: 'uppercase' }}>Available Exams</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{EXAMS_CATALOG.length} Tracks</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, background: '#fff',
            border: '1px solid #cbd5e1', borderRadius: 10, padding: '8px 14px', flex: 1, minWidth: 260
          }}>
            <FiSearch size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search exams, PSUs, civil services, banking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13.5 }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px', borderRadius: 20,
                background: selectedCategory === cat ? '#2563eb' : '#fff',
                color: selectedCategory === cat ? '#fff' : '#475569',
                border: `1px solid ${selectedCategory === cat ? '#2563eb' : '#e2e8f0'}`,
                fontSize: 12.5, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            style={{
              background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
              padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)', position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                  background: '#eff6ff', color: '#2563eb', textTransform: 'uppercase'
                }}>
                  {exam.category}
                </span>
                <span style={{ fontSize: 11.5, color: '#64748b', fontWeight: 600 }}>
                  {exam.frequency}
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>
                {exam.name}
              </h3>
              <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#64748b', lineHeight: 1.4 }}>
                <strong>Eligibility:</strong> {exam.eligibility}
              </p>

              {/* Opportunities snippet */}
              <div style={{
                background: '#f8fafc', padding: '10px 14px', borderRadius: 10,
                border: '1px solid #f1f5f9', marginBottom: 14
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: 4 }}>
                  Career & Academic Unlocks:
                </div>
                <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                  {exam.opportunities}
                </div>
              </div>

              {/* Prep Timeline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569', marginBottom: 16 }}>
                <FiClock size={14} color="#f59e0b" />
                <span>Recommended Prep: <strong>{exam.timeline}</strong></span>
              </div>
            </div>

            {/* Action */}
            <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setSelectedExam(exam)}
                style={{
                  background: '#2563eb', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                Syllabus & Strategy Breakdown
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for In-Depth Exam Details */}
      {selectedExam && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: 20
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, maxWidth: 620, width: '100%',
            padding: 28, position: 'relative', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: '#2563eb' }}>
                  {selectedExam.category}
                </span>
                <h2 style={{ margin: '4px 0 8px', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                  {selectedExam.name}
                </h2>
                <div style={{ fontSize: 13, color: '#64748b' }}>Conducted by: <strong>{selectedExam.organizer}</strong></div>
              </div>
              <button
                onClick={() => setSelectedExam(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                  Comprehensive Syllabus & Sections:
                </div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>
                  {selectedExam.syllabus}
                </div>
              </div>

              <div style={{ background: '#ecfdf5', padding: 14, borderRadius: 10, border: '1px solid #a7f3d0' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#065f46', marginBottom: 4 }}>
                  Cutoffs & Selection Benchmark:
                </div>
                <div style={{ fontSize: 13, color: '#047857', lineHeight: 1.5 }}>
                  {selectedExam.cutoffBrief}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
                  Recommended Step-by-Step Preparation Strategy:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                  <li>Download the official past 5-year question papers to understand question weightage.</li>
                  <li>Identify weak domains early and dedicate the first 3 months to conceptual foundations.</li>
                  <li>Transition to timed sectionals and full-length test series at least 60 days before the exam.</li>
                  <li>Maintain a dedicated formula / revision notebook for last-minute consolidation.</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedExam(null)}
                style={{
                  padding: '10px 20px', background: '#0f172a', color: '#fff',
                  border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
