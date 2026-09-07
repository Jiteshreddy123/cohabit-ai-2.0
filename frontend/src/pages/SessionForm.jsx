import React, { useState } from "react";
import { sessionApi } from "../api/sessionApi";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, BedDouble, HelpCircle } from "lucide-react";

// Room type definitions with labels and descriptions
const ROOM_TYPES = [
  { capacity: 1, label: "Single Room", description: "1 student per room", icon: "🛏️" },
  { capacity: 2, label: "Double Room", description: "2 students per room", icon: "🛏️🛏️" },
  { capacity: 3, label: "Triple Room", description: "3 students per room", icon: "🛏️🛏️🛏️" },
  { capacity: 4, label: "Quad Room", description: "4 students per room", icon: "🏨" },
];

function SessionForm() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [sessionSize, setSessionSize] = useState("");

  // Room inventory: {1: 0, 2: 0, 3: 0, 4: 0}
  const [roomCounts, setRoomCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });

  // Computed: total available beds
  const totalBeds = ROOM_TYPES.reduce(
    (sum, rt) => sum + (parseInt(roomCounts[rt.capacity]) || 0) * rt.capacity,
    0
  );

  const handleRoomCountChange = (capacity, value) => {
    const num = Math.max(0, parseInt(value) || 0);
    setRoomCounts((prev) => ({ ...prev, [capacity]: num }));
  };

  const validate = () => {
    if (!title.trim() || title.length < 2) return "Title must be at least 2 characters.";
    if (!/^\d{4}(-\d{2,4})?$/.test(academicYear)) return "Academic year must be YYYY or YYYY-YY or YYYY-YYYY.";
    const sz = parseInt(sessionSize);
    if (!sz || sz <= 0) return "Number of students must be greater than 0.";
    if (totalBeds < sz) {
      return `Total room capacity (${totalBeds} beds) is less than student count (${sz}). Add more rooms.`;
    }
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const validationError = validate();
    if (validationError) {
      setApiError(validationError);
      return;
    }

    // Build room_inventory: only include room types where count > 0
    const room_inventory = {};
    for (const rt of ROOM_TYPES) {
      const count = parseInt(roomCounts[rt.capacity]) || 0;
      if (count > 0) {
        room_inventory[String(rt.capacity)] = count;
      }
    }

    try {
      setSubmitting(true);
      await sessionApi.createSession({
        title: title.trim(),
        academic_year: academicYear.trim(),
        session_size: parseInt(sessionSize),
        room_inventory,
      });
      navigate("/sessions");
    } catch (err) {
      setApiError(err?.response?.data?.detail || err.detail || "Failed to create session.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 transition-shadow";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/sessions" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Allocation Session</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Set up a new hostel intake cycle with your room inventory.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {apiError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-500 mt-0.5 mr-3 shrink-0" size={18} />
          <div className="text-sm text-red-700 dark:text-red-300">{apiError}</div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 space-y-5 transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">
            Session Details
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. 2025 B.Tech Freshers Hostel Intake"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className={inputClass}
                placeholder="e.g. 2024-2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Students
              </label>
              <input
                type="number"
                min="1"
                value={sessionSize}
                onChange={(e) => setSessionSize(e.target.value)}
                className={inputClass}
                placeholder="e.g. 60"
              />
            </div>
          </div>
        </div>

        {/* Room Inventory */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 sm:p-8 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <BedDouble size={20} className="text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Room Inventory</h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Enter the number of rooms of each type available in your hostel.
            Students will be allocated to the room type they prefer in the AI interview.
          </p>

          <div className="space-y-4">
            {ROOM_TYPES.map((rt) => (
              <div
                key={rt.capacity}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{rt.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{rt.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Number of rooms:</label>
                  <input
                    type="number"
                    min="0"
                    value={roomCounts[rt.capacity]}
                    onChange={(e) => handleRoomCountChange(rt.capacity, e.target.value)}
                    className="w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Capacity Summary */}
          <div className={`mt-4 p-3 rounded-lg text-sm flex items-center justify-between ${
            totalBeds >= (parseInt(sessionSize) || 0) && totalBeds > 0
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800/30"
              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30"
          }`}>
            <span>Total capacity: <strong>{totalBeds} beds</strong></span>
            {parseInt(sessionSize) > 0 && (
              <span>
                {totalBeds >= parseInt(sessionSize)
                  ? `✓ Enough for ${sessionSize} students`
                  : `⚠ Need ${parseInt(sessionSize) - totalBeds} more beds`}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to="/sessions"
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-70 transition-colors shadow-sm"
          >
            {submitting ? "Creating..." : "Create Session"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SessionForm;
