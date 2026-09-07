import React, { useState, useEffect } from "react";
import { sessionApi } from "../api/sessionApi";
import { studentApi } from "../api/studentApi";
import { Users, Layers, Lightbulb, TrendingUp, AlertCircle, RefreshCw, Building2, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import StudentDashboard from "./StudentDashboard";

function StatCard({ title, value, icon, colorClass }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`p-4 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
    </div>
  );
}

function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [stats, setStats] = useState({ studentsCount: 0 });
  const [copiedCode, setCopiedCode] = useState(false);
  const role = authApi.getUserRole();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "{}"));

  const activeSessionId = localStorage.getItem("activeSessionId")
    ? parseInt(localStorage.getItem("activeSessionId"), 10)
    : null;

  // Calculate real total bed capacity from room_inventory
  const calcTotalBeds = (session) => {
    if (!session?.room_inventory || Object.keys(session.room_inventory).length === 0) return null;
    return Object.entries(session.room_inventory).reduce(
      (sum, [cap, count]) => sum + parseInt(cap) * parseInt(count),
      0
    );
  };

  const handleCopyCode = () => {
    if (user.collegeCode) {
      navigator.clipboard.writeText(user.collegeCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      if (role === "admin") {
        const freshUser = await authApi.getMe();
        if (freshUser) {
          setUser(freshUser);
        }
      }

      const sessionData = await sessionApi.getSessions();
      setSessions(sessionData);

      if (sessionData.length > 0 && !activeSessionId) {
        const defaultId = sessionData[0].id;
        localStorage.setItem("activeSessionId", defaultId);
      }

      const activeId = activeSessionId || (sessionData.length > 0 ? sessionData[0].id : null);
      if (activeId) {
        const studentData = await studentApi.getStudents(activeId);
        setStats({ studentsCount: studentData.length });
      }
    } catch (err) {
      setApiError(err.detail || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      loadData();
    } else {
      setLoading(false);
    }
  }, [activeSessionId, role]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const totalBeds = calcTotalBeds(activeSession);
  const vacancySeats = totalBeds !== null ? totalBeds - stats.studentsCount : null;

  if (role === "student") {
    return <StudentDashboard />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monitor your allocation sessions and student metrics.</p>
          {user.collegeCode && (
            <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300">College Code for Students:</span>
              <code className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded font-mono font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 shadow-sm text-xs sm:text-sm">{user.collegeCode}</code>
              <button
                onClick={handleCopyCode}
                title="Copy College Code"
                className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded transition-colors"
              >
                {copiedCode ? <Check size={14} className="text-green-600 dark:text-green-400" /> : <Copy size={14} />}
              </button>
              {copiedCode && <span className="text-xs text-green-600 dark:text-green-400 font-medium">Copied!</span>}
            </div>
          )}
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-500 mt-0.5 mr-3 shrink-0" size={18} />
          <div className="text-sm text-red-700">{apiError}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Sessions"
          value={sessions.length}
          icon={<Layers size={24} className="text-brand-600 dark:text-brand-400" />}
          colorClass="bg-brand-50 dark:bg-brand-500/10"
        />
        <StatCard
          title="Total Hostel Capacity"
          value={totalBeds !== null ? `${totalBeds} beds` : "Not configured"}
          icon={<Building2 size={24} className="text-blue-600 dark:text-blue-400" />}
          colorClass="bg-blue-50 dark:bg-blue-500/10"
        />
        <StatCard
          title="Enrolled Students"
          value={stats.studentsCount}
          icon={<Users size={24} className="text-purple-600 dark:text-purple-400" />}
          colorClass="bg-purple-50 dark:bg-purple-500/10"
        />
        <StatCard
          title="Vacancy (Active Session)"
          value={
            vacancySeats !== null
              ? vacancySeats >= 0
                ? `${vacancySeats} seats left`
                : `${Math.abs(vacancySeats)} over capacity`
              : "N/A"
          }
          icon={<TrendingUp size={24} className="text-amber-600 dark:text-amber-400" />}
          colorClass="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Link
          to="/sessions/new"
          className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-brand-500 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-lg w-fit group-hover:bg-brand-500 group-hover:text-white transition-colors text-brand-600 dark:text-brand-400">
            <Layers size={20} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mt-4 text-base">Create Allocation Session</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure room quotas and begin gathering student preferences.</p>
        </Link>

        <Link
          to="/students/new"
          className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg w-fit group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-600 dark:text-blue-400">
            <Users size={20} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mt-4 text-base">Enroll Students</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add student records or upload batches to active allocation cohorts.</p>
        </Link>

        <Link
          to="/recommendations"
          className="p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-purple-500 hover:shadow-md transition-all group"
        >
          <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-lg w-fit group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-600 dark:text-purple-400">
            <Lightbulb size={20} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mt-4 text-base">Run AI Allocation</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Compute compatibility metrics and generate optimal room assignments.</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
