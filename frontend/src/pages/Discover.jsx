import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Compass, Search, Building2, MapPin, Star, ShieldCheck,
  CheckCircle2, Sparkles, Filter, Users, Flame, ChevronRight,
  Wifi, Utensils, Zap, Award, Layers, Loader2, AlertCircle
} from "lucide-react";
import { discoverApi } from "../api/discoverApi";

const FACILITIES_LIST = [
  "All", "Wi-Fi", "Mess", "AC", "Laundry", "Study Room", "Gym", "24/7 Power Backup", "Water Purifier", "Security"
];

const GENDER_OPTIONS = ["All", "Male", "Female", "Co-ed"];
const HOSTEL_TYPES = ["All", "AC", "Non-AC", "Both"];

export default function Discover() {
  const [colleges, setColleges] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("hostels"); // "hostels" | "colleges"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedFacility, setSelectedFacility] = useState("All");
  const [selectedMinRating, setSelectedMinRating] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "hostels") {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        if (selectedGender !== "All") params.gender = selectedGender;
        if (selectedType !== "All") params.hostel_type = selectedType;
        if (selectedFacility !== "All") params.facility = selectedFacility;
        if (selectedMinRating > 0) params.min_rating = selectedMinRating;

        const data = await discoverApi.getHostels(params);
        setHostels(data);
      } else {
        const params = {};
        if (searchTerm.trim()) params.search = searchTerm.trim();
        const data = await discoverApi.getColleges(params);
        setColleges(data);
      }
    } catch (err) {
      setError(err?.detail || "Failed to load discovery data.");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, selectedGender, selectedType, selectedFacility, selectedMinRating]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-900 via-dark-900 to-dark-800 text-white p-6 md:p-8 shadow-xl border border-brand-800/30">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass size={14} className="animate-spin text-brand-300" style={{ animationDuration: "12s" }} />
            Hostel &amp; Campus Explorer
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Discover Verified Hostels &amp; Campuses
          </h1>
          <p className="text-gray-300 text-sm sm:text-base mt-2 leading-relaxed">
            Search verified accommodations, compare facilities, browse honest student reviews, and inspect campus repair transparency before you move in.
          </p>

          {/* Search bar inside hero */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by college name, hostel name, or city..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("hostels")}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "hostels"
                    ? "bg-brand-500 text-gray-950 shadow-lg shadow-brand-500/30 font-bold"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                Hostel Blocks ({hostels.length})
              </button>
              <button
                onClick={() => setActiveTab("colleges")}
                className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === "colleges"
                    ? "bg-brand-500 text-gray-950 shadow-lg shadow-brand-500/30 font-bold"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                Colleges ({colleges.length})
              </button>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Filters bar (Visible in Hostels view) */}
      {activeTab === "hostels" && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <Filter size={14} /> Refine Filters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Gender */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hostel Gender</label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g === "All" ? "All Genders" : `${g} Hostel`}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">AC / Non-AC</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {HOSTEL_TYPES.map((t) => (
                  <option key={t} value={t}>{t === "All" ? "Any AC / Non-AC" : t}</option>
                ))}
              </select>
            </div>

            {/* Facility */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Facility / Amenity</label>
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {FACILITIES_LIST.map((f) => (
                  <option key={f} value={f}>{f === "All" ? "Any Facility" : f}</option>
                ))}
              </select>
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Rating</label>
              <select
                value={selectedMinRating}
                onChange={(e) => setSelectedMinRating(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value={0}>All Ratings</option>
                <option value={4.5}>4.5+ Stars ★★★★★</option>
                <option value={4.0}>4.0+ Stars ★★★★☆</option>
                <option value={3.5}>3.5+ Stars ★★★☆☆</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={36} className="animate-spin text-brand-500" />
        </div>
      ) : activeTab === "hostels" ? (
        hostels.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <Building2 size={48} className="mx-auto text-gray-400 mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Hostels Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try relaxing your search terms or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostels.map((h) => (
              <div
                key={h.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="h-48 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                  <img
                    src={h.image_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-sm shadow-sm">
                      {h.gender} Hostel
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand-600/90 text-white backdrop-blur-sm shadow-sm">
                      {h.hostel_type}
                    </span>
                  </div>

                  {/* Rating Pill */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-bold border border-white/10">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span>{h.average_rating > 0 ? h.average_rating.toFixed(1) : "New"}</span>
                    <span className="text-gray-400 text-[10px]">({h.total_reviews} reviews)</span>
                  </div>

                  {/* Resolved issues stat */}
                  {h.resolved_issues_count > 0 && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 px-2 py-1 rounded-lg text-emerald-300 text-[11px] font-semibold">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span>{h.resolved_issues_count} fixed</span>
                    </div>
                  )}
                </div>

                {/* Details Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-semibold mb-1">
                    <Building2 size={13} />
                    <span className="truncate">{h.college_name || "Campus Residency"}</span>
                    {h.college_city && <span className="text-gray-400">· {h.college_city}</span>}
                  </div>

                  <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {h.name}
                  </h2>

                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {h.description || "Fully equipped student hostel with high-speed internet and campus dining."}
                  </p>

                  {/* Facilities Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(h.facilities || []).slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[11px] font-medium"
                      >
                        {f}
                      </span>
                    ))}
                    {(h.facilities || []).length > 4 && (
                      <span className="px-1.5 py-0.5 text-gray-400 text-[11px] font-medium">
                        +{(h.facilities || []).length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Fee Structure</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{h.fee_structure || "Enquire at admin"}</p>
                    </div>

                    <Link
                      to={`/discover/hostel/${h.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 dark:hover:text-white text-xs font-bold transition-all shadow-sm"
                    >
                      View Details <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Colleges View */
        colleges.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            <Building2 size={48} className="mx-auto text-gray-400 mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Colleges Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colleges.map((col) => (
              <div
                key={col.id}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col hover:shadow-lg transition-all"
              >
                <div className="flex gap-4 items-start">
                  <img
                    src={col.image_url || "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80"}
                    alt={col.name}
                    className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shrink-0"
                  />
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">{col.name}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin size={13} className="text-brand-500" />
                      {col.location}, {col.city}, {col.state}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Star size={12} className="fill-amber-400" />
                        {col.average_rating > 0 ? col.average_rating.toFixed(1) : "Unrated"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {col.total_reviews} verified reviews
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 mt-4 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>

                {/* Hostels count & resolution rate */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-base font-bold text-gray-900 dark:text-white">{col.total_hostels}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Hostels</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-base font-bold text-brand-600 dark:text-brand-400">{col.total_reviews}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Reviews</p>
                  </div>
                  <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-base font-bold text-green-600 dark:text-green-400">{col.total_complaints_resolved}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">Issues Fixed</p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm(col.name);
                      setActiveTab("hostels");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700"
                  >
                    View Campus Hostels ({col.total_hostels}) →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
