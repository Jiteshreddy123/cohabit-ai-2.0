import React, { useState, useEffect } from "react";
import { clubsApi } from "../api/clubsApi";
import { authApi } from "../api/authApi";
import {
  Sparkles, Users, Calendar, MapPin, ShieldCheck, AlertCircle,
  Plus, Check, X, Search, ChevronRight, Music, HeartHandshake,
  Laptop, Trophy, ShieldAlert, Award, Compass, ExternalLink,
  Flame, CheckCircle2, UserCheck, Clock, UserPlus
} from "lucide-react";

export default function HosClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyClubsOnly, setShowMyClubsOnly] = useState(false);
  const [engagementStatus, setEngagementStatus] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isJoinLoading, setIsJoinLoading] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New club form state (Admin)
  const [newClub, setNewClub] = useState({
    name: "",
    category: "Cultural & Arts",
    tagline: "",
    description: "",
    image_url: "",
    faculty_advisor: "",
    student_lead: "",
    meeting_schedule: "",
    venue: "",
    is_mandatory_eligible: true,
  });

  // New activity form state
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    event_date: "",
    venue: "",
    event_type: "Meetup",
  });
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);

  const isStudent = authApi.getUserRole() === "student";
  const isAdmin = authApi.getUserRole() === "admin";

  const categories = [
    { label: "All", icon: <Compass size={15} /> },
    { label: "Cultural & Arts", icon: <Music size={15} /> },
    { label: "Academics & Tech", icon: <Laptop size={15} /> },
    { label: "Social Service", icon: <HeartHandshake size={15} /> },
    { label: "Sports & Fitness", icon: <Trophy size={15} /> },
    { label: "Hostel Committees", icon: <ShieldAlert size={15} /> },
  ];

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const data = await clubsApi.getClubs({
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });
      setClubs(data);
    } catch (err) {
      console.error("Error fetching clubs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngagement = async () => {
    if (isStudent) {
      try {
        const res = await clubsApi.getEngagementStatus();
        setEngagementStatus(res);
      } catch (err) {
        console.error("Error fetching engagement status:", err);
      }
    }
  };

  useEffect(() => {
    fetchClubs();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchEngagement();
  }, []);

  const handleJoinToggle = async (club) => {
    setIsJoinLoading((prev) => ({ ...prev, [club.id]: true }));
    try {
      if (club.is_enrolled) {
        await clubsApi.leaveClub(club.id);
      } else {
        await clubsApi.joinClub(club.id);
      }
      await fetchClubs();
      await fetchEngagement();
      if (selectedClub && selectedClub.id === club.id) {
        const updatedDetail = await clubsApi.getClub(club.id);
        setSelectedClub(updatedDetail);
      }
    } catch (err) {
      console.error("Error toggling club membership:", err);
    } finally {
      setIsJoinLoading((prev) => ({ ...prev, [club.id]: false }));
    }
  };

  const handleOpenDetail = async (club) => {
    try {
      const detail = await clubsApi.getClub(club.id);
      setSelectedClub(detail);
    } catch (err) {
      console.error("Error fetching club details:", err);
    }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    try {
      await clubsApi.createClub(newClub);
      setShowCreateModal(false);
      setNewClub({
        name: "",
        category: "Cultural & Arts",
        tagline: "",
        description: "",
        image_url: "",
        faculty_advisor: "",
        student_lead: "",
        meeting_schedule: "",
        venue: "",
        is_mandatory_eligible: true,
      });
      fetchClubs();
    } catch (err) {
      console.error("Error creating club:", err);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!selectedClub) return;
    try {
      await clubsApi.createActivity(selectedClub.id, newActivity);
      setShowAddActivityModal(false);
      setNewActivity({
        title: "",
        description: "",
        event_date: "",
        venue: "",
        event_type: "Meetup",
      });
      const updated = await clubsApi.getClub(selectedClub.id);
      setSelectedClub(updated);
    } catch (err) {
      console.error("Error adding activity:", err);
    }
  };

  const handleRsvp = async (activityId) => {
    try {
      await clubsApi.rsvpActivity(activityId);
      if (selectedClub) {
        const updated = await clubsApi.getClub(selectedClub.id);
        setSelectedClub(updated);
      }
    } catch (err) {
      console.error("Error RSVPing:", err);
    }
  };

  const displayedClubs = showMyClubsOnly
    ? clubs.filter((c) => c.is_enrolled)
    : clubs;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              Campus Life & Peer Bonding
            </span>
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              <ShieldCheck size={13} /> Mandatory Requirement
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">
            Hostel Clubs <span className="text-brand-600 dark:text-brand-400">(Hos-Clubs)</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
            Explore dedicated college clubs & committees to break hostel room isolation, forge lifelong friendships, and foster an inspiring campus environment.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-500/20"
          >
            <Plus size={16} />
            Register New Hos-Club
          </button>
        )}
      </div>

      {/* ── Mandatory Student Engagement Banner (Student Perspective) ── */}
      {isStudent && engagementStatus && (
        <div
          className={`p-5 rounded-2xl border transition-all shadow-sm ${
            engagementStatus.is_compliant
              ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
              : "bg-gradient-to-r from-amber-500/15 via-rose-500/5 to-transparent border-amber-500/30 text-amber-950 dark:text-amber-100"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-3 rounded-xl mt-0.5 ${
                  engagementStatus.is_compliant
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/20 text-amber-600 dark:text-amber-400 animate-pulse"
                }`}
              >
                {engagementStatus.is_compliant ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    Mandatory Campus Engagement Status:
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      engagementStatus.is_compliant
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {engagementStatus.status_label} ({engagementStatus.enrolled_count} / {engagementStatus.minimum_required} Required)
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  {engagementStatus.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Participation Ratio
                </p>
                <p className="text-lg font-black text-brand-600 dark:text-brand-400">
                  {engagementStatus.enrolled_count} Active {engagementStatus.enrolled_count === 1 ? "Club" : "Clubs"}
                </p>
              </div>
              {engagementStatus.enrolled_count > 0 && (
                <button
                  onClick={() => setShowMyClubsOnly(!showMyClubsOnly)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    showMyClubsOnly
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-brand-500"
                  }`}
                >
                  {showMyClubsOnly ? "Show All Clubs" : "View My Clubs"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Category Pills & Search Controls ─────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(cat.label)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.label
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-500/25"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search Hos-Clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
          />
        </div>
      </div>

      {/* ── Clubs Cards Grid ──────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse border border-gray-200 dark:border-gray-800"
            />
          ))}
        </div>
      ) : displayedClubs.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-400 mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No Hos-Clubs Found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {showMyClubsOnly
              ? "You haven't joined any clubs in this category yet. Explore and join one above!"
              : "Try choosing another category or clearing your search keywords."}
          </p>
          {showMyClubsOnly && (
            <button
              onClick={() => setShowMyClubsOnly(false)}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
            >
              Explore All Clubs
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col hover:border-brand-500/40 dark:hover:border-brand-500/30 transition-all duration-200 group shadow-sm hover:shadow-md"
            >
              {/* Club Banner Image */}
              <div className="relative h-44 w-full bg-gray-800 overflow-hidden">
                <img
                  src={
                    club.image_url ||
                    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&fit=crop"
                  }
                  alt={club.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {club.category}
                  </span>
                </div>

                {/* Mandatory Eligible Badge */}
                {club.is_mandatory_eligible && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/90 text-gray-950 backdrop-blur-sm">
                      <ShieldCheck size={12} /> Mandatory Credit
                    </span>
                  </div>
                )}

                {/* Member Count Overlay */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-xs">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md font-semibold">
                    <Users size={12} className="text-brand-400" />
                    {club.member_count} Members
                  </span>
                  {club.is_enrolled && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/80 text-white font-bold backdrop-blur-md">
                      <Check size={12} /> You Joined
                    </span>
                  )}
                </div>
              </div>

              {/* Club Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {club.name}
                  </h3>
                  {club.tagline && (
                    <p className="text-xs font-medium text-brand-600 dark:text-brand-400 mt-0.5">
                      {club.tagline}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                    {club.description}
                  </p>
                </div>

                {/* Schedule & Venue Metadata */}
                <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300">
                  {club.meeting_schedule && (
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-brand-500 shrink-0" />
                      <span className="truncate">{club.meeting_schedule}</span>
                    </div>
                  )}
                  {club.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin size={13} className="text-rose-500 shrink-0" />
                      <span className="truncate">{club.venue}</span>
                    </div>
                  )}
                  {club.student_lead && (
                    <div className="flex items-center gap-2">
                      <UserCheck size={13} className="text-amber-500 shrink-0" />
                      <span className="truncate">Lead: {club.student_lead}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2">
                  {isStudent && (
                    <button
                      onClick={() => handleJoinToggle(club)}
                      disabled={isJoinLoading[club.id]}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                        club.is_enrolled
                          ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100"
                          : "bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                      }`}
                    >
                      {club.is_enrolled ? (
                        <>
                          <X size={14} /> Leave Club
                        </>
                      ) : (
                        <>
                          <UserPlus size={14} /> Join Club
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenDetail(club)}
                    className="py-2 px-3 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-1"
                  >
                    Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Club Details & Activities Modal ───────────────────────── */}
      {selectedClub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header Image */}
            <div className="relative h-48 w-full bg-gray-800">
              <img
                src={
                  selectedClub.image_url ||
                  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&fit=crop"
                }
                alt={selectedClub.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
              <button
                onClick={() => setSelectedClub(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-500 text-gray-950">
                  {selectedClub.category}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1.5">
                  {selectedClub.name}
                </h2>
                <p className="text-xs text-brand-300 font-medium">
                  {selectedClub.tagline}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  About the Hos-Club
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedClub.description}
                </p>
              </div>

              {/* Leaders & Faculty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 text-xs">
                <div>
                  <p className="text-gray-400 uppercase font-semibold text-[10px]">
                    Faculty Advisor
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedClub.faculty_advisor || "University Faculty Board"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase font-semibold text-[10px]">
                    Student Lead / Coordinator
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedClub.student_lead || "Student Council Lead"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase font-semibold text-[10px]">
                    Meeting Schedule
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedClub.meeting_schedule || "Every Weekend"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 uppercase font-semibold text-[10px]">
                    Meeting Venue
                  </p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                    {selectedClub.venue || "Student Activity Center"}
                  </p>
                </div>
              </div>

              {/* Upcoming Club Activities & Events */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-500" /> Upcoming Activities & Meetups
                  </h4>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddActivityModal(true)}
                      className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Event
                    </button>
                  )}
                </div>

                {selectedClub.activities && selectedClub.activities.length > 0 ? (
                  <div className="space-y-3">
                    {selectedClub.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-500/10 text-brand-600 dark:text-brand-400">
                              {act.event_type}
                            </span>
                            <h5 className="font-bold text-sm text-gray-900 dark:text-white">
                              {act.title}
                            </h5>
                          </div>
                          {act.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {act.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-brand-500" /> {act.event_date}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-rose-500" /> {act.venue}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRsvp(act.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600/10 text-brand-700 dark:text-brand-400 hover:bg-brand-600 hover:text-white transition-all whitespace-nowrap self-start sm:self-center flex items-center gap-1"
                        >
                          <Users size={12} /> RSVP ({act.rsvp_count})
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30 text-center">
                    No upcoming activities scheduled yet. Check back soon!
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/80">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedClub.member_count} students currently active
              </span>
              <div className="flex items-center gap-3">
                {isStudent && (
                  <button
                    onClick={() => handleJoinToggle(selectedClub)}
                    disabled={isJoinLoading[selectedClub.id]}
                    className={`py-2 px-5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      selectedClub.is_enrolled
                        ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                        : "bg-brand-600 hover:bg-brand-500 text-white"
                    }`}
                  >
                    {selectedClub.is_enrolled ? "Leave Club" : "Join This Club"}
                  </button>
                )}
                <button
                  onClick={() => setSelectedClub(null)}
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create New Club Modal (Admin) ────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Register New Hostel Club (Hos-Club)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-semibold">Club Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nritya — Campus Dance Crew"
                  value={newClub.name}
                  onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">Category *</label>
                  <select
                    value={newClub.category}
                    onChange={(e) => setNewClub({ ...newClub, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Cultural & Arts">Cultural & Arts (Dance, Music, Drama)</option>
                    <option value="Academics & Tech">Academics & Tech (Coding, AI, Debate)</option>
                    <option value="Social Service">Social Service (NSS, Blood Drive, Eco)</option>
                    <option value="Sports & Fitness">Sports & Fitness (Football, Cricket, Yoga)</option>
                    <option value="Hostel Committees">Hostel Committees (Mess, Anti-Ragging)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">Tagline</label>
                  <input
                    type="text"
                    placeholder="Short punchline"
                    value={newClub.tagline}
                    onChange={(e) => setNewClub({ ...newClub, tagline: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-semibold">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the club purpose, activities, and who should join..."
                  value={newClub.description}
                  onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">Faculty Advisor</label>
                  <input
                    type="text"
                    placeholder="Dr. Radhika Sharma"
                    value={newClub.faculty_advisor}
                    onChange={(e) => setNewClub({ ...newClub, faculty_advisor: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">Student Lead</label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma (3rd Year)"
                    value={newClub.student_lead}
                    onChange={(e) => setNewClub({ ...newClub, student_lead: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">Meeting Schedule</label>
                  <input
                    type="text"
                    placeholder="e.g. Wednesdays & Fridays · 6 PM"
                    value={newClub.meeting_schedule}
                    onChange={(e) => setNewClub({ ...newClub, meeting_schedule: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. SAC Studio 1"
                    value={newClub.venue}
                    onChange={(e) => setNewClub({ ...newClub, venue: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-semibold">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newClub.image_url}
                  onChange={(e) => setNewClub({ ...newClub, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-500 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl"
                >
                  Save & Publish Club
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Club Activity Modal ─────────────────────────────── */}
      {showAddActivityModal && selectedClub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Add Event for {selectedClub.name}
              </h3>
              <button
                onClick={() => setShowAddActivityModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1 font-semibold">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acoustic Rooftop Jam"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">Event Type</label>
                  <select
                    value={newActivity.event_type}
                    onChange={(e) => setNewActivity({ ...newActivity, event_type: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Rehearsal">Rehearsal</option>
                    <option value="Competition">Competition</option>
                    <option value="Outreach">Outreach</option>
                    <option value="Meetup">Meetup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">Event Date & Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saturday, Oct 25 · 7 PM"
                    value={newActivity.event_date}
                    onChange={(e) => setNewActivity({ ...newActivity, event_date: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-semibold">Venue *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amphitheatre or SAC Room 102"
                  value={newActivity.venue}
                  onChange={(e) => setNewActivity({ ...newActivity, venue: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-semibold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief note for attendees..."
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="px-3 py-1.5 rounded-xl text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
