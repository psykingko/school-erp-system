import React, { useState, memo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  User,
  MapPin,
  Clock,
  CalendarDays,
  Radio,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useViewMode } from "../context/ViewModeContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

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
    cardClass: "opacity-60 grayscale bg-white",
    cardStyle: { outline: "1px solid #e5e7eb" },
    dotStyle: {
      backgroundColor: "#9ca3af",
      boxShadow: "0 0 0 4px rgba(156,163,175,0.2)",
    },
    accentStyle: { background: "linear-gradient(to bottom, #d1d5db, #9ca3af)" },
    timeStyle: { color: "#9ca3af", fontWeight: 600 },
    badgeStyle: { backgroundColor: "#f3f4f6", color: "#6b7280" },
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
      ? "Your child is in class right now"
      : status === "ended"
        ? "Class finished"
        : `Next class at ${startTime}`;

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
        aria-label={`${subject} — ${status}`}
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
                {subject}
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

function TimetableCard({ classes = [] }) {
  // FIX: single context subscription for the whole card tree
  const { t } = useLanguage();
  const { isParentMode } = useViewMode();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <>
      <motion.div
        variants={wrapperVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl p-6 shadow-md flex flex-col gap-4 relative"
        style={{ outline: "1px solid #caf0f8" }}
        role="region"
        aria-label={t("timetable.title")}
      >
        <HelperButton onClick={() => setShowHelper(true)} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: "#caf0f8" }}
            >
              <CalendarDays
                size={26}
                style={{ color: "#03045e" }}
                aria-hidden="true"
              />
            </div>
            <h2 className="text-lg font-bold" style={{ color: "#03045e" }}>
              {t("timetable.title")}
            </h2>
          </div>
          <span
            className="text-xs font-semibold text-gray-400 px-3 py-1 rounded-full mr-8"
            style={{ backgroundColor: "#caf0f8" }}
          >
            {classes.length} {t("timetable.classes")}
          </span>
        </div>

        {classes.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            {t("timetable.noClasses")}
          </p>
        )}
        {classes.length > 0 && (
          <div className="flex flex-col">
            {classes.map((classItem, index) => (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                index={index}
                isLast={index === classes.length - 1}
                t={t}
                isParentMode={isParentMode}
              />
            ))}
          </div>
        )}
      </motion.div>

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
