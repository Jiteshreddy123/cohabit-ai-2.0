import React, { useState, useEffect, useCallback } from "react";
import {
  Globe, ShieldCheck, Filter, MapPin, CheckCircle2,
  Clock, AlertTriangle, Building2, Loader2, AlertCircle
} from "lucide-react";
import { complaintApi } from "../api/complaintApi";
import { discoverApi } from "../api/discoverApi";

const COMPLAINT_CATEGORIES = [
  "All",
  "AC / Electrical",
  "Plumbing / Water",
  "Cleanliness / Hygiene",
  "Mess / Food",
  "Furniture / Infrastructure",
  "Wi-Fi / Network",
  "Security / Safety",
  "Maintenance",
  "Other"
];

const STATUS_CONFIG = {
  NEW: { label: "New", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  ASSIGNED: { label: "Assigned", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  RESOLVED: { label: "Resolved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  REOPENED: { label: "Reopened", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
};

export default function PublicIssues() {
  const [issues, setIssues] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeHostelId, setActiveHostelId] = useState("");

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (activeStatus !== "All") params.status = activeStatus;
      if (activeHostelId) params.hostel_id = activeHostelId;

      const [issuesData, hostelsData] = await Promise.all([
        complaintApi.getPublicIssues(params),
        discoverApi.getHostels(),
      ]);
      setIssues(issuesData);
      setHostels(hostelsData);
    } catch (err) {
      setError(err?.detail || "Could not load public campus issues.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeStatus, activeHostelId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const resolvedCount = issues.filter(i => i.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Globe size={26} className="text-brand-500" />
            Public Campus Issues Feed
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Transparent view of known facility issues reported on campus. Student identity is strictly protected.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-2 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <span>{resolvedCount} of {issues.length} Issues Fixed</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Hostel Filter */}
          <div className="flex-1 min-w-[200px]">
            <select
              value={activeHostelId}
              onChange={(e) => setActiveHostelId(e.target.value)}
              className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">All Hostel Blocks</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="NEW">New</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
          {COMPLAINT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Issues Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-brand-500" />
        </div>
      ) : issues.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Public Issues Reported</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All campus facilities operating normally.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issues.map((iss) => {
            const st = STATUS_CONFIG[iss.status] || STATUS_CONFIG.NEW;
            return (
              <div
                key={iss.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                      {iss.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${st.color}`}>
                      {st.label}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{iss.title}</h3>
                  {iss.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {iss.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 mt-3 font-medium">
                    <MapPin size={13} className="text-brand-500 shrink-0" />
                    <span>{iss.location}</span>
                    {iss.hostel_name && <span className="text-gray-400">· {iss.hostel_name}</span>}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Reported {new Date(iss.created_at).toLocaleDateString()}</span>
                  {iss.resolved_at ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Resolved {new Date(iss.resolved_at).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                      <Clock size={13} /> Status: {st.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
