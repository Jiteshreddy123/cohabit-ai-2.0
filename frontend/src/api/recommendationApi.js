import apiClient from "./apiClient";

export const recommendationApi = {
  getRecommendations: async (sessionId) => {
    const response = await apiClient.get(`/recommendations/${sessionId}`);
    return response.data;
  },

  generateRecommendations: async (sessionId) => {
    const response = await apiClient.post(`/recommendations/${sessionId}/generate`);
    return response.data;
  }
};
