import axiosInstance from '../config/axios'

export const careerPathService = {
  // Admin Methods
  createCareerPath: async (careerPathData) => {
    const response = await axiosInstance.post('/admin/career-paths', careerPathData)
    return response.data
  },

  getAllCareerPathsAdmin: async (params = {}) => {
    const response = await axiosInstance.get('/admin/career-paths', { params })
    return response.data
  },

  getCareerPathByIdAdmin: async (id) => {
    const response = await axiosInstance.get(`/admin/career-paths/${id}`)
    return response.data
  },

  updateCareerPath: async (id, careerPathData) => {
    const response = await axiosInstance.put(`/admin/career-paths/${id}`, careerPathData)
    return response.data
  },

  deleteCareerPath: async (id) => {
    const response = await axiosInstance.delete(`/admin/career-paths/${id}`)
    return response.data
  },

  // User/Public Methods
  getAllCareerPaths: async (params = {}) => {
    const response = await axiosInstance.get('/career-paths', { params })
    return response.data
  },

  getByLevel: async (level) => {
    const response = await axiosInstance.get(`/career-paths`, { params: { level } })
    return response.data
  }
}
