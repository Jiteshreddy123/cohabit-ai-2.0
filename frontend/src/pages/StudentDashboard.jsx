import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User, FileText, CheckCircle, Home, Clock, ShoppingBag,
  Zap, MessageCircle, ShieldCheck, Star, AlertTriangle,
  Compass, Globe, CheckCircle2, ChevronRight
} from "lucide-react";
import apiClient from "../api/apiClient";
import { complaintApi } from "../api/complaintApi";

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [roomData, setRoomData] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  
  // Get student info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomRes, complaintsRes] = await Promise.allSettled([
          apiClient.get("/recommendations/my-room"),
          complaintApi.getMyComplaints(),
        ]);
        if (roomRes.status === "fulfilled") setRoomData(roomRes.value.data);
        if (complaintsRes.status === "fulfilled") setMyComplaints(complaintsRes.value);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const activeComplaintsCount = myComplaints.filter(c => ["NEW", "UNDER_REVIEW", "ASSIGNED", "IN_PROGRESS"].includes(c.status)).length;
  const resolvedComplaintsCount = myComplaints.filter(c => c.status === "RESOLVED").length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900 to-dark-900 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-lg border border-brand-800/40">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">
            Welcome{user.name ? `, ${user.name}` : ""}, to Cohabit AI
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1">
            Your verified hub for room matching, campus reviews, repairs &amp; peer marketplace.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link
            to="/discover"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors backdrop-blur-sm border border-white/20 flex items-center gap-1.5"
          >
            <Compass size={14} /> Explore Hostels
          </Link>
          <Link
            to="/complaints"
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-gray-950 font-bold text-xs transition-colors shadow-md flex items-center gap-1.5"
          >
            <AlertTriangle size={14} /> Raise Issue
          </Link>
        </div>
      </div>

      {/* Primary Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Interview */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-brand-50 dark:bg-brand-500/10 p-3.5 rounded-xl">
              <FileText className="text-brand-600 dark:text-brand-400" size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">AI Personality Matching</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Extract sleep, study, and noise preferences</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link to="/interview" className="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm">
              Take / View Interview <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Room Allocation */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3.5 rounded-xl">
              <Home className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Room Allocation</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {roomData?.published && roomData?.allocated 
                  ? "Allocated Room & Roommates" 
                  : "Check allocation status"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            {roomData?.published ? (
               roomData?.allocated ? (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-xs font-bold text-green-800 dark:text-green-400 flex items-center">
                      <CheckCircle size={15} className="mr-1.5" />
                      Allocated Room: {roomData.room_number}
                    </p>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <p className="font-semibold mb-1">Roommates:</p>
                    <ul className="list-disc pl-5 space-y-0.5">
                      {roomData.roommates.map(rm => (
                        <li key={rm.id}>{rm.name} ({rm.roll_number})</li>
                      ))}
                    </ul>
                  </div>
                </div>
               ) : (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-xs text-red-800 dark:text-red-400">{roomData.message}</p>
                </div>
               )
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center">
                  <Clock size={15} className="mr-1.5 shrink-0" />
                  Allocations not yet published by admin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Integrated Campus Services Section ──────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Campus Resident Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Verified Reviews */}
          <Link
            to="/reviews"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between hover:border-brand-400 hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Star size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Verified Reviews</h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                    <ShieldCheck size={11} /> Authenticated Badges
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Rate hostel facilities, cleanliness, mess food, and Wi-Fi with verified student protection.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
              Browse / Submit Reviews →
            </span>
          </Link>

          {/* Student Complaints */}
          <Link
            to="/complaints"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between hover:border-red-400 hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">My Complaints</h3>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {activeComplaintsCount} Active · {resolvedComplaintsCount} Resolved
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Report electrical, plumbing, or hygiene issues directly to college management.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
              View My Tickets →
            </span>
          </Link>

          {/* Public Issues Feed */}
          <Link
            to="/public-issues"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div>
              <div className="flex items-center gap-3 mb-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Globe size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Public Issues Feed</h3>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                    Campus Transparency
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                Check known campus repairs anonymously before submitting duplicate tickets.
              </p>
            </div>
            <span className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              View Public Feed →
            </span>
          </Link>

        </div>
      </div>

      {/* ── Peer Engagement Features ──────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">Peer Network &amp; Micro-Economy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Marketplace */}
          <Link
            to="/marketplace"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between hover:border-brand-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                <ShoppingBag size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Marketplace</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Buy, sell, or rent student essentials (fridges, lamps, kettles) privately.
            </p>
            <span className="mt-3 text-xs font-bold text-brand-600 dark:text-brand-400">Browse Items →</span>
          </Link>

          {/* Quick Gigs */}
          <Link
            to="/micro-gigs"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Zap size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Quick Gigs</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Post small campus errands (notes sharing, tutoring, delivery) for peers.
            </p>
            <span className="mt-3 text-xs font-bold text-amber-500 dark:text-amber-400">View Gigs →</span>
          </Link>

          {/* Safe Messages */}
          <Link
            to="/chat"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col justify-between hover:border-green-400 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <MessageCircle size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Safe Messages</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              End-to-end masked campus chat with zero personal phone/email leaks.
            </p>
            <span className="mt-3 text-xs font-bold text-green-600 dark:text-green-400">Open Chat →</span>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
