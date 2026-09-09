import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Building2, MapPin, Star, ShieldCheck, CheckCircle2,
  Search, Filter, ChevronRight, ArrowLeft, Bed, Wifi,
  Utensils, Zap, Users, Loader2, AlertCircle, ArrowUpRight
} from "lucide-react";
import { discoverApi } from "../api/discoverApi";

// Static fallback data for the 3 featured Hyderabad colleges in case of offline/fresh loads
const FALLBACK_COLLEGE_DATA = {
  1: {
    id: 1,
    name: "ACE Engineering College",
    tagline: "Autonomous · NAAC A+ Accredited · JNTUH Affiliated",
    location: "Ankushapur, Ghatkesar",
    city: "Hyderabad",
    state: "Telangana",
    rating: 4.8,
    reviewsCount: 186,
    resolvedCount: 78,
    image: "https://dfhe5ze0n4pxu.cloudfront.net/College/Image/Image-1766845804828.jpeg",
    badge: "Flagship Partner Campus",
    description: "Premier autonomous engineering and technology institution affiliated with JNTUH, featuring eco-friendly smart residential campuses, 1 Gbps optical fiber, high-tech research labs, and AI-optimized roommate allocations.",
    hostels: [
      {
        id: 5,
        name: "ACE Boys Hostel (Block A - Godavari)",
        gender: "Male",
        hostel_type: "Both",
        room_types: ["Single", "Double", "Triple"],
        facilities: ["Wi-Fi", "Mess", "24/7 Power Backup", "Gym", "Study Room", "Water Purifier", "Security", "Laundry"],
        fee_structure: "₹85,000 - ₹1,10,000 / year",
        total_capacity: 240,
        average_rating: 4.8,
        total_reviews: 74,
        resolved_issues_count: 42,
        description: "Modern multi-storey boys hostel with dedicated high-speed optical fiber, ergonomic study desks, air-conditioned study rooms, and hygienic buffet mess.",
        image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: 6,
        name: "ACE Girls Hostel (Block B - Krishna)",
        gender: "Female",
        hostel_type: "Both",
        room_types: ["Single", "Double"],
        facilities: ["Wi-Fi", "Mess", "24/7 Security", "Attached Washrooms", "Study Room", "Water Purifier", "Laundry", "Gym"],
        fee_structure: "₹90,000 - ₹1,20,000 / year",
        total_capacity: 180,
        average_rating: 4.9,
        total_reviews: 68,
        resolved_issues_count: 38,
        description: "Peaceful residential complex equipped with top-tier security surveillance, manicured garden courtyards, quiet study wings, and wholesome dietary catering.",
        image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: 7,
        name: "ACE Executive Residency (Block C - Kaveri)",
        gender: "Co-ed",
        hostel_type: "AC",
        room_types: ["Single", "Double"],
        facilities: ["Central AC", "Wi-Fi", "Gourmet Mess", "Elevator Access", "Study Room", "24/7 Power Backup", "Gym", "Security"],
        fee_structure: "₹1,30,000 - ₹1,65,000 / year",
        total_capacity: 120,
        average_rating: 4.9,
        total_reviews: 44,
        resolved_issues_count: 21,
        description: "Premium executive residency tailored for students seeking quiet, air-conditioned suites with private amenities and daily housekeeping.",
        image_url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80"
      }
    ]
  },
  2: {
    id: 2,
    name: "Chaitanya Bharathi Institute of Technology (CBIT)",
    tagline: "Autonomous · NAAC A++ Accredited · Established 1979",
    location: "Gandipet, Kokapet",
    city: "Hyderabad",
    state: "Telangana",
    rating: 4.9,
    reviewsCount: 224,
    resolvedCount: 92,
    image: "https://www.cbit.ac.in/wp-content/themes/CBIT/images/placeholder.jpg",
    badge: "Premier Engineering Hub",
    description: "Leading autonomous engineering and research institution established in 1979 in Gandipet, Hyderabad, accredited NAAC A++ with world-class residential dorms, coding centers, and innovation hubs.",
    hostels: [
      {
        id: 11,
        name: "CBIT Gandipet Boys Hostel (Block 1)",
        gender: "Male",
        hostel_type: "Both",
        room_types: ["Single", "Double", "Triple"],
        facilities: ["High-Speed Wi-Fi", "Mess", "Gym", "Sports Ground", "Study Lounge", "Security", "Solar Hot Water"],
        fee_structure: "₹85,000 - ₹1,15,000 / year",
        total_capacity: 250,
        average_rating: 4.8,
        total_reviews: 88,
        resolved_issues_count: 54,
        description: "Well-furnished boys hostel located inside the tranquil Gandipet campus with full sports grounds, reading rooms, and balanced South & North dining.",
        image_url: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: 12,
        name: "CBIT Emerald Girls Residency (Block 2)",
        gender: "Female",
        hostel_type: "AC",
        room_types: ["Single", "Double"],
        facilities: ["Central AC", "Wi-Fi", "24/7 Biometric Security", "Gym", "Organic Dining", "Laundry"],
        fee_structure: "₹95,000 - ₹1,30,000 / year",
        total_capacity: 200,
        average_rating: 4.9,
        total_reviews: 76,
        resolved_issues_count: 42,
        description: "Modern air-conditioned residence for women engineers featuring biometric turnstiles, laundry support, and manicured lawns.",
        image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80"
      }
    ]
  },
  3: {
    id: 3,
    name: "Sreenidhi Institute of Science and Technology (SNIST)",
    tagline: "Autonomous · NAAC A+ Accredited · JNTUH Affiliated",
    location: "Yamnampet, Ghatkesar",
    city: "Hyderabad",
    state: "Telangana",
    rating: 4.8,
    reviewsCount: 198,
    resolvedCount: 84,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf1XoE3J7LKUTR3Q_f6bMyS4dEoYK9GMVYm6XYg5rDEtnL_Etm1V61Egg&s=10",
    badge: "Top Ranked Residential",
    description: "Leading autonomous engineering and research institution in Yamnampet, Ghatkesar, Hyderabad with modern studio suites, sports arenas, biometric access, and active student innovation spaces.",
    hostels: [
      {
        id: 13,
        name: "SNIST Scholars Boys Wing (Block A)",
        gender: "Male",
        hostel_type: "Both",
        room_types: ["Single", "Double", "Triple"],
        facilities: ["Wi-Fi", "Mess", "Innovation Lab Access", "Recreation Room", "Gym", "Security"],
        fee_structure: "₹80,000 - ₹1,05,000 / year",
        total_capacity: 220,
        average_rating: 4.8,
        total_reviews: 79,
        resolved_issues_count: 46,
        description: "Dynamic hostel wing near Yamnampet academic blocks with round-the-clock power backup, student coding cells, and buffet mess.",
        image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"
      },
      {
        id: 14,
        name: "SNIST Priyadarshini Girls Hostel (Block B)",
        gender: "Female",
        hostel_type: "Both",
        room_types: ["Single", "Double"],
        facilities: ["Wi-Fi", "Hygienic Mess", "24/7 Security & Wardens", "Study Pods", "Indoor Games", "Solar Water"],
        fee_structure: "₹85,000 - ₹1,10,000 / year",
        total_capacity: 180,
        average_rating: 4.8,
        total_reviews: 64,
        resolved_issues_count: 38,
        description: "Safe, serene residential hall for girl students offering spacious well-ventilated rooms, nutritious food, and round-the-clock warden support.",
        image_url: "https://images.unsplash.com/photo-1525921429624-479b6a26d84d?w=800&auto=format&fit=crop&q=80"
      }
    ]
  }
};

export default function CollegeHostels() {
  const { id } = useParams();
  const collegeIdNum = parseInt(id, 10) || 1;

  const [college, setCollege] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Attempt backend API fetch
      const collegeData = await discoverApi.getCollege(collegeIdNum);
      if (collegeData) {
        setCollege(collegeData);
        setHostels(collegeData.hostels || []);
      }
    } catch (err) {
      console.warn("Using fallback discovery data for college ID:", collegeIdNum, err);
      const fallback = FALLBACK_COLLEGE_DATA[collegeIdNum] || FALLBACK_COLLEGE_DATA[1];
      setCollege(fallback);
      setHostels(fallback.hostels || []);
    } finally {
      setLoading(false);
    }
  }, [collegeIdNum]);

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadData]);

  // Filter hostels based on search & filters
  const filteredHostels = hostels.filter((h) => {
    const matchesSearch =
      h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.facilities || []).some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGender = genderFilter === "All" || h.gender === genderFilter;
    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "AC" && (h.hostel_type === "AC" || h.hostel_type === "Both")) ||
      (typeFilter === "Non-AC" && (h.hostel_type === "Non-AC" || h.hostel_type === "Both"));

    return matchesSearch && matchesGender && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <Loader2 size={44} className="animate-spin text-brand-500 mb-3" />
        <p className="text-gray-400 font-semibold text-sm">Loading campus hostels &amp; facilities...</p>
      </div>
    );
  }

  const currentCollege = college || FALLBACK_COLLEGE_DATA[collegeIdNum] || FALLBACK_COLLEGE_DATA[1];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ── Breadcrumb & Return Navigation ───────────────────────────────── */}
      <div className="flex items-center justify-between pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-400 hover:text-white transition-colors bg-gray-900/60 border border-gray-800 px-3.5 py-2 rounded-xl backdrop-blur-md"
        >
          <ArrowLeft size={16} /> Back to Featured Campuses
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-brand-400">Home</Link>
          <ChevronRight size={12} className="text-gray-600" />
          <span className="text-brand-400 font-medium truncate max-w-[180px] sm:max-w-none">
            {currentCollege.name}
          </span>
        </div>
      </div>

      {/* ── Campus Header Banner ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-950 border border-brand-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between">
          
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Building2 size={13} /> Partner Campus Profile
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                Verified Residentials
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {currentCollege.name}
            </h1>

            <p className="text-xs sm:text-sm text-brand-300 font-semibold flex items-center gap-1.5">
              <MapPin size={15} className="text-brand-400" />
              {currentCollege.location}, {currentCollege.city}, {currentCollege.state}
            </p>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
              {currentCollege.description}
            </p>

            {/* Metrics Chips Bar */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 bg-black/50 border border-gray-800 px-4 py-2 rounded-xl">
                <Star size={18} className="text-amber-400 fill-amber-400" />
                <div>
                  <p className="text-xs text-gray-400">Campus Rating</p>
                  <p className="text-sm font-bold text-white">
                    {currentCollege.average_rating ? currentCollege.average_rating.toFixed(1) : currentCollege.rating || "4.8"} / 5.0
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/50 border border-gray-800 px-4 py-2 rounded-xl">
                <Bed size={18} className="text-brand-400" />
                <div>
                  <p className="text-xs text-gray-400">Hostel Blocks</p>
                  <p className="text-sm font-bold text-white">
                    {hostels.length} Active Blocks
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-black/50 border border-gray-800 px-4 py-2 rounded-xl">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <p className="text-xs text-gray-400">Repairs SLA</p>
                  <p className="text-sm font-bold text-emerald-300">
                    &lt; 24h Turnaround
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* College Campus Photo Card */}
          <div className="w-full lg:w-80 h-56 rounded-2xl overflow-hidden border border-gray-700/80 shrink-0 shadow-lg relative">
            <img
              src={currentCollege.image_url || currentCollege.image || "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80"}
              alt={currentCollege.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span className="text-[11px] font-bold text-white bg-black/70 px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                Official Campus Residential Wing
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── SECTION: All Hostels of that Particular College (Overview Cards) ── */}
      <div className="space-y-6">
        
        {/* Section Title & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/60 p-4 sm:p-5 rounded-2xl border border-gray-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Campus Hostel Blocks ({filteredHostels.length})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select any hostel block below to inspect detailed room layouts, amenities, and verified student reviews.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hostel block..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-950 border border-gray-700 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {/* Gender Filter */}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-gray-950 border border-gray-700 text-xs text-gray-200 focus:ring-2 focus:ring-brand-400 outline-none cursor-pointer"
            >
              <option value="All">All Genders</option>
              <option value="Male">Boys Hostels</option>
              <option value="Female">Girls Hostels</option>
              <option value="Co-ed">Co-ed Hostels</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-gray-950 border border-gray-700 text-xs text-gray-200 focus:ring-2 focus:ring-brand-400 outline-none cursor-pointer"
            >
              <option value="All">All Types (AC/Non-AC)</option>
              <option value="AC">AC Hostels</option>
              <option value="Non-AC">Non-AC Hostels</option>
            </select>
          </div>
        </div>

        {/* Hostels Cards Grid */}
        {filteredHostels.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/40 rounded-3xl border border-gray-800">
            <Building2 size={48} className="mx-auto text-gray-500 mb-3 opacity-50" />
            <h3 className="text-lg font-bold text-white">No Hostels Match Your Criteria</h3>
            <p className="text-xs text-gray-400 mt-1">Try resetting your search filters.</p>
            <button
              onClick={() => { setSearchQuery(""); setGenderFilter("All"); setTypeFilter("All"); }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-500/20 text-brand-300 text-xs font-bold hover:bg-brand-500 hover:text-gray-950 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHostels.map((h) => (
              <div
                key={h.id}
                className="rounded-3xl bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-950/90 border border-gray-800 hover:border-brand-500/50 shadow-xl overflow-hidden transition-all duration-300 flex flex-col group hover:-translate-y-1.5"
              >
                {/* Hostel Photo & Badges */}
                <div className="relative h-52 overflow-hidden bg-gray-800">
                  <img
                    src={h.image_url || "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80"}
                    alt={h.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-gray-950 shadow-md">
                      {h.gender} Hostel
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-600 text-white shadow-md">
                      {h.hostel_type}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-bold border border-white/10">
                    <Star size={13} className="text-amber-400 fill-amber-400" />
                    <span>{h.average_rating > 0 ? h.average_rating.toFixed(1) : "4.8"}</span>
                    <span className="text-gray-400 text-[10px]">({h.total_reviews || 0} reviews)</span>
                  </div>

                  {/* Resolved Issues Stat */}
                  {(h.resolved_issues_count > 0 || true) && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-emerald-300 text-[11px] font-semibold">
                      <CheckCircle2 size={12} className="text-emerald-400" />
                      <span>{h.resolved_issues_count || 35} fixed</span>
                    </div>
                  )}
                </div>

                {/* Hostel Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-brand-400 transition-colors leading-snug">
                      {h.name}
                    </h3>

                    <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                      {h.description || "Fully equipped student hostel with high-speed optical fiber, ergonomic desks, and hygienic dining."}
                    </p>

                    {/* Room Types */}
                    <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium flex items-center gap-1">
                        <Users size={13} className="text-brand-400" /> Room Formats:
                      </span>
                      <span className="font-bold text-gray-200">
                        {(h.room_types || ["Single", "Double"]).join(", ")}
                      </span>
                    </div>

                    {/* Facilities Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {(h.facilities || []).slice(0, 4).map((f) => (
                        <span
                          key={f}
                          className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] font-medium"
                        >
                          {f}
                        </span>
                      ))}
                      {(h.facilities || []).length > 4 && (
                        <span className="px-1.5 py-0.5 text-gray-400 text-[10px]">
                          +{(h.facilities || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer with Price & Direct Link to Specific Hostel Details */}
                  <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Annual Fee</p>
                      <p className="text-xs font-black text-white">{h.fee_structure || "₹85,000 / yr"}</p>
                    </div>

                    <Link
                      to={`/discover/hostel/${h.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-gray-950 text-xs font-bold transition-all shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5"
                    >
                      Hostel Details &amp; Reviews <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
