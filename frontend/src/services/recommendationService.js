import axiosInstance from '../config/axios';

// Thin wrapper around the backend academic recommendation engine.
// The backend service is the single source of truth for all recommendation
// logic (bands, priorities, study plan, progress). This file only forwards
// the logged-in student's ID and the daily study-time preference.
const recommendationService = {
    getAcademicRecommendations: async (studentId, studyMinutes = 120) => {
        const response = await axiosInstance.get(`/recommendations/${studentId}`, {
            params: { studyMinutes },
        });
        return response.data;
    },
};

export default recommendationService;