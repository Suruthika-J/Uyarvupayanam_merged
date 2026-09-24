import axiosInstance from '../config/axios'

/**
 * Public read API backing the Class 12 "Colleges Insight" tab.
 * Data source: admin's College-Course Mapping engine (confirmed mappings only).
 */
export const collegesInsightService = {
  // GET /api/colleges-insight — one live-count row per category
  getSummary: async () => {
    const response = await axiosInstance.get('/colleges-insight')
    return response.data
  },

  // GET /api/colleges-insight/:category/courses
  getCourses: async (category) => {
    const response = await axiosInstance.get(`/colleges-insight/${encodeURIComponent(category)}/courses`)
    return response.data
  },

  // GET /api/colleges-insight/:category/courses/:courseId/colleges
  getColleges: async (category, courseId) => {
    const response = await axiosInstance.get(
      `/colleges-insight/${encodeURIComponent(category)}/courses/${courseId}/colleges`
    )
    return response.data
  },
}