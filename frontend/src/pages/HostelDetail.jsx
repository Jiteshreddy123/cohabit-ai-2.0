import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2, MapPin, Star, ShieldCheck, CheckCircle2,
  Clock, AlertCircle, Plus, ThumbsUp, Flag, X,
  Image as ImageIcon, Upload, Loader2, ArrowLeft,
  Wifi, Utensils, Check, Eye, ChevronRight
} from "lucide-react";
import { discoverApi } from "../api/discoverApi";
import { reviewApi } from "../api/reviewApi";
import { authApi } from "../api/authApi";

const REVIEW_CATEGORIES = [
  "Hostel Facilities",
  "Mess / Food",
  "Cleanliness",
  "Wi-Fi & Internet",
  "Water Supply",
  "Washrooms",
  "AC / Electricity",
  "Security",
  "Study Areas",
  "Maintenance",
  "General"
];

export default function HostelDetail() {
  const { id } = useParams();
  const [hostel, setHostel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("All");
  const [activeRatingFilter, setActiveRatingFilter] = useState(0);

  // Lightbox modal for evidence
  const [selectedImage, setSelectedImage] = useState(null);

  // Auth context
  const isStudent = authApi.getUserRole() === "student";
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const loadHostelData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [hostelData, reviewsData, issuesData] = await Promise.all([
        discoverApi.getHostel(id),
        discoverApi.getHostelReviews(id),
        discoverApi.getHostelIssues(id),
      ]);
      setHostel(hostelData);
      setReviews(reviewsData);
      setIssues(issuesData);
    } catch (err) {
      setError(err?.detail || "Failed to load hostel details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHostelData();
  }, [loadHostelData]);

  const handleMarkHelpful = async (reviewId) => {
    if (!authApi.isAuthenticated()) {
      alert("Please log in to upvote reviews.");
      return;
    }
    try {
      const res = await reviewApi.markHelpful(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, helpful_count: res.helpful_count } : r))
      );
    } catch (err) {
      alert(err?.detail || "Could not vote.");
    }
  };

  const handleFlagReview = async (reviewId) => {
    if (!authApi.isAuthenticated()) {
      alert("Please log in to flag reviews.");
      return;
    }
    const reason = window.prompt("Please state the reason for flagging this review:");
    if (!reason || reason.trim().length < 5) return;
    try {
      await reviewApi.flagReview(reviewId, reason.trim());
      alert("Thank you. Review has been reported for moderator inspection.");
    } catch (err) {
      alert(err?.detail || "Could not flag review.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 size={36} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-2" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hostel Not Found</h2>
        <p className="text-sm text-gray-500 mt-1">{error || "Could not locate this hostel block."}</p>
        <Link to="/discover" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
          <ArrowLeft size={16} /> Back to Discovery Explorer
        </Link>
      </div>
    );
  }

  const filteredReviews = reviews.filter((r) => {
    if (activeCategoryFilter !== "All" && r.category !== activeCategoryFilter) return false;
    if (activeRatingFilter > 0 && r.rating !== activeRatingFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Back Link & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to={hostel.college_id ? `/colleges/${hostel.college_id}/hostels` : "/"}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft size={15} /> Back to {hostel.college_name || "Campus Hostels"}
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-brand-400">Home</Link>
          <ChevronRight size={12} className="text-gray-600" />
          {hostel.college_id && (
            <>
              <Link to={`/colleges/${hostel.college_id}/hostels`} className="hover:text-brand-400">
                {hostel.college_name}
              </Link>
              <ChevronRight size={12} className="text-gray-600" />
            </>
          )}
          <span className="text-brand-400 font-medium truncate max-w-[150px] sm:max-w-none">
            {hostel.name}
          </span>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={hostel.image_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&auto=format&fit=crop&q=80"}
            alt={hostel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

          {/* Top Chips */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-md shadow-md">
              {hostel.gender} Hostel
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-brand-600 text-white backdrop-blur-md shadow-md">
              {hostel.hostel_type} Accommodation
            </span>
          </div>

          {/* Bottom Info in Banner */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4 text-white">
            <div>
              <div className="flex items-center gap-2 text-sm text-brand-300 font-semibold mb-1">
                <Building2 size={16} />
                <span>{hostel.college_name}</span>
                {hostel.college_city && <span>· {hostel.college_city}</span>}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{hostel.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 flex items-center gap-2">
                <Star size={20} className="text-amber-400 fill-amber-400" />
                <div>
                  <div className="text-lg font-bold leading-none">
                    {hostel.average_rating > 0 ? hostel.average_rating.toFixed(1) : "New"}
                  </div>
                  <div className="text-[10px] text-gray-300 font-medium">
                    {hostel.total_reviews} verified reviews
                  </div>
                </div>
              </div>

              {isStudent && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-gray-950 font-bold text-sm transition-all shadow-lg flex items-center gap-1.5"
                >
                  <Plus size={16} /> Write Review
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Fee Structure</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{hostel.fee_structure || "Enquire at admin"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Capacity</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{hostel.total_capacity} Student Beds</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Room Configurations</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{(hostel.room_types || []).join(", ") || "Standard"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Facility Repairs</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 size={15} /> {hostel.resolved_issues_count} Resolved
            </p>
          </div>
        </div>

        {/* Description & Facilities */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">About this Hostel Block</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {hostel.description || "A well-maintained campus residential block with all standard amenities."}
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">Hostel Amenities &amp; Services</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(hostel.facilities || []).map((fac) => (
                <div
                  key={fac}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60"
                >
                  <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Check size={14} />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{fac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Public Issue Tracking Transparency Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" />
              Campus Repair &amp; Maintenance Transparency
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live status of public facility repairs reported by verified hostel residents. Student identity is strictly protected.
            </p>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            {issues.filter(i => i.status === "RESOLVED").length} of {issues.length} Issues Resolved
          </span>
        </div>

        {issues.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-xs bg-gray-50 dark:bg-gray-800/40 rounded-2xl">
            No public maintenance issues reported for this hostel block.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {issues.map((iss) => (
              <div
                key={iss.id}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/70 dark:border-gray-700/70 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                      {iss.category}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        iss.status === "RESOLVED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : iss.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}
                    >
                      {iss.status.replace("_", " ")}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{iss.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin size={12} /> {iss.location}
                  </p>
                </div>

                <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-between">
                  <span>Reported {new Date(iss.created_at).toLocaleDateString()}</span>
                  {iss.resolved_at && (
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      Resolved {new Date(iss.resolved_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Reviews Showcase */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck size={22} className="text-brand-500" />
              Verified Student Reviews
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Only authentic students enrolled in this college can post reviews. Verified badges guarantee genuine student experiences.
            </p>
          </div>

          {isStudent && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus size={15} /> Write a Review
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", ...REVIEW_CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategoryFilter === cat
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
            <Star size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <h4 className="text-base font-bold text-gray-900 dark:text-white">No Reviews in this Category</h4>
            <p className="text-xs text-gray-500 mt-1">Be the first verified resident to submit a review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4"
              >
                {/* Header: Rating, Badge, Date */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {/* Stars */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={16}
                          className={`${
                            s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                      {r.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Verified Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      {r.reviewer_badge}
                    </span>

                    <span className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Title & Body */}
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{r.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line">
                    {r.review_text}
                  </p>
                </div>

                {/* Evidence Photo Gallery */}
                {r.images && r.images.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ImageIcon size={13} /> Photo Evidence ({r.images.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {r.images.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => setSelectedImage(img.file_url)}
                          className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity relative group"
                        >
                          <img src={img.file_url} alt="Evidence" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye size={16} className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions: Helpful & Report */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <button
                    onClick={() => handleMarkHelpful(r.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                  >
                    <ThumbsUp size={14} /> Helpful ({r.helpful_count})
                  </button>

                  <button
                    onClick={() => handleFlagReview(r.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Flag size={13} /> Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {showReviewModal && (
        <WriteReviewModal
          hostel={hostel}
          onClose={() => setShowReviewModal(false)}
          onSuccess={(newReview) => {
            setReviews((prev) => [newReview, ...prev]);
            setShowReviewModal(false);
          }}
        />
      )}

      {/* Lightbox Modal for Evidence Photos */}
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

// ── Write Review Modal Component ─────────────────────────────────
function WriteReviewModal({ hostel, onClose, onSuccess }) {
  const [form, setForm] = useState({
    category: "Hostel Facilities",
    rating: 5,
    title: "",
    review_text: "",
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 5) {
      alert("You can upload a maximum of 5 evidence photos.");
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Build previews
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create Review
      const createdReview = await reviewApi.createReview({
        hostel_id: hostel.id,
        category: form.category,
        rating: Number(form.rating),
        title: form.title,
        review_text: form.review_text,
      });

      // 2. Upload any selected evidence images
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            await reviewApi.uploadImage(createdReview.id, file);
          } catch (uploadErr) {
            console.error("Image upload failed", uploadErr);
          }
        }
        // Fetch fresh review data with images
        const updated = await reviewApi.getReview(createdReview.id);
        onSuccess(updated);
      } else {
        onSuccess(createdReview);
      }
    } catch (err) {
      setError(err?.detail || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Review {hostel.name}</h3>
            <p className="text-xs text-gray-500">Your review will be marked as "Verified Student".</p>
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

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setForm({ ...form, rating: s })}
                  className="p-1 text-2xl focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`${
                      s <= form.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-2">
                {form.rating} of 5 Stars
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {REVIEW_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Review Headline *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Spacious rooms and high-speed Wi-Fi"
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Review Details *</label>
            <textarea
              rows={4}
              required
              value={form.review_text}
              onChange={(e) => setForm({ ...form, review_text: e.target.value })}
              placeholder="Describe your daily experience with facilities, maintenance, cleanliness, food, and living atmosphere..."
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Photo Evidence Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Upload Photo Evidence (Optional, max 5)
            </label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center hover:border-brand-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="review-photo-upload"
              />
              <label htmlFor="review-photo-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                <Upload size={20} className="text-brand-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Click to select photos (AC, washroom, mess, room condition)
                </span>
                <span className="text-[10px] text-gray-400">JPG, PNG, or WEBP up to 5MB</span>
              </label>
            </div>

            {/* Previews */}
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? "Submitting Review..." : "Submit Verified Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
