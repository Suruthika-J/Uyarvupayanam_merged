import axiosInstance from '../config/axios'

export const adminService = {
  login: async (email, password) => {
    const response = await axiosInstance.post('/admin/login', { email, password })
    return response.data
  },

  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard')
    return response.data
  },

  getRegistrationReport: async () => {
    const response = await axiosInstance.get('/admin/reports/registrations')
    return response.data
  },

  getPopularCoursesReport: async () => {
    const response = await axiosInstance.get('/admin/reports/popular-courses')
    return response.data
  },

  getScholarshipsReport: async () => {
    const response = await axiosInstance.get('/admin/reports/scholarships')
    return response.data
  },

  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/admin/users', { params })
    return response.data
  },

  blockUser: async (id) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/block`)
    return response.data
  },

  unblockUser: async (id) => {
    const response = await axiosInstance.patch(`/admin/users/${id}/unblock`)
    return response.data
  },

  resetPassword: async (id) => {
    const response = await axiosInstance.put(`/admin/users/${id}/reset-password`)
    return response.data
  },

  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`)
    return response.data
  },

  // ── College Management ──
  getColleges: async (params = {}) => {
    const response = await axiosInstance.get('/colleges', { params })
    return response.data
  },

  getCollegeById: async (id) => {
    const response = await axiosInstance.get(`/colleges/${id}`)
    return response.data
  },

  createCollege: async (data) => {
    const response = await axiosInstance.post('/colleges', data)
    return response.data
  },

  updateCollege: async (id, data) => {
    const response = await axiosInstance.put(`/colleges/${id}`, data)
    return response.data
  },

  deleteCollege: async (id) => {
    const response = await axiosInstance.delete(`/colleges/${id}`)
    return response.data
  },

  fetchCollegeCourses: async (id) => {
    const response = await axiosInstance.post(`/colleges/${id}/fetch-courses`)
    return response.data
  },

  getFetchedCourses: async (id) => {
    const response = await axiosInstance.get(`/colleges/${id}/courses`)
    return response.data
  },

  syncCollegeCourses: async (id) => {
    const response = await axiosInstance.post(`/colleges/${id}/sync-courses`)
    return response.data
  },

  bulkFetchAllCollegeCourses: async () => {
    const response = await axiosInstance.post('/colleges/bulk/fetch-all-courses')
    return response.data
  },

  // ── Cutoff Management ── (NEW)
  getCutoffs: async (params = {}) => {
    const response = await axiosInstance.get('/cutoff', { 
      params: { 
        ...params, 
        largeLimit: 'true', 
        limit: 10000 
      } 
    })
    return response.data
  },

  importCutoffs: async (year) => {
    const response = await axiosInstance.post('/cutoff/import', {
      year,
      force: true
    }, {
      timeout: 120000
    })
    return response.data
  }
}
