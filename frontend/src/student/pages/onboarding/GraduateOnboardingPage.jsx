import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SBtn, SCard, SInput, SSelect, SAlert } from '../../components/ui'
import { FiBriefcase, FiArrowRight, FiCheckCircle, FiUser, FiAward } from 'react-icons/fi'

const COMPLETED_DEGREES = [
  'B.E / B.Tech (Engineering)',
  'B.Sc / M.Sc (Science)',
  'B.Com / M.Com (Commerce & Finance)',
  'BCA / MCA (Computer Applications)',
  'B.A / M.A (Arts & Humanities)',
  'Polytechnic Diploma Completed',
  'MBA / Management Graduate',
  'Other Graduate Degree'
]

const GRADUATE_GOALS = [
  'Immediate Job Placement / Career Start',
  'Higher Education (M.E / M.Tech / MBA / Ph.D)',
  'Competitive Exams Readiness (GATE / CAT / UPSC / TNPSC)',
  'Specialized Skill Certification & Upskilling',
  'Career Switch / Domain Transition'
]

export default function GraduateOnboardingPage() {
  const { student, updateStudent } = useStudentAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    degreeCompleted: COMPLETED_DEGREES[0],
    graduationYear: '2025',
    primaryGoal: GRADUATE_GOALS[0],
    targetSector: 'Information Technology & Software Services'
  })

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      updateStudent({
        onboardingCompleted: true,
        graduateDetails: formData,
        userType: 'graduate'
      })
      
      navigate('/student/onboarding/result')
    } catch (err) {
      setError('Failed to save graduate onboarding profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="student-root" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '60px 20px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#dbeafe', color: '#1e40af', padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 800, marginBottom: 14 }}>
            <FiBriefcase size={16} /> Graduate Career Onboarding
          </div>
          <h1 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: 'var(--s-text)', margin: '0 0 10px' }}>
            Setup Your Post-Graduate & Career Direction Profile
          </h1>
          <p style={{ color: 'var(--s-text3)', fontSize: 15, maxWidth: 580, margin: '0 auto' }}>
            Tell us about your completed degree and post-graduation ambitions to receive custom career transition pathways and competitive exam guidance.
          </p>
        </div>

        <SCard style={{ padding: '40px 32px', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }} className="s-anim-up">
          {error && <SAlert type="error" style={{ marginBottom: 24 }}>{error}</SAlert>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <SInput label="Graduate Name" value={student?.name || ''} disabled icon={<FiUser />} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="s-grid-2col">
              <SSelect label="Degree Completed" name="degreeCompleted" value={formData.degreeCompleted} onChange={handleChange}>
                {COMPLETED_DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
              </SSelect>

              <SSelect label="Year of Graduation" name="graduationYear" value={formData.graduationYear} onChange={handleChange}>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="Earlier than 2023">Earlier than 2023</option>
              </SSelect>
            </div>

            <SSelect label="Primary Post-Graduate Goal" name="primaryGoal" value={formData.primaryGoal} onChange={handleChange}>
              {GRADUATE_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
            </SSelect>

            <SSelect label="Target Industry / Sector" name="targetSector" value={formData.targetSector} onChange={handleChange}>
              <option value="Information Technology & Software Services">Information Technology & Software Services</option>
              <option value="Core Engineering & Manufacturing">Core Engineering & Manufacturing</option>
              <option value="Banking, Finance & Fintech">Banking, Finance & Fintech</option>
              <option value="Civil Services & Public Sector (TNPSC/UPSC)">Civil Services & Public Sector (TNPSC/UPSC)</option>
              <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
              <option value="Research & Higher Education">Research & Higher Education</option>
            </SSelect>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <SBtn type="submit" variant="primary" style={{ padding: '14px 36px', borderRadius: 14 }} disabled={submitting}>
                {submitting ? 'Saving Profile...' : 'Complete Graduate Onboarding'} <FiArrowRight style={{ marginLeft: 8 }} />
              </SBtn>
            </div>
          </form>
        </SCard>
      </div>
    </div>
  )
}
