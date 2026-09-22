import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { AXIS_LABELS, C5, axisColor } from './class5Theme'

// Animated strength radar. Skills map is { logic, creativity, empathy, leadership, focus }.
export default function StrengthRadar({ skills, height = 300, showLegend = true }) {
  const data = Object.keys(AXIS_LABELS).map((key) => ({
    axis: AXIS_LABELS[key].label,
    value: Math.round(skills?.[key] ?? 40),
  }))

  return (
    <div style={{ width: '100%' }}>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke={C5.line} />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12, fontWeight: 800, fill: C5.muted, fontFamily: 'var(--s-font-display)' }} />
            <PolarRadiusAxis domain={[0, 100]} tickCount={5} axisLine={false} tick={false} />
            <Radar name="Strength" dataKey="value" stroke={C5.navy} fill={C5.navy} fillOpacity={0.32} strokeWidth={2.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {showLegend && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 6 }}>
          {Object.keys(AXIS_LABELS).map((key) => (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C5.muted }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: axisColor(key) }} />
              {AXIS_LABELS[key].label} · {Math.round(skills?.[key] ?? 40)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}