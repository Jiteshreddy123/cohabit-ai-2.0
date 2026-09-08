import apiClient from "./apiClient";

export const reviewApi = {
  getReviews: async (params = {}) => {
    const response = await apiClient.get("/reviews", { params });
    return response.data;
  },

  getReview: async (id) => {
    const response = await apiClient.get(`/reviews/${id}`);
    return response.data;
  },

  createReview: async (data) => {
    const response = await apiClient.post("/reviews", data);
    return response.data;
  },

  uploadImage: async (reviewId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post(`/reviews/${reviewId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateReview: async (id, data) => {
    const response = await apiClient.put(`/reviews/${id}`, data);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await apiClient.delete(`/reviews/${id}`);
    return response.data;
  },

  markHelpful: async (id) => {
    const response = await apiClient.post(`/reviews/${id}/helpful`);
    return response.data;
  },

  flagReview: async (id, reason) => {
    const response = await apiClient.post(`/reviews/${id}/flag`, { reason });
    return response.data;
  },
};
