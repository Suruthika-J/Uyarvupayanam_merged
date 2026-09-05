import axiosInstance from '../config/axios';

const onboardingService = {
    getQuestions: async (grade) => {
        const response = await axiosInstance.get(`/onboarding/questions/${grade}`);
        return response.data;
    },

    submitOnboarding: async (data) => {
        const response = await axiosInstance.post('/onboarding/submit', data);
        return response.data;
    },

    getRecommendations: async (userId) => {
        const response = await axiosInstance.get(`/onboarding/recommendations/user/${userId}`);
        return response.data;
    },

    retakeAssessment: async (userId) => {
        const response = await axiosInstance.post(`/onboarding/retake/${userId}`);
        return response.data;
    },

    // Admin Methods
    adminGetQuestions: async (grade) => {
        const url = grade ? `/onboarding/admin/questions?grade=${grade}` : '/onboarding/admin/questions';
        const response = await axiosInstance.get(url);
        return response.data;
    },

    adminCreateQuestion: async (data) => {
        const response = await axiosInstance.post('/onboarding/admin/questions', data);
        return response.data;
    },

    adminUpdateQuestion: async (id, data) => {
        const response = await axiosInstance.put(`/onboarding/admin/questions/${id}`, data);
        return response.data;
    },

    adminDeleteQuestion: async (id) => {
        const response = await axiosInstance.delete(`/onboarding/admin/questions/${id}`);
        return response.data;
    }
};

export default onboardingService;
