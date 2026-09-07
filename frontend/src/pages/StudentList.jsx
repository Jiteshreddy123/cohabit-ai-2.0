import React, { useState, useEffect } from "react";
import { studentApi } from "../api/studentApi";
import { sessionApi } from "../api/sessionApi";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, UserPlus, AlertCircle } from "lucide-react";

function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const activeSessionId = localStorage.getItem("activeSessionId")
    ? parseInt(localStorage.getItem("activeSessionId"), 10)
    : null;

  const loadData = async () => {
    if (!activeSessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const sessions = await sessionApi.getSessions();
      const current = sessions.find((s) => s.id === activeSessionId);
      setActiveSession(current);

      if (current) {
        const studentData = await studentApi.getStudents(activeSessionId);
        setStudents(studentData);
      }
    } catch (err) {
      setError(err.detail || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSessionId]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await studentApi.deleteStudent(id);
        setStudents(students.filter(s => s.id !== id));
      } catch (err) {
        alert("Failed to delete student");
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!activeSessionId) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center max-w-2xl mx-auto mt-10 transition-colors">
        <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Active Session Selected</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          You must select or create an allocation session on the Dashboard before you can view or enroll students.
        </p>
        <Link
          to="/"
          className="inline-flex bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-500 transition-colors shadow-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Active Session: <span className="font-semibold text-gray-700 dark:text-gray-300">{activeSession?.title || `Session #${activeSessionId}`}</span>
          </p>
        </div>
        <Link
          to="/students/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-500 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Student
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-500 mt-0.5 mr-3 shrink-0" size={18} />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col transition-colors">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by name, roll no, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium shadow-sm transition-colors">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center">
            <UserPlus className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students enrolled yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Add students individually or import them to begin the allocation process.</p>
            <Link
              to="/students/new"
              className="inline-flex bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-500 transition-colors shadow-sm"
            >
              Enroll First Student
            </Link>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">No students match your search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-semibold">Name & Email</th>
                  <th className="px-6 py-4 font-semibold">Roll Number</th>
                  <th className="px-6 py-4 font-semibold">Branch</th>
                  <th className="px-6 py-4 font-semibold">Year</th>
                  <th className="px-6 py-4 font-semibold">Gender</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{s.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{s.email}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">{s.roll_number}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{s.branch}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{s.year_of_study}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        s.gender === "Male" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                        s.gender === "Female" ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300" :
                        "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }`}>
                        {s.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/students/${s.id}`} className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-md transition-colors" title="View Details">
                          <Eye size={18} />
                        </Link>
                        <Link to={`/students/${s.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Edit">
                          <Edit2 size={18} />
                        </Link>
                        <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
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

export default StudentList;
