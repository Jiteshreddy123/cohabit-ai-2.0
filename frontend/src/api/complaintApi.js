import apiClient from "./apiClient";

export const complaintApi = {
  getMyComplaints: async (params = {}) => {
    const response = await apiClient.get("/complaints/my", { params });
    return response.data;
  },

  getComplaint: async (id) => {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  },

  createComplaint: async (data) => {
    const response = await apiClient.post("/complaints", data);
    return response.data;
  },

  uploadImage: async (complaintId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/complaints/${complaintId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  reopenComplaint: async (id, reason) => {
    const response = await apiClient.post(`/complaints/${id}/reopen`, { reason });
    return response.data;
  },

  getPublicIssues: async (params = {}) => {
    const response = await apiClient.get("/public/issues", { params });
    return response.data;
  },

  getPublicIssueDetail: async (id) => {
    const response = await apiClient.get(`/public/issues/${id}`);
    return response.data;
  },
};
