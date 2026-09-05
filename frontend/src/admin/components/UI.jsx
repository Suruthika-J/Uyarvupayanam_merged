import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/* ── SBadge ── */
export function SBadge({ color, children, style }) {
  const map = {
    purple: { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
    gold:   { bg: 'rgba(245,158,11,0.12)',  color: '#d97706' },
    green:  { bg: 'rgba(34,197,94,0.12)',   color: '#16a34a' },
    blue:   { bg: 'rgba(59,130,246,0.12)',  color: '#2563eb' },
    red:    { bg: 'rgba(239,68,68,0.12)',   color: '#dc2626' },
    gray:   { bg: 'rgba(100,116,139,0.12)', color: '#64748b' },
  }
  const s = map[color] || map.gray
  return (
    <span style={{ 
      display: 'inline-block', padding: '4px 12px', borderRadius: '10px',
      fontSize: 12, fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap',
      fontFamily: 'Outfit, sans-serif', ...style 
    }}>
      {children}
    </span>
  )
}

/* ── SLoader ── */
export function SLoader({ size = 40 }) {
  return (
    <div style={{ display:'grid', placeItems:'center', padding:'40px 0', width:'100%' }}>
      <div style={{ width:size, height:size, border:'4px solid rgba(0,0,0,0.05)', borderTopColor:'var(--primary)',
        borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

/* ── SCard ── */
export function SCard({ children, style, hover }) {
  const [isHov, setHov] = useState(false)
  return (
    <div 
      style={{ 
        background: 'var(--surface)', border: '1.5px solid var(--border)', 
        borderRadius: 24, padding: 24, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hover && isHov ? 'translateY(-6px)' : 'none',
        boxShadow: hover && isHov ? '0 12px 30px rgba(0,0,0,0.08)' : '0 2px 8px rgba(0,0,0,0.02)',
        ...style 
      }}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
    >
      {children}
    </div>
  )
}

/* ── SBtn ── */
export function SBtn({ children, onClick, fullWidth, variant="primary", style, disabled, type="button" }) {
  const [hov, setHov] = useState(false)
  const isPrimary = variant === 'primary'
  
  const baseStyle = {
    background: isPrimary ? (hov ? 'var(--primary-d)' : 'var(--primary)') : (hov ? 'rgba(0,0,0,0.05)' : 'transparent'),
    color: isPrimary ? '#fff' : 'var(--text)',
    border: isPrimary ? 'none' : '1.5px solid var(--border)',
    borderRadius: 12, padding: '10px 20px', width: fullWidth ? '100%' : 'auto',
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 800,
    fontSize: 14, transition: 'all 0.15s', opacity: disabled ? 0.6 : 1,
    transform: hov && !disabled ? 'scale(1.02)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, ...style
  }

  return (
    <button 
      type={type} onClick={onClick} disabled={disabled}
      style={baseStyle}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </button>
  )
}

/* ── SEmpty ── */
export function SEmpty({ title, desc, icon }) {
  return (
    <div style={{ textAlign:'center', padding:60, background:'var(--surface2)', borderRadius:24, border:'1.5px dashed var(--border)' }}>
      <div style={{ fontSize:48, marginBottom:16, opacity:0.4 }}>{icon || '🔍'}</div>
      <h3 style={{ margin:'0 0 8px', color:'var(--text)' }}>{title || 'No data found'}</h3>
      <p style={{ margin:0, color:'var(--text3)', fontSize:14 }}>{desc || 'Try adjusting your filters or adding new content.'}</p>
    </div>
  )
}

/* ── Level Badge ── */
export function LevelBadge({ level }) {
  const colorMap = {
    '5th': 'purple',
    '8th': 'blue',
    '10th': 'gold',
    '12th': 'green',
    'CSE': 'blue',
    'ECE': 'green',
    'EEE': 'gold',
    'IT': 'purple',
    'AIDS': 'red',
    'Mechanical': 'gray',
    'Civil': 'gray',
  }
  return <SBadge color={colorMap[level] || 'gray'}>{level}</SBadge>
}

/* ── Legacy Mappings ── */
export function Card(props) { return <SCard {...props} /> }
export function PrimaryBtn(props) { return <SBtn {...props} /> }

/* ── Card Header ── */
export function CardHeader({ title, action, actionLabel = 'View All' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
      <h3 style={{ fontFamily:'Nunito', fontSize:16, fontWeight:900, color:'var(--text)' }}>{title}</h3>
      {action && <SBtn variant="ghost" onClick={action} style={{ padding:'4px 8px', fontSize:12 }}>{actionLabel}</SBtn>}
    </div>
  )
}

/* ── Progress Bar ── */
export function ProgressBar({ label, value, max, color, pct }) {
  const percent = pct !== undefined ? pct : Math.round((value / max) * 100)
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13 }}>
        <span style={{ fontWeight:700, color:'var(--text2)' }}>{label}</span>
        <span style={{ fontWeight:800, color }}>{pct !== undefined ? `${pct}%` : value}</span>
      </div>
      <div style={{ height:8, background:'var(--surface2)', borderRadius:20, overflow:'hidden', border:'1px solid var(--border)' }}>
        <div style={{ height:'100%', width:`${percent}%`, background:color, borderRadius:20, transition:'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </div>
    </div>
  )
}

/* ── Form Components ── */
export function FormGrid({ children }) { return <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>{children}</div> }
export function FormGroup({ label, full, children }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, gridColumn: full ? '1/-1' : undefined }}>
      <label style={{ fontSize:11, fontWeight:700, color:'var(--text3)', letterSpacing:'0.5px', textTransform:'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}
export function FormInput({ type='text', placeholder, as='input', name, value, onChange, disabled }) {
  const base = { width:'100%', background:'var(--surface2)', border:'1.5px solid var(--border)',
    color:'var(--text)', borderRadius:12, padding:'11px 16px', fontSize:14,
    fontFamily:'Outfit,sans-serif', outline:'none', transition:'border-color 0.15s' }
  if (as === 'textarea') return (
    <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      style={{ ...base, resize:'vertical', minHeight:100 }} onFocus={e => e.target.style.borderColor='var(--primary)'}
      onBlur={e => e.target.style.borderColor='var(--border)'} />
  )
  if (as === 'select') return (
    <select name={name} value={value} onChange={onChange} disabled={disabled} style={base}>
       {placeholder && <option value="">{placeholder}</option>}
       {arguments[0].children}
    </select>
  )
  return (
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      style={base} onFocus={e => e.target.style.borderColor='var(--primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
  )
}
export function FormActions({ onClose, onSave, saveDisabled, saveText }) {
  return (
    <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:32 }}>
      <SBtn variant="outline" onClick={onClose}>Cancel</SBtn>
      <SBtn onClick={onSave} disabled={saveDisabled}>{saveText || 'Save Changes'}</SBtn>
    </div>
  )
}

/* ── Modal ── */
export function Modal({ title, onClose, children, maxWidth = 650 }) {
  useEffect(() => {
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
  return createPortal(
    <div style={{ position:'fixed', top:0, left:0, width:'100vw', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.6)', zIndex:9999, padding:20 }}>
      <div style={{ width:maxWidth, maxWidth:'100%', maxHeight:'90vh', overflowY:'auto', borderRadius:24, padding:32, background:'var(--surface)', border:'1.5px solid var(--border)', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', animation:'fadeUp 0.3s' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <h3 style={{ fontFamily:'Nunito', fontSize:22, fontWeight:900, color:'var(--text)' }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:24, cursor:'pointer', color:'var(--text3)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>, document.body
  )
}

/* ── Data Display ── */
export function DataTable({ columns, data, renderRow }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr style={{ borderBottom:'1.5px solid var(--border)' }}>
            {columns.map(c => <th key={c} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:800, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px' }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>{data.map((row, i) => renderRow(row, i))}</tbody>
      </table>
    </div>
  )
}
export function TR({ children, style }) { return <tr style={{ borderBottom:'1px solid var(--border)', transition:'background 0.2s', ...style }}>{children}</tr> }
export function TD({ children, style }) { return <td style={{ padding:'16px', fontSize:14, ...style }}>{children}</td> }

/* ── Misc ── */
export function Toggle({ on, onClick }) {
  return (
    <div onClick={onClick} style={{ width:44, height:24, borderRadius:20, cursor:'pointer', position:'relative', background: on ? 'var(--primary)' : 'var(--border)', transition:'0.2s' }}>
      <div style={{ position:'absolute', width:18, height:18, background:'#fff', borderRadius:'50%', top:3, left: on ? 23 : 3, transition:'0.2s' }} />
    </div>
  )
}
export function StatCard({ icon, value, label, color }) {
    return (
        <SCard style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -16, bottom: -16, width: 80, height: 80, borderRadius: '50%', background: color, opacity: 0.1 }} />
            <div style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 950, color, lineHeight:1.2 }}>{value}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 700, marginTop:4 }}>{label}</div>
        </SCard>
    )
}
export function ActionBtn({ children, danger, onClick, style }) {
    const [h, sH] = useState(false)
    return <button onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{ border:'1px solid var(--border)', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:700, cursor:'pointer', background: h ? (danger?'#fee2e2':'var(--primary-l)') : 'transparent', color: h ? (danger?'#b91c1c':'var(--primary)') : 'var(--text2)', transition:'0.15s', ...style }}>{children}</button>
}
export function FiltersRow({ children }) { return <div style={{ display:'flex', gap:12, marginBottom:24, alignItems:'center' }}>{children}</div> }
export function SearchInput({ value, onChange, placeholder }) {
    return <input value={value} onChange={onChange} placeholder={placeholder || "Search..."} style={{ background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:12, padding:'10px 16px', fontSize:14, minWidth:280, outline:'none', fontFamily:'Outfit' }} />
}
export function FilterSelect({ children, value, onChange }) {
    return <select value={value} onChange={onChange} style={{ background:'var(--surface)', border:'1.5px solid var(--border)', borderRadius:12, padding:'10px 16px', fontSize:14, cursor:'pointer', outline:'none', fontFamily:'Outfit' }}>{children}</select>
}
export function ActivityDot({ color }) { return <div style={{ width:10, height:10, borderRadius:'50%', background:color, flexShrink:0 }} /> }

/* ── SAlert ── */
export function SAlert({ type = 'info', children, onClose, style }) {
  const map = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#d97706' },
    info:    { bg: 'rgba(59,130,246,0.1)', border: '#93c5fd', text: '#2563eb' },
  }
  const s = map[type] || map.info
  return (
    <div style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      borderRadius: 12, padding: '12px 16px', fontSize: 14, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, ...style
    }}>
      <span>{children}</span>
      {onClose && <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'inherit', fontSize:18 }}>✕</button>}
    </div>
  )
}

/* ── SInput & SSelect ── */
export function SInput({ label, ...props }) {
  return (
    <FormGroup label={label}>
      <FormInput {...props} />
    </FormGroup>
  )
}

export function SSelect({ label, children, ...props }) {
  return (
    <FormGroup label={label}>
      <FormInput as="select" {...props}>
        {children}
      </FormInput>
    </FormGroup>
  )
}
