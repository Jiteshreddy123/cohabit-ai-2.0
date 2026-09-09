import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Building, GraduationCap, ChevronRight, AlertCircle, X, ShieldAlert } from "lucide-react";
import { authApi } from "../api/authApi";

const StudentLogin = () => {
  const [collegeCode, setCollegeCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (authApi.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setShowPopup(false);
    setLoading(true);

    try {
      await authApi.studentLogin(collegeCode.trim(), email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      let fallbackMessage = "Incorrect College Code, Email, or Roll Number. Please check your credentials and try again.";

      if (err.response?.data?.detail) {
        fallbackMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        fallbackMessage = err.response.data.message;
      } else if (err.message) {
        fallbackMessage = err.message;
      }

      setError(fallbackMessage);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-y-auto">
      {/* ── Top Floating Error Pop-up / Toast ── */}
      {showPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce-short">
          <div className="bg-red-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 border-2 border-red-400">
            <ShieldAlert className="h-6 w-6 text-white shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base">Wrong Login Credentials!</h4>
              <p className="text-xs sm:text-sm text-red-100 mt-1 leading-snug">
                {error}
              </p>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-700 transition-colors"
              title="Close alert"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 dark:text-blue-500">
          <Building className="h-12 w-12" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Student Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Sign in using your College Code, Email, and Roll Number
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100 dark:border-gray-800">

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                College Code
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md p-2 border"
                  placeholder="e.g. ABC12345"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md p-2 border"
                  placeholder="student@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Roll Number (Password)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-md p-2 border"
                  placeholder="Enter your roll number"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Signing in..." : "Sign in to Student Portal"}
              </button>
            </div>
          </form>

            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  await authApi.studentLogin("ACE2026", "aarav@cohabit.demo", "CS21B001");
                  navigate("/dashboard");
                  window.location.reload();
                }}
                className="w-full flex justify-center items-center py-2 px-4 border border-blue-200 dark:border-blue-800 rounded-md shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                ⚡ Instant Demo Login (Aarav Sharma)
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                    College Administrator?
                  </span>
                </div>
              </div>

              <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Go to Admin Login
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
