import React from "react";
import { Link } from "react-router-dom";
import {
  Brain, Users, Building2, ChevronRight, ShieldCheck, Zap,
  Sparkles, Star, MapPin, Compass, CheckCircle2, ArrowRight,
  Wifi, Utensils, Lock, Award, MessageSquare, HeartHandshake,
  Bed, ArrowUpRight, Check
} from "lucide-react";

// Mock Partner Colleges Data (Headlined by ACE, CBIT, and SNIST in Hyderabad)
const FEATURED_COLLEGES = [
  {
    id: 1,
    name: "ACE Engineering College",
    tagline: "Autonomous · NAAC A+ Accredited · JNTUH Affiliated",
    location: "Ankushapur, Ghatkesar",
    city: "Hyderabad",
    state: "Telangana",
    rating: 4.8,
    reviewsCount: 186,
    image: "https://dfhe5ze0n4pxu.cloudfront.net/College/Image/Image-1766845804828.jpeg",
    badge: "Flagship Partner Campus",
    badgeColor: "from-brand-500 to-emerald-500",
    totalHostels: 3,
    totalBeds: "680+ Beds",
    description: "Premier engineering and technology institution with eco-friendly smart residential campuses, 1 Gbps optical fiber, high-tech labs, and AI-optimized roommate allocations.",
    facilities: ["1 Gbps Fiber Wi-Fi", "Multi-Cuisine Mess", "24/7 Security & Wardens", "Solar Hot Water", "Modern Gym", "Smart Study Pods"],
    startingFee: "₹85,000 / yr",
    hostels: [
      { name: "ACE Boys Hostel (Block A - Godavari)", type: "Boys", ac: "Both", price: "₹85,000 - ₹1,10,000" },
      { name: "ACE Girls Hostel (Block B - Krishna)", type: "Girls", ac: "Both", price: "₹90,000 - ₹1,20,000" },
      { name: "ACE Executive Residency (Block C - Kaveri)", type: "Co-ed", ac: "AC", price: "₹1,30,000 - ₹1,65,000" }
    ]
  },
  {
    id: 2,
    name: "Chaitanya Bharathi Institute of Technology (CBIT)",
    tagline: "Autonomous · NAAC A++ Accredited · Established 1979",
    location: "Gandipet, Kokapet",
    city: "Hyderabad",
    state: "Telangana",
    rating: 4.9,
    reviewsCount: 224,
    image: "https://www.cbit.ac.in/wp-content/themes/CBIT/images/placeholder.jpg",
    badge: "Premier Engineering Hub",
    badgeColor: "from-blue-500 to-cyan-500",
    totalHostels: 2,
    totalBeds: "520+ Beds",
    description: "Leading autonomous institute in Gandipet, Hyderabad featuring modern residential blocks, innovation incubation hubs, fiber-connected study rooms, and sports amenities.",
    facilities: ["Central AC Wings", "High-Speed Wi-Fi", "Sports Complex", "Cafeteria & Lounge", "Laundry Facility", "24/7 Power Backup"],
    startingFee: "₹85,000 / yr",
    hostels: [
      { name: "CBIT Gandipet Boys Hostel (Block 1)", type: "Boys", ac: "Both", price: "₹85,000 - ₹1,15,000" },
      { name: "CBIT Emerald Girls Residency (Block 2)", type: "Girls", ac: "AC", price: "₹95,000 - ₹1,30,000" }
    ]
  },
  {
    id: 3,
    name: "Sreenidhi Institute of Science and Technology (SNIST)",
    tagline: "Autonomous · NAAC A+ Accredited · JNTUH Affiliated",
    location: "Yamnampet, Ghatkesar",
    city: "Hyderabad",
    state: "Telangana",
    rating: 4.8,
    reviewsCount: 198,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf1XoE3J7LKUTR3Q_f6bMyS4dEoYK9GMVYm6XYg5rDEtnL_Etm1V61Egg&s=10",
    badge: "Top Ranked Residential",
    badgeColor: "from-purple-500 to-pink-500",
    totalHostels: 2,
    totalBeds: "480+ Beds",
    description: "Renowned autonomous institution in Yamnampet, Ghatkesar, Hyderabad with spacious student accommodations, robotics labs, biometric security, and student wellness support.",
    facilities: ["Studio Single/Double", "Biometric Access", "Indoor Arena", "Acoustic Study Pods", "Nutritious Mess", "High-Speed Fiber"],
    startingFee: "₹80,000 / yr",
    hostels: [
      { name: "SNIST Scholars Boys Wing (Block A)", type: "Boys", ac: "Both", price: "₹80,000 - ₹1,05,000" },
      { name: "SNIST Priyadarshini Girls Hostel (Block B)", type: "Girls", ac: "Both", price: "₹85,000 - ₹1,10,000" }
    ]
  }
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#070b14] text-gray-100 selection:bg-brand-500/30 selection:text-white font-sans flex flex-col relative overflow-x-hidden">
      
      {/* ── Background Glows & Gradient Meshes ──────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/25 via-emerald-500/20 to-teal-400/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-gradient-to-bl from-blue-600/20 via-indigo-600/15 to-purple-700/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-teal-500/15 via-brand-700/15 to-cyan-500/10 rounded-full blur-[140px]" />
        {/* Subtle grid backdrop overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* ── Top Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-800/80 bg-[#070b14]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Building2 size={22} className="text-gray-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Cohabit</span>
                <span className="text-xs font-black px-1.5 py-0.5 rounded bg-gradient-to-r from-brand-400 to-teal-300 text-gray-950">AI</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">Smart Living &amp; Allocation</p>
            </div>
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#featured-colleges" className="hover:text-brand-400 transition-colors flex items-center gap-1">
              <Building2 size={15} className="text-brand-400" />
              Featured Campuses
            </a>
            <a href="#ai-engine" className="hover:text-brand-400 transition-colors">
              AI Matching Engine
            </a>
            <a href="#benefits" className="hover:text-brand-400 transition-colors">
              Why Cohabit
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800/80 transition-all border border-transparent hover:border-gray-700"
            >
              Admin Login
            </Link>
            <Link
              to="/student-login"
              className="text-xs sm:text-sm font-bold bg-gradient-to-r from-brand-500 via-teal-500 to-emerald-500 hover:from-brand-400 hover:to-emerald-400 text-gray-950 px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5 flex items-center gap-1.5"
            >
              Student Portal <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
        
        {/* Floating Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-950/80 via-gray-900/90 to-brand-950/80 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-inner mb-8 backdrop-blur-md">
          <Sparkles size={14} className="text-brand-400 animate-spin" style={{ animationDuration: "6s" }} />
          <span>Next-Gen AI Accommodation Platform for Universities</span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-brand-400" />
          <span className="hidden sm:inline text-gray-400">NAAC &amp; AICTE Compliant</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15] max-w-5xl mx-auto">
          Intelligent Campus Accommodations &amp;{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-teal-300 to-emerald-400">
            Harmonious Room Allocations.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto mt-6 leading-relaxed font-normal">
          Empowering institutions like <strong className="text-white font-semibold">ACE Engineering College</strong> with scientific AI personality extraction, constraint-optimized roommate matching, and transparent student discovery.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="#featured-colleges"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brand-500 via-teal-500 to-emerald-500 hover:from-brand-400 hover:to-emerald-400 text-gray-950 font-bold text-base rounded-2xl transition-all shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Building2 size={19} />
            Explore Partner Campuses
          </a>

          <Link
            to="/student-login"
            className="w-full sm:w-auto px-8 py-4 bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 text-white font-semibold text-base rounded-2xl transition-all hover:-translate-y-1 backdrop-blur-md flex items-center justify-center gap-2"
          >
            <Users size={19} className="text-brand-400" />
            Student Login
          </Link>

          <Link
            to="/login"
            state={{ isRegister: true }}
            className="w-full sm:w-auto px-8 py-4 bg-gray-900/50 hover:bg-gray-800/80 border border-brand-500/30 text-brand-300 font-semibold text-base rounded-2xl transition-all hover:-translate-y-1 backdrop-blur-md flex items-center justify-center gap-2"
          >
            <Building2 size={19} className="text-brand-400" />
            Register Your Campus
          </Link>
        </div>

        {/* Live Metrics Showcase */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md text-left">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-300">98.4%</p>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Roommate Harmony</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Eliminates mid-semester conflicts</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md text-left">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">3,500+</p>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Verified Beds</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Across premier partner colleges</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md text-left">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">100%</p>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Automated Surveys</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Conversational LLM assessments</p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-900/60 border border-gray-800 backdrop-blur-md text-left">
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">&lt; 24 hrs</p>
            <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Complaint Turnaround</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Geo-verified repair tracking</p>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: Featured Partner Colleges (Level 1 Cards Overview) ─── */}
      <section id="featured-colleges" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 size={14} /> Partner Institutions
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Featured Partner Campuses
          </h2>
          <p className="text-gray-400 text-base mt-3">
            Click on any institution to view all its active hostel blocks, room formats, and transparent student reviews.
          </p>
        </div>

        {/* 3 Featured College Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {FEATURED_COLLEGES.map((college, idx) => (
            <div
              key={college.id}
              className={`rounded-3xl bg-gradient-to-b from-gray-900/90 via-gray-900/70 to-gray-950/90 border transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-2 hover:shadow-2xl ${
                idx === 0
                  ? "border-brand-500/50 shadow-brand-500/10 hover:shadow-brand-500/25 ring-1 ring-brand-500/20"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              {/* College Campus Photo Header */}
              <div className="relative h-56 overflow-hidden bg-gray-800">
                <img
                  src={college.image}
                  alt={college.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-black/40" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r ${college.badgeColor} shadow-md backdrop-blur-md`}>
                    {college.badge}
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 text-xs font-bold text-white">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span>{college.rating}</span>
                  <span className="text-gray-400 font-normal">({college.reviewsCount})</span>
                </div>

                {/* Location Bar at bottom of image */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-gray-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin size={13} className="text-brand-400 shrink-0" />
                    {college.location}, {college.city}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-sm text-[11px] font-semibold">
                    {college.totalHostels} Hostels
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white group-hover:text-brand-400 transition-colors">
                    {college.name}
                  </h3>
                  <p className="text-xs text-brand-300 font-medium mt-1">
                    {college.tagline}
                  </p>

                  <p className="text-xs text-gray-400 mt-3.5 leading-relaxed line-clamp-3">
                    {college.description}
                  </p>

                  {/* Hostels Included in this Campus */}
                  <div className="mt-5 pt-4 border-t border-gray-800">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1">
                      <Bed size={13} className="text-brand-400" /> Campus Hostel Blocks Overview
                    </p>
                    <div className="space-y-1.5">
                      {college.hostels.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-gray-800/40 border border-gray-800/60">
                          <span className="text-gray-300 font-medium truncate max-w-[180px]">{h.name}</span>
                          <span className="text-[11px] font-bold text-brand-400">{h.type} · {h.ac}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {college.facilities.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-800/80 text-gray-300 border border-gray-700/50"
                      >
                        {f}
                      </span>
                    ))}
                    {college.facilities.length > 4 && (
                      <span className="px-2 py-1 text-[11px] text-gray-400">
                        +{college.facilities.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: View Hostels CTA that redirects to the dedicated College Hostels Page */}
                <div className="mt-6 pt-5 border-t border-gray-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400">Annual Fee From</span>
                    <p className="text-sm font-black text-white">{college.startingFee}</p>
                  </div>

                  <Link
                    to={`/colleges/${college.id}/hostels`}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-gray-950 text-xs font-bold transition-all shadow-md shadow-brand-500/20 hover:shadow-brand-500/40 hover:-translate-y-0.5"
                  >
                    View Hostels <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 2: AI Matching & Personality Engine ─────────────────── */}
      <section id="ai-engine" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Brain size={14} /> Optimization Science
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How Cohabit-AI Eliminates Roommate Conflict
          </h2>
          <p className="text-gray-400 text-base mt-3">
            Our multi-tier engine converts natural conversations into 5-dimensional compatibility vectors and solves whole-campus allocations with zero administrative guesswork.
          </p>
        </div>

        {/* Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-8 rounded-3xl bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800 hover:border-brand-500/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center mb-6 group-hover:bg-brand-500/20 transition-colors">
              <Brain size={28} className="text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Automated LLM Interviews</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              No boring 50-question questionnaires. Our conversational agent interviews students naturally to extract sleep cycles, study noise tolerance, hygiene expectations, and social preferences.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800 hover:border-blue-500/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
              <Zap size={28} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Google OR-Tools Solver</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We model roommate allocation as a quadratic constraint satisfaction problem, executing millions of permutations to find the globally optimal happiness score across entire buildings.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800 hover:border-emerald-500/40 transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
              <ShieldCheck size={28} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Verified Reviews &amp; Repairs</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Students post authenticated reviews and track maintenance tickets in real-time. Campus management resolves tickets with transparent public proof and SLA timestamps.
            </p>
          </div>
        </div>

        {/* Live Matching Simulation Box */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-950 border border-gray-800 p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Live Algorithm Preview</span>
            <h4 className="text-2xl font-bold text-white mt-1">
              Sample Cohabit Harmony Score: <span className="text-brand-400">96% Compatibility</span>
            </h4>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed">
              When matched students share compatible sleep schedules (Night Owls), low noise thresholds, and disciplined study habits, room change requests drop to near zero.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-gray-950/80 p-4 rounded-2xl border border-gray-800/80 shrink-0">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-sm font-bold text-brand-300 mx-auto">
                AS
              </div>
              <p className="text-xs font-semibold text-white mt-1">Aarav</p>
              <p className="text-[10px] text-gray-400">CS · 3rd Yr</p>
            </div>

            <div className="flex flex-col items-center px-3">
              <span className="text-xs font-black text-emerald-400">96% MATCH</span>
              <div className="w-20 h-1 bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full my-1.5" />
              <span className="text-[10px] text-gray-400 font-mono">Room #304</span>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-sm font-bold text-blue-300 mx-auto">
                RS
              </div>
              <p className="text-xs font-semibold text-white mt-1">Rohan</p>
              <p className="text-[10px] text-gray-400">ECE · 3rd Yr</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Why Cohabit / Student & Admin Ecosystem ──────────── */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="rounded-3xl bg-gradient-to-br from-brand-950/40 via-gray-900/60 to-gray-950 border border-brand-500/20 p-8 sm:p-14 text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto">
            Ready to Transform Your Campus Accommodation Experience?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed">
            Join visionary institutions that are streamlining hostel logistics, elevating student well-being, and eliminating roommate grievances with AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/student-login"
              className="w-full sm:w-auto px-8 py-4 bg-brand-500 hover:bg-brand-400 text-gray-950 font-bold text-sm rounded-xl transition-all shadow-lg shadow-brand-500/25"
            >
              Sign In as Student
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm rounded-xl border border-gray-700 transition-all"
            >
              Institution Admin Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800/80 bg-[#070b14] py-12 px-4 sm:px-6 lg:px-8 text-gray-400 text-xs mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-gray-950 font-black text-xs">
              CH
            </div>
            <span className="font-bold text-white text-sm">Cohabit-AI</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Campus Accommodation Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-gray-400 text-xs">
            <Link to="/colleges/1/hostels" className="hover:text-white transition-colors">ACE Engineering College</Link>
            <Link to="/colleges/2/hostels" className="hover:text-white transition-colors">CBIT Hyderabad</Link>
            <Link to="/colleges/3/hostels" className="hover:text-white transition-colors">SNIST Hyderabad</Link>
            <Link to="/login" className="hover:text-white transition-colors">Admin Portal</Link>
            <Link to="/student-login" className="hover:text-white transition-colors">Student Portal</Link>
          </div>

          <p className="text-gray-500 text-[11px]">
            © {new Date().getFullYear()} Cohabit-AI Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
