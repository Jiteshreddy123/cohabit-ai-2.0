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
import CollegeHostels from "./pages/CollegeHostels";
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

const DiscoverRoute = ({ children }) => {
  if (authApi.isAuthenticated()) {
    return (
      <ProtectedRoute>
        <PageLayout>{children}</PageLayout>
      </ProtectedRoute>
    );
  }
  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 flex flex-col font-sans">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800/80 bg-gray-950/90 backdrop-blur-md sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-gray-950 font-black text-sm">CH</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">Cohabit<span className="text-brand-400">AI</span></span>
        </a>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">← Back to Home</a>
          <a href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Admin Login</a>
          <a href="/student-login" className="text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]">Student Portal</a>
        </div>
      </nav>
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* ── Public Routes ──────────────────────────────────── */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={authApi.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/student-login" element={authApi.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <StudentLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* ── Feature 3: College & Hostel Discovery ─────────── */}
          <Route path="/discover" element={<DiscoverRoute><Discover /></DiscoverRoute>} />
          <Route path="/colleges/:id/hostels" element={<DiscoverRoute><CollegeHostels /></DiscoverRoute>} />
          <Route path="/discover/college/:id" element={<DiscoverRoute><CollegeHostels /></DiscoverRoute>} />
          <Route path="/discover/hostel/:id" element={<DiscoverRoute><HostelDetail /></DiscoverRoute>} />

          {/* ── Protected Routes ───────────────────────────────── */}
          <Route path="/dashboard" element={<SharedRoute><Dashboard /></SharedRoute>} />

          {/* ── Feature 1: Verified Student Reviews ───────────── */}
          <Route path="/reviews" element={<SharedRoute><Reviews /></SharedRoute>} />

          {/* ── Feature 2: Student Complaints & Management ─────── */}
          <Route path="/complaints" element={<StudentRoute><MyComplaints /></StudentRoute>} />
          <Route path="/public-issues" element={<SharedRoute><PublicIssues /></SharedRoute>} />
          <Route path="/management/complaints" element={<AdminRoute><ManagementComplaints /></AdminRoute>} />

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