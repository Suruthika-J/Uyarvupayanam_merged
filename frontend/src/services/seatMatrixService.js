import axiosInstance from '../config/axios'

/**
 * Admin-only "Courses & Colleges" (TNEA seat matrix) API.
 * Endpoints are mounted at /api/admin/seat-matrix behind verifyAdmin, so seat
 * data never reaches public/student routes.
 */

/**
 * The 9 "school" categories, mirroring the public Colleges Insight taxonomy
 * (backend config/collegesInsightCategories). Legacy raw course categories
 * such as "Architecture", "IT & Computer" or "ITI" are folded into these, so
 * the stream selector counts and the student-facing Colleges page agree.
 * The `key` is also the /:stream URL segment.
 */
export const STREAM_OPTIONS = [
  { key: 'engineering', label: 'Engineering', icon: '⚙️' },
  { key: 'medical', label: 'Medical', icon: '🩺' },
  { key: 'arts-science', label: 'Arts & Science', icon: '🎨' },
  { key: 'law', label: 'Law', icon: '⚖️' },
  { key: 'diploma', label: 'Diploma', icon: '🎓' },
  { key: 'media-journalism', label: 'Media & Journalism', icon: '📰' },
  { key: 'polytechnic', label: 'Polytechnic', icon: '🛠️' },
  { key: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { key: 'others', label: 'Others', icon: '🗂️' },
]

const normId = (s = '') => String(s).toLowerCase().replace(/[^a-z0-9]/g, '').trim()

/** Map a stream label ("Arts & Science") or key ("arts-science") to its key. */
export const streamSlug = (name) => {
  const v = String(name || '').trim()
  if (!v) return 'engineering'
  const n = normId(v)
  const found = STREAM_OPTIONS.find((s) => normId(s.key) === n || normId(s.label) === n)
  return found ? found.key : 'engineering'
}

/** "arts-science" -> "Arts & Science" (falls back to the raw input). */
export const streamLabel = (slug) => {
  const v = String(slug || '')
  const found = STREAM_OPTIONS.find((s) => normId(s.key) === normId(v) || normId(s.label) === normId(v))
  return found ? found.label : v
}

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