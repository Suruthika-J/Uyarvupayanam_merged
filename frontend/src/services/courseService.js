import axiosInstance from '../config/axios'

export const courseService = {
  // Create new course
  createCourse: async (courseData) => {
    const response = await axiosInstance.post('/courses', courseData)
    return response.data
  },

  // Bulk import courses (text-based)
  bulkImport: async (courseData) => {
    const response = await axiosInstance.post('/courses/bulk', courseData)
    return response.data
  },

  // Preview source import (dry run — no DB changes)
  previewSourceImport: async (filters = {}) => {
    const response = await axiosInstance.post('/courses/preview-import', filters)
    return response.data
  },

  // Import from source (actual DB insert)
  importFromSource: async (filters = {}) => {
    const response = await axiosInstance.post('/courses/import-from-source', filters)
    return response.data
  },

  // Get all courses
  getAllCourses: async () => {
    const response = await axiosInstance.get('/courses')
    return response.data
  },

  // Alias used by LandingPage and student course browser
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/courses', { params })
    return response.data
  },

  // Get single course by ID
  getCourseById: async (id) => {
    const response = await axiosInstance.get(`/courses/${id}`)
    return response.data
  },

  // Update course
  updateCourse: async (id, courseData) => {
    const response = await axiosInstance.put(`/courses/${id}`, courseData)
    return response.data
  },

  // Delete course
  deleteCourse: async (id) => {
    const response = await axiosInstance.delete(`/courses/${id}`)
    return response.data
  },

  // Explorer API (Used by Student Class 12 page)
  getExplorerData: async (params = {}) => {
    const response = await axiosInstance.get('/students/class12/exploration', { params })
    return response.data
  },

  // Get student course details with offering colleges
  getStudentCourseDetails: async (courseId) => {
    const response = await axiosInstance.get(`/student/courses/${courseId}`)
    return response.data
  }
}
