import axios from 'axios'
import { COLLEGE_FIELDS_DATA } from '../config/collegeFieldsData'

const API_BASE = 'http://localhost:5000/api/taxonomy'

export const taxonomyService = {
  // Fetch all active fields
  getFields: async () => {
    try {
      const res = await axios.get(`${API_BASE}/fields`, { timeout: 3000 })
      if (res.data?.success && res.data.fields?.length) {
        return res.data.fields
      }
    } catch (err) {
      console.warn('Taxonomy API offline, using fallback fields config')
    }
    return COLLEGE_FIELDS_DATA.map(f => ({
      fieldId: f.id,
      fieldName: f.name,
      icon: f.icon,
      description: f.description
    }))
  },

  // Fetch degrees for selected field
  getDegrees: async (fieldId = 'engineering') => {
    try {
      const res = await axios.get(`${API_BASE}/degrees`, { params: { fieldId }, timeout: 3000 })
      if (res.data?.success && res.data.degrees?.length) {
        return res.data.degrees.map(d => typeof d === 'string' ? { id: d, name: d } : d)
      }
    } catch (err) {
      console.warn('Taxonomy degrees API error, using fallback config')
    }
    const fb = COLLEGE_FIELDS_DATA.find(f => f.id === fieldId) || COLLEGE_FIELDS_DATA[0]
    return fb.degrees.map(d => typeof d === 'string' ? { id: d, name: d } : d)
  },

  // Fetch domains / branches for selected field
  getDomains: async (fieldId = 'engineering') => {
    try {
      const res = await axios.get(`${API_BASE}/domains`, { params: { fieldId }, timeout: 3000 })
      if (res.data?.success && res.data.domains?.length) {
        return res.data.domains
      }
    } catch (err) {
      console.warn('Taxonomy domains API error, using fallback config')
    }
    const fb = COLLEGE_FIELDS_DATA.find(f => f.id === fieldId) || COLLEGE_FIELDS_DATA[0]
    return fb.domains
  },

  // Fetch specializations for selected domain
  getSpecializations: async (fieldId = 'engineering', domainName = '') => {
    try {
      const res = await axios.get(`${API_BASE}/specializations`, { params: { fieldId, domainName }, timeout: 3000 })
      if (res.data?.success && res.data.specializations?.length) {
        return res.data.specializations.map(s => typeof s === 'string' ? { id: s, name: s } : s)
      }
    } catch (err) {
      console.warn('Taxonomy specializations API error, using fallback config')
    }
    const fb = COLLEGE_FIELDS_DATA.find(f => f.id === fieldId) || COLLEGE_FIELDS_DATA[0]
    const fbDom = fb.domains.find(d => domainName && d.name.toLowerCase() === domainName.toLowerCase()) || fb.domains[0]
    return fbDom ? fbDom.specs.map(s => typeof s === 'string' ? { id: s, name: s } : s) : []
  },

  // Fetch professional certifications for field
  getCertifications: async (fieldId = 'engineering') => {
    try {
      const res = await axios.get(`${API_BASE}/certifications`, { params: { fieldId }, timeout: 3000 })
      if (res.data?.success && res.data.certifications?.length) {
        return res.data.certifications
      }
    } catch (err) {
      console.warn('Taxonomy certifications API error, using fallback config')
    }
    const fb = COLLEGE_FIELDS_DATA.find(f => f.id === fieldId) || COLLEGE_FIELDS_DATA[0]
    return fb.certifications || []
  }
}
