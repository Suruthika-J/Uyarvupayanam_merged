// Shared visual tokens + tiny helpers for the Class 5 redesign.
// Mirrors the navy visual language already used across the student UI.
// Icons come from Feather (react-icons/fi). Real photos come from Unsplash
// CDN URLs (stable) so the dashboard shows pictures instead of decorations.

import {
  FiCompass,
  FiUsers,
  FiGlobe,
  FiAward,
  FiBookOpen,
  FiCpu,
  FiHeart,
  FiMic,
  FiTarget,
  FiFeather,
  FiSun,
  FiPenTool,
  FiDollarSign,
  FiSunrise,
  FiTool,
  FiTerminal,
  FiGrid,
  FiShoppingCart,
  FiMessageSquare,
  FiLock,
  FiActivity,
  FiFlag,
  FiMap,
  FiCheck,
  FiCheckCircle,
  FiRefreshCw,
  FiPlay,
  FiRadio,
  FiFilm,
  FiStar,
  FiUsers as FiTeam,
  FiFileText,
  FiPrinter,
  FiMessageCircle,
  FiSmile,
  FiTrendingUp,
  FiX,
  FiDivide,
  FiAperture,
  FiStar as FiSparkle,
} from 'react-icons/fi'

export const C5 = {
  navy: '#0f4c75',
  navyDeep: '#083a5c',
  ink: '#1e293b',
  muted: '#5b6b80',
  faint: '#8ea0b4',
  line: '#eaf0f6',
  bg: '#ffffff',
  soft: '#f7fafc',
  radius: 24,
  radiusLg: 32,
  shadow: '0 10px 15px -3px rgba(0,0,0,0.02)',
  shadowLg: '0 18px 40px -12px rgba(15,76,117,0.18)',
}

export const WORLD_COLORS = {
  blue: '#2563eb',
  purple: '#7c3aed',
  gold: '#d97706',
  green: '#059669',
  orange: '#ea580c',
  red: '#dc2626',
  navy: C5.navy,
}

export const worldColor = (tag) => WORLD_COLORS[tag] || C5.navy

// Unsplash photos keyed by world/category (stable CDN ids, same as backend seeder).
const unsplash = (id) => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`

export const IMG = {
  "ocean-explorer": unsplash('photo-1507525428034-b723cf961d3e'),
  "story-weaver": unsplash('photo-1455390582262-044cdead277a'),
  "money-master": unsplash('photo-1554224155-6726b3ff858f'),
  "green-builder": unsplash('photo-1416879595882-3373a0480b5b'),
  "space-engineer": unsplash('photo-1517976487492-5750f3195933'),
  "community-doctor": unsplash('photo-1576091160399-112ba8d25d1d'),
  "code-wizard": unsplash('photo-1517694712202-14dd9538aa97'),
  festival: unsplash('photo-1492684223066-81342ee5ff30'),
  spaceweek: unsplash('photo-1446776877081-d402a2f4e0ee'),
  marine: unsplash('photo-1544551763-46a013bb70d5'),
  developer: unsplash('photo-1504610926078-a1611febcad3'),
  nurse: unsplash('photo-1576091160550-2173dba999ef'),
}

export const worldImage = (key, fallback = '') => IMG[key] || key || fallback

// Feather icon per career world (rendered inside photo cards / chips).
export const WORLD_ICONS = {
  "ocean-explorer": FiSun,
  "story-weaver": FiFeather,
  "money-master": FiDollarSign,
  "green-builder": FiSunrise,
  "space-engineer": FiTool,
  "community-doctor": FiHeart,
  "code-wizard": FiTerminal,
}

export const worldIcon = (key) => WORLD_ICONS[key] || FiMap

export const AXIS_LABELS = {
  logic: { label: 'Logic', icon: FiCpu },
  creativity: { label: 'Creativity', icon: FiFeather },
  empathy: { label: 'Empathy', icon: FiHeart },
  leadership: { label: 'Leadership', icon: FiMic },
  focus: { label: 'Focus', icon: FiTarget },
}

export const axisIcon = (axis) => AXIS_LABELS[axis]?.icon || FiActivity

export const axisColor = (axis) =>
  ({ logic: '#2563eb', creativity: '#7c3aed', empathy: '#059669', leadership: '#ea580c', focus: '#d97706' }[axis] || C5.navy)

export const CATEGORY_ICONS = {
  logic: FiGrid,
  creative: FiFeather,
  debate: FiMessageSquare,
  budgeting: FiShoppingCart,
  coding: FiCpu,
}

export const categoryIcon = (cat) => CATEGORY_ICONS[cat] || FiPlay

export const TAB_ICONS = {
  'adhikaram': FiFeather,
  'maths': FiDivide,
  'social': FiGlobe,
  'science': FiAperture,
  'scholarships': FiBookOpen,
}

export const ICONS = {
  activity: FiActivity,
  award: FiAward,
  flag: FiFlag,
  map: FiMap,
  check: FiCheck,
  checkCircle: FiCheckCircle,
  refresh: FiRefreshCw,
  play: FiPlay,
  radio: FiRadio,
  film: FiFilm,
  star: FiStar,
  team: FiTeam,
  lock: FiLock,
  fileText: FiFileText,
  printer: FiPrinter,
  messageCircle: FiMessageCircle,
  messageSquare: FiMessageSquare,
  smile: FiSmile,
  trendingUp: FiTrendingUp,
  sparkle: FiSparkle,
  compass: FiCompass,
  grid: FiGrid,
  penTool: FiPenTool,
  heart: FiHeart,
  mic: FiMic,
  close: FiX,
}

export function clampPct(v) {
  return Math.max(0, Math.min(100, Math.round(Number(v) || 0)))
}

export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function timeLeftLabel(endsAtIso, timeLeftMs) {
  const ms = timeLeftMs != null ? timeLeftMs : (new Date(endsAtIso).getTime() - Date.now())
  if (ms <= 0) return 'Ends today'
  const days = Math.floor(ms / 86400000)
  const hrs = Math.floor((ms % 86400000) / 3600000)
  return days >= 1 ? `${days}d ${hrs}h left` : `${Math.max(1, Math.round(ms / 3600000))}h left`
}