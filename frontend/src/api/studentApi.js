import apiClient from "./apiClient";

export const studentApi = {
  getStudents: async (sessionId = null) => {
    const url = sessionId ? `/students?session_id=${sessionId}` : "/students";
    const response = await apiClient.get(url);
    return response.data;
  },

  getStudentById: async (id) => {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await apiClient.post("/students", studentData);
    return response.data;
  },

  updateStudent: async (id, studentData) => {
    const response = await apiClient.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id) => {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  },

  resetPassword: async (id) => {
    const response = await apiClient.post(`/students/${id}/reset-password`);
    return response.data;
  }
};
