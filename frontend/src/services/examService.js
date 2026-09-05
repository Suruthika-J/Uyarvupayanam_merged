import axiosInstance from '../config/axios'

export const examService = {
  // Create new exam
  createExam: async (examData) => {
    const response = await axiosInstance.post('/exams', examData)
    return response.data
  },

  // Upload exams CSV
  uploadCSV: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axiosInstance.post('/exams/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Get all exams
  getAllExams: async (params = {}) => {
    const response = await axiosInstance.get('/exams', { params })
    return response.data
  },

  // Get single exam by ID
  getExamById: async (id) => {
    const response = await axiosInstance.get(`/exams/${id}`)
    return response.data
  },

  // Update exam
  updateExam: async (id, examData) => {
    const response = await axiosInstance.put(`/exams/${id}`, examData)
    return response.data
  },

  // Delete exam
  deleteExam: async (id) => {
    const response = await axiosInstance.delete(`/exams/${id}`)
    return response.data
  }
}
