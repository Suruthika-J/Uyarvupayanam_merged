import axiosInstance from '../config/axios'

/**
 * Streams After 10th — public reads for the student page, admin CRUD for the
 * admin panel. The axios interceptor attaches the admin token automatically
 * for /admin routes (and inside the /admin panel), so no manual headers here.
 */
export const streamService = {
  // ── Public ────────────────────────────────────────────────────────────
  getStreams: async ({ category, subCategory } = {}) => {
    const params = {}
    if (category) params.category = category
    if (subCategory) params.subCategory = subCategory
    const res = await axiosInstance.get('/streams', { params })
    return res.data
  },

  // ── Admin ─────────────────────────────────────────────────────────────
  getAdminList: async () => {
    const res = await axiosInstance.get('/streams/admin')
    return res.data
  },

  create: async (data) => {
    const res = await axiosInstance.post('/streams/admin', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await axiosInstance.put(`/streams/admin/${id}`, data)
    return res.data
  },

  togglePublish: async (id) => {
    const res = await axiosInstance.patch(`/streams/admin/${id}/toggle-publish`)
    return res.data
  },

  remove: async (id) => {
    const res = await axiosInstance.delete(`/streams/admin/${id}`)
    return res.data
  },

  bulkReorder: async (items) => {
    const res = await axiosInstance.post('/streams/admin/bulk-reorder', { items })
    return res.data
  },

  bulkImport: async (items) => {
    const res = await axiosInstance.post('/streams/admin/bulk-import', { items })
    return res.data
  },

  uploadThemeImage: async (file, themeKey) => {
    const form = new FormData()
    form.append('image', file)
    if (themeKey) form.append('themeKey', themeKey)
    const res = await axiosInstance.post('/streams/admin/theme-assets/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },
}