import React, { useState } from 'react'
import { useCollegeTheme, COLLEGE_THEMES } from '../../context/CollegeThemeContext'
import { useStudentAuth } from '../../context/StudentAuthContext'
import { useNavigate } from 'react-router-dom'
import {
  FiMoon, FiSun, FiMonitor, FiSettings, FiCheck,
  FiUser, FiLock, FiBell, FiLogOut, FiArrowRight, FiZap, FiLayout
} from 'react-icons/fi'

export default function CollegeSettingsPage() {
  const { theme, themeKey, setTheme, themes } = useCollegeTheme()
  const { student, logout } = useStudentAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)

  const handleThemeChange = (key) => {
    setTheme(key)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleLogout = () => {
    logout()
    navigate('/student/signin')
  }

  const isGamified = themeKey === 'gamified'

  return (
    <div style={{
      maxWidth: 760,
      margin: '0 auto',
      paddingBottom: 40,
      color: theme.text,
      fontFamily: theme.fontBody,
    }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 40, height: 40, borderRadius: theme.radiusMd,
            background: isGamified ? 'rgba(0,245,212,0.15)' : theme.primaryLight,
            color: theme.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: theme.accentGlow,
          }}>
            <FiSettings size={20} />
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: 24, fontWeight: 900,
              color: theme.text,
              fontFamily: theme.fontDisplay,
              letterSpacing: isGamified ? '0.04em' : '0',
            }}>
              {isGamified ? '⚙️ SETTINGS' : 'Settings'}
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: theme.text2 }}>
              Manage your college portal preferences
            </p>
          </div>
        </div>
      </div>

      {/* ── THEME SELECTOR ── */}
      <section style={{
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: theme.radiusLg,
        boxShadow: theme.cardShadow,
        padding: '24px 28px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <FiLayout color={theme.primary} size={16} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: theme.text }}>
            Portal Theme
          </h2>
          {saved && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: theme.primaryLight, color: theme.primary,
              fontSize: 11, fontWeight: 800, padding: '2px 10px',
              borderRadius: 20, marginLeft: 'auto',
            }}>
              <FiCheck size={11} /> Saved!
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: theme.text2, marginBottom: 20 }}>
          Choose how the college portal looks. Switch anytime.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {Object.values(themes).map((t) => {
            const isActive = themeKey === t.key
            return (
              <button
                key={t.key}
                onClick={() => handleThemeChange(t.key)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  padding: '20px 22px',
                  borderRadius: theme.radiusMd,
                  border: isActive
                    ? `2px solid ${theme.primary}`
                    : `2px solid ${theme.cardBorder}`,
                  background: isActive ? theme.primaryLight : theme.cardBg,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isActive ? theme.accentGlow : 'none',
                  textAlign: 'left',
                }}
              >
                {/* Mini Preview Mockup */}
                <div style={{
                  width: '100%', height: 80, borderRadius: 10, overflow: 'hidden',
                  border: `1px solid ${t.cardBorder}`,
                  background: t.sidebarBg,
                  display: 'flex',
                  position: 'relative',
                }}>
                  {/* Sidebar strip */}
                  <div style={{ width: 28, background: t.sidebarBg, borderRight: `1px solid ${t.sidebarBorder}`, padding: '6px 4px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[t.sidebarActiveItemBg, t.sidebarHoverBg, t.sidebarHoverBg, t.sidebarHoverBg].map((bg, i) => (
                      <div key={i} style={{ height: 4, borderRadius: 3, background: i === 0 ? t.sidebarActiveItemColor : t.sidebarInactiveColor, opacity: i === 0 ? 1 : 0.4 }} />
                    ))}
                  </div>
                  {/* Content area */}
                  <div style={{ flex: 1, background: t.contentBg, padding: '6px 8px' }}>
                    <div style={{ height: 5, width: '60%', borderRadius: 3, background: t.primary, marginBottom: 4 }} />
                    <div style={{ height: 4, width: '80%', borderRadius: 3, background: t.cardBorder, marginBottom: 3 }} />
                    <div style={{ height: 4, width: '45%', borderRadius: 3, background: t.cardBorder }} />
                    <div style={{ marginTop: 8, height: 20, borderRadius: 6, background: t.cardBg, border: `1px solid ${t.cardBorder}` }} />
                  </div>
                </div>

                {/* Theme Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 16 }}>{t.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: theme.text }}>{t.label}</span>
                    {isActive && (
                      <span style={{
                        marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%',
                        background: theme.primary, color: t.key === 'gamified' ? '#000' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <FiCheck size={11} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: theme.text2 }}>{t.description}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Quick Toggle */}
        <div style={{
          marginTop: 20, padding: '14px 18px', borderRadius: theme.radiusMd,
          background: isGamified ? 'rgba(247,37,133,0.08)' : theme.primaryLight,
          border: `1px solid ${isGamified ? 'rgba(247,37,133,0.25)' : theme.cardBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: theme.text }}>
              {isGamified ? '🎮 Gamified Mode Active' : '💼 Professional Mode Active'}
            </div>
            <div style={{ fontSize: 12, color: theme.text2, marginTop: 2 }}>
              {isGamified
                ? 'Dark neon theme with XP-style visuals'
                : 'Clean professional look, great for focused work'}
            </div>
          </div>
          <button
            onClick={() => handleThemeChange(themeKey === 'normal' ? 'gamified' : 'normal')}
            style={{
              padding: '8px 18px', borderRadius: theme.radiusMd, cursor: 'pointer',
              background: isGamified ? 'rgba(247,37,133,0.2)' : theme.primaryLight,
              border: `1px solid ${isGamified ? 'rgba(247,37,133,0.4)' : theme.primary}`,
              color: isGamified ? '#f72585' : theme.primary,
              fontWeight: 800, fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <FiZap size={13} />
            Switch to {themeKey === 'normal' ? 'Gamified' : 'Professional'}
          </button>
        </div>
      </section>

      {/* ── ACCOUNT SECTION ── */}
      <section style={{
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: theme.radiusLg,
        boxShadow: theme.cardShadow,
        padding: '24px 28px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <FiUser color={theme.primary} size={16} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: theme.text }}>
            Account
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: isGamified ? 'rgba(0,245,212,0.05)' : '#f8fafc', borderRadius: theme.radiusMd, marginBottom: 16 }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            background: isGamified ? 'rgba(0,245,212,0.2)' : theme.primaryLight,
            color: theme.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 20, flexShrink: 0,
            boxShadow: theme.accentGlow,
          }}>
            {student?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.text }}>{student?.name || 'Student'}</div>
            <div style={{ fontSize: 13, color: theme.text2 }}>{student?.email}</div>
            <div style={{ fontSize: 11, color: theme.primary, fontWeight: 700, marginTop: 2 }}>College Student</div>
          </div>
          <button
            onClick={() => navigate('/college/profile')}
            style={{
              marginLeft: 'auto', padding: '8px 14px',
              background: theme.primaryLight, color: theme.primary,
              border: `1px solid ${theme.primary}`,
              borderRadius: theme.radiusSm, fontSize: 12, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            View Profile <FiArrowRight size={12} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { icon: FiUser, label: 'Edit Academic Profile', action: () => navigate('/student/onboarding/college') },
            { icon: FiLock, label: 'Change Password', action: () => navigate('/student/forgot-password') },
            { icon: FiBell, label: 'Notification Preferences', action: () => navigate('/college/notifications') },
          ].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: theme.radiusSm,
                color: theme.text2, fontSize: 14, fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = theme.sidebarHoverBg}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Icon size={16} color={theme.text3} />
              {label}
              <FiArrowRight size={14} style={{ marginLeft: 'auto', color: theme.text3 }} />
            </button>
          ))}
        </div>
      </section>

      {/* ── DANGER ZONE ── */}
      <section style={{
        background: theme.cardBg,
        border: `1px solid ${isGamified ? 'rgba(247,37,133,0.2)' : '#fecaca'}`,
        borderRadius: theme.radiusLg,
        boxShadow: theme.cardShadow,
        padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FiLogOut color={theme.danger} size={16} />
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: theme.danger }}>
            Sign Out
          </h2>
        </div>
        <p style={{ fontSize: 13, color: theme.text2, marginBottom: 16 }}>
          You will be redirected to the login page. Your data and progress will be saved.
        </p>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 22px', borderRadius: theme.radiusMd, cursor: 'pointer',
            background: isGamified ? 'rgba(247,37,133,0.12)' : '#fef2f2',
            border: `1px solid ${theme.danger}`,
            color: theme.danger, fontWeight: 800, fontSize: 13,
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s ease',
          }}
        >
          <FiLogOut size={15} /> Sign Out of Portal
        </button>
      </section>
    </div>
  )
}
