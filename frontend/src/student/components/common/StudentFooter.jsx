import React from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi'

const PLATFORM_LINKS = [
  { to: '/#about',        label: 'About' },
  { to: '/student/careers', label: 'Explore' },
  { to: '/#how-it-works',  label: 'How It Works' },
  { to: '/#features',      label: 'Features' },
]

const STUDENT_LINKS = [
  { to: '/student/careers',           label: 'School Student' },
  { to: '/student/courses',           label: 'College Student' },
  { to: '/student/colleges/explorer', label: 'Graduate' },
]

const RESOURCE_LINKS = [
  { to: '/student/careers',         label: 'Careers' },
  { to: '/student/courses',         label: 'Courses' },
  { to: '/student/colleges',        label: 'Colleges' },
  { to: '/student/scholarships',     label: 'Scholarships' },
  { to: '/student/colleges/cutoff', label: 'Entrance Exams' },
]

const ACCOUNT_LINKS = [
  { to: '/student/signin', label: 'Login' },
  { to: '/student/signup', label: 'Sign Up' },
]

const LEGAL_LINKS = [
  { to: '/#privacy', label: 'Privacy Policy' },
  { to: '/#terms',   label: 'Terms of Service' },
  { to: '/#contact', label: 'Contact Us' },
]

export default function StudentFooter() {
  return (
    <footer style={{
      background: '#0c1520',
      color: '#94a3b8',
    }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '52px 24px 28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 36, marginBottom: 48,
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                <span style={{
                  fontFamily: 'var(--s-font-display)', fontWeight: 800,
                  fontSize: 18, color: '#7dd3fc',
                }}>
                  Uyarvu Payanam
                </span>
                <span style={{
                  fontFamily: 'var(--s-font-display)', fontWeight: 600,
                  fontSize: 10, color: '#64748b',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  Unified Career Ecosystem
                </span>
              </div>
            </Link>
            <p style={{
              fontSize: 13, lineHeight: 1.7,
              color: '#64748b', maxWidth: 220, marginBottom: 20,
            }}>
              Empowering Tamil Nadu school students, college students, and graduates with transparent guidance.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#64748b', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}>
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 style={{
              fontFamily: 'var(--s-font-display)', fontWeight: 700,
              fontSize: 12, color: '#7dd3fc', marginBottom: 16,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Platform
            </h4>
            {PLATFORM_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', color: '#64748b',
                textDecoration: 'none', fontSize: 13, marginBottom: 10,
                transition: 'color 0.15s',
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Student */}
          <div>
            <h4 style={{
              fontFamily: 'var(--s-font-display)', fontWeight: 700,
              fontSize: 12, color: '#7dd3fc', marginBottom: 16,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Student
            </h4>
            {STUDENT_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', color: '#64748b',
                textDecoration: 'none', fontSize: 13, marginBottom: 10,
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div>
            <h4 style={{
              fontFamily: 'var(--s-font-display)', fontWeight: 700,
              fontSize: 12, color: '#7dd3fc', marginBottom: 16,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Resources
            </h4>
            {RESOURCE_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', color: '#64748b',
                textDecoration: 'none', fontSize: 13, marginBottom: 10,
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{
              fontFamily: 'var(--s-font-display)', fontWeight: 700,
              fontSize: 12, color: '#7dd3fc', marginBottom: 16,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Account
            </h4>
            {ACCOUNT_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', color: '#64748b',
                textDecoration: 'none', fontSize: 13, marginBottom: 10,
              }}>
                {l.label}
              </Link>
            ))}
            <h4 style={{
              fontFamily: 'var(--s-font-display)', fontWeight: 700,
              fontSize: 12, color: '#7dd3fc', marginTop: 20, marginBottom: 12,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              Legal
            </h4>
            {LEGAL_LINKS.map(l => (
              <Link key={l.to} to={l.to} style={{
                display: 'block', color: '#64748b',
                textDecoration: 'none', fontSize: 13, marginBottom: 8,
              }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 22, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 10,
        }}>
          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
            © {new Date().getFullYear()} Uyarvu Payanam. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
            Empowering Tamil Nadu's academic and career journey.
          </p>
        </div>
      </div>
    </footer>
  )
}
