import React, { useState, useEffect } from "react";
import { sessionApi } from "../api/sessionApi";
import { Link, useNavigate } from "react-router-dom";
import { Plus, AlertCircle, Layers, Settings } from "lucide-react";

function SessionList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const activeSessionId = localStorage.getItem("activeSessionId") 
    ? parseInt(localStorage.getItem("activeSessionId"), 10) 
    : null;

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await sessionApi.getSessions();
      setSessions(data);
    } catch (err) {
      setError(err.detail || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetActive = (id) => {
    localStorage.setItem("activeSessionId", id);
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Allocation Sessions</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your student intake and room allocation cycles.</p>
        </div>
        <Link 
          to="/sessions/new" 
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Session
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-500 mt-0.5 mr-3 shrink-0" size={18} />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No sessions found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Create a session to start allocating rooms to students.</p>
            <Link 
              to="/sessions/new" 
              className="inline-flex bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-500 transition-colors shadow-sm"
            >
              Create First Session
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Academic Year</th>
                  <th className="px-6 py-4 font-semibold">Session Size</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sessions.map((session) => (
                  <tr 
                    key={session.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/sessions/${session.id}/structure`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {session.title}
                        <Settings size={16} className="text-gray-400" />
                      </div>
                      {session.id === activeSessionId && (
                        <span className="inline-block mt-1 text-xs font-semibold text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full">
                          Currently Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{session.academic_year}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{session.session_size} students</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${session.session_status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                        {session.session_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {session.id !== activeSessionId ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSetActive(session.id); }}
                          className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-medium text-sm bg-brand-50 dark:bg-brand-900/30 px-3 py-1.5 rounded hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
                        >
                          Set Active
                        </button>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 font-medium text-sm px-3 py-1.5">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SessionList;
