import studentApi from './studentApi'

export const mentorRequestService = {
  // User Side: Submit a request
  create: async (data) => {
    const response = await studentApi.post('/mentor-requests', data)
    return response.data
  },

  // User Side: Get my requests
  getMyRequests: async (userId) => {
    const response = await studentApi.get(`/mentor-requests/user/${userId}`)
    return response.data
  },

  // Admin Side: Get all requests
  getAll: async () => {
    const response = await studentApi.get('/mentor-requests')
    return response.data
  },

  // Admin Side: Get single request
  getById: async (id) => {
    const response = await studentApi.get(`/mentor-requests/${id}`)
    return response.data
  },

  // Admin Side: Update request (status, mentor, notes)
  update: async (id, data) => {
    const response = await studentApi.put(`/mentor-requests/${id}`, data)
    return response.data
  },

  // Admin Side: Delete request
  delete: async (id) => {
    const response = await studentApi.delete(`/mentor-requests/${id}`)
    return response.data
  }
}
