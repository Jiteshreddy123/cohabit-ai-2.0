import apiClient from "./apiClient";

export const sessionApi = {
  getSessions: async () => {
    const response = await apiClient.get("/allocation-sessions/");
    return response.data;
  },

  getSessionById: async (id) => {
    const response = await apiClient.get(`/allocation-sessions/${id}`);
    return response.data;
  },

  createSession: async (sessionData) => {
    const response = await apiClient.post("/allocation-sessions/", sessionData);
    return response.data;
  },

  updateRoomInventory: async (id, roomInventory) => {
    // roomInventory is an object like { "2": 20, "3": 10 }
    const response = await apiClient.put(`/allocation-sessions/${id}/room-inventory`, {
      room_inventory: roomInventory,
    });
    return response.data;
  },

  updateSessionStatus: async (id, newStatus) => {
    const response = await apiClient.put(`/allocation-sessions/${id}/status`, {
      session_status: newStatus,
    });
    return response.data;
  },

  publishSession: async (id) => {
    const response = await apiClient.put(`/allocation-sessions/${id}/publish`);
    return response.data;
  },
};

