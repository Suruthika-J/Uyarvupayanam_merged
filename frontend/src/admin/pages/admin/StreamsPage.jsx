import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  FiPlus, FiEdit3, FiTrash2, FiLayers, FiEye, FiEyeOff, FiPackage,
  FiCheckCircle, FiMove, FiUpload, FiX,
} from 'react-icons/fi'
import { streamService } from '../../../services/streamService'
import {
  STREAM_CATEGORIES, STREAM_THEMES, STREAM_THEME_KEYS,
  DIPLOMA_SUB_CATEGORIES, DIPLOMA_SUB_CATEGORY_LABELS,
} from '../../../constants/streamThemes'
import StreamBackdrop from '../../../student/components/streams/StreamBackdrop'
import {
  SCard, SBtn, SBadge, SLoader, SEmpty, StatCard, TR, TD,
  ActionBtn, FiltersRow, SearchInput, FilterSelect, Modal, FormGroup,
  FormInput, FormActions, FormGrid, Toggle, SAlert,
} from '../../components/UI'

const EMPTY_FORM = {
  category: 'science',
  subCategory: '',
  code: '',
  groupName: '',
  subjects: [],
  bestFor: '',
  progression: [],
  backgroundTheme: 'science-lab',
  backgroundImageUrl: '',
  order: 1,
  isPublished: true,
}

/* ── Tag input (subjects / progression) ─────────────────────────────── */
function TagInput({ tags, onChange, placeholder }) {
  const [text, setText] = useState('')
  const add = (val) => {
    const t = val.trim().replace(/,+$/g, '')
    if (t && !tags.includes(t)) onChange([...tags, t])
  }
  return (
    <div>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {tags.map((t) => (
            <span
              key={t}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--primary-l)', color: 'var(--primary)',
                borderRadius: 8, padding: '4px 10px', fontSize: 12.5, fontWeight: 700,
              }}
            >
              {t}
              <button
                type="button"
                onClick={() => onChange(tags.filter((x) => x !== t))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'grid' }}
                aria-label={`Remove ${t}`}
              >
                <FiX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add(text)
            setText('')
          } else if (e.key === 'Backspace' && !text && tags.length) {
            onChange(tags.slice(0, -1))
          }
        }}
        onBlur={() => { add(text); setText('') }}
        placeholder={placeholder || 'Type and press Enter…'}
        style={{
          width: '100%', background: 'var(--surface2)', border: '1.5px solid var(--border)',
          color: 'var(--text)', borderRadius: 12, padding: '11px 16px', fontSize: 14,
          fontFamily: 'Outfit,sans-serif', outline: 'none',
        }}
      />
    </div>
  )
}

export default function StreamsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterSub, setFilterSub] = useState('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [importOpen, setImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const importFileRef = useRef(null)

  const [toasts, setToasts] = useState([])
  const fileInputRef = useRef(null)

  const toast = (type, msg) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, type, msg }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await streamService.getAdminList()
      if (res.success) setData(res.data)
    } catch {
      toast('error', 'Failed to load streams.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  /* ── Derived lists ─────────────────────────────────────────────────── */
  const catCounts = useMemo(() => {
    return data.reduce((acc, s) => { acc[s.category] = (acc[s.category] || 0) + 1; return acc }, {})
  }, [data])

  const scopeStreams = useMemo(() => {
    return data.filter((s) => {
      const matchesCat = filterCat === 'all' || s.category === filterCat
      if (!matchesCat) return false
      if (filterCat === 'diploma' && filterSub !== 'all') return s.subCategory === filterSub
      return true
    }).sort((a, b) => a.order - b.order)
  }, [data, filterCat, filterSub])

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return scopeStreams
    return scopeStreams.filter((s) =>
      s.groupName.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) ||
      (s.bestFor || '').toLowerCase().includes(q)
    )
  }, [scopeStreams, search])

  const stats = useMemo(() => ({
    total: data.length,
    published: data.filter((s) => s.isPublished).length,
    hidden: data.filter((s) => !s.isPublished).length,
  }), [data])

  /* ── Form helpers ──────────────────────────────────────────────────── */
  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item._id)
    setForm({
      category: item.category,
      subCategory: (item.subCategory || '').trim(),
      code: item.code,
      groupName: item.groupName,
      subjects: [...(item.subjects || [])],
      bestFor: item.bestFor || '',
      progression: [...(item.progression || [])],
      backgroundTheme: item.backgroundTheme || 'science-lab',
      backgroundImageUrl: item.backgroundImageUrl || '',
      order: item.order ?? 1,
      isPublished: !!item.isPublished,
    })
    setModalOpen(true)
  }

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    const payload = {
      category: form.category,
      subCategory: form.category === 'diploma' ? form.subCategory : null,
      code: form.code,
      groupName: form.groupName,
      subjects: form.subjects,
      bestFor: form.bestFor,
      progression: form.progression,
      backgroundTheme: form.backgroundTheme,
      backgroundImageUrl: form.backgroundImageUrl,
      order: Number(form.order),
      isPublished: form.isPublished,
    }
    if (!payload.groupName || !payload.code) return toast('error', 'Group name and code are required.')
    if (payload.category === 'diploma' && !payload.subCategory) return toast('error', 'Sub-category is required for Diploma.')
    if (!payload.subjects.length) return toast('error', 'Add at least one subject.')
    if (!payload.progression.length) return toast('error', 'Add at least one progression option.')

    setSaving(true)
    try {
      if (editingId) {
        const res = await streamService.update(editingId, payload)
        if (res.success) toast('success', 'Stream updated.')
      } else {
        const res = await streamService.create(payload)
        if (res.success) toast('success', 'Stream created.')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast('error', err?.response?.data?.error || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async (item) => {
    try {
      const res = await streamService.togglePublish(item._id)
      if (res.success) {
        toast('success', `"${item.groupName}" is now ${res.data.isPublished ? 'published' : 'hidden'}.`)
        fetchData()
      }
    } catch {
      toast('error', 'Toggle failed.')
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      const res = await streamService.remove(deleteTarget._id)
      if (res.success) {
        toast('success', 'Stream deleted.')
        setDeleteTarget(null)
        fetchData()
      }
    } catch {
      toast('error', 'Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const handleUploadTheme = async (file) => {
    try {
      const res = await streamService.uploadThemeImage(file, form.backgroundTheme)
      if (res.success) {
        setField('backgroundImageUrl', res.data.url)
        toast('success', 'Theme image uploaded.')
      }
    } catch {
      toast('error', 'Upload failed. Use a smaller image.')
    }
  }

  const handleImportFile = (file) => {
    const reader = new FileReader()
    reader.onload = () => setImportText(String(reader.result || ''))
    reader.readAsText(file)
  }

  const handleBulkImport = async () => {
    let items
    try {
      items = JSON.parse(importText)
    } catch {
      return toast('error', 'Invalid JSON — paste a valid array of stream records.')
    }
    if (!Array.isArray(items) || items.length === 0) {
      return toast('error', 'JSON must be a non-empty array of stream records.')
    }

    setImporting(true)
    setImportResult(null)
    try {
      const res = await streamService.bulkImport(items)
      if (res.success) {
        setImportResult(res)
        toast('success', `Imported ${res.inserted} stream${res.inserted === 1 ? '' : 's'}, skipped ${res.skipped}.`)
        fetchData()
      }
    } catch (err) {
      toast('error', err?.response?.data?.error || 'Bulk import failed.')
    } finally {
      setImporting(false)
    }
  }

  /* ── Drag-to-reorder (within the current filter scope) ─────────────── */
  const dragIdRef = useRef(null)

  const handleDrop = async (targetId) => {
    const fromId = dragIdRef.current
    dragIdRef.current = null
    if (!fromId || fromId === targetId) return
    const fromIdx = scopeStreams.findIndex((s) => s._id === fromId)
    const toIdx = scopeStreams.findIndex((s) => s._id === targetId)
    if (fromIdx < 0 || toIdx < 0) return
    const reordered = [...scopeStreams]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, moved)
    const payload = reordered.map((s, i) => ({ id: s._id, order: i + 1 }))
    try {
      const res = await streamService.bulkReorder(payload)
      if (res.success) {
        toast('success', 'Order updated.')
        fetchData()
      }
    } catch (err) {
      toast('error', err?.response?.data?.error || 'Reorder failed.')
    }
  }

  /* ── Render ────────────────────────────────────────────────────────── */
  if (loading && data.length === 0) return <SLoader />

  return (
    <div className="admin-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>Streams After 10th</h1>
          <p style={{ color: 'var(--text3)', fontSize: 14 }}>Manage the 166 HSC groups, vocational diploma & polytechnic courses shown on the Class 10 page.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <SBtn variant="outline" onClick={() => window.open('/student/class10?section=Streams', '_blank')}>
            <FiEye /> Student View
          </SBtn>
          <SBtn variant="outline" onClick={() => setImportOpen(true)}>
            <FiUpload /> Bulk Import JSON
          </SBtn>
          <SBtn onClick={openCreate}>
            <FiPlus /> Add New Stream
          </SBtn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 20, marginBottom: 32 }}>
        <StatCard icon={<FiLayers color="#7c3aed" />} value={stats.total} label="Total Streams" color="#7c3aed" />
        <StatCard icon={<FiCheckCircle color="#16a34a" />} value={stats.published} label="Published" color="#16a34a" />
        <StatCard icon={<FiEyeOff color="#f59e0b" />} value={stats.hidden} label="Hidden" color="#f59e0b" />
        <StatCard icon={<FiPackage color="#0284c7" />} value={Object.keys(catCounts).length} label="Categories" color="#0284c7" />
      </div>

      {/* Category filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {[{ key: 'all', label: 'All' }, ...STREAM_CATEGORIES.filter((c) => c.key !== 'all')].map((c) => (
          <button
            key={c.key}
            onClick={() => { setFilterCat(c.key); setFilterSub('all') }}
            style={{
              padding: '9px 18px', borderRadius: 99, cursor: 'pointer',
              background: filterCat === c.key ? '#16A34A' : '#fff',
              color: filterCat === c.key ? '#fff' : '#475569',
              border: `1.5px solid ${filterCat === c.key ? '#16A34A' : '#e2e8f0'}`,
              fontWeight: 800, fontSize: 13, transition: 'all 0.18s',
            }}
          >
            {c.label}
            {(catCounts[c.key] || 0) > 0 && (
              <span style={{ marginLeft: 7, opacity: 0.8, fontSize: 11 }}>{catCounts[c.key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <FiltersRow>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search group name, code…" />
        {filterCat === 'diploma' && (
          <FilterSelect value={filterSub} onChange={(e) => setFilterSub(e.target.value)}>
            <option value="all">All Diploma Sub-Categories</option>
            {DIPLOMA_SUB_CATEGORIES.filter((c) => c.key !== 'all-diploma').map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </FilterSelect>
        )}
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text3)', fontWeight: 700 }}>
          {filteredData.length} shown · drag ⠿ rows to reorder
        </div>
      </FiltersRow>

      {/* Table */}
      <SCard style={{ padding: 0, overflow: 'hidden' }}>
        {filteredData.length === 0 ? (
          <div style={{ padding: 60 }}>
            <SEmpty icon={<FiPackage size={40} />} title="No streams found" desc="Try another category or add a new stream." />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                  {['Drag', 'Order', 'Code', 'Group Name', 'Category', 'Sub-Category', 'Status', 'Actions'].map((c) => (
                    <th key={c} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <TR
                    key={item._id}
                    draggable
                    onDragStart={(e) => { dragIdRef.current = item._id; e.dataTransfer.effectAllowed = 'move' }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(item._id)}
                    style={{ cursor: 'grab' }}
                  >
                    <TD>
                      <FiMove size={15} style={{ color: '#94a3b8' }} />
                    </TD>
                    <TD>
                      <SBadge color="gray">#{item.order}</SBadge>
                    </TD>
                    <TD><span style={{ fontWeight: 800, color: 'var(--primary)' }}>{item.code}</span></TD>
                    <TD>
                      <div style={{ fontWeight: 800, maxWidth: 280 }}>{item.groupName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                        {item.subjects.slice(0, 3).join(' · ')}{item.subjects.length > 3 ? ' …' : ''}
                      </div>
                    </TD>
                    <TD>
                      <SBadge color={item.category === 'polytechnic' ? 'blue' : item.category === 'science' ? 'blue' : item.category === 'commerce' ? 'green' : item.category === 'arts' ? 'purple' : 'gold'}>
                        {item.category}
                      </SBadge>
                    </TD>
                    <TD style={{ fontSize: 13, color: 'var(--text2)' }}>
                      {item.category === 'diploma' ? (DIPLOMA_SUB_CATEGORY_LABELS[item.subCategory] || item.subCategory) : '—'}
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Toggle on={!!item.isPublished} onClick={() => handleTogglePublish(item)} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: item.isPublished ? '#16a34a' : '#94a3b8' }}>
                          {item.isPublished ? 'Live' : 'Hidden'}
                        </span>
                      </div>
                    </TD>
                    <TD>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <ActionBtn onClick={() => openEdit(item)}>
                          <FiEdit3 size={13} /> Edit
                        </ActionBtn>
                        <ActionBtn danger onClick={() => setDeleteTarget(item)}>
                          <FiTrash2 size={13} /> Delete
                        </ActionBtn>
                      </div>
                    </TD>
                  </TR>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SCard>

      {/* ── Add / Edit modal ── */}
      {modalOpen && (
        <Modal
          title={editingId ? 'Edit Stream' : 'Add New Stream'}
          onClose={() => setModalOpen(false)}
          maxWidth={760}
        >
          <FormGrid>
            <FormGroup label="Category">
              <FormInput
                as="select"
                name="category"
                value={form.category}
                onChange={(e) => setField('category', e.target.value)}
              >
                {STREAM_CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                  <option key={c.key} value={c.key} style={{ textTransform: 'capitalize' }}>{c.label}</option>
                ))}
              </FormInput>
            </FormGroup>

            {form.category === 'diploma' ? (
              <FormGroup label="Sub-Category (required for Diploma)">
                <FormInput
                  as="select"
                  name="subCategory"
                  value={form.subCategory}
                  onChange={(e) => setField('subCategory', e.target.value)}
                >
                  <option value="">Select sub-category…</option>
                  {DIPLOMA_SUB_CATEGORIES.filter((c) => c.key !== 'all-diploma').map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </FormInput>
              </FormGroup>
            ) : (
              <FormGroup label="Sub-Category">
                <FormInput as="select" name="subCategory" value="" disabled>
                  <option value="">N/A for {form.category}</option>
                </FormInput>
              </FormGroup>
            )}

            <FormGroup label="Group Code">
              <FormInput name="code" value={form.code} onChange={(e) => setField('code', e.target.value)} placeholder="e.g. 103" />
            </FormGroup>

            <FormGroup label="Group Name">
              <FormInput name="groupName" value={form.groupName} onChange={(e) => setField('groupName', e.target.value)} placeholder="e.g. Physics / Chemistry / Biology / Mathematics" />
            </FormGroup>

            <FormGroup label="Best For">
              <FormInput
                as="textarea"
                name="bestFor"
                value={form.bestFor}
                onChange={(e) => setField('bestFor', e.target.value)}
                placeholder="Who is this group best suited for?"
              />
            </FormGroup>

            <FormGroup label="Display Order (within category)">
              <FormInput type="number" name="order" value={form.order} onChange={(e) => setField('order', e.target.value)} />
            </FormGroup>

            <FormGroup label="Subjects" full>
              <TagInput
                tags={form.subjects}
                onChange={(v) => setField('subjects', v)}
                placeholder="Type a subject and press Enter, e.g. Physics"
              />
            </FormGroup>

            <FormGroup label="Progression / What's Next" full>
              <TagInput
                tags={form.progression}
                onChange={(v) => setField('progression', v)}
                placeholder="Type a next step and press Enter, e.g. B.Sc Nursing"
              />
            </FormGroup>

            <FormGroup label="Background Theme">
              <FormInput
                as="select"
                name="backgroundTheme"
                value={form.backgroundTheme}
                onChange={(e) => setField('backgroundTheme', e.target.value)}
              >
                {STREAM_THEME_KEYS.map((key) => (
                  <option key={key} value={key}>{STREAM_THEMES[key].label}</option>
                ))}
              </FormInput>
            </FormGroup>

            <FormGroup label="Published">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8 }}>
                <Toggle
                  on={form.isPublished}
                  onClick={() => setField('isPublished', !form.isPublished)}
                />
                <span style={{ fontSize: 13, fontWeight: 700, color: form.isPublished ? '#16a34a' : '#94a3b8' }}>
                  {form.isPublished ? 'Visible to students' : 'Hidden from students'}
                </span>
              </div>
            </FormGroup>

            {/* Theme preview + optional custom upload */}
            <FormGroup label="Theme Preview" full>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: 220, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                  {form.backgroundImageUrl ? (
                    <img src={form.backgroundImageUrl} alt="theme" style={{ width: '100%', height: 84, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <StreamBackdrop themeKey={form.backgroundTheme} height={84} />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text3)' }}>
                    {STREAM_THEMES[form.backgroundTheme]?.label || form.backgroundTheme} · auto-generated backdrop
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <SBtn variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <FiUpload size={13} /> Upload custom image
                    </SBtn>
                    {form.backgroundImageUrl && (
                      <SBtn variant="outline" onClick={() => setField('backgroundImageUrl', '')}>
                        <FiX size={13} /> Clear
                      </SBtn>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0]
                      if (file) handleUploadTheme(file)
                      e.target.value = ''
                    }}
                  />
                </div>
              </div>
            </FormGroup>
          </FormGrid>

          <FormActions
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            saveDisabled={saving}
            saveText={saving ? 'Saving…' : editingId ? 'Update Stream' : 'Create Stream'}
          />
        </Modal>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <Modal title="Delete Stream" onClose={() => setDeleteTarget(null)} maxWidth={440}>
          <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>{deleteTarget.groupName}</strong> (Group {deleteTarget.code})?
            This removes it from the Class 10 page immediately.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 26 }}>
            <SBtn variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</SBtn>
            <SBtn
              onClick={confirmDelete}
              disabled={deleting}
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
            >
              {deleting ? 'Deleting…' : 'Delete stream'}
            </SBtn>
          </div>
        </Modal>
      )}

      {/* ── Bulk Import JSON modal ── */}
      {importOpen && (
        <Modal title="Bulk Import Streams (JSON)" onClose={() => { setImportOpen(false); setImportResult(null) }} maxWidth={680}>
          <p style={{ color: 'var(--text2)', fontSize: 13.5, lineHeight: 1.6, marginTop: 0 }}>
            Paste a JSON array of stream records (or pick a file) to insert them in one go.
            Records whose <strong>group code</strong> already exists are skipped — existing streams are never overwritten.
            Category values: <code>science</code>, <code>commerce</code>, <code>arts</code>, <code>diploma</code> (needs <code>subCategory</code>), <code>polytechnic</code>.
          </p>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <SBtn variant="outline" onClick={() => importFileRef.current?.click()}>
              <FiUpload size={13} /> Load .json file
            </SBtn>
            <input
              ref={importFileRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files && e.target.files[0]
                if (file) handleImportFile(file)
                e.target.value = ''
              }}
            />
          </div>

          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder='[{ "category": "polytechnic", "code": "DCE", "groupName": "Diploma in Civil Engineering", "subjects": [...], "bestFor": "...", "progression": [...], "backgroundTheme": "engineering-workshop", "order": 136 }, ...]'
            style={{
              width: '100%', minHeight: 260, background: 'var(--surface2)',
              border: '1.5px solid var(--border)', color: 'var(--text)', borderRadius: 12,
              padding: 14, fontSize: 12.5, fontFamily: 'Consolas, Menlo, monospace', outline: 'none',
              resize: 'vertical', boxSizing: 'border-box',
            }}
          />

          {importResult && (
            <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: 'var(--surface2)', border: '1.5px solid var(--border)', fontSize: 13 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>
                <span style={{ color: '#16a34a' }}>{importResult.inserted} inserted</span>
                <span style={{ color: 'var(--text3)' }}> · {importResult.skipped} skipped</span>
              </div>
              {importResult.errors && importResult.errors.length > 0 && (
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: '#dc2626', fontSize: 12.5 }}>
                  {importResult.errors.map((e, i) => (
                    <li key={i}><strong>{e.code}</strong>: {e.error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <FormActions
            onClose={() => { setImportOpen(false); setImportResult(null) }}
            onSave={handleBulkImport}
            saveDisabled={importing || !importText.trim()}
            saveText={importing ? 'Importing…' : 'Import records'}
          />
        </Modal>
      )}

      {/* ── Toasts ── */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
        {toasts.map((t) => (
          <SAlert key={t.id} type={t.type} onClose={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
            {t.msg}
          </SAlert>
        ))}
      </div>
    </div>
  )
}