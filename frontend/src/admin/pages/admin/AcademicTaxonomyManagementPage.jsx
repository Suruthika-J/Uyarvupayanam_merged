import React, { useState, useEffect } from 'react'
import axiosInstance from '../../../config/axios'
import { Card, LevelBadge, DataTable, TR, TD, ActionBtn, FiltersRow, FilterSelect } from '../../components/UI'
import { FiPlus, FiCheckCircle, FiEdit2, FiLayers, FiBookOpen, FiGlobe, FiCheck, FiX } from 'react-icons/fi'

export default function AcademicTaxonomyManagementPage() {
  const [taxonomy, setTaxonomy] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('fields') // 'fields', 'degrees', 'domains'
  const [selectedFieldId, setSelectedFieldId] = useState('engineering')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState('field') // 'field', 'degree', 'domain', 'spec'
  const [formData, setFormData] = useState({
    fieldId: '',
    fieldName: '',
    degreeName: '',
    domainName: '',
    specializationName: '',
    certificationName: ''
  })

  const fetchTaxonomy = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get('/taxonomy/admin/all')
      if (res.data?.success) {
        setTaxonomy(res.data.taxonomy || [])
      }
    } catch (err) {
      console.error('Failed to fetch taxonomy admin:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxonomy()
  }, [])

  const handleSaveTaxonomy = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosInstance.post('/taxonomy/admin/manage', formData)
      if (res.data?.success) {
        alert('Taxonomy entity saved successfully!')
        setModalOpen(false)
        fetchTaxonomy()
      }
    } catch (err) {
      alert('Failed to save taxonomy entity.')
    }
  }

  const selectedFieldObj = taxonomy.find(t => t.fieldId === selectedFieldId) || taxonomy[0]

  return (
    <div style={{ animation: 'fadeUp 0.4s ease both' }}>
      
      {/* ── TOP ACTION BAR & TABS ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setActiveTab('fields')}
            style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 800,
              border: activeTab === 'fields' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: activeTab === 'fields' ? 'var(--primary)' : '#fff',
              color: activeTab === 'fields' ? '#fff' : 'var(--text2)', cursor: 'pointer'
            }}
          >
            🏛️ Fields ({taxonomy.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('degrees')}
            style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 800,
              border: activeTab === 'degrees' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: activeTab === 'degrees' ? 'var(--primary)' : '#fff',
              color: activeTab === 'degrees' ? '#fff' : 'var(--text2)', cursor: 'pointer'
            }}
          >
            🎓 Degrees
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('domains')}
            style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 13, fontWeight: 800,
              border: activeTab === 'domains' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: activeTab === 'domains' ? 'var(--primary)' : '#fff',
              color: activeTab === 'domains' ? '#fff' : 'var(--text2)', cursor: 'pointer'
            }}
          >
            🌐 Domains & Specializations
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData({ fieldId: selectedFieldId, fieldName: selectedFieldObj?.fieldName || 'Engineering', degreeName: '', domainName: '', specializationName: '' })
            setModalType(activeTab === 'fields' ? 'field' : activeTab === 'degrees' ? 'degree' : 'domain')
            setModalOpen(true)
          }}
          style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            padding: '10px 18px', borderRadius: 12, fontSize: 13, fontWeight: 800,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <FiPlus size={16} /> Add New {activeTab === 'fields' ? 'Academic Field' : activeTab === 'degrees' ? 'Degree Programme' : 'Domain Branch'}
        </button>
      </div>

      {/* ── FIELDS TAB ── */}
      {activeTab === 'fields' && (
        <Card>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>Loading academic fields...</div>
          ) : (
            <DataTable
              columns={['Field Name', 'Field ID', 'Degrees Count', 'Domains Count', 'Status', 'Actions']}
              data={taxonomy}
              renderRow={(f) => (
                <TR key={f.fieldId}>
                  <TD><strong style={{ color: 'var(--text)', fontSize: 14 }}>{f.fieldName}</strong></TD>
                  <TD style={{ color: 'var(--text3)', fontFamily: 'monospace' }}>{f.fieldId}</TD>
                  <TD><LevelBadge level={`${f.degrees?.length || 0} Degrees`} /></TD>
                  <TD><LevelBadge level={`${f.domains?.length || 0} Domains`} /></TD>
                  <TD><span style={{ fontSize: 12, fontWeight: 800, color: '#047857', background: '#d1fae5', padding: '3px 8px', borderRadius: 10 }}>Active</span></TD>
                  <TD>
                    <ActionBtn onClick={() => {
                      setSelectedFieldId(f.fieldId)
                      setActiveTab('degrees')
                    }}>
                      View Degrees →
                    </ActionBtn>
                  </TD>
                </TR>
              )}
            />
          )}
        </Card>
      )}

      {/* ── DEGREES TAB ── */}
      {activeTab === 'degrees' && (
        <div>
          <FiltersRow style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>Select Academic Field:</span>
            <FilterSelect value={selectedFieldId} onChange={e => setSelectedFieldId(e.target.value)}>
              {taxonomy.map(t => <option key={t.fieldId} value={t.fieldId}>{t.fieldName}</option>)}
            </FilterSelect>
          </FiltersRow>

          <Card>
            {selectedFieldObj?.degrees?.length > 0 ? (
              <DataTable
                columns={['Degree Name', 'Degree ID', 'Academic Level', 'Duration', 'Status']}
                data={selectedFieldObj.degrees}
                renderRow={(d) => (
                  <TR key={d.id || d.name}>
                    <TD><strong style={{ color: 'var(--text)', fontSize: 14 }}>{d.name}</strong></TD>
                    <TD style={{ color: 'var(--text3)', fontFamily: 'monospace' }}>{d.id || '—'}</TD>
                    <TD><LevelBadge level={d.level || 'Undergraduate'} /></TD>
                    <TD style={{ color: 'var(--text2)', fontSize: 13 }}>{d.duration || '4 Years'}</TD>
                    <TD><span style={{ fontSize: 12, fontWeight: 800, color: '#047857', background: '#d1fae5', padding: '3px 8px', borderRadius: 10 }}>Active</span></TD>
                  </TR>
                )}
              />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No degrees configured for this field yet.</div>
            )}
          </Card>
        </div>
      )}

      {/* ── DOMAINS TAB ── */}
      {activeTab === 'domains' && (
        <div>
          <FiltersRow style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)' }}>Select Academic Field:</span>
            <FilterSelect value={selectedFieldId} onChange={e => setSelectedFieldId(e.target.value)}>
              {taxonomy.map(t => <option key={t.fieldId} value={t.fieldId}>{t.fieldName}</option>)}
            </FilterSelect>
          </FiltersRow>

          <Card>
            {selectedFieldObj?.domains?.length > 0 ? (
              <DataTable
                columns={['Domain Branch Name', 'Description', 'Specializations Focus Areas']}
                data={selectedFieldObj.domains}
                renderRow={(dom) => (
                  <TR key={dom.id || dom.name}>
                    <TD><strong style={{ color: 'var(--primary)', fontSize: 14 }}>{dom.name}</strong></TD>
                    <TD style={{ color: 'var(--text2)', fontSize: 13 }}>{dom.description || 'Core domain branch'}</TD>
                    <TD>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {dom.specializations?.map(s => (
                          <span key={s.id || s.name} style={{ fontSize: 12, background: 'var(--surface2)', padding: '3px 8px', borderRadius: 8, fontWeight: 600 }}>
                            • {s.name}
                          </span>
                        ))}
                      </div>
                    </TD>
                  </TR>
                )}
              />
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text3)' }}>No domain branches configured for this field.</div>
            )}
          </Card>
        </div>
      )}

      {/* ── ADD/EDIT TAXONOMY MODAL ── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: 500, borderRadius: 20, padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--text)' }}>
                Add Academic Taxonomy Entity
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}><FiX size={20} /></button>
            </div>

            <form onSubmit={handleSaveTaxonomy} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Field ID</label>
                <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.fieldId} onChange={e => setFormData({ ...formData, fieldId: e.target.value })} required />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Field Name</label>
                <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.fieldName} onChange={e => setFormData({ ...formData, fieldName: e.target.value })} required />
              </div>

              {modalType === 'degree' && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Degree Programme Name</label>
                  <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.degreeName} onChange={e => setFormData({ ...formData, degreeName: e.target.value })} placeholder="e.g. B.Tech Artificial Intelligence" required />
                </div>
              )}

              {modalType === 'domain' && (
                <>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Domain Branch Name</label>
                    <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.domainName} onChange={e => setFormData({ ...formData, domainName: e.target.value })} placeholder="e.g. Robotics & Automation" required />
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Specialization (Optional)</label>
                    <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }} value={formData.specializationName} onChange={e => setFormData({ ...formData, specializationName: e.target.value })} placeholder="e.g. Autonomous Drones" />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Save Taxonomy</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
