import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authApi } from "../api/authApi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Building2, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  name: z.string().min(2, "College name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(location.state?.isRegister || false);
  const [apiError, setApiError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  React.useEffect(() => {
    if (authApi.isAuthenticated()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setSuccessMsg(null);
    try {
      if (isRegister) {
        await authApi.register(data.name, data.email, data.password);
        setSuccessMsg("Registration successful! You can now log in.");
        setIsRegister(false);
        reset();
      } else {
        await authApi.login(data.email, data.password);
        navigate("/dashboard");
        window.location.reload();
      }
    } catch (err) {
      setApiError(err.detail || "An error occurred. Please try again.");
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setApiError(null);
    setSuccessMsg(null);
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Cohabit-AI
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {isRegister ? "Register your College Admin account" : "Sign in to your admin account"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-800 transition-colors">
          
          {apiError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="text-red-500 mt-0.5 mr-3 shrink-0" size={18} />
              <div className="text-sm text-red-700">{apiError}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle2 className="text-green-500 mt-0.5 mr-3 shrink-0" size={18} />
              <div className="text-sm text-green-700">{successMsg}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  College Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    {...register("name")}
                    type="text"
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.name ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                    placeholder="e.g. IIT Bombay"
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.email ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="admin@college.edu"
                />
              </div>
              {errors.email && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  {...register("password")}
                  type="password"
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${errors.password ? 'border-red-300 dark:border-red-500/50' : 'border-gray-300 dark:border-gray-700'}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
              {!isRegister && (
                <div className="flex justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Processing..." : isRegister ? "Create Account" : "Sign in"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  {isRegister ? "Already have an account?" : "New to Cohabit-AI?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={toggleMode}
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                {isRegister ? "Sign in to existing account" : "Register a new college"}
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={async () => {
                  await authApi.login("admin@cohabit.demo", "Admin@1234");
                  navigate("/dashboard");
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
              >
                ⚡ Instant Demo Login (Skip to Dashboard)
              </button>
            </div>

            <div className="mt-4">
              <Link
                to="/student-login"
                className="w-full flex justify-center py-2.5 px-4 border border-brand-200 dark:border-brand-800 rounded-lg shadow-sm text-sm font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
              >
                I am a Student
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
