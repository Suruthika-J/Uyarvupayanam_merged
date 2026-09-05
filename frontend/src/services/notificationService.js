import axiosInstance from '../config/axios'

export const notificationService = {
    // ── Admin: Create notification (broadcast or targeted) ──────────────
    create: async (data) => {
        const response = await axiosInstance.post('/notifications', data)
        return response.data
    },

    // ── Admin: Get all notifications (paginated) ─────────────────────────
    getAll: async (params = {}) => {
        const response = await axiosInstance.get('/notifications', { params })
        return response.data
    },

    // ── Admin: Get notification stats ─────────────────────────────────────
    getStats: async () => {
        const response = await axiosInstance.get('/notifications/stats')
        return response.data
    },

    // ── User: Get notifications for a specific user ───────────────────────
    getUserNotifications: async (userId, params = {}) => {
        if (!userId || userId === 'undefined') {
            return { total: 0, unreadCount: 0, page: 1, notifications: [] };
        }
        const response = await axiosInstance.get(`/notifications/user/${userId}`, { params })
        return response.data
    },

    // ── Update title/message/type of a notification ───────────────────────
    update: async (id, data) => {
        const response = await axiosInstance.put(`/notifications/${id}`, data)
        return response.data
    },

    // ── Mark a single notification as read ───────────────────────────────
    markAsRead: async (id) => {
        const response = await axiosInstance.put(`/notifications/${id}/read`)
        return response.data
    },

    // Alias for compatibility
    markRead: async (id) => {
        const response = await axiosInstance.put(`/notifications/${id}/read`)
        return response.data
    },

    // ── Mark all notifications as read for a user ───────────────────────
    markAllAsRead: async (userId) => {
        const response = await axiosInstance.put(`/notifications/user/${userId}/read-all`)
        return response.data
    },

    // Alias for compatibility
    markAllRead: async (userId) => {
        const response = await axiosInstance.put(`/notifications/user/${userId}/read-all`)
        return response.data
    },

    // ── Delete a single notification ─────────────────────────────────────
    delete: async (id) => {
        const response = await axiosInstance.delete(`/notifications/${id}`)
        return response.data
    },

    // ── Admin: Delete all notifications ──────────────────────────────────
    deleteAll: async () => {
        const response = await axiosInstance.delete('/notifications')
        return response.data
    },

    // ── Admin Alerts (system-generated notifications for admin) ──────────
    getAdminAlerts: async () => {
        const response = await axiosInstance.get('/admin/notifications')
        return response.data
    },

    markAdminAlertRead: async (id) => {
        const response = await axiosInstance.put(`/admin/notifications/${id}/read`)
        return response.data
    },
}
