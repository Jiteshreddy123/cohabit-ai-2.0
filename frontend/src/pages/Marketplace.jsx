import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag, Plus, X, Tag, Package, Filter,
  CheckCircle, Trash2, MessageCircle, Loader2, AlertCircle, IndianRupee
} from "lucide-react";
import { marketplaceApi } from "../api/marketplaceApi";
import { chatApi } from "../api/chatApi";

const CATEGORIES = ["All", "Electronics", "Furniture", "Books", "Kitchenware", "Clothing", "Sports", "Other"];
const CONDITIONS = ["New", "Good", "Fair"];
const LISTING_TYPES = ["sell", "rent"];

const CONDITION_COLORS = {
  New: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Good: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Fair: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function ListingCard({ listing, onInquire, onMarkSold, onDelete, currentStudentId }) {
  const isOwner = listing.student_id === currentStudentId;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="h-44 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden relative">
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <Package size={48} className="text-gray-300 dark:text-gray-600" />
        )}
        <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${CONDITION_COLORS[listing.condition]}`}>
          {listing.condition}
        </span>
        <span className="absolute top-2 right-2 text-xs font-semibold px-2 py-1 rounded-full bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 capitalize">
          {listing.listing_type === "rent" ? "🔄 Rent" : "🏷️ Sell"}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium uppercase tracking-wide">{listing.category}</p>
        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug mb-1 line-clamp-2">{listing.title}</h3>
        {listing.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{listing.description}</p>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-1 text-xl font-bold text-brand-600 dark:text-brand-400 mb-3">
            <IndianRupee size={18} />
            {listing.price > 0 ? listing.price.toLocaleString("en-IN") : "Free"}
            {listing.listing_type === "rent" && <span className="text-sm font-normal text-gray-400">/mo</span>}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
            By <span className="font-medium text-gray-600 dark:text-gray-300">{listing.seller_name || "Anonymous"}</span>
          </p>

          {isOwner ? (
            <div className="flex gap-2">
              <button
                onClick={() => onMarkSold(listing.id)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
              >
                <CheckCircle size={14} /> Mark Sold
              </button>
              <button
                onClick={() => onDelete(listing.id)}
                className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onInquire(listing)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
            >
              <MessageCircle size={15} /> Inquire
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostModal({ onClose, onPost }) {
  const [form, setForm] = useState({
    title: "", description: "", price: 0,
    condition: "Good", category: "Other",
    listing_type: "sell", image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, price: parseFloat(form.price) || 0 };
      const created = await marketplaceApi.createListing(payload);
      onPost(created);
      onClose();
    } catch (err) {
      setError(err?.detail || "Failed to post listing.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Post an Item</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
            </div>
          )}
          <div>
            <label className={labelCls}>Title *</label>
            <input name="title" value={form.title} onChange={handle} required className={inputCls} placeholder="e.g. Mini fridge, barely used" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3} className={inputCls} placeholder="Condition details, pickup location, etc." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Price (₹)</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handle} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select name="listing_type" value={form.listing_type} onChange={handle} className={inputCls}>
                {LISTING_TYPES.map((t) => <option key={t} value={t}>{t === "sell" ? "Sell" : "Rent"}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Condition</label>
              <select name="condition" value={form.condition} onChange={handle} className={inputCls}>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select name="category" value={form.category} onChange={handle} className={inputCls}>
                {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Image URL (optional)</label>
            <input name="image_url" value={form.image_url} onChange={handle} className={inputCls} placeholder="https://…" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {loading ? "Posting…" : "Post Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentStudentId = user.studentId || user.id || null;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = activeCategory !== "All" ? { category: activeCategory } : {};
      const data = await marketplaceApi.getListings(params);
      setListings(data);
    } catch (err) {
      setError(err?.detail || "Could not load marketplace.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleMarkSold = async (id) => {
    setActionLoading(id);
    try {
      await marketplaceApi.markSold(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err?.detail || "Could not update listing.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this listing?")) return;
    try {
      await marketplaceApi.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err?.detail || "Could not remove listing.");
    }
  };

  const handleInquire = async (listing) => {
    try {
      const conv = await chatApi.startConversation({
        other_student_id: listing.student_id,
        listing_id: listing.id,
      });
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      alert(err?.detail || "Could not open chat.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingBag size={24} className="text-brand-600 dark:text-brand-400" />
            Roommate Marketplace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Buy, sell, or rent items with students on your campus. 🔒 Seller contact is kept private.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus size={16} /> Post an Item
        </button>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-brand-600 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-brand-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-2 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <Package size={56} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No listings yet</p>
          <p className="text-sm mt-1">Be the first to post an item on your campus!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onInquire={handleInquire}
              onMarkSold={handleMarkSold}
              onDelete={handleDelete}
              currentStudentId={currentStudentId}
            />
          ))}
        </div>
      )}

      {showModal && (
        <PostModal
          onClose={() => setShowModal(false)}
          onPost={(newListing) => setListings((prev) => [newListing, ...prev])}
        />
      )}
    </div>
  );
}
