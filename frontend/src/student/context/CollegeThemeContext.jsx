import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'

const CollegeThemeContext = createContext(null)

// ── THEME DEFINITIONS ──────────────────────────────────────────────────────────
export const COLLEGE_THEMES = {
  normal: {
    key: 'normal',
    label: 'Professional',
    emoji: '💼',
    description: 'Clean, corporate white & sky-blue design',
    // Layout colours
    sidebarBg: '#0f2044',
    sidebarBorder: 'rgba(255,255,255,0.07)',
    sidebarActiveItemBg: '#1a6fc4',
    sidebarActiveItemColor: '#ffffff',
    sidebarInactiveColor: '#94a3b8',
    sidebarSectionLabel: '#475569',
    sidebarAiBadgeBg: '#1d4ed8',
    sidebarLogoBg: '#1a6fc4',
    headerBg: '#ffffff',
    headerBorder: '#e2e8f0',
    headerTitleColor: '#334155',
    headerCtaBg: '#1a6fc4',
    headerCtaColor: '#ffffff',
    // Content area
    contentBg: '#f1f5f9',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    cardShadow: '0 2px 12px rgba(0,0,0,0.06)',
    text: '#1e293b',
    text2: '#475569',
    text3: '#94a3b8',
    primary: '#1a6fc4',
    primaryLight: '#dbeafe',
    accent: '#0ea5e9',
    accentGlow: 'none',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    // Hero gradient
    heroBg: 'linear-gradient(135deg, #1a6fc4 0%, #0ea5e9 100%)',
    heroText: '#ffffff',
    heroSubText: '#bfdbfe',
    // Stat card bg
    statCardBg: 'rgba(255,255,255,0.15)',
    // Sidebar item hover
    sidebarHoverBg: 'rgba(255,255,255,0.06)',
    // border radius tokens
    radiusSm: '8px',
    radiusMd: '14px',
    radiusLg: '20px',
    // Font
    fontDisplay: '"Inter", sans-serif',
    fontBody: '"Inter", sans-serif',
  },
  gamified: {
    key: 'gamified',
    label: 'Gamified',
    emoji: '🎮',
    description: 'Dark neon theme — cyberpunk academic adventure',
    // Layout colours
    sidebarBg: '#080d1f',
    sidebarBorder: 'rgba(0,245,212,0.10)',
    sidebarActiveItemBg: 'rgba(0,245,212,0.15)',
    sidebarActiveItemColor: '#00f5d4',
    sidebarInactiveColor: '#64748b',
    sidebarSectionLabel: '#1e40af',
    sidebarAiBadgeBg: '#4f46e5',
    sidebarLogoBg: '#00f5d4',
    headerBg: '#0a0f1e',
    headerBorder: 'rgba(0,245,212,0.12)',
    headerTitleColor: '#00f5d4',
    headerCtaBg: 'linear-gradient(90deg,#00f5d4,#f72585)',
    headerCtaColor: '#000',
    // Content area
    contentBg: '#0a0f1e',
    cardBg: '#0d1535',
    cardBorder: 'rgba(0,245,212,0.12)',
    cardShadow: '0 4px 24px rgba(0,245,212,0.06)',
    text: '#e2e8f0',
    text2: '#94a3b8',
    text3: '#475569',
    primary: '#00f5d4',
    primaryLight: 'rgba(0,245,212,0.12)',
    accent: '#f72585',
    accentGlow: '0 0 20px rgba(0,245,212,0.3)',
    success: '#00f5d4',
    warning: '#fbbf24',
    danger: '#f72585',
    // Hero gradient
    heroBg: 'linear-gradient(135deg, #0f2044 0%, #080d1f 100%)',
    heroText: '#00f5d4',
    heroSubText: '#94a3b8',
    // Stat card bg
    statCardBg: 'rgba(0,245,212,0.08)',
    // Sidebar item hover
    sidebarHoverBg: 'rgba(0,245,212,0.06)',
    // border radius tokens
    radiusSm: '6px',
    radiusMd: '12px',
    radiusLg: '18px',
    // Font
    fontDisplay: '"Orbitron","Inter",sans-serif',
    fontBody: '"Inter",sans-serif',
  },
}

export function CollegeThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem('collegePortalTheme') || 'normal'
  })

  const theme = useMemo(() => COLLEGE_THEMES[themeKey] || COLLEGE_THEMES.normal, [themeKey])

  const toggleTheme = () => {
    const next = themeKey === 'normal' ? 'gamified' : 'normal'
    setThemeKey(next)
    localStorage.setItem('collegePortalTheme', next)
  }

  const setTheme = (key) => {
    if (COLLEGE_THEMES[key]) {
      setThemeKey(key)
      localStorage.setItem('collegePortalTheme', key)
    }
  }

  // Apply CSS variables to the document body when theme changes
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-college-theme', themeKey)
    // Inject CSS custom props
    root.style.setProperty('--cp-bg', theme.contentBg)
    root.style.setProperty('--cp-card', theme.cardBg)
    root.style.setProperty('--cp-border', theme.cardBorder)
    root.style.setProperty('--cp-text', theme.text)
    root.style.setProperty('--cp-text2', theme.text2)
    root.style.setProperty('--cp-text3', theme.text3)
    root.style.setProperty('--cp-primary', theme.primary)
    root.style.setProperty('--cp-primary-l', theme.primaryLight)
    root.style.setProperty('--cp-accent', theme.accent)
    root.style.setProperty('--cp-shadow', theme.cardShadow)
    root.style.setProperty('--cp-radius-sm', theme.radiusSm)
    root.style.setProperty('--cp-radius', theme.radiusMd)
    root.style.setProperty('--cp-radius-lg', theme.radiusLg)
    root.style.setProperty('--cp-success', theme.success)
    root.style.setProperty('--cp-warning', theme.warning)
    root.style.setProperty('--cp-danger', theme.danger)
    root.style.setProperty('--cp-font-display', theme.fontDisplay)
    root.style.setProperty('--cp-font-body', theme.fontBody)
  }, [themeKey, theme])

  return (
    <CollegeThemeContext.Provider value={{ theme, themeKey, toggleTheme, setTheme, themes: COLLEGE_THEMES }}>
      {children}
    </CollegeThemeContext.Provider>
  )
}

export function useCollegeTheme() {
  const ctx = useContext(CollegeThemeContext)
  if (!ctx) {
    // Safe fallback outside provider
    return { theme: COLLEGE_THEMES.normal, themeKey: 'normal', toggleTheme: () => {}, setTheme: () => {}, themes: COLLEGE_THEMES }
  }
  return ctx
}
