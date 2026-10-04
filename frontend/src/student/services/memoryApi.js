// frontend/src/student/services/memoryApi.js
//
// API client for the Personal Memory Vault (/api/memories). Uses the shared
// axios instance so auth (studentToken) and 401 handling stay consistent with
// the rest of the app. FormData bodies let axios set the multipart boundary.

import axiosInstance from '../../config/axios'

export const MEMORY_TYPES = [
  { id: 'voice', label: 'Voice Recording', icon: '🎙️' },
  { id: 'journal', label: 'Journal Entry', icon: '📓' },
  { id: 'email', label: 'Email / Letter', icon: '✉️' },
  { id: 'document', label: 'Document', icon: '📄' },
  { id: 'story', label: 'Story / Note', icon: '✏️' },
]

export function memoryTypeLabel(id) {
  const t = MEMORY_TYPES.find((x) => x.id === id)
  return t ? t.label : 'Memory'
}

export const memoryApi = {
  list: (params = {}) => axiosInstance.get('/memories', { params }),
  get: (id) => axiosInstance.get(`/memories/${id}`),
  create: (formData) => axiosInstance.post('/memories', formData),
  update: (id, formData) => axiosInstance.put(`/memories/${id}`, formData),
  remove: (id) => axiosInstance.delete(`/memories/${id}`),
  reprocess: (id) => axiosInstance.post(`/memories/${id}/reprocess`),
  getSettings: () => axiosInstance.get('/memories/settings'),
  putSettings: (useMemoryInChat) => axiosInstance.put('/memories/settings', { useMemoryInChat }),
}