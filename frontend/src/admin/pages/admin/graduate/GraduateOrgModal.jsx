import React, { useEffect, useState } from 'react'
import {
  Modal, FormGrid, FormGroup, FormInput, FormActions, SAlert,
} from '../../../components/UI'
import { graduateExamService } from '../../../../services/graduateExamService'

const isUrl = (v) => !v || /^https?:\/\/[^\s]+\.[^\s]+/i.test(String(v).trim())

/**
 * GraduateOrgModal — shared add / edit dialog for RecruitmentOrganization.
 * Used from the State (per-state) and Central organization list pages.
 */
export default function GraduateOrgModal({ open, onClose, onSaved, org }) {
  const [form, setForm] = useState({
    name: '', governmentType: 'State', state: '', description: '',
    officialWebsite: '', sourceUrl: '', referenceSource: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setForm({
      name: org?.name || '',
      governmentType: org?.governmentType || 'State',
      state: org?.state || '',
      description: org?.description || '',
      officialWebsite: org?.officialWebsite || '',
      sourceUrl: org?.sourceUrl || '',
      referenceSource: org?.referenceSource || '',
    })
  }, [open, org])

  if (!open) return null

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    setError('')
    if (!form.name.trim()) return setError('Organization name is required.')
    if (!form.governmentType) return setError('Government type is required.')
    if (!isUrl(form.officialWebsite)) return setError('Official website must be a valid http(s) URL (or leave empty).')
    if (!isUrl(form.sourceUrl)) return setError('Source URL must be a valid http(s) URL (or leave empty).')
    if (!isUrl(form.referenceSource)) return setError('Reference source must be a valid http(s) URL (or leave empty).')

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        governmentType: form.governmentType,
        state: form.governmentType === 'State' ? form.state.trim() : '',
        description: form.description,
        officialWebsite: form.officialWebsite.trim(),
        sourceUrl: form.sourceUrl.trim(),
        referenceSource: form.referenceSource.trim(),
      }
      const res = org && org._id
        ? await graduateExamService.updateOrganization(org._id, payload)
        : await graduateExamService.createOrganization(payload)
      onSaved(res.data)
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save organization.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={org && org._id ? 'Edit Organization' : 'Add Organization'} onClose={onClose} maxWidth={680}>
      {error && (
        <div style={{ marginBottom: 16 }}>
          <SAlert type="error">{error}</SAlert>
        </div>
      )}

      <FormGrid>
        <FormGroup label="Organization Name *" full>
          <FormInput value={form.name} onChange={set('name')} placeholder="e.g. Tamil Nadu Public Service Commission (TNPSC)" />
        </FormGroup>

        <FormGroup label="Government Type *">
          <FormInput as="select" value={form.governmentType} onChange={set('governmentType')}>
            <option value="State">State</option>
            <option value="Central">Central</option>
          </FormInput>
        </FormGroup>

        {form.governmentType === 'State' && (
          <FormGroup label="State">
            <FormInput value={form.state} onChange={set('state')} placeholder="e.g. Tamil Nadu" />
          </FormGroup>
        )}

        <FormGroup label="Official Website" full>
          <FormInput value={form.officialWebsite} onChange={set('officialWebsite')} placeholder="https://www.tnpsc.gov.in" />
        </FormGroup>

        <FormGroup label="Source / Reference URL" full>
          <FormInput value={form.sourceUrl} onChange={set('sourceUrl')} placeholder="https://apply.tnpscexams.in/notification?... (optional reference)" />
        </FormGroup>

        <FormGroup label="Reference Guide URL" full>
          <FormInput value={form.referenceSource} onChange={set('referenceSource')} placeholder="https://www.oliveboard.in/blog/tamil-nadu-govt-jobs/ (optional third-party guide)" />
        </FormGroup>

        <FormGroup label="Description" full>
          <FormInput as="textarea" value={form.description} onChange={set('description')} placeholder="What this organisation conducts…" />
        </FormGroup>
      </FormGrid>

      <FormActions onClose={onClose} onSave={handleSave} saveDisabled={saving} saveText={saving ? 'Saving…' : (org && org._id ? 'Save Changes' : 'Create Organization')} />
    </Modal>
  )
}