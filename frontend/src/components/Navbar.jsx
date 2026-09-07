import React from "react";
import { authApi } from "../api/authApi";
import { LogOut, Home, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAuthenticated = authApi.isAuthenticated();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const isAdmin = user.role === "admin";

  return (
    <nav className="bg-dark-900 text-white px-6 h-16 flex justify-between items-center shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="bg-brand-500 p-1.5 rounded-md flex items-center justify-center">
          <Home size={20} className="text-white" />
        </div>
        <h2 className="m-0 text-xl font-bold tracking-tight">
          Cohabit-AI
        </h2>
        <span className="text-xs bg-brand-600/20 text-brand-300 px-2.5 py-1 rounded-full font-medium ml-2 border border-brand-500/20">
          {isAdmin ? "Admin Portal" : "Student Portal"}
        </span>
      </div>

      {isAuthenticated && (
        <div className="flex items-center gap-6">
          <span className="text-sm text-gray-400 hidden sm:inline">
            Welcome, <strong className="text-white font-medium">{user.name || user.email || 'Student'}</strong>
          </span>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 text-gray-400 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors border border-dark-700"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={authApi.logout}
            className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-dark-700"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;