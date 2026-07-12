import React, { useState, useEffect, useCallback } from "react";
import MainCard from "./MainCard";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Sunset } from "lucide-react";
import { getAttendanceStatus } from "../shared/utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { getAttendanceSummary, getAttendanceStatusByDate } from "../services/attendanceService";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

const RADIUS = 72;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const HELPER_CONTENT_EN =
  "Attendance shows how many classes were attended out of the total scheduled. Regular attendance is important for learning and exam eligibility.";
const HELPER_CONTENT_HI =
  "उपस्थिति बताती है कि कुल निर्धारित कक्षाओं में से कितनी कक्षाओं में भाग लिया गया। नियमित उपस्थिति सीखने और परीक्षा पात्रता के लिए महत्वपूर्ण है।";

const ATTENDANCE_COLOR_LEGEND = [
  {
    color: "#00b4d8",
    labelEn: "Green (85%+) — Attendance is excellent.",
    labelHi: "हरा (85%+) — उपस्थिति उत्कृष्ट है। ऐसे ही जारी रखें।",
  },
  {
    color: "#0077b6",
    labelEn: "Teal (75–85%) — Attendance is good.",
    labelHi: "नील (75–85%) — उपस्थिति अच्छी है।",
  },
  {
    color: "#F59E0B",
    labelEn: "Yellow (60–75%) — Attendance is low (Warning).",
    labelHi: "पीला (60–75%) — उपस्थिति कम है (चेतावनी)।",
  },
  {
    color: "#EF4444",
    labelEn: "Red (below 60%) — Critical attendance. May affect eligibility.",
    labelHi: "लाल (60% से कम) — उपस्थिति गंभीर रूप से कम है।",
  },
];

function CircularRing({ percentage, strokeColor }) {
  const targetOffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 180 180"
      className="drop-shadow-md"
      aria-hidden="true"
    >
      <circle
        cx="90"
        cy="90"
        r={RADIUS}
        fill="none"
        stroke="#caf0f8"
        strokeWidth="12"
      />
      <motion.circle
        cx="90"
        cy="90"
        r={RADIUS}
        fill="none"
        stroke={strokeColor}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        initial={{ strokeDashoffset: CIRCUMFERENCE }}
        animate={{ strokeDashoffset: targetOffset }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        style={{ transformOrigin: "50% 50%", rotate: "-90deg" }}
      />
    </svg>
  );
}

function StatusIcon({ status }) {
  if (status === "excellent" || status === "good") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#00b4d8"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    );
  }
  if (status === "warning") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2" />
        <path
          d="M12 8v4M12 16h.01"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="12"
        y1="9"
        x2="12"
        y2="13"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="17"
        x2="12.01"
        y2="17"
        stroke="#EF4444"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AttendanceCard({ studentId }) {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  
  // Dynamic State resolved from centralized attendanceService
  const [summary, setSummary] = useState({ percentage: 100, totalClasses: 0, attended: 0 });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dailyStatus, setDailyStatus] = useState("UNMARKED");
  const [dailyStatusTitle, setDailyStatusTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Fetch Dynamic Cumulative Summary
  const loadSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAttendanceSummary(studentId);
      setSummary(data);
    } catch (err) {
      console.error("Failed to load attendance summary:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  // 2. Fetch Selected Date Status
  const loadDailyStatus = useCallback(async () => {
    try {
      const res = await getAttendanceStatusByDate(studentId, selectedDate);
      setDailyStatus(res.status);
      setDailyStatusTitle(res.title || "");
    } catch (err) {
      console.error("Failed to load daily attendance status:", err);
    }
  }, [studentId, selectedDate]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadDailyStatus();
  }, [loadDailyStatus]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Navigation handlers
  const handlePrevDay = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d.toISOString().split("T")[0];
    });
  };

  const handleNextDay = () => {
    setSelectedDate(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      const nextStr = d.toISOString().split("T")[0];
      return nextStr <= todayStr ? nextStr : todayStr;
    });
  };

  const handleDateChange = (e) => {
    const chosen = e.target.value;
    if (chosen <= todayStr) {
      setSelectedDate(chosen);
    }
  };

  const isTodaySelected = selectedDate === todayStr;

  const percentage = summary.percentage;
  const { status, colorClass, bgClass, strokeColor } = getAttendanceStatus(percentage);

  return (
    <>
      <MainCard
        variants={cardVariants}
        className="p-6 flex flex-col justify-between cursor-default select-none relative h-full gap-6"
        aria-label={`Attendance Overview: ${percentage}%`}
      >
        {/* Helper button */}
        <HelperButton onClick={() => setShowHelper(true)} className="absolute top-4 right-4" />

        {/* Heading */}
        <div className="flex items-center gap-2 self-start">
          <BarChart2
            size={24}
            className="text-[#03045e]"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-lg font-black text-[#03045e]">
              Attendance Overview
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("attendance.centralizedInsights", { fallback: "Centralized ERP Insights" })}</p>
          </div>
        </div>

        {/* Top: Circular Ring with Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 bg-gradient-to-br from-[#f8fdff] to-[#f0f9ff] p-4 rounded-3xl border border-[#caf0f8]/50">
          <div className="relative flex items-center justify-center">
            <CircularRing percentage={percentage} strokeColor={strokeColor} />
            <div className="absolute flex flex-col items-center justify-center gap-1">
              <motion.span
                className={`text-3.5xl font-black ${colorClass}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              >
                {percentage}%
              </motion.span>
              
              {/* Micro Legend Button */}
              <div className="relative">
                <motion.button
                  onClick={() => setShowLegend(!showLegend)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="focus:outline-none p-1 rounded-full hover:bg-[#caf0f8]/50 transition-colors"
                  aria-label="Show attendance legend"
                >
                  <StatusIcon status={status} />
                </motion.button>

                <AnimatePresence>
                  {showLegend && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowLegend(false)}
                      />
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-44 p-3 rounded-2xl bg-white shadow-[0_10px_30px_rgba(3,4,94,0.15)] border border-[#caf0f8]"
                      >
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                        <div className="space-y-2">
                          {[
                            { color: "#00b4d8", label: "Excellent (>85%)" },
                            { color: "#0077b6", label: "Good (75-85%)" },
                            { color: "#F59E0B", label: "Warning (60-75%)" },
                            { color: "#EF4444", label: "Critical (<60%)" }
                          ].map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                              <span className="text-[10px] font-extrabold text-[#03045e]">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-col gap-3 text-center sm:text-left min-w-[120px]">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("attendance.statusTitle", { fallback: "Attendance Status" })}</p>
              <div className={`mt-1 px-3 py-1 rounded-full text-xs font-black inline-block capitalize ${bgClass} ${colorClass}`}>
                {status}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("attendance.presentDays", { fallback: "Present Days" })}</p>
              <p className="text-lg font-black text-[#03045e]">{summary.attended} <span className="text-xs text-gray-400 font-bold">/ {summary.totalClasses} classes</span></p>
            </div>
          </div>
        </div>

        {/* Lower Section: Daily Status & Historical Navigation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">{t("attendance.dailyHistoryStatus", { fallback: "Daily History & Status" })}</h3>
            
            {/* Navigation & Calendar Picker */}
            <div className="flex items-center gap-1.5 bg-[#caf0f8]/30 p-1 rounded-xl">
              {/* Backward Arrow */}
              <button 
                onClick={handlePrevDay} 
                className="p-1.5 hover:bg-[#caf0f8]/60 active:scale-95 rounded-lg transition-all text-[#0077b6]"
                title="Previous Day"
              >
                <ChevronLeft size={16} />
              </button>
              
              {/* Native Calendar Picker Input without duplicate Lucide icon & select-none to block selection highlights */}
              <input 
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={handleDateChange}
                className="bg-transparent text-xs font-black text-[#03045e] focus:outline-none cursor-pointer uppercase py-0.5 px-1 outline-none w-[115px] select-none"
              />

              {/* Forward Arrow — active only when user has gone backward (i.e. selectedDate !== today) */}
              <button 
                onClick={handleNextDay} 
                disabled={isTodaySelected}
                className={`p-1.5 rounded-lg transition-all ${
                  isTodaySelected 
                    ? 'text-gray-350 cursor-not-allowed opacity-30' 
                    : 'hover:bg-[#caf0f8]/60 active:scale-95 text-[#0077b6]'
                }`}
                title="Next Day"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Status Badge display for selected date */}
          <div className="flex items-center justify-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                {dailyStatus === "PRESENT" && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-600">Present</h4>
                      <p className="text-[10px] font-bold text-emerald-600/70">{t("attendance.verifiedHomeroom", { fallback: "Verified Homeroom Attendance" })}</p>
                    </div>
                  </>
                )}
                {dailyStatus === "ABSENT" && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                      <XCircle size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-rose-600">Absent</h4>
                      <p className="text-[10px] font-bold text-rose-600/70">{t("attendance.markedAbsent", { fallback: "Marked Absent by Homeroom Teacher" })}</p>
                    </div>
                  </>
                )}
                {dailyStatus === "ON_LEAVE" && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
                      <Sunset size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-sky-600">On Leave</h4>
                      <p className="text-[10px] font-bold text-sky-600/70">{t("attendance.approvedLeave", { fallback: "Approved Institutional Leave" })}</p>
                    </div>
                  </>
                )}
                {dailyStatus === "UNMARKED" && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
                      <Clock size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-600">Not Marked Yet</h4>
                      <p className="text-[10px] font-bold text-amber-600/70">Attendance pending submission</p>
                    </div>
                  </>
                )}
                {dailyStatus === "HOLIDAY" && (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                      <Sunset size={22} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-indigo-600">{dailyStatusTitle}</h4>
                      <p className="text-[10px] font-bold text-indigo-600/70">{t("attendance.schoolBreak", { fallback: "School Academic Calendar Break" })}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </MainCard>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="attendance.overviewHelper"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={ATTENDANCE_COLOR_LEGEND}
      />
    </>
  );
}

export default AttendanceCard;
