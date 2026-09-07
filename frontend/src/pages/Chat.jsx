import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MessageCircle, Send, ArrowLeft, ShieldCheck,
  Loader2, AlertCircle, User
} from "lucide-react";
import { chatApi } from "../api/chatApi";

function ConversationItem({ conv, isActive, onClick }) {
  const initials = (conv.other_student_name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 border-b border-gray-100 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
        isActive ? "bg-brand-50 dark:bg-brand-900/20" : ""
      }`}
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {conv.other_student_name || "Student"}
          </p>
          {conv.last_message_at && (
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
              {new Date(conv.last_message_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
        {(conv.listing_title || conv.gig_title) && (
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium truncate">
            re: {conv.listing_title || conv.gig_title}
          </p>
        )}
        {conv.last_message && (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{conv.last_message}</p>
        )}
      </div>
    </button>
  );
}

function MessageBubble({ msg, isMe }) {
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
        {!isMe && (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">
            {msg.sender_name}
          </span>
        )}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMe
              ? "bg-brand-600 text-white rounded-br-sm"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-sm"
          }`}
        >
          {msg.message}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 mx-1">
          {new Date(msg.sent_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

export default function Chat() {
  const { convId } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentStudentId = user.studentId || user.id || null;

  const activeConvId = convId ? parseInt(convId, 10) : null;
  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Load all conversations
  useEffect(() => {
    const load = async () => {
      setLoadingConvs(true);
      try {
        const data = await chatApi.getConversations();
        setConversations(data);
      } catch (err) {
        setError(err?.detail || "Could not load conversations.");
      } finally {
        setLoadingConvs(false);
      }
    };
    load();
  }, []);

  // Load messages when active conversation changes
  const loadMessages = useCallback(async () => {
    if (!activeConvId) return;
    setLoadingMsgs(true);
    try {
      const data = await chatApi.getMessages(activeConvId);
      setMessages(data);
    } catch (err) {
      setError(err?.detail || "Could not load messages.");
    } finally {
      setLoadingMsgs(false);
    }
  }, [activeConvId]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConvId) return;
    setSending(true);
    try {
      const sent = await chatApi.sendMessage(activeConvId, newMsg.trim());
      setMessages((prev) => [...prev, sent]);
      setNewMsg("");
      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, last_message: sent.message, last_message_at: sent.sent_at }
            : c
        )
      );
    } catch (err) {
      alert(err?.detail || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-130px)] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm bg-white dark:bg-gray-900">
      {/* ── Conversation Sidebar ─────────────────────── */}
      <div className="w-80 shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle size={18} className="text-brand-600 dark:text-brand-400" />
            Messages
          </h2>
          {/* Privacy badge */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg px-2.5 py-1.5">
            <ShieldCheck size={13} /> Private &amp; secure — no contact info shared
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-brand-500" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-400 dark:text-gray-600">
              <MessageCircle size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No conversations yet.</p>
              <p className="text-xs mt-1">Click <strong>Inquire</strong> on a listing or gig to start one.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === activeConvId}
                onClick={() => navigate(`/chat/${conv.id}`)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Message Thread ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeConvId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600 gap-3 p-8">
            <MessageCircle size={56} className="opacity-30" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm text-center max-w-xs">
              Or start one by clicking <strong>Inquire</strong> on any marketplace item or quick gig.
            </p>
            <div className="flex gap-3 mt-2">
              <Link to="/marketplace" className="text-sm font-medium text-brand-600 dark:text-brand-400 underline underline-offset-2">
                Go to Marketplace
              </Link>
              <Link to="/micro-gigs" className="text-sm font-medium text-amber-600 dark:text-amber-400 underline underline-offset-2">
                Go to Gigs
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate("/chat")}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors sm:hidden"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                {(activeConv?.other_student_name || "?")
                  .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {activeConv?.other_student_name || "Student"}
                </p>
                {(activeConv?.listing_title || activeConv?.gig_title) && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    re: {activeConv?.listing_title || activeConv?.gig_title}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-full px-2.5 py-1">
                <ShieldCheck size={12} /> Private
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50 dark:bg-gray-950">
              {loadingMsgs ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-brand-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                  <User size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Send the first message!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMe={msg.sender_id === currentStudentId}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2 items-center shrink-0"
            >
              <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a message…"
                className="flex-1 px-4 py-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!newMsg.trim() || sending}
                className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
