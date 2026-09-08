import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { authApi, DEMO_STUDENTS, switchDemoRole } from "../api/authApi";
import {
  LayoutDashboard, Users, Layers, Lightbulb,
  Settings, FileText, ShoppingBag, Zap, MessageCircle,
  ShieldCheck, GraduationCap, Compass, AlertTriangle,
  Star, Globe, Inbox, Building2
} from "lucide-react";

function Sidebar() {
  const isAuthenticated = authApi.isAuthenticated();
  const [currentRole, setCurrentRole] = useState(authApi.getUserRole() || "admin");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentStudentId = user?.id || 1;

  if (!isAuthenticated) return null;

  const isAdmin = currentRole === "admin";

  const adminLinks = [
    { to: "/dashboard",             label: "Dashboard",            icon: <LayoutDashboard size={18} /> },
    { to: "/management/complaints", label: "Complaints Desk",      icon: <Inbox size={18} /> },
    { to: "/reviews",               label: "Verified Reviews",     icon: <Star size={18} /> },
    { to: "/discover",              label: "Hostel Discovery",     icon: <Compass size={18} /> },
    { to: "/sessions",              label: "Allocation Sessions",  icon: <Layers size={18} /> },
    { to: "/students",              label: "Students",              icon: <Users size={18} /> },
    { to: "/recommendations",       label: "AI Allocations",       icon: <Lightbulb size={18} /> },
  ];

  const studentLinks = [
    { to: "/dashboard",     label: "Dashboard",         icon: <LayoutDashboard size={18} /> },
    { to: "/discover",      label: "Discover Hostels",  icon: <Compass size={18} /> },
    { to: "/reviews",       label: "Campus Reviews",    icon: <Star size={18} /> },
    { to: "/complaints",    label: "My Complaints",     icon: <AlertTriangle size={18} /> },
    { to: "/public-issues", label: "Public Issues",     icon: <Globe size={18} /> },
    { to: "/interview",     label: "AI Interview",      icon: <FileText size={18} /> },
    { to: "/marketplace",   label: "Marketplace",       icon: <ShoppingBag size={18} /> },
    { to: "/micro-gigs",    label: "Quick Gigs",        icon: <Zap size={18} /> },
    { to: "/chat",          label: "Messages",          icon: <MessageCircle size={18} /> },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  const handleSwitch = (role, studentId) => {
    setCurrentRole(role);
    switchDemoRole(role, studentId);
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 px-4 py-6 min-h-[calc(100vh-64px)] flex flex-col transition-colors">
      <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider mb-4 px-3">
        Menu
      </h3>
      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-semibold"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {isAdmin && (
        <div className="mt-6">
          <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider mb-4 px-3">
            Account
          </h3>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`
            }
          >
            <Settings size={18} />
            Profile Settings
          </NavLink>
        </div>
      )}

      {/* ── Demo Perspective Switcher ───────────────────────────────────── */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Perspective Switcher
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 font-mono font-semibold">
            {isAdmin ? "Admin" : "Student"}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            id="demo-view-admin"
            onClick={() => handleSwitch("admin")}
            title="Switch to Admin perspective"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${
              isAdmin
                ? "bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-300/40 dark:shadow-brand-800/40"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400"
            }`}
          >
            <ShieldCheck size={13} />
            Admin
          </button>
          <button
            id="demo-view-student"
            onClick={() => handleSwitch("student", currentStudentId)}
            title="Switch to Student perspective"
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-semibold transition-all border ${
              !isAdmin
                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-300/40 dark:shadow-blue-800/40"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            <GraduationCap size={13} />
            Student
          </button>
        </div>

        {/* Demo Student Selector Dropdown Box */}
        {!isAdmin && (
          <div className="mt-3">
            <label className="block text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mb-1 px-0.5">
              Choose Student:
            </label>
            <select
              id="demo-student-select"
              value={currentStudentId}
              onChange={(e) => handleSwitch("student", Number(e.target.value))}
              className="w-full text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-blue-200 dark:border-blue-800/60 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer hover:border-blue-400 transition-colors shadow-sm"
            >
              {DEMO_STUDENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.badge})
                </option>
              ))}
            </select>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1.5 px-0.5 leading-snug">
              Select any student to test reviews, complaints &amp; room matching.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;