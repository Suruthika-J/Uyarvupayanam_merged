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
    },

    // ── College Onboarding Methods ─────────────────────────────────────────
    getCollegeQuestions: async () => {
        const response = await axiosInstance.get('/college-onboarding/questions');
        return response.data;
    },

    submitCollegeOnboarding: async (data) => {
        const response = await axiosInstance.post('/college-onboarding/submit', data);
        return response.data;
    },

    getCollegeBaseline: async () => {
        const response = await axiosInstance.get('/college-onboarding/baseline');
        return response.data;
    },

    retakeDomainAssessment: async () => {
        const response = await axiosInstance.post('/college-onboarding/retake');
        return response.data;
    },

    // College Admin Methods
    adminGetCollegeQuestions: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await axiosInstance.get(`/college-onboarding/admin/questions?${params}`);
        return response.data;
    },

    adminCreateCollegeQuestion: async (data) => {
        const response = await axiosInstance.post('/college-onboarding/admin/questions', data);
        return response.data;
    },

    adminUpdateCollegeQuestion: async (id, data) => {
        const response = await axiosInstance.put(`/college-onboarding/admin/questions/${id}`, data);
        return response.data;
    },

    adminDeleteCollegeQuestion: async (id) => {
        const response = await axiosInstance.delete(`/college-onboarding/admin/questions/${id}`);
        return response.data;
    }
};

export default onboardingService;
