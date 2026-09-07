import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { studentApi } from "../api/studentApi";
import { traitApi } from "../api/traitApi";
import { ArrowLeft, User, Activity, AlertCircle } from "lucide-react";

function InterviewDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [traits, setTraits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentData = await studentApi.getStudentById(id);
        setStudent(studentData);
        
        try {
          const traitData = await traitApi.getStudentTraits(id);
          setTraits(traitData.data);
        } catch (e) {
          console.warn("Could not load traits (expected if placeholders)");
        }
      } catch (err) {
        setError("Failed to load interview details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading interview data...</div>;

  if (error || !student) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mt-10 transition-colors">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error || "Could not find details."}</p>
        <Link to="/interview" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
          Return to Interviews
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/interview" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Extracted Traits</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View the AI-analyzed personality profile for {student.name}.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 flex flex-col items-center text-center transition-colors">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
            <User size={32} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{student.branch}</p>
          <div className="mt-4 w-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 py-2 rounded-lg text-sm font-medium border border-green-100 dark:border-green-800/50 flex items-center justify-center gap-2">
            <Activity size={16} />
            Interview Complete
          </div>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-900 dark:text-white">LLM Extracted Persona</h3>
          </div>
          
          {traits ? (
            <div className="p-6 space-y-5">
              {traits.personality_summary && (
                <div className="bg-brand-50/60 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/40 p-4 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 mb-1">
                    AI Personality Summary
                  </h4>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                    {traits.personality_summary}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Sleep / Wake Schedule</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 block">
                    🌙 {traits.sleep_time || "11:00 PM"} — ☀️ {traits.wake_time || "7:00 AM"}
                  </span>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Preferred Room Size</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 block">
                    🏠 {traits.preferred_room_size ? `${traits.preferred_room_size}-Person Room` : "2-Person Room"}
                  </span>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-800 sm:col-span-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block font-medium">Study Style</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5 block">
                    📚 {traits.study_style || "Balanced Study"}
                  </span>
                </div>
              </div>

              {/* Trait Vector Sliders */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    <span>Cleanliness &amp; Organization</span>
                    <span className="font-bold">{Math.round((traits.cleanliness || 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${(traits.cleanliness || 0.5) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    <span>Noise Tolerance</span>
                    <span className="font-bold">{Math.round((traits.noise_tolerance || 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${(traits.noise_tolerance || 0.5) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    <span>Social &amp; Outgoing Scale</span>
                    <span className="font-bold">{Math.round((traits.social_level || 0.5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${(traits.social_level || 0.5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {traits.non_negotiable_preferences && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold uppercase tracking-wider block mb-0.5">Non-Negotiable:</span>
                  {traits.non_negotiable_preferences}
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-800/50">
                <Activity size={24} className="text-blue-500 dark:text-blue-400" />
              </div>
              <h4 className="text-gray-900 dark:text-white font-medium mb-2">Traits Extraction in Progress</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                The interview is pending completion or trait vectors are being processed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewDetails;
