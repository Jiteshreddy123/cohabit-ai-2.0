import apiClient from "./apiClient";

// ─── Demo Mode Helpers ────────────────────────────────────────────────────────
// These allow the app to run without a real login for demo/judge presentations.
// The real backend auth system is untouched; just comment out the initDemoSession
// call in main.jsx to restore normal login behaviour.

const DEMO_TOKEN = "demo-bypass-token-cohabit-ai";

const DEMO_USERS = {
  admin: {
    id: 1,
    name: "Demo Admin",
    email: "admin@cohabit.demo",
    role: "admin",
    collegeCode: "DEMO2024",
  },
  student: {
    id: 101,
    name: "Demo Student",
    email: "student@cohabit.demo",
    role: "student",
    collegeCode: "DEMO2024",
  },
};

export const DEMO_STUDENTS = [
  {
    id: 15,
    name: "Aarav Sharma",
    rollNumber: "CS21B001",
    email: "aarav@cohabit.demo",
    branch: "Computer Science",
    year: 3,
    gender: "Male",
    badge: "Night Owl · CS (Year 3)"
  },
  {
    id: 17,
    name: "Rohan Mehta",
    rollNumber: "ME21B003",
    email: "rohan@cohabit.demo",
    branch: "Mechanical Eng",
    year: 3,
    gender: "Male",
    badge: "Night Owl · ME (Year 3)"
  },
  {
    id: 16,
    name: "Priya Patel",
    rollNumber: "EE21B002",
    email: "priya@cohabit.demo",
    branch: "Electrical Eng",
    year: 3,
    gender: "Female",
    badge: "Early Bird · EE (Year 3)"
  },
  {
    id: 18,
    name: "Ananya Verma",
    rollNumber: "CS21B004",
    email: "ananya@cohabit.demo",
    branch: "Computer Science",
    year: 2,
    gender: "Female",
    badge: "Early Bird · CS (Year 2)"
  }
];

export const loginAsDemoAdmin = async () => {
  try {
    const res = await apiClient.post("/login", {
      email: "admin@cohabit.demo",
      password: "Admin@1234",
    });
    if (res.data?.access_token) {
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", "admin");
      localStorage.setItem("user", JSON.stringify({
        id: 4,
        name: "Demo Admin",
        email: "admin@cohabit.demo",
        role: "admin",
        collegeCode: res.data.college_code || "A8FC026B",
      }));
      localStorage.setItem("college", JSON.stringify({ email: "admin@cohabit.demo" }));
      return true;
    }
  } catch (err) {
    console.warn("Admin auto-login error:", err);
  }
  return false;
};

export const loginAsDemoStudent = async (studentId) => {
  const student = DEMO_STUDENTS.find(s => s.id === Number(studentId)) || DEMO_STUDENTS[0];
  try {
    const res = await apiClient.post("/student/login", {
      college_code: "A8FC026B",
      email: student.email,
      password: student.rollNumber,
    });
    if (res.data?.access_token) {
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", "student");
      localStorage.setItem("user", JSON.stringify({
        id: res.data.student_id || student.id,
        name: res.data.student_name || student.name,
        role: "student",
        collegeCode: "A8FC026B",
        email: student.email,
        rollNumber: student.rollNumber,
        branch: student.branch,
      }));
      return true;
    }
  } catch (err) {
    console.warn("Student auto-login failed for", student.name, err);
  }
  return false;
};

export const initDemoSession = async () => {
  const currentToken = localStorage.getItem("token");
  // If no token or mock DEMO_TOKEN, log in as admin
  if (!currentToken || currentToken === DEMO_TOKEN) {
    await loginAsDemoAdmin();
  }
};

export const switchDemoRole = async (role, studentId) => {
  if (role === "student") {
    const success = await loginAsDemoStudent(studentId || 15);
    if (success) {
      window.location.href = "/dashboard";
      return;
    }
  } else {
    const success = await loginAsDemoAdmin();
    if (success) {
      window.location.href = "/dashboard";
      return;
    }
  }

  // Fallback
  const user = DEMO_USERS[role] || DEMO_USERS.admin;
  localStorage.setItem("token", DEMO_TOKEN);
  localStorage.setItem("user", JSON.stringify(user));
  window.location.href = "/dashboard";
};
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email, password) => {
    const response = await apiClient.post("/login", { email, password });
    if (response.data && response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("user", JSON.stringify({ 
        email, 
        role: "admin", 
        collegeCode: response.data.college_code 
      }));
      localStorage.setItem("college", JSON.stringify({ email })); // legacy
    }
    return response.data;
  },

  getMe: async () => {
    // Demo mode: skip backend call, return the locally stored demo user
    if (localStorage.getItem("token") === DEMO_TOKEN) {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    try {
      const response = await apiClient.get("/auth/me");
      if (response.data) {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : {};
        const updatedUser = {
          ...user,
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: "admin",
          collegeCode: response.data.college_code
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
    return null;
  },

  studentLogin: async (college_code, email, password) => {
    const response = await apiClient.post("/student/login", { college_code, email, password });
    if (response.data.access_token) {
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", "student"); // Keep for legacy
      localStorage.setItem("user", JSON.stringify({ 
        id: response.data.student_id,
        role: "student",
        name: response.data.student_name,
        collegeCode: college_code
      }));
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post("/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post("/reset-password", { 
      token, 
      new_password: newPassword 
    });
    return response.data;
  },

  register: async (name, email, password) => {
    const response = await apiClient.post("/register", { name, email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("college");
    localStorage.removeItem("activeSessionId");
    window.location.href = "/login";
  },

  getCurrentCollege: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    const college = localStorage.getItem("college");
    return college ? JSON.parse(college) : null;
  },

  getUserRole: () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      return JSON.parse(userStr).role;
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  }
};
