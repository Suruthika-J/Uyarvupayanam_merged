import React, { useEffect, useState } from 'react'
import { FiClipboard, FiTrash2, FiPlus } from 'react-icons/fi'
import applicationService from '../../../services/applicationService'

const STATUSES = ['Interested', 'Planning to Apply', 'Applied', 'Exam / Interview Scheduled', 'Selected', 'Rejected']

export default function GraduateApplicationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', organization: '', location: '', status: 'Interested', notes: '' })

  const load = async () => {
    try {
      setLoading(true)
      const res = await applicationService.list(statusFilter || undefined)
      if (res.success) setItems(res.data || [])
    } catch {
      setError('Could not load your application tracker.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [statusFilter])

  const update = async (id, patch) => {
    try {
      const res = await applicationService.update(id, patch)
      if (res.success) setItems((prev) => prev.map((i) => (i._id === id ? { ...i, ...res.data } : i)))
    } catch { setError('Update failed.') }
  }

  const remove = async (id) => {
    try {
      await applicationService.remove(id)
      setItems((prev) => prev.filter((i) => i._id !== id))
    } catch { setError('Delete failed.') }
  }

  const addPrivate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required.')
    try {
      const res = await applicationService.create({ ...form, contentType: 'PrivateJob' })
      if (res.success) {
        setItems((prev) => [res.data, ...prev])
        setForm({ title: '', organization: '', location: '', status: 'Interested', notes: '' })
        setShowForm(false)
        setError('')
      }
    } catch { setError('Could not add the record.') }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>My Applications</h1>
        <button onClick={() => setShowForm((s) => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <FiPlus size={14} /> Track a job manually
        </button>
      </div>

      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: 10, padding: 12 }}>{error}</div>}

      {showForm && (
        <form onSubmit={addPrivate} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 18, display: 'grid', gap: 10 }}>
          <input placeholder="Job title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={input} />
          <input placeholder="Company / organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} style={input} />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={input} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={input}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <textarea placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ ...input, minHeight: 70 }} />
          <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>Save record</button>
        </form>
      )}

      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...input, maxWidth: 260 }}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s}>{s}</option>)}
      </select>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ background: '#fff', border: '1px dashed #e2e8f0', borderRadius: 16, padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Nothing tracked yet. Use the "Track" button on any government exam, or add a private job manually.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div key={item._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>{item.title}</h3>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{[item.organization, item.location, item.contentType === 'PrivateJob' ? 'Private' : 'Government'].filter(Boolean).join(' · ')}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={item.status} onChange={(e) => update(item._id, { status: e.target.value })} style={{ ...input, padding: '7px 10px' }}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(item._id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
              <textarea
                defaultValue={item.notes || ''}
                onBlur={(e) => { if (e.target.value !== (item.notes || '')) update(item._id, { notes: e.target.value }) }}
                placeholder="Add notes… (saved when you click away)"
                style={{ ...input, marginTop: 10, minHeight: 54 }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const input = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, boxSizing: 'border-box' }
