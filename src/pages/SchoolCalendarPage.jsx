import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  BookOpen,
  Trophy,
  AlertCircle,
  GraduationCap,
  Users,
  Star,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

// ── Event type config ─────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  holiday: { label: "Holiday", bg: "#EF444420", color: "#EF4444", icon: Star },
  exam: { label: "Exam", bg: NAVY + "18", color: NAVY, icon: BookOpen },
  event: { label: "Event", bg: TEAL + "20", color: TEAL, icon: Trophy },
  ptm: { label: "PTM", bg: SAGE + "30", color: SAGE, icon: Users },
  academic: {
    label: "Academic",
    bg: "#F59E0B20",
    color: "#F59E0B",
    icon: GraduationCap,
  },
};

const ALL_TYPES = ["all", "holiday", "exam", "event", "ptm", "academic"];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: "easeOut" },
  },
};

// ── Event row ─────────────────────────────────────────────────────────────────
function EventRow({ event, index }) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.event;
  const IconComponent = cfg.icon;

  // Parse date for display
  const parts = event.date.split(" ");
  const day = parts[0];
  const month = parts[1];
  const year = parts[2];

  return (
    <motion.div
      variants={cardVariants}
      className="flex items-start gap-4 rounded-2xl px-4 py-3 transition-colors"
      style={{
        backgroundColor: index % 2 === 0 ? LIME : "white",
        outline: index % 2 !== 0 ? `1px solid ${LIME}` : "none",
      }}
      role="listitem"
      aria-label={`${event.title} on ${event.date}`}
    >
      {/* Date block */}
      <div className="flex-shrink-0 w-14 text-center">
        <p
          className="text-[10px] font-extrabold uppercase"
          style={{ color: TEAL }}
        >
          {month}
        </p>
        <p className="text-2xl font-black leading-none" style={{ color: NAVY }}>
          {day}
        </p>
        <p className="text-[10px] text-gray-400">{year}</p>
      </div>

      {/* Divider */}
      <div
        className="w-px self-stretch flex-shrink-0 mt-1"
        style={{ backgroundColor: TEAL + "30" }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold" style={{ color: NAVY }}>
            {event.title}
          </p>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            <IconComponent size={12} aria-hidden="true" />
            {cfg.label}
          </span>
        </div>
        {event.description && (
          <p className="text-xs text-gray-400 mt-0.5 leading-snug">
            {event.description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function SchoolCalendarPage({ schoolCalendar }) {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  if (!schoolCalendar) return null;

  const filtered =
    activeFilter === "all"
      ? schoolCalendar.events
      : schoolCalendar.events.filter((e) => e.type === activeFilter);

  return (
    <>
      <div className="relative">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: NAVY }}>
            <CalendarDays size={31} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: NAVY }}>
              School Calendar
            </h1>
            <p className="text-sm text-gray-500">
              Academic Year {schoolCalendar.academicYear}
            </p>
          </div>
          <div className="ml-auto">
            <HelperButton
              onClick={() => setShowHelper(true)}
              className="relative"
            />
          </div>
        </div>

        {/* Term pills */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {schoolCalendar.terms.map((term) => (
            <div
              key={term.id}
              className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ backgroundColor: "white", outline: `1px solid ${LIME}` }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: term.status === "ongoing" ? SAGE : TEAL,
                }}
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-extrabold" style={{ color: NAVY }}>
                  {term.name}
                </p>
                <p className="text-[10px] text-gray-400">{term.period}</p>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
                style={{
                  backgroundColor:
                    term.status === "ongoing" ? SAGE + "25" : TEAL + "20",
                  color: term.status === "ongoing" ? SAGE : TEAL,
                }}
              >
                {term.status === "ongoing" ? "Ongoing" : "Completed"}
              </span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {ALL_TYPES.map((type) => {
            const isActive = activeFilter === type;
            const cfg = TYPE_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all capitalize"
                style={{
                  backgroundColor: isActive ? NAVY : LIME,
                  color: isActive ? LIME : NAVY,
                }}
              >
                {type === "all" ? "All Events" : (cfg?.label ?? type)}
              </button>
            );
          })}
        </div>

        {/* Event count */}
        <p className="text-xs font-semibold text-gray-400 mb-3">
          {filtered.length} event{filtered.length !== 1 ? "s" : ""}{" "}
          {activeFilter !== "all"
            ? `· ${TYPE_CONFIG[activeFilter]?.label}`
            : ""}
        </p>

        {/* Events list */}
        {filtered.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-8 text-center shadow-md"
            style={{ outline: `1px solid ${LIME}` }}
          >
            <p className="text-sm font-bold text-gray-400">
              No events found for this filter.
            </p>
          </div>
        ) : (
          <motion.div
            className="bg-white rounded-2xl shadow-md overflow-hidden"
            style={{ outline: `1px solid ${LIME}` }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            role="list"
            aria-label="School calendar events"
          >
            {filtered.map((event, i) => (
              <EventRow key={event.id} event={event} index={i} />
            ))}
          </motion.div>
        )}

        {/* Legend */}
        <div
          className="mt-6 bg-white rounded-2xl p-4 shadow-md"
          style={{ outline: `1px solid ${LIME}` }}
        >
          <p
            className="text-xs font-extrabold uppercase tracking-wide mb-3"
            style={{ color: NAVY }}
          >
            Event Types
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
              const IconComponent = cfg.icon;
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cfg.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-gray-600">
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="calendar.title"
        contentEn="The School Calendar shows all important dates for the academic year — including exams, holidays, events, and Parent-Teacher Meetings. Use the filter buttons to view specific types of events."
        contentHi="स्कूल कैलेंडर शैक्षणिक वर्ष की सभी महत्वपूर्ण तिथियां दिखाता है — जिसमें परीक्षाएं, छुट्टियां, कार्यक्रम और अभिभावक-शिक्षक बैठकें शामिल हैं। विशिष्ट प्रकार के कार्यक्रम देखने के लिए फ़िल्टर बटन का उपयोग करें।"
        colorLegend={[
          {
            color: "#EF4444",
            labelEn: "Red — School holiday",
            labelHi: "लाल — स्कूल की छुट्टी",
          },
          {
            color: NAVY,
            labelEn: "Navy — Examination",
            labelHi: "नेवी — परीक्षा",
          },
          {
            color: TEAL,
            labelEn: "Teal — School event",
            labelHi: "टील — स्कूल कार्यक्रम",
          },
          {
            color: SAGE,
            labelEn: "Sage — Parent-Teacher Meeting",
            labelHi: "सेज — अभिभावक-शिक्षक बैठक",
          },
          {
            color: "#F59E0B",
            labelEn: "Amber — Academic milestone",
            labelHi: "एम्बर — शैक्षणिक मील का पत्थर",
          },
        ]}
      />
    </>
  );
}

export default SchoolCalendarPage;
