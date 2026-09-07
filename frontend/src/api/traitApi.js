import apiClient from "./apiClient";

export const traitApi = {
  getTraits: async () => {
    const response = await apiClient.get("/traits");
    return response.data;
  },

  getStudentTraits: async (studentId) => {
    const response = await apiClient.get(`/traits/${studentId}`);
    return response.data;
  }
};
