import axiosInstance from '../config/axios';

const graduateService = {
  getProfile: async () => {
    const response = await axiosInstance.get('/graduate/profile');
    return response.data;
  },

  saveStep: async (stepData) => {
    const response = await axiosInstance.post('/graduate/profile/step', stepData);
    return response.data;
  },

  completeOnboarding: async (data = {}) => {
    const response = await axiosInstance.post('/graduate/onboarding/complete', data);
    return response.data;
  },

  getDashboard: async () => {
    const response = await axiosInstance.get('/graduate/dashboard');
    return response.data;
  },

  getCareers: async () => {
    const response = await axiosInstance.get('/graduate/careers');
    return response.data;
  },

  getSkillGap: async () => {
    const response = await axiosInstance.get('/graduate/skill-gap');
    return response.data;
  },

  getExams: async () => {
    const response = await axiosInstance.get('/graduate/exams');
    return response.data;
  },

  getHigherStudies: async () => {
    const response = await axiosInstance.get('/graduate/higher-studies');
    return response.data;
  },

  getRoadmap: async () => {
    const response = await axiosInstance.get('/graduate/roadmap');
    return response.data;
  },

  chatAdvisor: async (payload) => {
    const response = await axiosInstance.post('/graduate/advisor/chat', payload);
    return response.data;
  }
};

export default graduateService;
