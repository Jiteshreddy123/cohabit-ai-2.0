import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const getStudents = async () => {

    const token = localStorage.getItem("token");

    const response = await axios.get(
        `${API_URL}/students`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};

export const addStudent = async (student) => {
    const response = await axios.post(
        `${API_URL}/students`,
        student
    );

    return response.data;
};