import axiosInstance from '../config/axios'

export const classContentService = {
  // Public
  getPublicList: async (params) => {
    const level = typeof params === 'object' ? params.targetClass : params
    const response = await axiosInstance.get(`/class-content/level/${level}`)
    return response.data
  },

  getBySlug: async (slug) => {
    const response = await axiosInstance.get(`/class-content/slug/${slug}`)
    return response.data
  },

  // Admin
  getAdminSummaries: async () => {
    const response = await axiosInstance.get('/class-content/admin/summaries')
    return response.data
  },

  getAdminList: async (params) => {
    const level = typeof params === 'object' ? params.targetClass : params
    const response = await axiosInstance.get(`/class-content/admin/level/${level}`)
    return response.data
  },

  getAllAdmin: async (params) => {
    // Some components pass { targetClass: '5' }, some just '5'
    const level = typeof params === 'object' ? params.targetClass : params
    const response = await axiosInstance.get(`/class-content/admin/level/${level}`)
    return response.data
  },

  create: async (data) => {
    const response = await axiosInstance.post('/class-content', data)
    return response.data
  },

  createContent: async (data) => {
    const response = await axiosInstance.post('/class-content', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/class-content/${id}`, data)
    return response.data
  },

  updateContent: async (id, data) => {
    const response = await axiosInstance.put(`/class-content/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/class-content/${id}`)
    return response.data
  },

  deleteContent: async (id) => {
    const response = await axiosInstance.delete(`/class-content/${id}`)
    return response.data
  },

  toggleStatus: async (id) => {
    const response = await axiosInstance.patch(`/class-content/${id}/toggle-status`)
    return response.data
  },

  toggleFeature: async (id) => {
    const response = await axiosInstance.patch(`/class-content/${id}/toggle-feature`)
    return response.data
  }
}
