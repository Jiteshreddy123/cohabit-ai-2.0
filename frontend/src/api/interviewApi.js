import apiClient from "./apiClient";

export const interviewApi = {
  startInterview: async (studentId) => {
    const response = await apiClient.post(`/interviews/${studentId}/start`);
    return response.data;
  },

  sendMessage: async (studentId, message) => {
    const response = await apiClient.post(`/interviews/${studentId}/message`, { message });
    return response.data;
  },

  endInterview: async (studentId) => {
    const response = await apiClient.post(`/interviews/${studentId}/end`);
    return response.data;
  }
};
