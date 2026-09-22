import apiClient from "./apiClient";

export const mentorshipApi = {
  getMyMentor: async () => {
    const response = await apiClient.get("/mentorship/my-mentor");
    return response.data;
  },

  submitPreNotes: async (notes) => {
    const response = await apiClient.post("/mentorship/pre-call-notes", {
      student_pre_notes: notes,
    });
    return response.data;
  },

  getAcademicRoster: async () => {
    const response = await apiClient.get("/mentorship/academic-roster");
    return response.data;
  },

  getStudentHistory: async (studentId) => {
    const response = await apiClient.get(`/mentorship/student/${studentId}/history`);
    return response.data;
  },

  logCheckinCall: async (callId, data) => {
    const response = await apiClient.post(`/mentorship/calls/${callId}/log`, data);
    return response.data;
  },

  scheduleCall: async (data) => {
    const response = await apiClient.post("/mentorship/schedule", data);
    return response.data;
  },
};
