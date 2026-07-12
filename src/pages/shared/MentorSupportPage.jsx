import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Shield, CheckCircle, Clock, Calendar,
  ChevronDown, ChevronUp, Send, Eye, EyeOff, BookOpen, Users,
  Brain, Target, Smile, ScrollText, Handshake, AlertTriangle
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useStudent } from "../../context/StudentContext";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";
import { getMentorResources } from "../../services/teacherService";
import { 
  getStudentSessions, 
  getStudentAssignedMentor, 
  createSessionRequest 
} from "../../services/mentorshipService";
import { useService } from "../../hooks/useService";

const ICON_MAP = {
  BookOpen, Brain, Calendar, ScrollText, MessageSquare: MessageCircle, Target, Smile, Shield, Users, Send
};

const fade = { hidden: { opacity: 0, y: 14 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.3, ease: "easeOut" } }) };

const HELPER_EN = "Mentor Support is an institutional scheduling workflow where you can request a dedicated guidance session with your assigned mentor, select a topic, and coordinate discussion notes.";
const HELPER_HI = "मेंटर सपोर्ट एक संस्थागत शेड्यूलिंग कार्यप्रवाह है जहाँ आप अपने नियुक्त मेंटर के साथ एक समर्पित मार्गदर्शन सत्र का अनुरोध कर सकते हैं, एक विषय चुन सकते हैं, और चर्चा नोट्स का समन्वय कर सकते हैं।";

const SUPPORT_CATEGORIES = [
  { id: "academic", titleEn: "Academic Guidance", titleHi: "शैक्षणिक मार्गदर्शन", icon: "BookOpen", color: "#0077b6", colorBg: "#caf0f8", descEn: "Subjects, study plans, or revision goals.", descHi: "विषय, अध्ययन योजना, या दोहराव लक्ष्य।" },
  { id: "personal", titleEn: "Personal Support", titleHi: "व्यक्तिगत सहायता", icon: "Smile", color: "#6d28d9", colorBg: "#f5f3ff", descEn: "Stress, balance, or guidance.", descHi: "तनाव, संतुलन, या मार्गदर्शन।" },
  { id: "career", titleEn: "Career Advice", titleHi: "करियर सलाह", icon: "Target", color: "#059669", colorBg: "#ecfdf5", descEn: "Future path and entrance exams.", descHi: "भविष्य का रास्ता और प्रवेश परीक्षाएं।" },
  { id: "social", titleEn: "Peer Interaction", titleHi: "सहकर्मी संवाद", icon: "Users", color: "#dc2626", colorBg: "#fef2f2", descEn: "School life and peer discussions.", descHi: "स्कूल जीवन और सहकर्मी चर्चा।" },
  { id: "other", titleEn: "Other Concerns", titleHi: "अन्य चिंताएं", icon: "MessageSquare", color: "#d97706", colorBg: "#fffbeb", descEn: "Anything else you need support with.", descHi: "कुछ भी जिसमें आपको सहायता चाहिए।" },
];

function MentorCard({ mentor }) {
  const { t, lang } = useLanguage();
  if (!mentor) return null;
  const statusKey = `status.${mentor.status}`;
  
  return (
    <MainCard variants={fade} className="overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-lg">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md animate-pulse"
              style={{ backgroundColor: mentor.avatarColor }}>
              {mentor.avatarInitials}
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700" 
              style={mentor.status === 'available' ? {backgroundColor: '#d1fae5', color: '#059669'} : mentor.status === 'busy' ? {backgroundColor: '#fef3c7', color: '#d97706'} : {}}>
              {t(statusKey) || mentor.status}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-extrabold" style={{ color: "#03045e" }}>{mentor.name}</h2>
            <p className="text-sm font-semibold" style={{ color: "#0077b6" }}>{mentor.designation}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{mentor.department}</p>
            <p className="text-sm text-gray-600 font-medium mt-3 leading-relaxed">
              {lang === "hi" ? mentor.bioHi : mentor.bio}
            </p>
            <div className="flex flex-col gap-1.5 mt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Clock size={13} style={{ color: "#0077b6" }} />
                {lang === "hi" ? mentor.officeHoursHi : mentor.officeHours}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <BookOpen size={13} style={{ color: "#0077b6" }} />
                {lang === "hi" ? mentor.roomHi : mentor.room}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainCard>
  );
}

function CategoryGrid({ onSelect }) {
  const { lang } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 sm:grid-cols-3 gap-3">
      {SUPPORT_CATEGORIES.map((cat, i) => {
        const Icon = ICON_MAP[cat.icon] || MessageCircle;
        const title = lang === "hi" ? cat.titleHi : cat.titleEn;
        return (
          <motion.button key={cat.id} custom={i} variants={fade} initial="hidden" animate="visible"
            onClick={() => onSelect(title)}
            className="flex flex-col gap-3 p-5 rounded-2xl text-left transition-all hover:shadow-md bg-white border border-gray-100"
            style={{ outline: `1px solid ${cat.color}15` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: cat.colorBg }}>
              <Icon size={24} style={{ color: cat.color }} />
            </div>
            <div>
              <p className="text-base font-extrabold leading-tight" style={{ color: cat.color }}>
                {title}
              </p>
              <p className="text-[11px] font-semibold text-gray-400 mt-1 leading-snug">
                {lang === "hi" ? cat.descHi : cat.descEn}
              </p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function RequestForm({ prefillCategory, onSessionCreated }) {
  const { t, lang } = useLanguage();
  const { activeStudentId } = useStudent();
  const [topic, setTopic] = useState(prefillCategory || "Academic Guidance");
  const [scheduledAt, setScheduledAt] = useState("");
  const [message, setMessage] = useState("");
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!scheduledAt) {
      setError(t("mentor.errorDate", { fallback: "Please select a preferred date and time." }));
      return;
    }
    if (!message.trim()) {
      setError(t("mentor.errorDesc", { fallback: "Please describe what you would like to discuss." }));
      return;
    }

    setLoading(true);
    try {
      await createSessionRequest({
        studentId: activeStudentId,
        topic,
        scheduledAt,
        message
      });
      setSubmitted(true);
      if (onSessionCreated) onSessionCreated();
    } catch (err) {
      setError(err.message || t("mentor.errorSubmit", { fallback: "Failed to submit request." }));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div variants={fade} initial="hidden" animate="visible"
        className="flex flex-col items-center gap-4 py-12 px-6 bg-white rounded-2xl text-center border border-emerald-100"
        style={{ border: "1px solid #d1fae5" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-50">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-lg font-extrabold" style={{ color: "#03045e" }}>
            {t("mentor.reqSubmitted", { fallback: "Session Request Submitted" })}
          </p>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {t("mentor.reqNotified", { fallback: "Your assigned mentor has been notified. Check the status in your session history." })}
          </p>
        </div>
        <button onClick={() => { setSubmitted(false); setMessage(""); setScheduledAt(""); }}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#03045e]" >
          {t("mentor.submitAnother", { fallback: "Submit Another Request" })}
        </button>
      </motion.div>
    );
  }

  const inputStyle = (err) => ({
    backgroundColor: "#f8fafc",
    border: `1px solid ${err ? "#dc2626" : "#e2e8f0"}`,
    color: "#03045e",
    borderRadius: "12px",
    padding: "10px 14px",
    width: "100%",
    fontSize: "14px",
    fontWeight: 500,
    outline: "none",
  });
  
  const label = (text) => (
    <span className="text-xs font-black uppercase tracking-widest text-[#0077b6]">
      {text}
    </span>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 border border-[#caf0f8]" noValidate>
      <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider mb-2">
        {t("mentor.reqSupportSession", { fallback: "Request Support Session" })}
      </h3>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
        {/* Topic Selection */}
        <div className="flex flex-col gap-1.5">
          {label(t("mentor.chooseTopic", { fallback: "Choose Session Topic" }))}
          <select value={topic} onChange={e => setTopic(e.target.value)} style={inputStyle(false)}>
            {SUPPORT_CATEGORIES.map((c, i) => (
              <option key={i} value={lang === 'hi' ? c.titleHi : c.titleEn}>
                {lang === 'hi' ? c.titleHi : c.titleEn}
              </option>
            ))}
          </select>
        </div>

        {/* Preferred Date-Time */}
        <div className="flex flex-col gap-1.5">
          {label(t("mentor.preferredTime", { fallback: "Preferred Time & Date" }))}
          <input 
            type="datetime-local" 
            value={scheduledAt} 
            onChange={e => setScheduledAt(e.target.value)} 
            style={inputStyle(!scheduledAt && error)}
          />
        </div>
      </div>

      {/* Discussion Message */}
      <div className="flex flex-col gap-1.5">
        {label(t("mentor.sessionMessage", { fallback: "Session Message / Support Needed" }))}
        <textarea rows={4} value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={t("mentor.descPlaceholder", { fallback: "Describe briefly what you would like to discuss (e.g., preparation stress, study plans, etc.)." })}
          style={{ ...inputStyle(!message && error), resize: "none" }} 
        />
      </div>

      <button type="submit" disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-extrabold text-white bg-[#03045e] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        <Send size={16} />
        {loading ? t("mentor.schedulingReq", { fallback: "Scheduling Request..." }) : t("mentor.reqAppointment", { fallback: "Request Mentorship Appointment" })}
      </button>
    </form>
  );
}

function UpcomingSessionsList({ sessions, t }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-xs font-bold text-gray-400 italic border border-[#caf0f8]">
        {t("mentor.noActiveSessions", { fallback: "No active or pending mentor support sessions scheduled." })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s, i) => {
        const dateStr = new Date(s.scheduledAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        
        const isPending = s.status === "Pending";
        const statusBg = isPending ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-indigo-50 text-indigo-700 border-indigo-100";
        
        return (
          <motion.div key={s.id} custom={i} variants={fade} initial="hidden" animate="visible"
            className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm border border-[#caf0f8]"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50/60 border border-indigo-100/50">
              <Clock size={22} className="text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-extrabold text-[#03045e]">
                {s.topic}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-semibold text-gray-400">{t("mentor.mentorPrefix", { fallback: "Mentor:" })} {s.mentorTeacherName}</p>
                <span className="text-gray-300">•</span>
                <p className="text-xs font-semibold text-gray-400">{dateStr}</p>
              </div>
              <p className="text-xs text-gray-600 font-bold mt-2 leading-relaxed">
                <span className="text-gray-400 block text-[9px] font-black uppercase tracking-widest mb-0.5">{t("mentor.yourMessage", { fallback: "Your Message:" })}</span>
                "{s.message}"
              </p>
            </div>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wide border ${statusBg}`}>
              {s.status}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

function SessionHistory({ sessions, t }) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-xs font-bold text-gray-400 italic border border-[#caf0f8]">
        {t("mentor.noCompletedSessions", { fallback: "No completed mentor sessions logged in your timeline." })}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((s, i) => {
        const dateStr = new Date(s.scheduledAt || s.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
        
        return (
          <motion.div key={s.id} custom={i} variants={fade} initial="hidden" animate="visible"
            className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm border border-[#caf0f8]"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-extrabold text-[#03045e]">
                {s.topic}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-semibold text-gray-400">{t("mentor.mentorPrefix", { fallback: "Mentor:" })} {s.mentorTeacherName}</p>
                <span className="text-gray-300">•</span>
                <p className="text-xs font-semibold text-gray-400">{dateStr}</p>
              </div>
              <p className="text-xs text-gray-600 font-bold mt-2 leading-relaxed">
                <span className="text-gray-400 block text-[9px] font-black uppercase tracking-widest mb-0.5">{t("mentor.sessionNotes", { fallback: "Session Notes:" })}</span>
                {s.mentorNotes || t("mentor.notesDefault", { fallback: "Session completed successfully. Discussed exam planning & support strategies." })}
              </p>
            </div>
            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-100">
              {t("mentor.completed", { fallback: "Completed" })}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function MentorSupportPage() {
  const { lang, t } = useLanguage();
  const { isParent: isParentMode } = useAuth();
  const { activeStudentId } = useStudent();
  const [showHelper, setShowHelper] = useState(false);
  const [activeSection, setActiveSection] = useState("request");
  const [prefillCategory, setPrefillCategory] = useState(null);

  const { data: mentor, loading: mLoading } = useService(getStudentAssignedMentor, [activeStudentId], [activeStudentId]);
  const { data: resources, loading: rLoading } = useService(getMentorResources);
  const { data: sessions, loading: sLoading, refresh: refreshSessions } = useService(getStudentSessions, [activeStudentId], [activeStudentId]);

  const handleCategorySelect = useCallback((catName) => {
    setPrefillCategory(catName);
    setActiveSection("request");
    setTimeout(() => document.getElementById("mentor-request-section")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }, []);

  const toggleSection = (id) => setActiveSection(v => v === id ? null : id);

  const SectionToggle = ({ id, label, icon: Icon }) => (
    <button onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl shadow-sm transition-colors hover:bg-gray-50 border border-[#caf0f8]"
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-[#0077b6]" />
        <span className="text-sm font-extrabold text-[#03045e]">
          {label}
        </span>
      </div>
      {activeSection === id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
    </button>
  );

  if (mLoading || rLoading || sLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const upcomingSessions = (sessions || []).filter(s => s.status === "Pending" || s.status === "Approved");
  const completedSessions = (sessions || []).filter(s => s.status === "Completed" || s.status === "Rejected");

  return (
    <>
      <motion.div variants={fade} initial="hidden" animate="visible" className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl shadow-sm flex-shrink-0 bg-[#03045e]">
            <MessageCircle size={31} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black truncate text-[#03045e]">
              {t("mentor.title") || "Mentor Support"}
            </h1>
            <p className="text-sm text-gray-500 truncate">
              {isParentMode ? t("mentor.descParent", { fallback: "Schedule guidance session appointments or review past counselor notes." }) : t("mentor.descStudent", { fallback: "Request mentorship session appointments & review counselor feedback notes." })}
            </p>
          </div>
          <div className="flex-shrink-0">
            <HelperButton onClick={() => setShowHelper(true)} />
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0]">
          <Shield size={20} className="text-[#059669] flex-shrink-0" />
          <p className="text-xs font-bold leading-relaxed text-[#065f46]">
            {t("mentor.confidentiality", { fallback: "Confidentiality Guaranteed. Mentor consultation scheduling is private and academic-focused." })}
          </p>
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-2 px-1 text-[#0077b6]">
            {t("mentor.assignedMentor") || "Assigned Mentor"}
          </p>
          <MentorCard mentor={mentor} />
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-3 px-1 text-[#0077b6]">
            {t("mentor.supportCategories") || "Support Categories"}
          </p>
          <CategoryGrid onSelect={handleCategorySelect} />
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-widest mb-3 px-1 text-[#0077b6]">
            {t("mentor.quickLinks", { fallback: "Quick Scheduling Links & Guides" })}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(resources || []).map((r, i) => {
              const Icon = ICON_MAP[r.icon] || MessageCircle;
              const title = lang === 'hi' ? r.titleHi : r.titleEn;
              const tip = lang === 'hi' ? r.tipHi : r.tipEn;
              return (
                <motion.div key={r.id} custom={i} variants={fade} initial="hidden" animate="visible"
                  className="p-5 rounded-2xl flex flex-col gap-3 bg-white shadow-sm border border-[#caf0f8]">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50" style={{ backgroundColor: r.colorBg || "#f3f4f6" }}>
                    <Icon size={24} style={{ color: r.color || "#4b5563" }} />
                  </div>
                  <div>
                    <p className="text-base font-extrabold" style={{ color: r.color || "#03045e" }}>
                      {title}
                    </p>
                    <p className="text-[11px] font-semibold text-gray-400 mt-1 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* REQUEST APPOINTMENT SECTION */}
        <div id="mentor-request-section">
          <SectionToggle id="request" label={t("mentor.reqAppointmentLabel", { fallback: "Request Mentor Appointment" })} icon={Send} />
          {activeSection === "request" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-3">
              <RequestForm prefillCategory={prefillCategory} onSessionCreated={refreshSessions} />
            </motion.div>
          )}
        </div>

        {/* UPCOMING SESSIONS SECTION */}
        <div>
          <SectionToggle id="upcoming" label={`${t("mentor.upcomingLabel", { fallback: "Upcoming Support Sessions" })} (${upcomingSessions.length})`} icon={Clock} />
          {activeSection === "upcoming" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-3">
              <UpcomingSessionsList sessions={upcomingSessions} t={t} />
            </motion.div>
          )}
        </div>

        {/* PAST SESSIONS & NOTES TIMELINE */}
        <div>
          <SectionToggle id="history" label={t("mentor.completedLabel", { fallback: "Completed Sessions & Notes" })} icon={Users} />
          {activeSection === "history" && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mt-3">
              <SessionHistory sessions={completedSessions} t={t} />
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-5 p-6 rounded-2xl shadow-sm bg-gradient-to-r from-[#03045e] to-[#0077b6]">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
            <Handshake size={34} className="text-[#caf0f8]" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-black text-white">
              {t("mentor.advisoryTitle", { fallback: "Academic Advisory & Support" })}
            </p>
            <p className="text-sm text-white/70 font-semibold mt-0.5">
              {t("mentor.advisoryDesc", { fallback: "Discuss curriculum revisions, exam preparation strategies, or balanced progress schedules with your mentor." })}
            </p>
          </div>
        </div>
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="mentor.title"
        contentEn={HELPER_EN}
        contentHi={HELPER_HI}
      />
    </>
  );
}


