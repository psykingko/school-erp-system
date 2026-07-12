import React, { useState, memo, useMemo } from "react";
import MainCard from "./MainCard";
import { motion } from "framer-motion";
import {
  BookOpen,
  User,
  MapPin,
  Clock,
  CalendarDays,
  Radio,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";
import { AnimatePresence } from "framer-motion";
import ParentInsight from "./ParentInsight";
import { MiniDatePicker } from "../shared/components/MiniDatePicker";

// All variants at module level — never recreated
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: "easeOut" },
  }),
};
const wrapperVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const HELPER_CONTENT_EN =
  "The timetable shows today's class schedule. Each class shows the subject, teacher, room number, and timing. A green highlight means the class is happening right now.";
const HELPER_CONTENT_HI =
  "टाइमटेबल आज का कक्षा कार्यक्रम दिखाता है। प्रत्येक कक्षा में विषय, शिक्षक, कमरा नंबर और समय दिखाया जाता है। हरा हाइलाइट का मतलब है कि कक्षा अभी चल रही है।";

const TIMETABLE_LEGEND = [
  {
    color: "#00b4d8",
    labelEn: "Green glow — Class is live right now.",
    labelHi: "हरी चमक — कक्षा अभी चल रही है।",
  },
  {
    color: "#9ca3af",
    labelEn: "Gray — Class has ended.",
    labelHi: "ग्रे — कक्षा समाप्त हो गई है।",
  },
  {
    color: "#0077b6",
    labelEn: "Teal — Upcoming class.",
    labelHi: "टील — आने वाली कक्षा।",
  },
];

// FIX: status config is pure data — no JSX badges inside.
// Previously getStatusConfig() created new JSX elements on every render of
// every ClassCard. Now badges are rendered inline with stable string keys.
const STATUS_CONFIG = {
  live: {
    cardClass: "bg-white",
    cardStyle: {
      outline: "2px solid #00b4d8",
      boxShadow:
        "0 0 0 4px rgba(0,180,216,0.2), 0 4px 20px rgba(0,180,216,0.15)",
    },
    dotStyle: {
      backgroundColor: "#00b4d8",
      boxShadow: "0 0 0 4px rgba(0,180,216,0.3)",
    },
    accentStyle: { background: "linear-gradient(to bottom, #00b4d8, #0077b6)" },
    timeStyle: { color: "#00b4d8", fontWeight: 700 },
    badgeStyle: { backgroundColor: "#00b4d820", color: "#00b4d8" },
    badgeLabelKey: "timetable.live",
    BadgeIcon: Radio,
    dimmed: false,
  },
  ended: {
    cardClass: "opacity-75 grayscale bg-white",
    cardStyle: { outline: "1px solid #e5e7eb" },
    dotStyle: {
      backgroundColor: "#9ca3af",
      boxShadow: "0 0 0 4px rgba(156,163,175,0.2)",
    },
    accentStyle: { background: "linear-gradient(to bottom, #d1d5db, #9ca3af)" },
    timeStyle: { color: "#9ca3af", fontWeight: 600 },
    badgeStyle: { 
      backgroundColor: "#f1f5f9", 
      color: "#4b5563", 
      border: "1px solid #e2e8f0" 
    },
    badgeLabelKey: "timetable.ended",
    BadgeIcon: CheckCircle,
    dimmed: true,
  },
  upcoming: {
    cardClass: "bg-white",
    cardStyle: { outline: "1px solid #caf0f8" },
    dotStyle: {
      backgroundColor: "#0077b6",
      boxShadow: "0 0 0 4px rgba(0,119,182,0.2)",
    },
    accentStyle: { background: "linear-gradient(to bottom, #0077b6, #03045e)" },
    timeStyle: { color: "#0077b6", fontWeight: 600 },
    badgeStyle: { backgroundColor: "#0077b620", color: "#0077b6" },
    badgeLabelKey: "timetable.upcoming",
    BadgeIcon: Clock,
    dimmed: false,
  },
};

// FIX: memo + props instead of context hooks inside each card.
// Previously each ClassCard called useLanguage() and useViewMode() — with 5
// cards that's 10 context subscriptions. Now only TimetableCard subscribes.
const ClassCard = memo(function ClassCard({
  classItem,
  index,
  isLast,
  t,
  isParentMode,
}) {
  const { subject, faculty, teacher, room, startTime, endTime, status } =
    classItem;
  const teacherName = teacher || faculty;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.upcoming;
  const { BadgeIcon } = config;

  const parentDesc =
    status === "live"
      ? t("timetable.parentDesc.live")
      : status === "ended"
        ? t("timetable.parentDesc.ended")
        : t("timetable.parentDesc.upcoming", { time: startTime });

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-4 h-4 flex-shrink-0 mt-4 rounded-full"
          style={config.dotStyle}
          aria-hidden="true"
        />
        {!isLast && (
          <div
            className="w-0.5 flex-1 mt-1"
            style={{ backgroundColor: "#00b4d8" }}
            aria-hidden="true"
          />
        )}
      </div>

      <motion.div
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        // FIX: CSS hover instead of whileHover spring physics
        className={`flex-1 mb-4 rounded-2xl overflow-hidden flex shadow-md
                    cursor-default select-none transition-transform duration-200
                    ease-out hover:-translate-y-1 hover:shadow-xl ${config.cardClass}`}
        style={config.cardStyle}
        role="article"
        aria-label={`${t(subject)} — ${t(`status.${status}`)}`}
      >
        <div
          className="w-1.5 flex-shrink-0"
          style={config.accentStyle}
          aria-hidden="true"
        />
        <div className="flex-1 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen
                size={21}
                style={{ color: config.dimmed ? "#9ca3af" : "#03045e" }}
                aria-hidden="true"
              />
              <h3
                className="text-sm font-bold leading-tight"
                style={{ color: "#03045e" }}
              >
                {t(subject)}
              </h3>
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={config.badgeStyle}
            >
              <BadgeIcon size={14} aria-hidden="true" />
              {t(config.badgeLabelKey)}
            </span>
          </div>

          {isParentMode && (
            <p
              className="text-xs font-semibold rounded-xl px-3 py-1.5 inline-block"
              style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
            >
              {parentDesc}
            </p>
          )}

          <div className="flex items-center gap-2 text-gray-500">
            <User
              size={17}
              style={{ color: config.dimmed ? "#d1d5db" : "#0077b6" }}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold">{teacherName}</span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <MapPin
                size={17}
                style={{ color: config.dimmed ? "#d1d5db" : "#00b4d8" }}
                aria-hidden="true"
              />
              <span className="text-xs font-medium text-gray-500">{room}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock
                size={17}
                style={{ color: config.dimmed ? "#d1d5db" : "#0077b6" }}
                aria-hidden="true"
              />
              <span className="text-xs" style={config.timeStyle}>
                {startTime} – {endTime}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

// ── Mini Date Picker ──────────────────────────────────────────────────────


function TimetableCard({ weeklyTimetable = {}, isConfigured = true }) {
  const { t, lang } = useLanguage();
  const { isParent: isParentMode } = useAuth();
  const [showHelper, setShowHelper] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getDayName = (date) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
  
  const isSelectedToday = useMemo(() => {
    const today = new Date();
    return selectedDate.getDate() === today.getDate() &&
           selectedDate.getMonth() === today.getMonth() &&
           selectedDate.getFullYear() === today.getFullYear();
  }, [selectedDate]);

  const isSelectedTomorrow = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return selectedDate.getDate() === tomorrow.getDate() &&
           selectedDate.getMonth() === tomorrow.getMonth() &&
           selectedDate.getFullYear() === tomorrow.getFullYear();
  }, [selectedDate]);

  const classes = useMemo(() => {
    const dayName = getDayName(selectedDate);
    const dayClasses = weeklyTimetable[dayName] || [];
    
    return dayClasses.map(cls => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      
      let status = cls.status || "upcoming";
      
      if (!cls.status) {
        if (selectedDateOnly < today) {
          status = "ended";
        } else if (selectedDateOnly > today) {
          status = "upcoming";
        } else {
          // Real-time calculation for today
          const periodTimes = {
            P1: { startTime: "08:00", endTime: "08:45" },
            P2: { startTime: "08:50", endTime: "09:35" },
            P3: { startTime: "09:40", endTime: "10:25" },
            P4: { startTime: "10:30", endTime: "11:15" },
            P5: { startTime: "11:15", endTime: "11:50" }, // Lunch Break
            P6: { startTime: "11:50", endTime: "12:35" },
            P7: { startTime: "12:40", endTime: "13:25" },
            P8: { startTime: "13:30", endTime: "14:15" },
            P9: { startTime: "14:20", endTime: "15:05" },
          };
          const periodKey = cls.periodNumber || cls.period || "P1";
          const timeInfo = periodTimes[periodKey] || periodTimes.P1;
          const startTime = cls.startTime || timeInfo.startTime;
          const endTime = cls.endTime || timeInfo.endTime;

          const [sh, sm] = startTime.split(":").map(Number);
          const [eh, em] = endTime.split(":").map(Number);
          const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), sh, sm);
          const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), eh, em);
          
          if (now < start) status = "upcoming";
          else if (now > end) status = "ended";
          else status = "live";
        }
      }
      
      return { ...cls, status };
    });
  }, [selectedDate, weeklyTimetable]);

  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const headerLabel = useMemo(() => {
    if (isSelectedToday) return t("timetable.title");
    if (isSelectedTomorrow) return lang === "hi" ? "कल की कक्षाएं" : "Tomorrow's Classes";
    
    // Custom label for other dates
    const options = { day: "numeric", month: "short" };
    const dateStr = selectedDate.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", options);
    const dayName = selectedDate.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long" });
    
    return lang === "hi" ? `${dateStr} की कक्षाएं` : `${dateStr} — ${dayName}`;
  }, [selectedDate, isSelectedToday, isSelectedTomorrow, t, lang]);

  return (
    <>
      <MainCard
        variants={wrapperVariants}
        className="p-6 flex flex-col gap-0 relative overflow-visible h-full"
        aria-label={headerLabel}
      >
        {/* Header Section */}
        <div className="flex flex-col gap-4 flex-shrink-0 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-2xl flex-shrink-0"
                style={{ backgroundColor: "#caf0f8" }}
              >
                <CalendarDays
                  size={28}
                  style={{ color: "#03045e" }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <h2 className="text-lg font-extrabold leading-tight truncate" style={{ color: "#03045e" }}>
                  {headerLabel}
                </h2>
                {isSelectedToday && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00b4d8] flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00b4d8] animate-pulse" />
                    {t("timetable.liveUpdates", { fallback: "Live Updates" })}
                  </span>
                )}
              </div>
            </div>

            {/* Header Controls Grouped in Single Row */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex bg-[#caf0f8] p-1 rounded-xl">
                <button 
                  onClick={handlePrevDay}
                  className="p-1.5 hover:bg-white rounded-lg transition-all text-[#03045e]"
                  title="Previous Day"
                >
                  <ChevronLeft size={17} />
                </button>
                <button 
                  onClick={handleNextDay}
                  className="p-1.5 hover:bg-white rounded-lg transition-all text-[#03045e]"
                  title="Next Day"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className={`p-2 rounded-xl transition-all ${showDatePicker ? "bg-[#03045e] text-white" : "bg-[#caf0f8] text-[#03045e] hover:bg-[#03045e]/10"}`}
                  title="Select Date"
                >
                  <CalendarIcon size={21} />
                </button>
                <AnimatePresence>
                  {showDatePicker && (
                    <MiniDatePicker 
                      selectedDate={selectedDate} 
                      onSelect={(d) => {
                        setSelectedDate(d);
                        setShowDatePicker(false);
                      }}
                      onClose={() => setShowDatePicker(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
              
              <HelperButton 
                onClick={() => setShowHelper(true)} 
                className="relative !top-0 !right-0"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold text-[#03045e] px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "#caf0f8" }}
              >
                {classes.length} {t("timetable.classes")}
              </span>
              {!isSelectedToday && (
                <button 
                  onClick={() => setSelectedDate(new Date())}
                  className="text-[10px] font-black uppercase tracking-widest text-[#0077b6] hover:underline transition-colors px-2"
                >
                  {t("timetable.backToToday", { fallback: "Back to Today" })}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Parent Insight */}
        {isParentMode && classes.length > 0 && isConfigured && (
          <div className="mb-6 px-1">
            <ParentInsight 
              text={t("insight.timetable", { count: classes.length, time: classes[0].startTime })} 
            />
          </div>
        )}

        {/* Scrollable Classes Section */}
        <div 
          className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar"
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#caf0f8 transparent'
          }}
        >
          {(!isConfigured || classes.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#caf0f8] flex items-center justify-center mb-4">
                <CalendarIcon size={32} className="text-[#9ca3af]" />
              </div>
              <p className="text-sm font-semibold text-gray-400">
                {t("timetable.notSet", { fallback: "Timetable has not been set yet" })}
              </p>
            </div>
          )}
          {isConfigured && classes.length > 0 && (
            <div className="flex flex-col pb-4">
              {classes.map((classItem, index) => (
                <ClassCard
                  key={classItem.id || `${classItem.periodNumber || classItem.period || "class"}-${classItem.subject || ""}-${index}`}
                  classItem={classItem}
                  index={index}
                  isLast={index === classes.length - 1}
                  t={t}
                  isParentMode={isParentMode}
                />
              ))}
            </div>
          )}
        </div>
      </MainCard>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="timetable.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={TIMETABLE_LEGEND}
      />
    </>
  );
}

export default TimetableCard;

