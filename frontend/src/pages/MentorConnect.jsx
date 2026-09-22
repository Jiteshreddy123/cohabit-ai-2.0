import React, { useState, useEffect } from "react";
import { mentorshipApi } from "../api/mentorshipApi";
import { authApi } from "../api/authApi";
import {
  GraduationCap, PhoneCall, Video, Calendar, Clock, MapPin, Mail,
  Phone, UserCheck, AlertTriangle, CheckCircle2, Star, ShieldAlert,
  Send, FileText, ChevronRight, MessageSquare, ExternalLink,
  Plus, History, HeartPulse, User, Award, Shield
} from "lucide-react";

export default function MentorConnect() {
  const role = authApi.getUserRole() || "student";
  const isStudent = role === "student";

  // Student perspective state
  const [studentProfile, setStudentProfile] = useState(null);
  const [preNotes, setPreNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Admin/Mentor perspective state
  const [roster, setRoster] = useState([]);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Log Call form state
  const [callLog, setCallLog] = useState({
    call_id: null,
    wellbeing_score: 4,
    mentor_notes: "",
    confidential_summary: "",
    flag_status: "Normal",
    action_items: "",
  });

  // Schedule Call form state
  const [scheduleData, setScheduleData] = useState({
    student_id: null,
    month_year: "September 2026",
    scheduled_date: "2026-09-28 16:00",
    call_mode: "Video Call",
    meeting_link: "https://meet.google.com/cohabit-mentor-call",
  });

  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const data = await mentorshipApi.getMyMentor();
      setStudentProfile(data);
      if (data?.current_call?.student_pre_notes) {
        setPreNotes(data.current_call.student_pre_notes);
      }
    } catch (err) {
      console.error("Error fetching student mentor data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAcademicRoster = async () => {
    try {
      setLoading(true);
      const data = await mentorshipApi.getAcademicRoster();
      setRoster(data);
    } catch (err) {
      console.error("Error fetching academic roster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStudent) {
      fetchStudentData();
    } else {
      fetchAcademicRoster();
    }
  }, [role]);

  // Student submits pre-call notes
  const handleSavePreNotes = async (e) => {
    e.preventDefault();
    setIsSavingNotes(true);
    try {
      await mentorshipApi.submitPreNotes(preNotes);
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 4000);
      fetchStudentData();
    } catch (err) {
      console.error("Error saving pre-call notes:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Mentor opens log call modal
  const handleOpenLogModal = (mentee) => {
    setSelectedMentee(mentee);
    setCallLog({
      call_id: mentee.current_call_id,
      wellbeing_score: mentee.latest_wellbeing_score || 4,
      mentor_notes: "",
      confidential_summary: "",
      flag_status: mentee.latest_flag_status || "Normal",
      action_items: "",
    });
    setShowLogModal(true);
  };

  // Mentor submits log
  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!callLog.call_id) return;
    try {
      await mentorshipApi.logCheckinCall(callLog.call_id, {
        wellbeing_score: Number(callLog.wellbeing_score),
        mentor_notes: callLog.mentor_notes,
        confidential_summary: callLog.confidential_summary,
        flag_status: callLog.flag_status,
        action_items: callLog.action_items,
      });
      setShowLogModal(false);
      fetchAcademicRoster();
    } catch (err) {
      console.error("Error logging call:", err);
    }
  };

  // View full history for student
  const handleViewHistory = async (studentId, studentName) => {
    try {
      const history = await mentorshipApi.getStudentHistory(studentId);
      setStudentHistory(history);
      setSelectedMentee({ student_id: studentId, name: studentName });
      setShowHistoryModal(true);
    } catch (err) {
      console.error("Error fetching student history:", err);
    }
  };

  // Schedule call submit
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mentorshipApi.scheduleCall(scheduleData);
      setShowScheduleModal(false);
      fetchAcademicRoster();
    } catch (err) {
      console.error("Error scheduling call:", err);
    }
  };

  const filteredRoster = roster.filter((item) => {
    if (filterStatus === "All") return true;
    if (filterStatus === "Completed") return item.monthly_status === "Completed";
    if (filterStatus === "Scheduled") return item.monthly_status === "Scheduled";
    if (filterStatus === "Flagged") return item.latest_flag_status !== "Normal";
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1.5">
              <HeartPulse size={14} className="text-rose-500" /> Monthly Well-being & Academic Pulse
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
              {isStudent ? "Student Portal" : "Academic Mentor Portal"}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2 tracking-tight">
            {isStudent ? "My Academic Mentor" : "Academic Mentorship Desk"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-2xl">
            {isStudent
              ? "Every month, connect 1-on-1 with your dedicated faculty mentor to share any problems regarding your studies, hostel room living, mental health, or personal aspirations."
              : "Review your assigned student mentees, track monthly check-in call completion, log confidential counseling dossiers, and ensure early intervention for student struggles."}
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          STUDENT VIEW
      ══════════════════════════════════════════════════════════════ */}
      {isStudent && (
        <div className="space-y-8">
          {loading ? (
            <div className="h-64 rounded-3xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
          ) : (
            <>
              {/* Top Row: Mentor Card & Current Call Spotlight */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Mentor Profile Card */}
                {studentProfile?.mentor && (
                  <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 flex flex-col justify-between shadow-sm">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            studentProfile.mentor.avatar_url ||
                            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop"
                          }
                          alt={studentProfile.mentor.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/20 shadow-md"
                        />
                        <div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-brand-500/10 text-brand-600 dark:text-brand-400">
                            Assigned Faculty Mentor
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                            {studentProfile.mentor.name}
                          </h3>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                            {studentProfile.mentor.designation}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed italic bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                        "{studentProfile.mentor.bio}"
                      </p>

                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2.5">
                          <GraduationCap size={14} className="text-brand-500" />
                          <span>{studentProfile.mentor.department}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <MapPin size={14} className="text-rose-500" />
                          <span>{studentProfile.mentor.office_location || "Faculty Wing Room 304"}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Mail size={14} className="text-amber-500" />
                          <span>{studentProfile.mentor.email}</span>
                        </div>
                        {studentProfile.mentor.phone && (
                          <div className="flex items-center gap-2.5">
                            <Phone size={14} className="text-emerald-500" />
                            <span>{studentProfile.mentor.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                      <span>Monthly Check-in Cycle: Mandatory</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Active Appointment
                      </span>
                    </div>
                  </div>
                )}

                {/* This Month's Check-in Call Spotlight */}
                <div className="lg:col-span-7 bg-gradient-to-br from-brand-900/10 via-brand-500/5 to-transparent bg-white dark:bg-gray-900 rounded-3xl p-6 border border-brand-500/30 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-500 text-gray-950 flex items-center gap-1.5 shadow-sm">
                        <Calendar size={13} /> This Month's Check-in
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        {studentProfile?.current_call?.status || "Scheduled"}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                        {studentProfile?.current_call?.month_year || "September 2026"} 1-on-1 Pulse
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Your dedicated confidential monthly call with your mentor to discuss your hostel experience, academic workload, and personal health.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200/60 dark:border-gray-700/60 text-xs">
                      <div>
                        <p className="text-gray-400 uppercase font-semibold text-[10px]">Date & Time</p>
                        <p className="font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                          <Clock size={13} className="text-brand-500" />
                          {studentProfile?.current_call?.scheduled_date || "2026-09-28 16:00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 uppercase font-semibold text-[10px]">Call Medium</p>
                        <p className="font-bold text-gray-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                          <Video size={13} className="text-rose-500" />
                          {studentProfile?.current_call?.call_mode || "Video Call"}
                        </p>
                      </div>
                    </div>

                    {studentProfile?.current_call?.meeting_link && (
                      <div className="flex items-center gap-3">
                        <a
                          href={studentProfile.current_call.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-all"
                        >
                          <Video size={15} /> Join Monthly Video Meeting
                          <ExternalLink size={12} />
                        </a>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          (Secure encrypted institutional link)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Section: "Share What's on Your Mind" Pre-Call Form */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Share What's on Your Mind Ahead of the Call
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Facing issues with roommates, studying late, food quality, or feeling isolated? Write it here so your mentor can prepare to guide you.
                      </p>
                    </div>
                  </div>
                  {notesSuccess && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
                      <CheckCircle2 size={13} /> Notes updated for mentor!
                    </span>
                  )}
                </div>

                <form onSubmit={handleSavePreNotes} className="space-y-3">
                  <textarea
                    rows={4}
                    value={preNotes}
                    onChange={(e) => setPreNotes(e.target.value)}
                    placeholder="e.g. I am having a bit of friction with my roommate's sleep schedule, and mid-term exam stress is building up. Would love some tips on balancing club activities with study time..."
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all leading-relaxed"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-gray-400">
                      🔒 Strictly confidential between you and your academic mentor.
                    </p>
                    <button
                      type="submit"
                      disabled={isSavingNotes || !preNotes.trim()}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Send size={13} />
                      {isSavingNotes ? "Saving Notes..." : "Share with Mentor"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Bottom Section: Historical Session Records */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <History size={18} className="text-brand-500" />
                    Past Recorded Sessions & Action Items
                  </h3>
                  <span className="text-xs text-gray-500">
                    {studentProfile?.history?.length || 0} recorded sessions
                  </span>
                </div>

                {studentProfile?.history && studentProfile.history.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentProfile.history.map((call) => (
                      <div
                        key={call.id}
                        className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2.5">
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                              {call.month_year} Call
                            </h4>
                            <p className="text-[11px] text-gray-400">
                              Completed on {call.completed_date || call.scheduled_date}
                            </p>
                          </div>

                          {call.wellbeing_score && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold">
                              <Star size={13} className="fill-amber-500" />
                              <span>{call.wellbeing_score}/5 Score</span>
                            </div>
                          )}
                        </div>

                        {call.mentor_notes && (
                          <div>
                            <p className="text-[11px] uppercase font-bold text-gray-400">
                              Mentor Feedback & Guidance
                            </p>
                            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                              {call.mentor_notes}
                            </p>
                          </div>
                        )}

                        {call.action_items && (
                          <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/20 text-xs">
                            <p className="font-bold text-brand-700 dark:text-brand-400 flex items-center gap-1">
                              <CheckCircle2 size={13} /> Agreed Action Items:
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line leading-relaxed">
                              {call.action_items}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                    No past sessions recorded yet. Once your mentor finishes your first monthly call, the session notes and guidance will be recorded here!
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ACADEMIC / MENTOR / ADMIN VIEW
      ══════════════════════════════════════════════════════════════ */}
      {!isStudent && (
        <div className="space-y-6">
          {/* Controls & Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {["All", "Scheduled", "Completed", "Flagged"].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterStatus === st
                      ? "bg-brand-600 text-white shadow-sm"
                      : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500">
              Showing {filteredRoster.length} assigned students
            </p>
          </div>

          {/* Mentees Table */}
          {loading ? (
            <div className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Student Details</th>
                      <th className="px-4 py-3.5">Monthly Status</th>
                      <th className="px-4 py-3.5">Student Pre-Call Topics</th>
                      <th className="px-4 py-3.5">Well-being & Flag</th>
                      <th className="px-4 py-3.5">Recorded Calls</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredRoster.map((mentee) => (
                      <tr key={mentee.student_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-sm text-gray-900 dark:text-white">
                            {mentee.name}
                          </div>
                          <div className="text-gray-400 text-[11px] mt-0.5">
                            {mentee.roll_number} · {mentee.branch} (Year {mentee.year_of_study})
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              mentee.monthly_status === "Completed"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : mentee.monthly_status === "Scheduled"
                                ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/20"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {mentee.monthly_status}
                          </span>
                          {mentee.current_scheduled_date && (
                            <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                              <Clock size={10} /> {mentee.current_scheduled_date}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 max-w-xs">
                          {mentee.has_pre_notes ? (
                            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] line-clamp-2">
                              💬 "{mentee.student_pre_notes}"
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              No pre-call notes submitted
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {mentee.latest_wellbeing_score ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                <Star size={13} className="fill-amber-500" />
                                {mentee.latest_wellbeing_score}/5
                              </span>
                            ) : (
                              <span className="text-gray-400 text-[11px]">N/A</span>
                            )}

                            {mentee.latest_flag_status !== "Normal" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500 border border-rose-500/30">
                                ⚠️ {mentee.latest_flag_status}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 font-semibold text-gray-700 dark:text-gray-300">
                          {mentee.past_calls_count} completed
                        </td>

                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenLogModal(mentee)}
                            className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-sm transition-all"
                          >
                            Log Call
                          </button>
                          <button
                            onClick={() => handleViewHistory(mentee.student_id, mentee.name)}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs transition-colors"
                          >
                            History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Log Monthly Check-in Modal ───────────────────────────── */}
          {showLogModal && selectedMentee && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Record Monthly Pulse Call: {selectedMentee.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Roll: {selectedMentee.roll_number} · September 2026 Session
                    </p>
                  </div>
                  <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>

                {selectedMentee.student_pre_notes && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                    <p className="font-bold text-amber-600 dark:text-amber-400 text-[10px] uppercase">
                      Student's Submitted Agenda:
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 mt-1 italic">
                      "{selectedMentee.student_pre_notes}"
                    </p>
                  </div>
                )}

                <form onSubmit={handleSaveLog} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-500 mb-1 font-semibold">
                      Student Well-being Rating (1 to 5) *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCallLog({ ...callLog, wellbeing_score: star })}
                          className={`p-2 rounded-xl flex items-center gap-1 font-bold ${
                            callLog.wellbeing_score >= star
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}
                        >
                          <Star size={14} className={callLog.wellbeing_score >= star ? "fill-white" : ""} />
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1 font-semibold">
                      Discussion & Feedback Notes (Student Visible) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Notes on academic progress, study habits, and hostel room living adjustment..."
                      value={callLog.mentor_notes}
                      onChange={(e) => setCallLog({ ...callLog, mentor_notes: e.target.value })}
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 mb-1 font-semibold">
                      Confidential Institutional Notes (Private Dossier)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Private mentor impressions, emotional stability, potential counseling needs..."
                      value={callLog.confidential_summary}
                      onChange={(e) => setCallLog({ ...callLog, confidential_summary: e.target.value })}
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-500 mb-1 font-semibold">Flag Status</label>
                      <select
                        value={callLog.flag_status}
                        onChange={(e) => setCallLog({ ...callLog, flag_status: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                      >
                        <option value="Normal">🟢 Normal (Healthy)</option>
                        <option value="Academic Risk">🟡 Academic Risk</option>
                        <option value="Roommate / Hostel Distress">🟠 Roommate / Hostel Distress</option>
                        <option value="Mental Health / Isolation">🔴 Mental Health / Isolation</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-500 mb-1 font-semibold">Action Items for Student</label>
                      <input
                        type="text"
                        placeholder="e.g. Meet warden, join 1 club"
                        value={callLog.action_items}
                        onChange={(e) => setCallLog({ ...callLog, action_items: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setShowLogModal(false)}
                      className="px-4 py-2 rounded-xl text-gray-500 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl"
                    >
                      Save Recorded Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Student History Drawer / Modal ───────────────────────── */}
          {showHistoryModal && selectedMentee && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Recorded Mentorship History: {selectedMentee.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Multi-month historical well-being archive
                    </p>
                  </div>
                  <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {studentHistory.map((h) => (
                    <div
                      key={h.id}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">
                          {h.month_year}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-500">
                            ★ {h.wellbeing_score || "N/A"}/5
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              h.flag_status === "Normal"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : "bg-rose-500/20 text-rose-500"
                            }`}
                          >
                            {h.flag_status}
                          </span>
                        </div>
                      </div>

                      {h.student_pre_notes && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Student Problem Submission:
                          </p>
                          <p className="italic text-gray-700 dark:text-gray-300 mt-0.5">
                            "{h.student_pre_notes}"
                          </p>
                        </div>
                      )}

                      {h.mentor_notes && (
                        <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400">
                            Mentor Feedback & Guidance:
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                            {h.mentor_notes}
                          </p>
                        </div>
                      )}

                      {h.confidential_summary && (
                        <div className="p-2 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                          <p className="text-[10px] uppercase font-bold">Confidential Dossier:</p>
                          <p className="mt-0.5">{h.confidential_summary}</p>
                        </div>
                      )}

                      {h.action_items && (
                        <div className="text-brand-600 dark:text-brand-400 font-semibold">
                          Action Items: {h.action_items}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 text-right">
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
