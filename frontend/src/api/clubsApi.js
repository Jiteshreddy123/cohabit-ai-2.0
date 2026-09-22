import apiClient from "./apiClient";

export const clubsApi = {
  getClubs: async (params = {}) => {
    const response = await apiClient.get("/hos-clubs", { params });
    return response.data;
  },

  getClub: async (id) => {
    const response = await apiClient.get(`/hos-clubs/${id}`);
    return response.data;
  },

  getEngagementStatus: async () => {
    const response = await apiClient.get("/hos-clubs/engagement/status");
    return response.data;
  },

  joinClub: async (id) => {
    const response = await apiClient.post(`/hos-clubs/${id}/join`);
    return response.data;
  },

  leaveClub: async (id) => {
    const response = await apiClient.post(`/hos-clubs/${id}/leave`);
    return response.data;
  },

  createClub: async (data) => {
    const response = await apiClient.post("/hos-clubs", data);
    return response.data;
  },

  createActivity: async (clubId, data) => {
    const response = await apiClient.post(`/hos-clubs/${clubId}/activities`, data);
    return response.data;
  },

  rsvpActivity: async (activityId) => {
    const response = await apiClient.post(`/hos-clubs/activities/${activityId}/rsvp`);
    return response.data;
  },
};
