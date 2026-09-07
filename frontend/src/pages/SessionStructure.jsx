import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { sessionApi } from "../api/sessionApi";
import { ArrowLeft, Check, AlertCircle, BedDouble } from "lucide-react";

const ROOM_TYPES = [
  { capacity: 1, label: "Single Room", description: "1 student per room" },
  { capacity: 2, label: "Double Room", description: "2 students per room" },
  { capacity: 3, label: "Triple Room", description: "3 students per room" },
  { capacity: 4, label: "Quad Room", description: "4 students per room" },
];

function SessionStructure() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Local state for room counts
  const [roomCounts, setRoomCounts] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const data = await sessionApi.getSessionById(parseInt(id));
        setSession(data);

        // Pre-populate from existing room_inventory
        if (data.room_inventory) {
          const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
          for (const [k, v] of Object.entries(data.room_inventory)) {
            const cap = parseInt(k);
            if (cap >= 1 && cap <= 4) counts[cap] = v;
          }
          setRoomCounts(counts);
        }
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load session details.");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [id]);

  const handleRoomCountChange = (capacity, value) => {
    const num = Math.max(0, parseInt(value) || 0);
    setRoomCounts((prev) => ({ ...prev, [capacity]: num }));
  };

  const totalBeds = ROOM_TYPES.reduce(
    (sum, rt) => sum + (roomCounts[rt.capacity] || 0) * rt.capacity,
    0
  );

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    // Build inventory (only non-zero types)
    const inventory = {};
    for (const rt of ROOM_TYPES) {
      if (roomCounts[rt.capacity] > 0) {
        inventory[String(rt.capacity)] = roomCounts[rt.capacity];
      }
    }

    if (Object.keys(inventory).length === 0) {
      setError("Please add at least one room type with a count greater than 0.");
      return;
    }

    if (session && totalBeds < session.session_size) {
      setError(
        `Total capacity (${totalBeds} beds) is less than session size (${session.session_size} students). Add more rooms.`
      );
      return;
    }

    try {
      setSaving(true);
      await sessionApi.updateRoomInventory(id, inventory);
      setSuccess(true);
      setTimeout(() => navigate("/sessions"), 1200);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to save room inventory.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading session details...</div>;
  }

  if (error && !session) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <Link to="/sessions" className="text-brand-600 dark:text-brand-400 hover:underline">Back to Sessions</Link>
      </div>
    );
  }

  const inputClass =
    "w-20 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/sessions" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Room Inventory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {session?.title} ({session?.academic_year}) — {session?.session_size} Students
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 flex items-start">
          <AlertCircle className="text-red-500 dark:text-red-400 mt-0.5 mr-3 shrink-0" size={18} />
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 flex items-center">
          <Check className="text-green-500 mr-3" size={18} />
          <div className="text-sm text-green-700 dark:text-green-300">Room inventory saved successfully!</div>
        </div>
      )}

      {/* Room Inventory Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg">
            <BedDouble size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Available Room Types</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Specify how many rooms of each type are available. Students will be allocated to their preferred room type.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {ROOM_TYPES.map((rt) => (
            <div
              key={rt.capacity}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{rt.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{rt.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Count:</span>
                <input
                  type="number"
                  min="0"
                  value={roomCounts[rt.capacity]}
                  onChange={(e) => handleRoomCountChange(rt.capacity, e.target.value)}
                  className={inputClass}
                />
                {roomCounts[rt.capacity] > 0 && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 w-20 shrink-0">
                    = {roomCounts[rt.capacity] * rt.capacity} beds
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className={`mt-5 p-3 rounded-lg text-sm flex items-center justify-between font-medium ${
          session && totalBeds >= session.session_size && totalBeds > 0
            ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
            : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
        }`}>
          <span>Total capacity: {totalBeds} beds</span>
          {session && (
            <span>
              {totalBeds >= session.session_size
                ? `✓ Covers all ${session.session_size} students`
                : `⚠ Need ${session.session_size - totalBeds} more beds`}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
          <Link
            to="/sessions"
            className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-70 transition-colors shadow-sm"
          >
            {saving ? "Saving..." : "Save Inventory"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionStructure;
