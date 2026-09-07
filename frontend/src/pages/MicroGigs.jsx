import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Plus, X, Clock, CheckCircle, Trash2,
  MessageCircle, Loader2, AlertCircle, IndianRupee, Gift
} from "lucide-react";
import { microGigApi } from "../api/microGigApi";
import { chatApi } from "../api/chatApi";

const CATEGORIES = ["All", "Errand", "Tutoring", "Delivery", "Cooking", "Cleaning", "Tech Help", "Other"];

function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    const compute = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setUrgent(h < 4);
      setTimeLeft(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    };
    compute();
    const timer = setInterval(compute, 60000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${urgent ? "text-red-500 dark:text-red-400 animate-pulse" : "text-gray-400 dark:text-gray-500"}`}>
      <Clock size={12} /> {timeLeft}
    </span>
  );
}

function GigCard({ gig, onAccept, onDelete, onContact, currentStudentId }) {
  const isOwner = gig.poster_id === currentStudentId;
  const isAccepted = gig.status === "accepted";

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200 ${
      isAccepted ? "border-green-200 dark:border-green-800 opacity-75" : "border-gray-100 dark:border-gray-800 hover:-translate-y-0.5"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 mb-2">
            {gig.category}
          </span>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug line-clamp-2">{gig.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          {gig.reward_type === "money" && gig.reward > 0 ? (
            <div className="flex items-center gap-0.5 text-lg font-bold text-green-600 dark:text-green-400">
              <IndianRupee size={16} />{gig.reward}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm font-bold text-purple-600 dark:text-purple-400">
              <Gift size={14} /> Favour
            </div>
          )}
        </div>
      </div>

      {gig.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{gig.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-50 dark:border-gray-800">
        <span>Posted by <span className="font-medium text-gray-600 dark:text-gray-300">{gig.poster_name || "Anonymous"}</span></span>
        <CountdownTimer expiresAt={gig.expires_at} />
      </div>

      {isAccepted ? (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 rounded-lg px-3 py-2">
          <CheckCircle size={15} />
          {isOwner
            ? `Accepted by ${gig.acceptor_name || "someone"}`
            : "You accepted this gig!"}
        </div>
      ) : isOwner ? (
        <button
          onClick={() => onDelete(gig.id)}
          className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 px-3 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={13} /> Cancel Gig
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(gig.id)}
            className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
          >
            <CheckCircle size={15} /> Accept
          </button>
          <button
            onClick={() => onContact(gig)}
            className="flex items-center justify-center gap-1.5 text-sm font-medium py-2 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <MessageCircle size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function PostGigModal({ onClose, onPost }) {
  const [form, setForm] = useState({
    title: "", description: "", reward: 0,
    reward_type: "money", category: "Other",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, reward: parseFloat(form.reward) || 0 };
      const created = await microGigApi.createGig(payload);
      onPost(created);
      onClose();
    } catch (err) {
      setError(err?.detail || "Failed to post gig.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Post a Quick Gig</h2>
            <p className="text-xs text-gray-400 mt-0.5">Auto-deletes after 48 hours if not accepted</p>
          </div>
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
            <label className={labelCls}>What do you need? *</label>
            <input name="title" value={form.title} onChange={handle} required className={inputCls} placeholder='e.g. "Pick up my laundry from Block C gate"' />
          </div>
          <div>
            <label className={labelCls}>More details</label>
            <textarea name="description" value={form.description} onChange={handle} rows={3} className={inputCls} placeholder="Time, location, any special instructions…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Reward Type</label>
              <select name="reward_type" value={form.reward_type} onChange={handle} className={inputCls}>
                <option value="money">Money (₹)</option>
                <option value="favour">Favour / Exchange</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{form.reward_type === "money" ? "Amount (₹)" : "N/A"}</label>
              <input
                name="reward" type="number" min="0" value={form.reward}
                onChange={handle} className={inputCls}
                disabled={form.reward_type === "favour"}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Category</label>
            <select name="category" value={form.category} onChange={handle} className={inputCls}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {loading ? "Posting…" : "Post Gig (48h)"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MicroGigs() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentStudentId = user.studentId || user.id || null;

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = activeCategory !== "All" ? { category: activeCategory } : {};
      const data = await microGigApi.getGigs(params);
      setGigs(data);
    } catch (err) {
      setError(err?.detail || "Could not load gigs.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  const handleAccept = async (id) => {
    try {
      const updated = await microGigApi.acceptGig(id);
      setGigs((prev) => prev.map((g) => (g.id === id ? updated : g)));
    } catch (err) {
      alert(err?.detail || "Could not accept gig.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Cancel this gig?")) return;
    try {
      await microGigApi.deleteGig(id);
      setGigs((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      alert(err?.detail || "Could not cancel gig.");
    }
  };

  const handleContact = async (gig) => {
    try {
      const conv = await chatApi.startConversation({
        other_student_id: gig.poster_id,
        gig_id: gig.id,
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
            <Zap size={24} className="text-amber-500" />
            Quick Gigs Board
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Post a small task or earn quick money. Posts expire in ⏳ 48 hours automatically.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus size={16} /> Post a Gig
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
                ? "bg-amber-500 text-white"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-amber-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-2 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={32} className="animate-spin text-amber-500" />
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-600">
          <Zap size={56} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No active gigs right now</p>
          <p className="text-sm mt-1">Be the first to post a task on your campus!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gigs.map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
              onAccept={handleAccept}
              onDelete={handleDelete}
              onContact={handleContact}
              currentStudentId={currentStudentId}
            />
          ))}
        </div>
      )}

      {showModal && (
        <PostGigModal
          onClose={() => setShowModal(false)}
          onPost={(newGig) => setGigs((prev) => [newGig, ...prev])}
        />
      )}
    </div>
  );
}
