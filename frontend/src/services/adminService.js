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

  getUserDetails: async (id) => {
    const response = await axiosInstance.get(`/admin/users/${id}`)
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

  // ── College Student Management Services ──
  getCollegeStudents: async (params = {}) => {
    const response = await axiosInstance.get('/admin/college/students', { params })
    return response.data
  },

  // ── Graduate Management Services ──
  getGraduates: async (params = {}) => {
    const response = await axiosInstance.get('/admin/college/graduates', { params })
    return response.data
  },

  getCollegeStudentProfile: async (id) => {
    const response = await axiosInstance.get(`/admin/college/students/${id}`)
    return response.data
  },

  updateCollegeStudent: async (id, data) => {
    const response = await axiosInstance.put(`/admin/college/students/${id}`, data)
    return response.data
  },

  toggleCollegeStudentStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/admin/college/students/${id}/status`, { status })
    return response.data
  },

  sendCollegeStudentNotification: async (id, notification) => {
    const response = await axiosInstance.post(`/admin/college/students/${id}/notify`, notification)
    return response.data
  },
}

