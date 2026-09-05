import axiosInstance from '../config/axios'

export const userActionService = {
  // Bookmark content
  saveItem: async (contentId, contentType) => {
    const response = await axiosInstance.post('/user-actions/save', { contentId, contentType })
    return response.data
  },

  // Get user's saved list
  getSavedList: async (contentType) => {
    const response = await axiosInstance.get('/user-actions/saved-list', { params: { contentType } })
    return response.data
  },

  // Remove bookmark
  unsaveItem: async (contentId) => {
    const response = await axiosInstance.delete(`/user-actions/unsave/${contentId}`)
    return response.data
  },

  // Habits
  getHabits: async () => {
    const response = await axiosInstance.get('/user-actions/habits')
    return response.data
  },

  toggleHabit: async (title, date) => {
    const response = await axiosInstance.post('/user-actions/habits/toggle', { title, date })
    return response.data
  }
}
