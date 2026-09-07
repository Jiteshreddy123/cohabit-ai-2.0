import React, { useState, useEffect } from "react";
import { Lightbulb, Users, CheckCircle, AlertCircle, Loader2, ChevronRight, DoorOpen, Award, Globe, Globe2 } from "lucide-react";
import { sessionApi } from "../api/sessionApi";
import { recommendationApi } from "../api/recommendationApi";
import { useNavigate } from "react-router-dom";

// Room capacity labels
const ROOM_SIZE_LABELS = { 1: "Single", 2: "Double", 3: "Triple", 4: "Quad" };

/**
 * Parse the room capacity from room_number strings like "2-Sharing Room 1".
 * Falls back to member count if the format doesn't match.
 */
function getRoomType(roomNumber, memberCount) {
  if (roomNumber) {
    const match = roomNumber.match(/^(\d+)/);
    if (match) {
      const cap = parseInt(match[1], 10);
      return ROOM_SIZE_LABELS[cap] || `${cap}-Sharing`;
    }
  }
  return ROOM_SIZE_LABELS[memberCount] || `${memberCount}-Sharing`;
}

function Recommendations() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchRecommendations(selectedSessionId);
    }
  }, [selectedSessionId]);

  const fetchSessions = async () => {
    try {
      const data = await sessionApi.getSessions();
      setSessions(data);
      if (data.length > 0) {
        setSelectedSessionId(data[0].id);
      }
    } catch (err) {
      setError("Failed to load allocation sessions.");
    }
  };

  const fetchRecommendations = async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await recommendationApi.getRecommendations(sessionId);
      setRecommendations(data);
    } catch (err) {
      setError("Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSessionId) return;

    if (
      !window.confirm(
        "Generating new recommendations will overwrite any existing allocations for this session. Continue?"
      )
    ) {
      return;
    }

    setGenerating(true);
    setError(null);
    try {
      await recommendationApi.generateRecommendations(selectedSessionId);
      await fetchRecommendations(selectedSessionId);
    } catch (err) {
      setError(
        err?.detail ||
          "Failed to generate recommendations. Ensure students have traits extracted."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleViewRoom = (rec) => {
    navigate(`/recommendations/room/${rec.id}`, { state: { recommendation: rec } });
  };

  // Aggregate stats
  const totalStudents = recommendations.reduce(
    (sum, rec) => sum + (rec.members?.length ?? 0),
    0
  );
  const avgScore =
    recommendations.length > 0
      ? recommendations.reduce((sum, rec) => sum + rec.compatibility_score, 0) /
        recommendations.length
      : 0;

  const currentSession = sessions.find((s) => s.id === parseInt(selectedSessionId, 10));

  const handlePublish = async () => {
    if (!selectedSessionId) return;
    try {
      setLoading(true);
      await sessionApi.publishSession(selectedSessionId);
      await fetchSessions();
    } catch (err) {
      setError("Failed to publish/unpublish session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Recommendations</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Review AI-optimized roommate allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm text-sm p-2 focus:ring-brand-500 focus:border-brand-500 border"
          >
            <option value="" disabled>
              Select Session
            </option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title || "Untitled Session"} ({s.academic_year})
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={!selectedSessionId || generating}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm font-medium transition-colors disabled:opacity-50 text-sm"
          >
            {generating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Lightbulb size={16} />
            )}
            Generate New Allocations
          </button>

          {currentSession && (
            <button
              onClick={handlePublish}
              disabled={loading || generating || recommendations.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm font-medium transition-colors disabled:opacity-50 text-sm ${
                currentSession.is_published 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {currentSession.is_published ? <Globe2 size={16} /> : <Globe size={16} />}
              {currentSession.is_published ? "Unpublish" : "Publish Allocations"}
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      ) : recommendations.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-16 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <DoorOpen size={28} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Allocations Found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm">
            Generate new allocations to see AI-optimized roommate matches here. Make sure
            students have completed their interviews first.
          </p>
          <button
            onClick={handleGenerate}
            disabled={!selectedSessionId || generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-500 transition-colors disabled:opacity-50 text-sm"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} />}
            Generate Allocations
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{recommendations.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rooms Allocated</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{totalStudents}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Students Placed</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{avgScore.toFixed(1)}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Avg Compatibility</p>
            </div>
          </div>

          {/* Room Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {recommendations.map((rec) => {
              const memberCount = rec.members?.length ?? 0;
              const roomLabel = getRoomType(rec.room_number, memberCount);
              const scoreColor =
                rec.compatibility_score >= 80
                  ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                  : rec.compatibility_score >= 60
                  ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                  : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";

              return (
                <div
                  key={rec.id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                        <DoorOpen size={18} className="text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight">
                          {rec.room_number}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{roomLabel} Room</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${scoreColor}`}>
                      <Award size={11} />
                      {rec.compatibility_score?.toFixed(1)}%
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col gap-4">
                    {/* Member Avatars Preview */}
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {(rec.members || []).slice(0, 4).map((member, idx) => {
                          const colors = [
                            "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200",
                            "bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200",
                            "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200",
                            "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200",
                          ];
                          const initials = member.student?.name
                            ? member.student.name.charAt(0).toUpperCase()
                            : "?";
                          return (
                            <div
                              key={member.id}
                              title={member.student?.name}
                              className={`w-9 h-9 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold ${colors[idx % colors.length]}`}
                            >
                              {initials}
                            </div>
                          );
                        })}
                        {memberCount > 4 && (
                          <div className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                            +{memberCount - 4}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Users size={14} />
                        <span className="font-medium">{memberCount}</span>
                        <span className="text-xs">student{memberCount !== 1 ? "s" : ""}</span>
                      </div>
                    </div>

                    {/* Reason snippet */}
                    {rec.reason && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
                        {rec.reason}
                      </p>
                    )}

                    {/* Allocated check */}
                    <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                      <CheckCircle size={13} />
                      <span>Allocated</span>
                    </div>
                  </div>

                  {/* View Room Button */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => handleViewRoom(rec)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm group"
                    >
                      <DoorOpen size={15} />
                      View Room Details
                      <ChevronRight size={15} className="ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Recommendations;
