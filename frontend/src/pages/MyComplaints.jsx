import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, Plus, Shield, Globe, Lock, Clock,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, Upload,
  Image as ImageIcon, X, Loader2, MapPin, ArrowRight,
  ChevronDown, ChevronUp, UserCheck, MessageSquare
} from "lucide-react";
import { complaintApi } from "../api/complaintApi";
import { discoverApi } from "../api/discoverApi";

const COMPLAINT_CATEGORIES = [
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

const PRIORITY_COLORS = {
  LOW: "text-gray-500 bg-gray-100 dark:bg-gray-800",
  MEDIUM: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  HIGH: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  EMERGENCY: "text-red-600 bg-red-50 dark:bg-red-900/20 font-bold",
};

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeStatusFilter, setActiveStatusFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedComplaintId, setExpandedComplaintId] = useState(null);
  const [reopenModalComplaint, setReopenModalComplaint] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeStatusFilter !== "All") params.status = activeStatusFilter;

      const [complaintsData, hostelsData] = await Promise.all([
        complaintApi.getMyComplaints(params),
        discoverApi.getHostels(),
      ]);
      setComplaints(complaintsData);
      setHostels(hostelsData);
    } catch (err) {
      setError(err?.detail || "Could not load your complaints.");
    } finally {
      setLoading(false);
    }
  }, [activeStatusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle size={26} className="text-brand-500" />
            Student Complaints &amp; Issues
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Directly report facility or maintenance problems to college administration and track resolution.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-sm"
        >
          <Plus size={16} /> Raise New Complaint
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        {["All", "NEW", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "REOPENED", "REJECTED"].map((st) => (
          <button
            key={st}
            onClick={() => setActiveStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeStatusFilter === st
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-400"
            }`}
          >
            {st === "All" ? "All Complaints" : st.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-brand-500" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
          <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-3 opacity-70" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Complaints Logged</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Need repairs or maintenance? Click "Raise New Complaint" above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const stConf = STATUS_CONFIG[c.status] || STATUS_CONFIG.NEW;
            const isExpanded = expandedComplaintId === c.id;

            return (
              <div
                key={c.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all hover:border-brand-300 dark:hover:border-brand-800"
              >
                {/* Header Strip */}
                <div
                  onClick={() => setExpandedComplaintId(isExpanded ? null : c.id)}
                  className="p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        {c.complaint_code}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {c.category}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${PRIORITY_COLORS[c.priority] || ""}`}>
                        {c.priority} Priority
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800">
                        {c.visibility === "PRIVATE" ? <Lock size={11} /> : <Globe size={11} />}
                        {c.visibility}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">
                      {c.title}
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <MapPin size={12} className="text-brand-500" />
                      {c.location}
                      {c.hostel_name && <span className="font-semibold text-gray-700 dark:text-gray-300">· {c.hostel_name}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${stConf.color}`}>
                      {stConf.label}
                    </span>
                    {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-6 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 space-y-6">
                    {/* Description */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Issue Description</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                        {c.description}
                      </p>
                    </div>

                    {/* Attached Photo Evidence */}
                    {c.images && c.images.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                          <ImageIcon size={14} /> Attached Photo Evidence ({c.images.length})
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {c.images.map((img) => (
                            <div
                              key={img.id}
                              onClick={() => setSelectedImage(img.file_url)}
                              className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              <img src={img.file_url} alt="Complaint Evidence" className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned Technician or Management Response */}
                    {(c.assigned_to || c.management_response) && (
                      <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200/70 dark:border-brand-800/70 space-y-2">
                        {c.assigned_to && (
                          <div className="flex items-center gap-2 text-xs font-bold text-brand-900 dark:text-brand-300">
                            <UserCheck size={16} className="text-brand-600" />
                            <span>Assigned Staff:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{c.assigned_to}</span>
                          </div>
                        )}
                        {c.management_response && (
                          <div>
                            <p className="text-[11px] font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider">
                              Official Management Response:
                            </p>
                            <p className="text-xs text-gray-800 dark:text-gray-200 mt-1 leading-relaxed">
                              {c.management_response}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step-by-step Activity Timeline */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                        <Clock size={14} /> Resolution Timeline
                      </h4>
                      <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                        {(c.updates || []).map((upd, idx) => (
                          <div key={idx} className="relative flex items-start gap-3 pl-7">
                            <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-brand-500 border-2 border-white dark:border-gray-900 -translate-x-1/2" />
                            <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200/70 dark:border-gray-700/70 flex-1">
                              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                                <span className="font-bold text-gray-700 dark:text-gray-300">{upd.author_name || upd.author_role}</span>
                                <span>{new Date(upd.created_at).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{upd.note}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reopen Action (For Resolved or Rejected complaints) */}
                    {["RESOLVED", "REJECTED"].includes(c.status) && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => setReopenModalComplaint(c)}
                          className="px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 border border-orange-200 dark:border-orange-800 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <RefreshCw size={14} /> Reopen Issue (Problem Persists)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Raise Complaint Modal */}
      {showCreateModal && (
        <CreateComplaintModal
          hostels={hostels}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newC) => {
            setComplaints((prev) => [newC, ...prev]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Reopen Modal */}
      {reopenModalComplaint && (
        <ReopenModal
          complaint={reopenModalComplaint}
          onClose={() => setReopenModalComplaint(null)}
          onSuccess={(updated) => {
            setComplaints((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setReopenModalComplaint(null);
          }}
        />
      )}

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img src={selectedImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
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

// ── Create Complaint Modal ───────────────────────────────────────
function CreateComplaintModal({ hostels, onClose, onSuccess }) {
  const [form, setForm] = useState({
    category: "Plumbing / Water",
    title: "",
    description: "",
    location: "",
    priority: "MEDIUM",
    visibility: "PRIVATE",
    hostel_id: hostels[0]?.id || "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      alert("Maximum 5 evidence photos allowed.");
      return;
    }
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const created = await complaintApi.createComplaint({
        hostel_id: form.hostel_id ? Number(form.hostel_id) : null,
        category: form.category,
        title: form.title,
        description: form.description,
        location: form.location,
        priority: form.priority,
        visibility: form.visibility,
      });

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            await complaintApi.uploadImage(created.id, file);
          } catch (uploadErr) {
            console.error("Evidence photo upload failed", uploadErr);
          }
        }
        const updated = await complaintApi.getComplaint(created.id);
        onSuccess(updated);
      } else {
        onSuccess(created);
      }
    } catch (err) {
      setError(err?.detail || "Failed to raise complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Raise a Facility Complaint</h3>
            <p className="text-xs text-gray-500">Dispatched directly to college facilities management.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          {/* Visibility Selector: PRIVATE vs PUBLIC */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Complaint Visibility *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: "PRIVATE" })}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  form.visibility === "PRIVATE"
                    ? "bg-brand-50/70 dark:bg-brand-950/40 border-brand-500 ring-2 ring-brand-500/20"
                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500"
                }`}
              >
                <Lock size={16} className={form.visibility === "PRIVATE" ? "text-brand-600 dark:text-brand-400 mt-0.5" : "text-gray-400 mt-0.5"} />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Private</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Only you &amp; admin</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, visibility: "PUBLIC" })}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  form.visibility === "PUBLIC"
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-500"
                }`}
              >
                <Globe size={16} className={form.visibility === "PUBLIC" ? "text-blue-600 dark:text-blue-400 mt-0.5" : "text-gray-400 mt-0.5"} />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Public Feed</p>
                  <p className="text-[10px] text-gray-500 leading-tight">Anonymous to peers</p>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              {form.visibility === "PUBLIC"
                ? "🔒 Your name, student ID, and contact details will NEVER be shown on the public feed."
                : "🔒 Only college management will see this ticket and your room details."}
            </p>
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="EMERGENCY">Emergency (Urgent)</option>
              </select>
            </div>
          </div>

          {/* Hostel & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Hostel Block</label>
              <select
                value={form.hostel_id}
                onChange={(e) => setForm({ ...form, hostel_id: e.target.value })}
                className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">General Campus Facility</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Exact Location *</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Block A Room 304 / 2nd Fl Washroom"
                className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Problem Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Water dripping from washroom pipe"
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Provide exact details of the damage or breakdown to help technicians resolve it quickly..."
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Upload Problem Photos (Recommended, max 5)
            </label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center hover:border-brand-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="complaint-photo-upload"
              />
              <label htmlFor="complaint-photo-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                <Upload size={20} className="text-brand-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Select photo of damage (broken AC, leakage, damaged furniture)
                </span>
                <span className="text-[10px] text-gray-400">JPG, PNG, or WEBP up to 5MB</span>
              </label>
            </div>

            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-0.5 right-0.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            {loading ? "Dispatching Complaint..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Reopen Complaint Modal ───────────────────────────────────────
function ReopenModal({ complaint, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleReopen = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await complaintApi.reopenComplaint(complaint.id, reason);
      onSuccess(res);
    } catch (err) {
      setError(err?.detail || "Failed to reopen complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6 border border-gray-100 dark:border-gray-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Reopen Complaint #{complaint.complaint_code}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-xs text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleReopen} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Why are you reopening this issue? *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. The leak resumed this morning / Repair was not fully completed..."
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            Confirm &amp; Reopen Ticket
          </button>
        </form>
      </div>
    </div>
  );
}
