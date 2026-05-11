import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, MapPin, User, BookOpen, CalendarDays } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Color cycle for subject blocks — keeps visual variety
const SUBJECT_COLORS = [
  { bg: `${NAVY}`, text: "#caf0f8" },
  { bg: `${TEAL}`, text: "#ffffff" },
  { bg: `${SAGE}`, text: "#03045e" },
  { bg: "#023e8a", text: "#caf0f8" },
  { bg: "#0096c7", text: "#ffffff" },
  { bg: "#48cae4", text: "#03045e" },
];

// Deterministic color per subject code
function getSubjectColor(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++)
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// ── Class block ───────────────────────────────────────────────────────────────
function ClassBlock({ cls }) {
  const color = getSubjectColor(cls.code);

  return (
    <motion.div
      variants={cardVariants}
      className="rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
      style={{ backgroundColor: color.bg }}
      role="article"
      aria-label={`${cls.subject} at ${cls.startTime}`}
    >
      {/* Subject + code */}
      <div>
        <p
          className="text-sm font-extrabold leading-tight"
          style={{ color: color.text }}
        >
          {cls.subject}
        </p>
        <span
          className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full mt-1 inline-block"
          style={{
            backgroundColor: "rgba(255,255,255,0.18)",
            color: color.text,
          }}
        >
          {cls.code}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Clock
            size={11}
            style={{ color: color.text, opacity: 0.8 }}
            aria-hidden="true"
          />
          <span
            className="text-[11px] font-semibold"
            style={{ color: color.text, opacity: 0.9 }}
          >
            {cls.startTime} – {cls.endTime}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <User
            size={11}
            style={{ color: color.text, opacity: 0.8 }}
            aria-hidden="true"
          />
          <span
            className="text-[11px] font-semibold truncate"
            style={{ color: color.text, opacity: 0.9 }}
          >
            {cls.teacher || cls.faculty}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin
            size={11}
            style={{ color: color.text, opacity: 0.8 }}
            aria-hidden="true"
          />
          <span
            className="text-[11px] font-semibold"
            style={{ color: color.text, opacity: 0.9 }}
          >
            {cls.room}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Day column ────────────────────────────────────────────────────────────────
function DayColumn({ day, classes }) {
  const isEmpty = !classes || classes.length === 0;

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Day header */}
      <div
        className="rounded-xl px-3 py-2 text-center font-extrabold text-sm sticky top-0 z-10"
        style={{ backgroundColor: NAVY, color: LIME }}
      >
        {day}
      </div>

      {isEmpty ? (
        <div
          className="rounded-2xl p-4 text-center text-xs font-semibold text-gray-400 border-2 border-dashed"
          style={{ borderColor: LIME }}
        >
          No classes
        </div>
      ) : (
        <motion.div
          className="flex flex-col gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {classes.map((cls) => (
            <ClassBlock key={cls.id} cls={cls} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ── Weekend card ──────────────────────────────────────────────────────────────
function WeekendCard({ day }) {
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div
        className="rounded-xl px-3 py-2 text-center font-extrabold text-sm"
        style={{ backgroundColor: "#e5e7eb", color: "#9ca3af" }}
      >
        {day}
      </div>
      <div
        className="rounded-2xl p-5 flex flex-col items-center gap-2 border-2 border-dashed"
        style={{ borderColor: "#e5e7eb" }}
      >
        <CalendarDays size={31} className="text-gray-300" aria-hidden="true" />
        <p className="text-xs font-bold text-gray-400">Holiday</p>
      </div>
    </div>
  );
}

// ── Mobile day tabs ───────────────────────────────────────────────────────────
function MobileView({ weeklyTimetable }) {
  const [activeDay, setActiveDay] = useState("Monday");

  return (
    <div>
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {DAYS.map((day) => {
          const isActive = activeDay === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold transition-all"
              style={{
                backgroundColor: isActive ? NAVY : LIME,
                color: isActive ? LIME : NAVY,
              }}
            >
              {day.slice(0, 3)}
            </button>
          );
        })}
        {["Saturday", "Sunday"].map((day) => (
          <button
            key={day}
            disabled
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold opacity-40 cursor-not-allowed"
            style={{ backgroundColor: "#e5e7eb", color: "#9ca3af" }}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Active day classes */}
      <motion.div
        key={activeDay}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-3"
      >
        {(weeklyTimetable[activeDay] || []).map((cls) => (
          <ClassBlock key={cls.id} cls={cls} />
        ))}
        {(!weeklyTimetable[activeDay] ||
          weeklyTimetable[activeDay].length === 0) && (
          <div
            className="rounded-2xl p-6 text-center text-sm font-semibold text-gray-400 border-2 border-dashed"
            style={{ borderColor: LIME }}
          >
            No classes scheduled
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function WeeklyTimetablePage({ weeklyTimetable = {} }) {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);

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
              Weekly Timetable
            </h1>
            <p className="text-sm text-gray-500">
              Mon–Fri schedule · Sat &amp; Sun off
            </p>
          </div>
          <div className="ml-auto">
            <HelperButton
              onClick={() => setShowHelper(true)}
              className="relative"
            />
          </div>
        </div>

        {/* Desktop grid — hidden on mobile */}
        <div
          className="hidden md:grid gap-4"
          style={{ gridTemplateColumns: "repeat(7, 1fr)" }}
        >
          {DAYS.map((day) => (
            <DayColumn key={day} day={day} classes={weeklyTimetable[day]} />
          ))}
          <WeekendCard day="Saturday" />
          <WeekendCard day="Sunday" />
        </div>

        {/* Mobile tab view */}
        <div className="md:hidden">
          <MobileView weeklyTimetable={weeklyTimetable} />
        </div>

        {/* Color legend */}
        <div
          className="mt-8 bg-white rounded-2xl p-5 shadow-md"
          style={{ outline: `1px solid ${LIME}` }}
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={21} style={{ color: TEAL }} aria-hidden="true" />
            <p className="text-sm font-extrabold" style={{ color: NAVY }}>
              Subject Color Guide
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.values(
              DAYS.flatMap((d) => weeklyTimetable[d] ?? []).reduce(
                (acc, cls) => {
                  if (!acc[cls.code]) acc[cls.code] = cls;
                  return acc;
                },
                {},
              ),
            ).map((cls) => {
              const color = getSubjectColor(cls.code);
              return (
                <div key={cls.code} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color.bg }}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-semibold text-gray-600">
                    {cls.subject}{" "}
                    <span className="font-mono text-gray-400">
                      ({cls.code})
                    </span>
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
        titleKey="timetable.title"
        contentEn="The weekly timetable shows all classes scheduled from Monday to Friday. Saturday and Sunday are holidays. Each colored block shows the subject, course code, teacher, time, and room number."
        contentHi="साप्ताहिक समय-सारणी सोमवार से शुक्रवार तक निर्धारित सभी कक्षाएं दिखाती है। शनिवार और रविवार छुट्टी के दिन हैं। प्रत्येक रंगीन ब्लॉक में विषय, कोर्स कोड, शिक्षक, समय और कमरा नंबर दिखाया जाता है।"
        colorLegend={[
          {
            color: NAVY,
            labelEn: "Navy — Core CS subjects",
            labelHi: "नेवी — मुख्य CS विषय",
          },
          {
            color: TEAL,
            labelEn: "Teal — Lab / practical sessions",
            labelHi: "टील — लैब / प्रैक्टिकल सत्र",
          },
          {
            color: SAGE,
            labelEn: "Sage — Elective / language subjects",
            labelHi: "सेज — ऐच्छिक / भाषा विषय",
          },
        ]}
      />
    </>
  );
}

export default WeeklyTimetablePage;
