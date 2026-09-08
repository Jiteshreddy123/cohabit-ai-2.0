import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import PageLayout from "./layouts/PageLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import StudentList from "./pages/StudentList";
import StudentForm from "./pages/StudentForm";
import StudentDetails from "./pages/StudentDetails";
import Interview from "./pages/Interview";
import InterviewDetails from "./pages/InterviewDetails";
import SessionList from "./pages/SessionList";
import SessionForm from "./pages/SessionForm";
import SessionStructure from "./pages/SessionStructure";
import Recommendations from "./pages/Recommendations";
import RoomDetails from "./pages/RoomDetails";
import Profile from "./pages/Profile";
import Login from "./pages/login";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Marketplace from "./pages/Marketplace";
import MicroGigs from "./pages/MicroGigs";
import Chat from "./pages/Chat";

// New Integrated Features
import Discover from "./pages/Discover";
import HostelDetail from "./pages/HostelDetail";
import Reviews from "./pages/Reviews";
import MyComplaints from "./pages/MyComplaints";
import ManagementComplaints from "./pages/ManagementComplaints";
import PublicIssues from "./pages/PublicIssues";

import StudentLogin from "./pages/StudentLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { authApi } from "./api/authApi";

// Helper: wraps a page in both PageLayout and ProtectedRoute
const AdminRoute = ({ children }) => {
  const role = authApi.getUserRole();
  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <ProtectedRoute>
      <PageLayout>{children}</PageLayout>
    </ProtectedRoute>
  );
};

const StudentRoute = ({ children }) => {
  const role = authApi.getUserRole();
  if (role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <ProtectedRoute>
      <PageLayout>{children}</PageLayout>
    </ProtectedRoute>
  );
};

const SharedRoute = ({ children }) => {
  return (
    <ProtectedRoute>
      <PageLayout>{children}</PageLayout>
    </ProtectedRoute>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* ── Public Routes ──────────────────────────────────── */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={authApi.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/student-login" element={authApi.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <StudentLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Protected Routes ───────────────────────────────── */}
          <Route path="/dashboard" element={<SharedRoute><Dashboard /></SharedRoute>} />

          {/* ── Feature 1: Verified Student Reviews ───────────── */}
          <Route path="/reviews" element={<SharedRoute><Reviews /></SharedRoute>} />

          {/* ── Feature 2: Student Complaints & Management ─────── */}
          <Route path="/complaints" element={<StudentRoute><MyComplaints /></StudentRoute>} />
          <Route path="/public-issues" element={<SharedRoute><PublicIssues /></SharedRoute>} />
          <Route path="/management/complaints" element={<AdminRoute><ManagementComplaints /></AdminRoute>} />

          {/* ── Feature 3: College & Hostel Discovery ─────────── */}
          <Route path="/discover" element={<SharedRoute><Discover /></SharedRoute>} />
          <Route path="/discover/hostel/:id" element={<SharedRoute><HostelDetail /></SharedRoute>} />

          {/* ── Admin Allocation Management ───────────────────── */}
          <Route path="/sessions" element={<AdminRoute><SessionList /></AdminRoute>} />
          <Route path="/sessions/new" element={<AdminRoute><SessionForm /></AdminRoute>} />
          <Route path="/sessions/:id/structure" element={<AdminRoute><SessionStructure /></AdminRoute>} />

          <Route path="/students" element={<AdminRoute><StudentList /></AdminRoute>} />
          <Route path="/students/new" element={<AdminRoute><StudentForm /></AdminRoute>} />
          <Route path="/students/:id" element={<AdminRoute><StudentDetails /></AdminRoute>} />
          <Route path="/students/:id/edit" element={<AdminRoute><StudentForm isEditing /></AdminRoute>} />

          <Route path="/recommendations" element={<AdminRoute><Recommendations /></AdminRoute>} />
          <Route path="/recommendations/room/:id" element={<AdminRoute><RoomDetails /></AdminRoute>} />
          <Route path="/profile" element={<AdminRoute><Profile /></AdminRoute>} />

          {/* ── Student Engagement & Personality AI ────────────── */}
          <Route path="/interview" element={<StudentRoute><Interview /></StudentRoute>} />
          <Route path="/interview/:id" element={<AdminRoute><InterviewDetails /></AdminRoute>} />
          <Route path="/marketplace" element={<StudentRoute><Marketplace /></StudentRoute>} />
          <Route path="/micro-gigs" element={<StudentRoute><MicroGigs /></StudentRoute>} />
          <Route path="/chat" element={<StudentRoute><Chat /></StudentRoute>} />
          <Route path="/chat/:convId" element={<StudentRoute><Chat /></StudentRoute>} />

          {/* ── 404 ────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;