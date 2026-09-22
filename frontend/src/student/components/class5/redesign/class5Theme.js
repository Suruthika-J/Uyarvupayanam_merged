// Shared visual tokens + tiny helpers for the Class 5 redesign.
// Mirrors the navy visual language already used across the student UI.

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

export const AXIS_LABELS = {
  logic: { label: 'Logic', emoji: '🧠' },
  creativity: { label: 'Creativity', emoji: '🎨' },
  empathy: { label: 'Empathy', emoji: '💛' },
  leadership: { label: 'Leadership', emoji: '📣' },
  focus: { label: 'Focus', emoji: '🎯' },
}

export const axisColor = (axis) =>
  ({ logic: '#2563eb', creativity: '#7c3aed', empathy: '#059669', leadership: '#ea580c', focus: '#d97706' }[axis] || C5.navy)

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