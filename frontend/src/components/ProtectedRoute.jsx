import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { initDemoSession } from "../api/authApi";

/**
 * ProtectedRoute
 *
 * Wraps any route that requires authentication.
 * If no JWT token is found, auto-authenticates via initDemoSession.
 * If authentication fails completely, redirects to /login.
 */
function ProtectedRoute({ children }) {
  const location = useLocation();
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isInitializing, setIsInitializing] = useState(!token);

  useEffect(() => {
    if (!token) {
      initDemoSession()
        .then(() => {
          setToken(localStorage.getItem("token"));
        })
        .finally(() => {
          setIsInitializing(false);
        });
    }
  }, [token]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 text-gray-600 dark:text-gray-300">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium animate-pulse">Initializing Cohabit-AI workspace...</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
