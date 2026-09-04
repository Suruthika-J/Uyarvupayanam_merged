import React, { useState } from 'react'
import {
  FiAward, FiGlobe, FiBook, FiCheckCircle, FiDollarSign,
  FiCalendar, FiArrowRight, FiFileText, FiCompass, FiShield
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const INDIA_PROGRAMS = [
  {
    degree: 'M.Tech / M.E (Master of Technology)',
    duration: '2 Years',
    entrance: 'GATE / TANCET',
    topInstitutes: 'IITs, IISc Bangalore, NITs, Anna University (CEG/MIT)',
    stipend: '₹12,400/month MHRD fellowship for GATE-qualified students',
    focus: 'Advanced specialization in AI, Robotics, VLSI, Structural, Power Systems, Thermal etc.',
    idealFor: 'Engineers seeking R&D, core design, or high-tier tech specialist careers'
  },
  {
    degree: 'MBA / PGDM (Management & Business)',
    duration: '2 Years',
    entrance: 'CAT / XAT / TANCET MBA / MAT',
    topInstitutes: 'IIMs (Ahmedabad, Bangalore, Calcutta), FMS Delhi, SPJIMR, XLRI, DOMS IIT Madras',
    stipend: 'High ROI; Average domestic starting packages ₹18 - 34 LPA',
    focus: 'Consulting, Product Management, Investment Banking, Brand Management, Operations',
    idealFor: 'Graduates looking to shift into leadership, strategy, or commercial operations'
  },
  {
    degree: 'M.S. by Research (Direct Research Master’s)',
    duration: '2 - 3 Years',
    entrance: 'GATE + Institute Written Test / Interview',
    topInstitutes: 'IIT Madras, IISc Bangalore, IIIT Hyderabad, IIT Bombay',
    stipend: 'Monthly research fellowship (~₹12,400 - 15,000/month)',
    focus: 'Pure research dissertation, publishing papers, patenting',
    idealFor: 'Those aiming for direct PhD or senior research scientist roles at Google Research, Microsoft Research, etc.'
  }
]

const ABROAD_DESTINATIONS = [
  {
    country: 'Germany 🇩🇪',
    title: 'Tuition-Free Master’s (Top European Tech Hub)',
    cost: 'Near ZERO tuition at public universities (~€300/semester admin fee)',
    livingCost: '€11,208/year blocked account (~₹10 Lakhs/year)',
    workPermit: '18-Month post-study work visa; 20 hrs/week student job allowed',
    exams: 'IELTS (6.5+), GRE (some universities require/waive), APS Certificate',
    topUnis: 'TU Munich, RWTH Aachen, TU Berlin, University of Stuttgart'
  },
  {
    country: 'United States 🇺🇸',
    title: 'Silicon Valley & Global Tech Leadership',
    cost: '$35,000 - $65,000/year tuition',
    livingCost: '$15,000 - $22,000/year',
    workPermit: '3-Year STEM OPT (Optional Practical Training) work authorization',
    exams: 'GRE (315+), TOEFL / IELTS',
    topUnis: 'CMU, Stanford, Georgia Tech, Purdue, UIUC, UT Austin'
  },
  {
    country: 'United Kingdom 🇬🇧',
    title: 'Fast-Track 1-Year Master’s Degree',
    cost: '£18,000 - £35,000 (total for 1 year)',
    livingCost: '£12,000 - £15,000',
    workPermit: '2-Year Graduate Route post-study work visa',
    exams: 'IELTS (6.5 - 7.0), GRE usually not mandatory',
    topUnis: 'Imperial College London, UCL, University of Manchester, Edinburgh'
  },
  {
    country: 'Canada & Ireland 🇨🇦 🇮🇪',
    title: 'High Tech Influx & Permanent Residency Pathways',
    cost: 'CAD $22,000 - $45,000 / €15,000 - €26,000',
    livingCost: 'CAD $18,000 / €12,000',
    workPermit: '2 to 3 Years Post-Graduation Work Permit (PGWP)',
    exams: 'IELTS (6.5 - 7.0)',
    topUnis: 'University of Toronto, UBC, Waterloo, Trinity College Dublin, UCD'
  }
]

export default function GraduateHigherStudiesPage() {
  const [tab, setTab] = useState('india') // 'india' or 'abroad'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)',
        borderRadius: 16, padding: '28px 32px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)'
      }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#c7d2fe', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <FiAward size={16} /> Postgraduate Academics
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '6px 0 8px', color: '#fff' }}>
            Higher Studies Pathways for Degree Holders
          </h1>
          <p style={{ margin: 0, color: '#e0e7ff', fontSize: 14, lineHeight: 1.5 }}>
            Evaluate whether M.Tech in premier Indian institutes or an MS abroad aligns better with your long-term earnings and career goals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setTab('india')}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: tab === 'india' ? '#4f46e5' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}
          >
            🇮🇳 Study in India (M.Tech/MBA)
          </button>
          <button
            onClick={() => setTab('abroad')}
            style={{
              padding: '10px 18px', borderRadius: 10, border: 'none',
              background: tab === 'abroad' ? '#4f46e5' : 'rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}
          >
            🌍 Study Abroad (MS / Master’s)
          </button>
        </div>
      </div>

      {tab === 'india' ? (
        /* India Section */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 12,
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <FiCheckCircle size={24} color="#4f46e5" />
            <div style={{ fontSize: 13.5, color: '#312e81', lineHeight: 1.5 }}>
              <strong>MHRD Fellowship Benefit:</strong> If you clear GATE with a valid score, you are entitled to a monthly government scholarship of <strong>₹12,400/month</strong> for the entire 2-year M.Tech program at IITs, NITs, and approved colleges.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {INDIA_PROGRAMS.map((prog, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                  padding: 24, display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: '#eff6ff', color: '#2563eb' }}>
                      {prog.duration}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>
                      Entrance: {prog.entrance}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                    {prog.degree}
                  </h3>

                  <div style={{ fontSize: 13, color: '#475569', marginBottom: 14 }}>
                    <strong>Top Institutes:</strong> {prog.topInstitutes}
                  </div>

                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                      Financial Return / Stipend
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>
                      {prog.stipend}
                    </div>
                  </div>

                  <p style={{ margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                    <strong>Core Focus:</strong> {prog.focus}
                  </p>
                </div>

                <div style={{ paddingTop: 14, borderTop: '1px solid #f1f5f9', fontSize: 12.5, color: '#2563eb', fontWeight: 600 }}>
                  💡 {prog.idealFor}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Study Abroad Section */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
            {ABROAD_DESTINATIONS.map((dest, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                  padding: 24, display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#0f172a' }}>
                      {dest.country}
                    </h3>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#4f46e5', marginBottom: 12 }}>
                    {dest.title}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f8fafc', padding: 12, borderRadius: 10, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tuition</div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0f172a' }}>{dest.cost}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Post-Study Visa</div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#059669' }}>{dest.workPermit}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 8 }}>
                    <strong>Mandatory Tests:</strong> {dest.exams}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 14 }}>
                    <strong>Top Universities:</strong> {dest.topUnis}
                  </div>
                </div>

                <div style={{ paddingTop: 12, borderTop: '1px solid #f1f5f9', fontSize: 12, color: '#64748b' }}>
                  Avg. Living Expenses: <strong>{dest.livingCost}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Abroad Checklist */}
          <div style={{
            background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
            padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>
              Study Abroad Application Checklist (Timeline: 9-12 Months Before Intake)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13 }}>
                <strong>1. Standardized Tests</strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Book and take GRE & IELTS/TOEFL 10 months prior.</p>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13 }}>
                <strong>2. Academic Transcripts</strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Obtain official transcripts & consolidated marksheets.</p>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13 }}>
                <strong>3. SOP & 3 LORs</strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Draft research-focused SOP; secure professors' recommendations.</p>
              </div>
              <div style={{ padding: 12, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13 }}>
                <strong>4. Financial Solvency</strong>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Pre-sanction student loan or prepare sponsor affidavit.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
