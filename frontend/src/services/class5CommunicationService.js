import axiosInstance from '../config/axios';

const LOCATION_COLORS = {
  Classroom: '#3b82f6',
  Library: '#8b5cf6',
  Playground: '#f97316',
  'School Bus': '#eab308',
  'Lunch Hall': '#ec4899',
  Home: '#10b981',
};

const class5CommunicationService = {
  getProgress: async () => {
    const response = await axiosInstance.get('/class5-communication/progress');
    return response.data;
  },

  completeStep: async (stepId) => {
    const response = await axiosInstance.post('/class5-communication/step', { stepId });
    return response.data;
  },

  submitActivityResult: async (data) => {
    const response = await axiosInstance.post('/class5-communication/activity-result', data);
    return response.data;
  },

  getDailyMission: async () => {
    const response = await axiosInstance.get('/class5-communication/daily-mission');
    return response.data;
  },

  completeDailyMission: async () => {
    const response = await axiosInstance.post('/class5-communication/daily-mission/complete');
    return response.data;
  },

  uploadVoiceRecording: async (formData) => {
    const response = await axiosInstance.post('/class5-communication/voice-recording', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getPublicPassport: async (studentId) => {
    const response = await axiosInstance.get(`/class5-communication/passport/${studentId}`);
    return response.data;
  },

  getContentByType: async (contentType) => {
    const response = await axiosInstance.get(`/communication-content/type/${contentType}`);
    return response.data;
  },

  getAllContent: async () => {
    const response = await axiosInstance.get('/communication-content/all');
    return response.data;
  },

  fetchEmotionQuestions: async () => {
    const res = await axiosInstance.get('/communication-content/type/emotion_question');
    if (!res.data.success) return [];
    return res.data.data.map((doc) => ({ ...doc.data, color: doc.data.color || '#8b5cf6' }));
  },

  fetchTalkTopics: async () => {
    const res = await axiosInstance.get('/communication-content/type/talk_topic');
    if (!res.data.success) return [];
    return res.data.data.map((doc) => doc.data.topic);
  },

  fetchConversationSets: async () => {
    const res = await axiosInstance.get('/communication-content/type/conversation_set');
    if (!res.data.success) return [];
    return res.data.data.map((doc) => doc.data);
  },

  fetchSimulatorScenarios: async () => {
    const res = await axiosInstance.get('/communication-content/type/simulator_scenario');
    if (!res.data.success) return {};
    const grouped = {};
    res.data.data.forEach((doc) => {
      const loc = doc.location || 'Classroom';
      if (!grouped[loc]) grouped[loc] = [];
      grouped[loc].push({ ...doc.data, color: LOCATION_COLORS[loc] || '#6b7280' });
    });
    return grouped;
  },

  fetchFlipTips: async () => {
    const res = await axiosInstance.get('/communication-content/type/flip_tip');
    if (!res.data.success) return [];
    return res.data.data.map((doc) => doc.data);
  },

  fetchDailyMissions: async () => {
    const res = await axiosInstance.get('/communication-content/type/daily_mission');
    if (!res.data.success) return [];
    return res.data.data.map((doc) => doc.data.text);
  },
};

export default class5CommunicationService;
