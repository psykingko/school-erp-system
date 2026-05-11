import React, { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2 } from "lucide-react";
import { getAttendanceStatus } from "../utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useViewMode } from "../context/ViewModeContext";
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
    labelEn: "Green (85%+) — Attendance is good. Keep it up.",
    labelHi: "हरा (85%+) — उपस्थिति अच्छी है। ऐसे ही जारी रखें।",
  },
  {
    color: "#F59E0B",
    labelEn: "Yellow (75–84%) — Attendance needs improvement.",
    labelHi: "पीला (75–84%) — उपस्थिति में सुधार की जरूरत है।",
  },
  {
    color: "#EF4444",
    labelEn: "Red (below 75%) — Attendance is very low. May affect exams.",
    labelHi:
      "लाल (75% से कम) — उपस्थिति बहुत कम है। परीक्षा पर असर पड़ सकता है।",
  },
];

function TrafficLight({ status }) {
  const colorMap = {
    excellent: "#00b4d8",
    moderate: "#F59E0B",
    warning: "#EF4444",
  };
  const color = colorMap[status] ?? colorMap.excellent;
  return (
    <div
      className="w-4 h-4 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function StatusIcon({ status }) {
  if (status === "excellent") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          stroke="#00b4d8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === "moderate") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="#0077b6" strokeWidth="2" />
        <path
          d="M12 8v4M12 16h.01"
          stroke="#0077b6"
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

function CircularRing({ percentage, strokeColor }) {
  const targetOffset = CIRCUMFERENCE - (percentage / 100) * CIRCUMFERENCE;
  return (
    <svg
      width="180"
      height="180"
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

function AttendanceCard({ overall, label }) {
  const { t, lang } = useLanguage();
  const { isParentMode } = useViewMode();
  const [showHelper, setShowHelper] = useState(false);

  const { status, colorClass, bgClass, strokeColor, message } =
    getAttendanceStatus(overall);

  const glowMap = {
    excellent: "2px solid #00b4d8",
    moderate: "2px solid #0077b6",
    warning: "2px solid #EF4444",
  };

  const parentMessageKey = {
    excellent: "attendance.parentExcellent",
    moderate: "attendance.parentModerate",
    warning: "attendance.parentWarning",
  };

  const statusLabelKey = {
    excellent: "attendance.statusExcellent",
    moderate: "attendance.statusModerate",
    warning: "attendance.statusWarning",
  };

  const trafficColor = {
    excellent: "#00b4d8",
    moderate: "#F59E0B",
    warning: "#EF4444",
  };

  const cardLabel = label || t("attendance.title");

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center gap-4 cursor-default select-none relative"
        style={{ outline: glowMap[status] ?? glowMap.excellent }}
        role="region"
        aria-label={`${cardLabel}: ${overall}%`}
      >
        {/* Helper button */}
        <HelperButton onClick={() => setShowHelper(true)} />

        {/* Heading */}
        <div className="flex items-center gap-2 self-start">
          <BarChart2
            size={26}
            style={{ color: "#03045e" }}
            aria-hidden="true"
          />
          <h2 className="text-lg font-bold" style={{ color: "#03045e" }}>
            {cardLabel}
          </h2>
        </div>

        {/* Ring */}
        <div className="relative flex items-center justify-center">
          <CircularRing percentage={overall} strokeColor={strokeColor} />
          <div className="absolute flex flex-col items-center justify-center gap-1">
            <motion.span
              className={`text-4xl font-black ${colorClass}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
            >
              {overall}%
            </motion.span>
            <StatusIcon status={status} />
          </div>
        </div>

        {/* Status pill */}
        <motion.div
          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${bgClass} ${colorClass}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </motion.div>

        {/* Message — student or parent */}
        {isParentMode ? (
          <motion.div
            className="w-full flex flex-col gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
          >
            {/* Traffic light + status label */}
            <div className="flex items-center gap-2">
              <TrafficLight status={status} />
              <span
                className="text-sm font-bold"
                style={{ color: trafficColor[status] }}
              >
                {t(statusLabelKey[status])}
              </span>
            </div>
            {/* Parent-friendly summary */}
            <p
              className="text-sm font-semibold leading-snug rounded-2xl px-4 py-2"
              style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
            >
              {t(parentMessageKey[status])}
            </p>
          </motion.div>
        ) : (
          <motion.p
            className={`text-sm font-semibold text-center ${colorClass}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.0 }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="attendance.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={ATTENDANCE_COLOR_LEGEND}
      />
    </>
  );
}

export default AttendanceCard;
