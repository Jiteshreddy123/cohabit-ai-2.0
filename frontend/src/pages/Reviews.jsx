import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Star, ThumbsUp, Flag, Plus, Filter,
  Building2, Image as ImageIcon, Eye, X, Upload,
  Loader2, AlertCircle, CheckCircle2, MessageSquare
} from "lucide-react";
import { reviewApi } from "../api/reviewApi";
import { discoverApi } from "../api/discoverApi";
import { authApi } from "../api/authApi";

const REVIEW_CATEGORIES = [
  "All",
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

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [activeRating, setActiveRating] = useState(0);
  const [activeHostelId, setActiveHostelId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const isStudent = authApi.getUserRole() === "student";

  const fetchReviewsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (activeRating > 0) params.rating = activeRating;
      if (activeHostelId) params.hostel_id = activeHostelId;

      const [revData, hostData] = await Promise.all([
        reviewApi.getReviews(params),
        discoverApi.getHostels(),
      ]);
      setReviews(revData);
      setHostels(hostData);
    } catch (err) {
      setError(err?.detail || "Could not load campus reviews.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeRating, activeHostelId]);

  useEffect(() => {
    fetchReviewsData();
  }, [fetchReviewsData]);

  const handleMarkHelpful = async (reviewId) => {
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
    const reason = window.prompt("Reason for flagging this review:");
    if (!reason || reason.trim().length < 5) return;
    try {
      await reviewApi.flagReview(reviewId, reason.trim());
      alert("Thank you. Review reported for moderation.");
    } catch (err) {
      alert(err?.detail || "Could not flag review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      await reviewApi.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(err?.detail || "Could not delete review.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck size={26} className="text-brand-500" />
            Verified Campus Reviews
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Genuine student feedback on hostel living, mess quality, washroom hygiene, Wi-Fi, and security.
          </p>
        </div>

        {isStudent && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-all shadow-sm"
          >
            <Plus size={16} /> Write Review
          </button>
        )}
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
              <option value="">All Hostels &amp; Facilities</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.gender})</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="w-40">
            <select
              value={activeRating}
              onChange={(e) => setActiveRating(Number(e.target.value))}
              className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value={0}>All Ratings</option>
              <option value={5}>5 Stars ★★★★★</option>
              <option value={4}>4 Stars ★★★★☆</option>
              <option value={3}>3 Stars ★★★☆☆</option>
              <option value={2}>2 Stars ★★☆☆☆</option>
              <option value={1}>1 Star ★☆☆☆☆</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
          {REVIEW_CATEGORIES.map((cat) => (
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

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-brand-500" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
          <MessageSquare size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Reviews Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try switching category or rating filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
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

                  {r.hostel_name && (
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Building2 size={13} /> {r.hostel_name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    {r.reviewer_badge}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-snug">{r.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line">
                  {r.review_text}
                </p>
              </div>

              {/* Photo Evidence Gallery */}
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

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <button
                  onClick={() => handleMarkHelpful(r.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium transition-colors"
                >
                  <ThumbsUp size={14} /> Helpful ({r.helpful_count})
                </button>

                <div className="flex items-center gap-3">
                  {r.is_owner && (
                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => handleFlagReview(r.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Flag size={13} /> Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Write Review Modal */}
      {showModal && (
        <CreateReviewModal
          hostels={hostels}
          onClose={() => setShowModal(false)}
          onSuccess={(newReview) => {
            setReviews((prev) => [newReview, ...prev]);
            setShowModal(false);
          }}
        />
      )}

      {/* Lightbox Modal */}
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

function CreateReviewModal({ hostels, onClose, onSuccess }) {
  const [form, setForm] = useState({
    hostel_id: hostels[0]?.id || "",
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
      alert("You can upload a maximum of 5 photos.");
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
      const createdReview = await reviewApi.createReview({
        hostel_id: form.hostel_id ? Number(form.hostel_id) : null,
        category: form.category,
        rating: Number(form.rating),
        title: form.title,
        review_text: form.review_text,
      });

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            await reviewApi.uploadImage(createdReview.id, file);
          } catch (uploadErr) {
            console.error("Image upload failed", uploadErr);
          }
        }
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
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Submit Campus Review</h3>
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

          {/* Rating */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Your Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setForm({ ...form, rating: s })}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
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
                {form.rating} / 5
              </span>
            </div>
          </div>

          {/* Hostel selection */}
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

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            >
              {REVIEW_CATEGORIES.filter(c => c !== "All").map((c) => (
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
              placeholder="e.g. Spacious rooms, great study areas"
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
              placeholder="Describe your daily experience with facilities, maintenance, hygiene, food..."
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Upload Photo Evidence (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-center hover:border-brand-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
                id="modal-review-photo-upload"
              />
              <label htmlFor="modal-review-photo-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                <Upload size={20} className="text-brand-500" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Select photo evidence (JPG, PNG, WEBP)
                </span>
                <span className="text-[10px] text-gray-400">Max 5MB each</span>
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
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
            {loading ? "Submitting..." : "Submit Verified Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
