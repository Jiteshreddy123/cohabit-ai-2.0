import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, DoorOpen, Award, User, GraduationCap, Hash } from "lucide-react";

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
      return { label: ROOM_SIZE_LABELS[cap] || `${cap}-Sharing`, capacity: cap };
    }
  }
  return { label: ROOM_SIZE_LABELS[memberCount] || `${memberCount}-Sharing`, capacity: memberCount };
}

function RoomDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  // Data is passed via router state
  const rec = location.state?.recommendation;

  if (!rec) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 text-center">
        <DoorOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Room Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          No room data was provided. Please go back to the recommendations page.
        </p>
        <button
          onClick={() => navigate("/recommendations")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-500 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Recommendations
        </button>
      </div>
    );
  }

  const memberCount = rec.members?.length ?? 0;
  const { label: roomSizeLabel, capacity: roomCapacity } = getRoomType(rec.room_number, memberCount);

  // Generate a color for each member avatar
  const avatarColors = [
    "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button + Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Details</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            AI-optimized allocation for {rec.room_number}
          </p>
        </div>
      </div>

      {/* Room Summary Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-brand-600 to-brand-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <DoorOpen size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{rec.room_number}</h2>
              <p className="text-brand-100 text-sm mt-0.5">{roomSizeLabel} Room • {memberCount} occupant{memberCount !== 1 ? "s" : ""} / {roomCapacity} capacity</p>
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
              <Award size={18} className="text-yellow-200" />
              <span className="text-white font-bold text-lg">{rec.compatibility_score?.toFixed(1)}%</span>
            </div>
            <span className="text-brand-100 text-xs">Compatibility Score</span>
          </div>
        </div>

        {/* Reason */}
        {rec.reason && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">AI Reasoning</p>
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">{rec.reason}</p>
          </div>
        )}

        {/* Room Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{memberCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Members</p>
          </div>
          <div className="px-6 py-4 text-center">
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{roomSizeLabel}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Room Type</p>
          </div>
          <div className="px-6 py-4 text-center col-span-2 sm:col-span-1">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{rec.compatibility_score?.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Match Score</p>
          </div>
        </div>

        {/* Members List */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users size={18} className="text-gray-500 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Room Members</h3>
          </div>

          {rec.members && rec.members.length > 0 ? (
            <div className="space-y-3">
              {rec.members.map((member, idx) => {
                const student = member.student;
                const colorClass = avatarColors[idx % avatarColors.length];
                const initials = student?.name
                  ? student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
                  : "?";

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${colorClass}`}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {student?.name || "Unknown Student"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        {student?.branch && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <GraduationCap size={11} />
                            {student.branch}
                          </span>
                        )}
                        {student?.roll_number && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Hash size={11} />
                            {student.roll_number}
                          </span>
                        )}
                        {student?.gender && (
                          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <User size={11} />
                            {student.gender}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Index badge */}
                    <div className="shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Users size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No members assigned to this room.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RoomDetails;
