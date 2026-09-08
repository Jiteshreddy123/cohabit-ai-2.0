import React, { useState, useEffect, useCallback } from "react";
import {
  Inbox, Search, Filter, CheckCircle2, Clock, AlertTriangle,
  User, Building2, MapPin, Image as ImageIcon, Eye, X,
  Loader2, AlertCircle, RefreshCw, Send, Check, ShieldAlert,
  ChevronRight, Lock, Globe
} from "lucide-react";
import { managementApi } from "../api/managementApi";
import { discoverApi } from "../api/discoverApi";

const STATUS_CONFIG = {
  NEW: { label: "New", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
  UNDER_REVIEW: { label: "Under Review", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  ASSIGNED: { label: "Assigned", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  RESOLVED: { label: "Resolved", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
  REOPENED: { label: "Reopened", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
};

const PRIORITY_BADGES = {
  LOW: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  MEDIUM: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  HIGH: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  EMERGENCY: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 font-bold animate-pulse",
};

export default function ManagementComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [hostelFilter, setHostelFilter] = useState("");

  const [activeComplaint, setActiveComplaint] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (priorityFilter !== "All") params.priority = priorityFilter;
      if (hostelFilter) params.hostel_id = hostelFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [cData, hData] = await Promise.all([
        managementApi.getComplaints(params),
        managementApi.getHostels(),
      ]);
      setComplaints(cData);
      setHostels(hData);
    } catch (err) {
      setError(err?.detail || "Could not load management complaints.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, hostelFilter, searchQuery]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Metric computations
  const totalCount = complaints.length;
  const newCount = complaints.filter(c => ["NEW", "UNDER_REVIEW", "REOPENED"].includes(c.status)).length;
  const inProgressCount = complaints.filter(c => ["ASSIGNED", "IN_PROGRESS"].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => c.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Inbox size={26} className="text-brand-500" />
          Campus Complaints &amp; Work Orders Desk
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review, assign, and resolve student facility complaints across all campus hostel blocks.
        </p>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Tickets</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">{totalCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Pending Review</p>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">{newCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">In Progress</p>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by complaint code, title, location..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="NEW">New</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REOPENED">Reopened</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="w-full md:w-36">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>

          {/* Hostel Filter */}
          <div className="w-full md:w-44">
            <select
              value={hostelFilter}
              onChange={(e) => setHostelFilter(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">All Hostels</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Complaints Table/Cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-brand-500" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">All Clear! No Open Complaints</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            No complaints match the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Code / Category</th>
                  <th className="py-3.5 px-4">Problem &amp; Location</th>
                  <th className="py-3.5 px-4">Student Info</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned To</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {complaints.map((c) => {
                  const st = STATUS_CONFIG[c.status] || STATUS_CONFIG.NEW;
                  return (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-brand-600 dark:text-brand-400">{c.complaint_code}</div>
                        <span className="text-[11px] text-gray-500">{c.category}</span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-gray-900 dark:text-white truncate">{c.title}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-brand-500 shrink-0" />
                          <span className="truncate">{c.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{c.student_name || "Student"}</div>
                        <div className="text-[11px] text-gray-400">{c.student_roll || "N/A"} · Year {c.student_year || 1}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${PRIORITY_BADGES[c.priority] || ""}`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${st.color}`}>
                          {st.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                        {c.assigned_to ? (
                          <span className="font-medium text-xs">{c.assigned_to}</span>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveComplaint(c)}
                          className="px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white font-bold transition-all shadow-sm"
                        >
                          Manage Ticket
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manage Complaint Drawer / Modal */}
      {activeComplaint && (
        <ManageComplaintModal
          complaint={activeComplaint}
          onClose={() => setActiveComplaint(null)}
          onSuccess={(updated) => {
            setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setActiveComplaint(null);
          }}
          onViewImage={(url) => setSelectedImage(url)}
        />
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={selectedImage} alt="Evidence Preview" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Management Complaint Action Modal ────────────────────────────
function ManageComplaintModal({ complaint, onClose, onSuccess, onViewImage }) {
  const [form, setForm] = useState({
    status: complaint.status,
    assigned_to: complaint.assigned_to || "",
    management_response: complaint.management_response || "",
    rejection_reason: complaint.rejection_reason || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updated = await managementApi.updateComplaintStatus(complaint.id, form);
      onSuccess(updated);
    } catch (err) {
      setError(err?.detail || "Failed to update complaint status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
                {complaint.complaint_code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-semibold">
                {complaint.category}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{complaint.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-xs text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Student & Location Info Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/60 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Reporting Student</p>
              <p className="font-bold text-gray-900 dark:text-white mt-0.5">{complaint.student_name}</p>
              <p className="text-gray-500">Roll: {complaint.student_roll} · {complaint.student_branch}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400">Location &amp; Hostel</p>
              <p className="font-bold text-gray-900 dark:text-white mt-0.5">{complaint.location}</p>
              <p className="text-gray-500">{complaint.hostel_name || "Campus Residency"}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Description</h4>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/50 p-3.5 rounded-xl whitespace-pre-line border border-gray-200/50 dark:border-gray-700/50">
              {complaint.description}
            </p>
          </div>

          {/* Evidence Photos */}
          {complaint.images && complaint.images.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                <ImageIcon size={14} /> Student Attached Evidence ({complaint.images.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {complaint.images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => onViewImage(img.file_url)}
                    className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <img src={img.file_url} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Form */}
          <form onSubmit={handleSubmit} className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Admin Action &amp; Status Update</h4>

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Change Status *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                  <option value="NEW">NEW</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {/* Assign To */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Assign Staff / Technician</label>
                <input
                  type="text"
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  placeholder="e.g. Electrician Team B / Plumber Suresh"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            {/* Management Response Note */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Official Resolution / Progress Note
              </label>
              <textarea
                rows={3}
                value={form.management_response}
                onChange={(e) => setForm({ ...form, management_response: e.target.value })}
                placeholder="Details of repair action taken, scheduled inspection time, or resolution summary..."
                className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            {/* Rejection reason if Rejected */}
            {form.status === "REJECTED" && (
              <div>
                <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                  Reason for Rejection *
                </label>
                <input
                  type="text"
                  required
                  value={form.rejection_reason}
                  onChange={(e) => setForm({ ...form, rejection_reason: e.target.value })}
                  placeholder="e.g. Duplicate report / Outside hostel jurisdiction"
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Update Ticket &amp; Notify Student
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
