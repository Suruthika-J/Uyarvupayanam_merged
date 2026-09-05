import axiosInstance from '../config/axios'

export const cutoffService = {
  getCutoffs: async (params) => {
    const response = await axiosInstance.get('/cutoffs', { params })
    return response.data
  },
  createCutoff: async (data) => {
    const response = await axiosInstance.post('/cutoffs', data)
    return response.data
  },
  updateCutoff: async (id, data) => {
    const response = await axiosInstance.put(`/cutoffs/${id}`, data)
    return response.data
  },
  deleteCutoff: async (id) => {
    const response = await axiosInstance.delete(`/cutoffs/${id}`)
    return response.data
  }
}
