import axiosInstance from '../config/axios';

const assessmentService = {
    // Admin APIs
    adminGetQuestions: async (grade) => {
        const url = grade ? `/assessment/admin/questions?grade=${grade}` : '/assessment/admin/questions';
        const response = await axiosInstance.get(url);
        return response.data;
    },
    adminCreateQuestion: async (data) => {
        const response = await axiosInstance.post('/assessment/admin/questions', data);
        return response.data;
    },
    adminUpdateQuestion: async (id, data) => {
        const response = await axiosInstance.put(`/assessment/admin/questions/${id}`, data);
        return response.data;
    },
    adminDeleteQuestion: async (id) => {
        const response = await axiosInstance.delete(`/assessment/admin/questions/${id}`);
        return response.data;
    },

    // Student APIs
    getQuestionsByLevel: async (classLevel) => {
        const response = await axiosInstance.get(`/assessment/questions/${classLevel}`);
        return response.data;
    },
    submitAssessment: async (data) => {
        const response = await axiosInstance.post('/assessment/submit', data);
        return response.data;
    },
    getLatestResult: async (userId) => {
        const response = await axiosInstance.get(`/assessment/result/${userId}`);
        return response.data;
    }
};

export default assessmentService;
