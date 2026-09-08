import apiClient from "./apiClient";

export const discoverApi = {
  getColleges: async (params = {}) => {
    const response = await apiClient.get("/discover/colleges", { params });
    return response.data;
  },

  getCollege: async (id) => {
    const response = await apiClient.get(`/discover/colleges/${id}`);
    return response.data;
  },

  getHostels: async (params = {}) => {
    const response = await apiClient.get("/discover/hostels", { params });
    return response.data;
  },

  getHostel: async (id) => {
    const response = await apiClient.get(`/discover/hostels/${id}`);
    return response.data;
  },

  getHostelReviews: async (hostelId, params = {}) => {
    const response = await apiClient.get(`/discover/hostels/${hostelId}/reviews`, { params });
    return response.data;
  },

  getHostelIssues: async (hostelId) => {
    const response = await apiClient.get(`/discover/hostels/${hostelId}/issues`);
    return response.data;
  },
};
