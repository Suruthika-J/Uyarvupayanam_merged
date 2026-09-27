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

    // Dynamic per-skill assessment generation for a specific student
    // (sanitized payload: no correct answers reach the frontend).
    getAssessmentQuestions: async (studentId) => {
        const response = await axiosInstance.get('/onboarding/assessment/questions', { params: { studentId } });
        return response.data;
    },

    // Latest scored response — per-skill breakdown for the result screen.
    getLatestResponse: async (userId) => {
        const response = await axiosInstance.get(`/onboarding/response/user/${userId}`);
        return response.data;
    },

    // Live AI question generation (per-session). Pass `sessionId` to resume the
    // same generated set after a page refresh instead of hitting the LLM again.
    generateOnboardingQuestions: async (data) => {
        const response = await axiosInstance.post('/onboarding/generate-questions', data);
        return response.data;
    },

    // Full recommendation-engine result payload for a student.
    getOnboardingResult: async (studentId) => {
        const response = await axiosInstance.get(`/onboarding/result/${studentId}`);
        return response.data;
    },

    // Admin: student assessment results grouped into attempts.
    adminGetResults: async (params = {}) => {
        const response = await axiosInstance.get('/onboarding/admin/results', { params });
        return response.data;
    },

    // Admin: recommendation rules (grade × skill × level → activity/exam)
    adminGetRecommendationRules: async (params = {}) => {
        const response = await axiosInstance.get('/onboarding/admin/rules', { params });
        return response.data;
    },

    adminCreateRecommendationRule: async (data) => {
        const response = await axiosInstance.post('/onboarding/admin/rules', data);
        return response.data;
    },

    adminUpdateRecommendationRule: async (id, data) => {
        const response = await axiosInstance.put(`/onboarding/admin/rules/${id}`, data);
        return response.data;
    },

    adminDeleteRecommendationRule: async (id) => {
        const response = await axiosInstance.delete(`/onboarding/admin/rules/${id}`);
        return response.data;
    },

    // Admin: guideline rules (overallLevel → quick message)
    adminGetGuidelines: async () => {
        const response = await axiosInstance.get('/onboarding/admin/guidelines');
        return response.data;
    },

    adminCreateGuideline: async (data) => {
        const response = await axiosInstance.post('/onboarding/admin/guidelines', data);
        return response.data;
    },

    adminUpdateGuideline: async (id, data) => {
        const response = await axiosInstance.put(`/onboarding/admin/guidelines/${id}`, data);
        return response.data;
    },

    adminDeleteGuideline: async (id) => {
        const response = await axiosInstance.delete(`/onboarding/admin/guidelines/${id}`);
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

    // ✅ LD-NBSE — Learning DNA · Next Best Skill Engine
    ldGenerateQuestions: async (data) => {
        const response = await axiosInstance.post('/onboarding/ld/generate-questions', data);
        return response.data;
    },
    ldSubmit: async (data) => {
        const response = await axiosInstance.post('/onboarding/ld/submit', data);
        return response.data;
    },
    ldReassess: async (data) => {
        const response = await axiosInstance.post('/onboarding/ld/reassess', data);
        return response.data;
    },
    ldGetResult: async (studentId) => {
        const response = await axiosInstance.get(`/onboarding/ld/result/${studentId}`);
        return response.data;
    },
    ldGetAdminConfig: async () => {
        const response = await axiosInstance.get('/onboarding/ld/admin/config');
        return response.data;
    },
    ldUpdateAdminConfig: async (data) => {
        const response = await axiosInstance.put('/onboarding/ld/admin/config', data);
        return response.data;
    }
};

export default onboardingService;