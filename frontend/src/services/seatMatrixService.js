import axiosInstance from '../config/axios'

/**
 * Admin-only "Courses & Colleges" (TNEA seat matrix) API.
 * Endpoints are mounted at /api/admin/seat-matrix behind verifyAdmin, so seat
 * data never reaches public/student routes.
 */

/** Fixed stream catalogue (matches the backend STREAMS list). */
export const SEAT_MATRIX_STREAMS = [
  'Engineering',
  'Medical',
  'Arts & Science',
  'Law',
  'Commerce',
  'Management',
  'IT & Computer',
  'Agriculture',
  'Architecture',
  'Design',
  'Hotel Management',
  'ITI',
  'Polytechnic',
  'Media & Journalism',
  'Others',
]

/** "Arts & Science" -> "arts-science", for the /:stream URL segment. */
export const streamSlug = (name) =>
  String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

/** "arts-science" -> "Arts & Science" (falls back to the raw slug). */
export const streamLabel = (slug) =>
  SEAT_MATRIX_STREAMS.find((s) => streamSlug(s) === String(slug || '').trim().toLowerCase()) ||
  String(slug || '').trim()

export const seatMatrixService = {
  /**
   * Upload a seat-matrix PDF (field "pdf") tagged with a stream
   * (field "stream", defaults to Engineering server-side). Idempotent upsert.
   * @param {File} file - the PDF file
   * @param {{stream?: string}} [opts] - canonical stream name (e.g. "Engineering")
   */
  importPdf: async (file, opts = {}) => {
    const formData = new FormData()
    formData.append('pdf', file)
    if (opts.stream) formData.append('stream', opts.stream)
    const response = await axiosInstance.post('/admin/seat-matrix/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 600000, // parsing a 319-page PDF + upserting ~3.4k mappings takes a while
    })
    return response.data
  },

  /**
   * Course/college/mapping counts for every known stream (incl. zero-data
   * streams), driving the Level-1 stream selector page.
   */
  getStreamsSummary: async () => {
    const response = await axiosInstance.get('/admin/seat-matrix/streams-summary')
    return response.data
  },

  /**
   * Courses in a stream, each with a per-course college count.
   * @param {{stream?: string, search?: string, page?: number, limit?: number}} params
   */
  getCourses: async (params = {}) => {
    const response = await axiosInstance.get('/admin/seat-matrix/courses', { params })
    return response.data
  },

  /**
   * Colleges offering a course, each with the full OC/BC/BCM/MBC/SC/SCA/ST
   * seat breakdown. Seat fields are admin-only.
   * @param {string} courseId
   * @param {{stream?: string, search?: string, page?: number, limit?: number}} params
   */
  getCourseColleges: async (courseId, params = {}) => {
    const response = await axiosInstance.get(`/admin/seat-matrix/courses/${courseId}/colleges`, { params })
    return response.data
  },

  /** Stream-scoped counts for the admin import summary panel. */
  getSummary: async (params = {}) => {
    const response = await axiosInstance.get('/admin/seat-matrix/summary', { params })
    return response.data
  },
}