import React, { useState, useEffect } from "react";
import { studentApi } from "../api/studentApi";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, GraduationCap, Building2, MapPin, Edit2 } from "lucide-react";

function StudentDetails() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!window.confirm("Are you sure you want to reset this student's password back to their roll number?")) return;
    setIsResetting(true);
    setResetMsg(null);
    try {
      await studentApi.resetPassword(id);
      setResetMsg("Password reset successfully.");
      setTimeout(() => setResetMsg(null), 3000);
    } catch (err) {
      alert("Failed to reset password: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await studentApi.getStudentById(id);
        setStudent(data);
      } catch (err) {
        setError(err.detail || "Failed to load student details");
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading student profile...</div>;
  
  if (error || !student) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mt-10 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Student Not Found</h2>
        <p className="text-red-500 mb-6">{error || "The requested student could not be found."}</p>
        <Link to="/students" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Return to directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/students" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Profile</h1>
        </div>
        <Link
          to={`/students/${id}/edit`}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <Edit2 size={16} />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center text-center h-full transition-colors">
            <div className="w-24 h-24 bg-brand-100 dark:bg-brand-500/20 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{student.name}</h2>
            <p className="text-brand-600 dark:text-brand-400 font-mono font-medium mt-1">{student.roll_number}</p>
            <span className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${
              student.gender === "Male" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
              student.gender === "Female" ? "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300" :
              "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}>
              {student.gender}
            </span>
            
            <div className="mt-6 w-full pt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleResetPassword}
                disabled={isResetting}
                className="w-full border border-red-200 dark:border-red-800/50 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isResetting ? "Resetting..." : "Reset Password"}
              </button>
              {resetMsg && <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">{resetMsg}</p>}
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-900 dark:text-white">Academic Information</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Mail size={16} /> Email Address
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{student.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <Building2 size={16} /> Branch / Major
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{student.branch}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <GraduationCap size={16} /> Year of Study
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">Year {student.year_of_study}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-1">
                    <MapPin size={16} /> Allocation Session ID
                  </dt>
                  <dd className="text-sm text-gray-900 dark:text-white">#{student.allocation_session_id}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* AI Insights placeholder */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Personality Insights</h3>
              <span className="text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full">Pending Interview</span>
            </div>
            <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              <p className="mb-4">This student has not completed their AI room compatibility interview yet.</p>
              <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                Send Interview Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDetails;
