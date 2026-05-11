import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useViewMode } from "../context/ViewModeContext";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const widgetVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

// ── Individual widgets ────────────────────────────────────────────────────────

function ExamWidget({ nextExam }) {
  const { name, date } = nextExam;
  const { t } = useLanguage();
  const { isParentMode } = useViewMode();

  return (
    <motion.div
      variants={widgetVariants}
      className="bg-white rounded-2xl shadow-md p-4 cursor-default"
      style={{ borderLeft: "4px solid #03045e" }}
      role="region"
      aria-label="Upcoming Exams widget"
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: "#03045e15" }}
          aria-hidden="true"
        >
          <CalendarDays size={16} style={{ color: "#03045e" }} />
        </div>
        <span
          className="text-xs font-extrabold uppercase tracking-wide"
          style={{ color: "#03045e" }}
        >
          {t("widget.upcomingExam")}
        </span>
      </div>
      <p
        className="text-sm font-extrabold leading-snug mb-1"
        style={{ color: "#03045e" }}
      >
        {name}
      </p>
      <div className="flex items-center gap-1.5">
        <CalendarDays size={12} className="text-gray-400" aria-hidden="true" />
        <span className="text-xs font-semibold text-gray-500">{date}</span>
      </div>
      {isParentMode && (
        <p
          className="text-xs font-semibold mt-2 rounded-xl px-2 py-1"
          style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
        >
          Your child has an upcoming exam: {name} on {date}
        </p>
      )}
    </motion.div>
  );
}

function AttendanceWarningWidget({ attendanceWarnings }) {
  const { t } = useLanguage();
  const { isParentMode } = useViewMode();
  if (!attendanceWarnings || attendanceWarnings.length === 0) return null;

  return (
    <motion.div
      variants={widgetVariants}
      className="bg-white rounded-2xl shadow-md p-4 cursor-default"
      style={{ borderLeft: "4px solid #EF4444" }}
      role="region"
      aria-label="Attendance Warning widget"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-red-50" aria-hidden="true">
          <AlertTriangle size={16} className="text-red-500" />
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wide text-red-500">
          {t("widget.attendanceWarning")}
        </span>
      </div>
      <ul className="space-y-2" aria-label="Subjects with low attendance">
        {attendanceWarnings.map((item, i) => (
          <li
            key={i}
            className="flex items-center justify-between"
            aria-label={`${item.subject}: ${item.percentage}% attendance`}
          >
            <span className="text-sm font-bold" style={{ color: "#03045e" }}>
              {item.subject}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={10} aria-hidden="true" />
              {item.percentage}%
            </span>
          </li>
        ))}
      </ul>
      {isParentMode ? (
        <p className="text-xs font-semibold text-red-500 mt-2 leading-snug">
          {attendanceWarnings
            .map(
              (item) =>
                `Your child's ${item.subject} attendance needs improvement`,
            )
            .join(". ")}
        </p>
      ) : (
        <p className="text-[11px] text-gray-400 font-medium mt-2 leading-snug">
          {t("widget.attendHint")}
        </p>
      )}
    </motion.div>
  );
}

function AssignmentsWidget({ pendingAssignments }) {
  const { t } = useLanguage();
  const { isParentMode } = useViewMode();
  const isUrgent = pendingAssignments > 0;

  return (
    <motion.div
      variants={widgetVariants}
      className="bg-white rounded-2xl shadow-md p-4 cursor-default"
      style={{ borderLeft: "4px solid #0077b6" }}
      role="region"
      aria-label={`Pending Assignments widget: ${pendingAssignments} pending`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-2 rounded-xl"
          style={{ backgroundColor: "#0077b615" }}
          aria-hidden="true"
        >
          <ClipboardList size={16} style={{ color: "#0077b6" }} />
        </div>
        <span
          className="text-xs font-extrabold uppercase tracking-wide"
          style={{ color: "#0077b6" }}
        >
          {t("widget.assignments")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p
            className="text-2xl font-black leading-none"
            style={{ color: "#03045e" }}
          >
            {pendingAssignments}
            <span className="text-sm font-bold text-gray-400 ml-1">
              {t("widget.pending")}
            </span>
          </p>
          <p
            className="text-[11px] font-semibold mt-0.5"
            style={{ color: "#0077b6" }}
          >
            {isParentMode
              ? isUrgent
                ? `Your child has ${pendingAssignments} assignment${pendingAssignments !== 1 ? "s" : ""} pending`
                : "All assignments submitted"
              : isUrgent
                ? t("widget.submitReminder")
                : t("widget.allCaughtUp")}
          </p>
        </div>
        {isUrgent && (
          <motion.div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#0077b615" }}
            /* FIX: removed repeat:Infinity — replaced with CSS animate-pulse */
            aria-hidden="true"
          >
            <ClipboardList
              size={18}
              style={{ color: "#0077b6" }}
              className="animate-pulse"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  const { t } = useLanguage();
  return (
    <motion.div
      variants={widgetVariants}
      className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center gap-3 text-center cursor-default"
      style={{ outline: "1px solid #caf0f8" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "#caf0f8" }}
      >
        <Bell size={22} style={{ color: "#0077b6" }} aria-hidden="true" />
      </div>
      <p className="text-sm font-bold" style={{ color: "#03045e" }}>
        All clear!
      </p>
      <p className="text-xs text-gray-400 leading-snug">
        No urgent updates right now. Check back later.
      </p>
    </motion.div>
  );
}

// ── Main collapsible panel ────────────────────────────────────────────────────

function FloatingWidgets({
  nextExam,
  attendanceWarnings = [],
  pendingAssignments,
}) {
  const hasContent =
    !!nextExam ||
    (attendanceWarnings && attendanceWarnings.length > 0) ||
    (pendingAssignments != null && pendingAssignments > 0);

  const [isOpen, setIsOpen] = useState(hasContent);

  useEffect(() => {
    setIsOpen(hasContent);
  }, [hasContent]);

  const alertCount =
    (nextExam ? 1 : 0) +
    (attendanceWarnings?.length ?? 0) +
    (pendingAssignments > 0 ? 1 : 0);

  return (
    <div className="flex items-start">
      {/* ── Collapsible panel ── */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="overflow-hidden flex-shrink-0"
            aria-label="Important updates panel"
          >
            <motion.div
              className="w-72 flex flex-col gap-4 pr-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {nextExam && <ExamWidget nextExam={nextExam} />}
              {attendanceWarnings.length > 0 && (
                <AttendanceWarningWidget
                  attendanceWarnings={attendanceWarnings}
                />
              )}
              {pendingAssignments != null && pendingAssignments > 0 && (
                <AssignmentsWidget pendingAssignments={pendingAssignments} />
              )}
              {!hasContent && <EmptyState />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toggle tab ── */}
      <div className="flex flex-col items-center pt-1">
        <motion.button
          onClick={() => setIsOpen((prev) => !prev)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="relative flex flex-col items-center justify-center gap-1 rounded-xl shadow-md px-1.5 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            backgroundColor: "#03045e",
            color: "#caf0f8",
            minWidth: "28px",
          }}
          aria-label={
            isOpen ? "Collapse updates panel" : "Expand updates panel"
          }
          aria-expanded={isOpen}
        >
          {alertCount > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ backgroundColor: "#EF4444" }}
              aria-label={`${alertCount} alerts`}
            >
              {alertCount}
            </motion.span>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </motion.div>
          <span
            className="text-[9px] font-extrabold uppercase tracking-widest"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              letterSpacing: "0.15em",
            }}
          >
            Updates
          </span>
        </motion.button>
      </div>
    </div>
  );
}

export default FloatingWidgets;
