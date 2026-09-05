import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SCard, SBtn } from '../../components/ui'

function CategoryCard({ title, desc, onClick, accent }) {
  return (
    <SCard
      hover
      onClick={onClick}
      style={{
        padding: 22,
        cursor: 'pointer',
        borderTop: `4px solid ${accent}`,
        minHeight: 170,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{
            fontFamily: 'var(--s-font-display)',
            fontWeight: 950,
            fontSize: 18,
            color: 'var(--s-text)',
            marginBottom: 6,
          }}>
            {title}
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--s-text3)', lineHeight: 1.55 }}>
            {desc}
          </div>
        </div>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: `${accent}1A`,
          border: `1.5px solid ${accent}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}>
          📚
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-start' }}>
        <SBtn variant="accent" size="md" onClick={onClick}>
          Explore Courses
        </SBtn>
      </div>
    </SCard>
  )
}

export default function CoursesCategoryHome() {
  const navigate = useNavigate()

  return (
    <div className="student-root" style={{ padding: '32px 20px', maxWidth: 1100, margin: '0 auto' }}>
      <div className="s-anim-up" style={{ marginBottom: 26 }}>
        <h1 style={{
          fontFamily: 'var(--s-font-display)',
          fontWeight: 950,
          fontSize: 'clamp(24px,4vw,32px)',
          color: 'var(--s-text)',
          marginBottom: 8,
        }}>
          Choose Your Education Stage
        </h1>
        <p style={{ fontSize: 14.5, color: 'var(--s-text3)' }}>
          Start with the right path — After 10th, After 12th, or Diploma. You can filter by domain and search by course name.
        </p>
      </div>

      <div className="s-anim-up" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: 16,
      }}>
        <CategoryCard
          title="After 10th"
          desc="Shortlist courses for your next step after Class 10."
          accent="#1d5fba"
          onClick={() => navigate('/student/courses/after-10th')}
        />
        <CategoryCard
          title="After 12th"
          desc="Find higher education courses after completing Class 12."
          accent="#16a34a"
          onClick={() => navigate('/student/courses/after-12th')}
        />
        <CategoryCard
          title="Diploma"
          desc="Explore skill-focused programs and diploma pathways."
          accent="#7c3aed"
          onClick={() => navigate('/student/courses/diploma')}
        />
      </div>
    </div>
  )
}

