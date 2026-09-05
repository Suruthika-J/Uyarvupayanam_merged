import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  FiArrowRight, FiCompass, FiFlag, FiTarget, FiTrendingUp, 
  FiHexagon, FiZap, FiBook, FiAward, FiStar, FiSearch, FiInfo 
} from 'react-icons/fi'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { SBadge, SBtn } from '../../components/ui'
import { CAREER_CLASS_CONFIGS } from './careerCatalog'

// Map icons to class levels
const CLASS_ICONS = {
  'class-5':  { icon: FiCompass, color: '#8b5cf6', bg: '#f5f3ff' },
  'class-8':  { icon: FiFlag,    color: '#f59e0b', bg: '#fffbeb' },
  'class-10': { icon: FiTarget,  color: '#10b981', bg: '#f0fdf4' },
  'class-12': { icon: FiTrendingUp, color: '#3b82f6', bg: '#eff6ff' },
}

function ProfessionalClassCard({ item, index }) {
  const [isHovered, setIsHovered] = useState(false)
  const meta = CLASS_ICONS[item.key] || CLASS_ICONS['class-5']
  const Icon = meta.icon

  return (
    <Link 
      to={`/student/${item.key.replace('-', '')}`} 
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        background: '#fff',
        borderRadius: 32,
        padding: '40px 32px',
        border: `1.5px solid ${isHovered ? meta.color : 'var(--s-border)'}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-8px)' : 'none',
        boxShadow: isHovered ? `0 20px 40px ${meta.color}15` : '0 4px 20px rgba(0,0,0,0.02)',
      }}>
        {/* Animated Background Element */}
        <div style={{
          position: 'absolute', top: -20, right: -20, width: 120, height: 120,
          borderRadius: '50%', background: meta.color, opacity: isHovered ? 0.05 : 0.02,
          transition: 'all 0.3s'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
           <div style={{ 
             width: 64, height: 64, borderRadius: 20, background: meta.bg, 
             color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
             boxShadow: isHovered ? `0 10px 20px ${meta.color}22` : 'none',
             transition: 'all 0.3s'
           }}>
              <Icon size={32} />
           </div>
           <SBadge color={item.badgeColor} style={{ padding: '6px 14px', fontSize: 13 }}>{item.title} Level</SBadge>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 24, color: 'var(--s-text)', margin: '0 0 12px' }}>
            {item.heading}
          </h2>
          <p style={{ margin: 0, fontSize: 16, color: 'var(--s-text3)', lineHeight: 1.7 }}>
            {item.summary}
          </p>
        </div>

        <div style={{ 
          marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingTop: 24, borderTop: '1px solid var(--s-border)'
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
             {[1,2,3].map(dot => (
               <div key={dot} style={{ width: 6, height: 6, borderRadius: 9, background: meta.color, opacity: dot === 1 ? 1 : 0.3 }} />
             ))}
          </div>
          <span style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, color: meta.color, 
            fontWeight: 800, fontFamily: 'var(--s-font-display)', fontSize: 15
          }}>
            Explore Guidance <FiArrowRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function CareersPage() {
  const { isAuthenticated } = useStudentAuth()
  const location = useLocation()
  const [search, setSearch] = useState('')

  return (
    <div className="student-root" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: 100 }}>
      {/* Premium Hero Section */}
      <section style={{ 
        padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        background: '#fff', borderBottom: '1px solid var(--s-border)'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #f59e0b)' }} />
        
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
          <SBadge color="purple" style={{ marginBottom: 20 }}>Career Roadmap Hub</SBadge>
          <h1 style={{ 
            fontFamily: 'var(--s-font-display)', fontWeight: 950, fontSize: 'clamp(40px, 6vw, 64px)', 
            color: 'var(--s-text)', margin: '0 0 20px', letterSpacing: '-0.05em', lineHeight: 1
          }}>
            Your Future <span style={{ color: 'var(--s-primary)' }}>Starts Here.</span>
          </h1>
          <p style={{ maxWidth: 720, margin: '0 auto 40px', color: 'var(--s-text3)', fontSize: 19, lineHeight: 1.7, fontWeight: 500 }}>
             Every student journey is unique. Select your current academic level to discover tailored career paths, skill-building activities, and future opportunities.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--s-text2)', fontWeight: 600 }}>
                <FiZap style={{ color: '#f59e0b' }} /> Verified Roadmaps
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--s-text2)', fontWeight: 600 }}>
                <FiHexagon style={{ color: '#8b5cf6' }} /> Skill Integration
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--s-text2)', fontWeight: 600 }}>
                <FiAward style={{ color: '#10b981' }} /> Scholarship Awareness
             </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section style={{ maxWidth: 1200, margin: '-40px auto 0', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {CAREER_CLASS_CONFIGS.map((item, index) => (
            <ProfessionalClassCard key={item.key} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* Extra Info / Call to Action */}
      {!isAuthenticated && (
        <section style={{ maxWidth: 1000, margin: '80px auto 0', padding: '0 24px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            borderRadius: 40,
            padding: '60px 40px',
            textAlign: 'center',
            color: '#fff',
            boxShadow: '0 30px 60px rgba(0,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', blur: '60px' }} />
            
            <FiStar size={48} color="#fbbf24" style={{ marginBottom: 24 }} fill="#fbbf24" />
            <h3 style={{ fontFamily: 'var(--s-font-display)', fontWeight: 900, fontSize: 32, marginBottom: 16 }}>
              Unlock Your Personalized Journey
            </h3>
            <p style={{ fontSize: 18, color: '#94a3b8', margin: '0 auto 32px', maxWidth: 600, lineHeight: 1.7 }}>
              Join thousands of students who are already tracking their progress and receiving custom career recommendations based on their unique interests.
            </p>
            <Link to="/student/signin" state={{ from: location.pathname }} style={{ textDecoration: 'none' }}>
              <SBtn size="lg" style={{ background: '#fff', color: '#0f172a', fontWeight: 900, padding: '16px 48px', borderRadius: 20 }}>
                Create Your Free Profile
              </SBtn>
            </Link>
          </div>
        </section>
      )}

      {/* Trust Quote / Footer Info */}
      <footer style={{ marginTop: 100, textAlign: 'center', padding: '40px 24px', borderTop: '1px solid var(--s-border)' }}>
         <p style={{ color: 'var(--s-text3)', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Empowering the next generation of leaders & creators.
         </p>
      </footer>
    </div>
  )
}
