import apiClient from "./apiClient";

export const managementApi = {
  getComplaints: async (params = {}) => {
    const response = await apiClient.get("/management/complaints", { params });
    return response.data;
  },

  getComplaint: async (id) => {
    const response = await apiClient.get(`/management/complaints/${id}`);
    return response.data;
  },

  updateComplaintStatus: async (id, data) => {
    const response = await apiClient.put(`/management/complaints/${id}/status`, data);
    return response.data;
  },

  getReviews: async (params = {}) => {
    const response = await apiClient.get("/management/reviews", { params });
    return response.data;
  },

  moderateReview: async (id, action) => {
    const response = await apiClient.put(`/management/reviews/${id}/moderate`, null, {
      params: { action },
    });
    return response.data;
  },

  getHostels: async () => {
    const response = await apiClient.get("/management/hostels");
    return response.data;
  },

  createHostel: async (data) => {
    const response = await apiClient.post("/management/hostels", data);
    return response.data;
  },
};
