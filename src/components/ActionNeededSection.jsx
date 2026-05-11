import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CreditCard,
  ClipboardList,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useViewMode } from "../context/ViewModeContext";

// ─────────────────────────────────────────────────────────────────────────────
// Priority config — drives colour, animation, sort order
// ─────────────────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  critical: {
    order: 0,
    badgeKey: "action.badge.urgent",
    badgeBg: "bg-red-100 text-red-700",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    border: "border-red-200",
    bg: "bg-red-50/60",
    pulse: true,
  },
  important: {
    order: 1,
    badgeKey: "action.badge.important",
    badgeBg: "bg-orange-100 text-orange-700",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    border: "border-orange-200",
    bg: "bg-orange-50/60",
    pulse: false,
  },
  reminder: {
    order: 2,
    badgeKey: "action.badge.reminder",
    badgeBg: "bg-[#0077b6]/10 text-[#0077b6]",
    iconBg: "bg-[#caf0f8]",
    iconColor: "text-[#0077b6]",
    border: "border-[#00b4d8]/30",
    bg: "bg-[#caf0f8]/60",
    pulse: false,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Build action items — all text comes from the translation function t()
// ─────────────────────────────────────────────────────────────────────────────
function buildActions({
  attendanceWarnings,
  nextExam,
  fees,
  pendingAssignments,
  isParentMode,
  t,
}) {
  const voice = isParentMode ? "parent" : "student";
  const items = [];

  // ── Attendance ──────────────────────────────────────────────────────────────
  if (Array.isArray(attendanceWarnings) && attendanceWarnings.length > 0) {
    const lowestPct = Math.min(...attendanceWarnings.map((w) => w.percentage));
    const isMulti = attendanceWarnings.length > 1;
    const subjectList = attendanceWarnings.map((w) => w.subject).join(", ");
    const firstSubject = attendanceWarnings[0].subject;

    const titleKey = isMulti
      ? `action.attendance.title.${voice}.multi`
      : `action.attendance.title.${voice}`;
    const descKey = isMulti
      ? `action.attendance.desc.${voice}.multi`
      : `action.attendance.desc.${voice}`;

    items.push({
      id: "attendance",
      sectionId: "section-attendance",
      Icon: AlertTriangle,
      title: t(titleKey, {
        subject: firstSubject,
        pct: lowestPct,
        subjects: subjectList,
      }),
      description: t(descKey, {
        subject: firstSubject,
        pct: lowestPct,
        subjects: subjectList,
      }),
      priority: lowestPct < 65 ? "critical" : "important",
    });
  }

  // ── Fee ─────────────────────────────────────────────────────────────────────
  if (fees && fees.status !== "paid") {
    const feeType = fees.status === "overdue" ? "overdue" : "unpaid";
    const titleKey = `action.fee.title.${voice}.${feeType}`;
    const descKey = `action.fee.desc.${voice}.${feeType}`;
    items.push({
      id: "fee",
      sectionId: "section-fee",
      Icon: CreditCard,
      title: t(titleKey, {
        date: fees.dueDate,
        currency: fees.currency,
        amount: fees.amount.toLocaleString("en-IN"),
      }),
      description: t(descKey, {
        date: fees.dueDate,
        currency: fees.currency,
        amount: fees.amount.toLocaleString("en-IN"),
      }),
      priority: fees.status === "overdue" ? "critical" : "important",
    });
  }

  // ── Exam ────────────────────────────────────────────────────────────────────
  if (nextExam && nextExam.name) {
    items.push({
      id: "exam",
      sectionId: "section-timetable",
      Icon: BookOpen,
      title: t(`action.exam.title.${voice}`, {
        name: nextExam.name,
        date: nextExam.date,
      }),
      description: t(`action.exam.desc.${voice}`),
      priority: "reminder",
    });
  }

  // ── Assignments ─────────────────────────────────────────────────────────────
  if (pendingAssignments > 0) {
    const titleKey =
      pendingAssignments === 1
        ? `action.assignments.title.${voice}_one`
        : `action.assignments.title.${voice}_other`;
    items.push({
      id: "assignments",
      sectionId: "section-lms",
      Icon: ClipboardList,
      title: t(titleKey, { count: pendingAssignments }),
      description: t(`action.assignments.desc.${voice}`),
      priority: "reminder",
    });
  }

  // Sort: critical → important → reminder
  return items.sort(
    (a, b) =>
      PRIORITY_CONFIG[a.priority].order - PRIORITY_CONFIG[b.priority].order,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single action item row
// ─────────────────────────────────────────────────────────────────────────────
function ActionItem({ item, onNavigate, index, t }) {
  const p = PRIORITY_CONFIG[item.priority];

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: "easeOut" }}
    >
      <motion.button
        onClick={() => onNavigate(item.sectionId)}
        whileHover={{ scale: 1.015, x: 3 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`w-full text-left flex items-start gap-3 p-3.5 rounded-xl border transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#00b4d8] ${p.bg} ${p.border}`}
        aria-label={`${item.title}`}
      >
        {/* Icon */}
        <div
          className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${p.iconBg}`}
        >
          {/* FIX: removed repeat:Infinity Framer Motion animation on the icon.
              Infinite JS-driven animations accumulate RAF callbacks over time
              and are a primary cause of the UI freeze after extended use.
              Using a CSS animation (animate-pulse) is GPU-composited and
              has zero JS overhead. */}
          <item.Icon
            size={17}
            className={`${p.iconColor} ${p.pulse ? "animate-pulse" : ""}`}
            aria-hidden="true"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold text-gray-800 leading-snug">
            {item.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Badge + chevron */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5 self-center">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${p.badgeBg}`}
          >
            {t(p.badgeKey)}
          </span>
          <ChevronRight
            size={13}
            className="text-gray-400"
            aria-hidden="true"
          />
        </div>
      </motion.button>
    </motion.li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function ActionNeededSection({
  attendanceWarnings = [],
  nextExam = null,
  fees = null,
  pendingAssignments = 0,
  onNavigate,
}) {
  const { t } = useLanguage();
  const { isParentMode } = useViewMode();

  const actions = useMemo(
    () =>
      buildActions({
        attendanceWarnings,
        nextExam,
        fees,
        pendingAssignments,
        isParentMode,
        t,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [attendanceWarnings, nextExam, fees, pendingAssignments, isParentMode, t],
  );

  const hasCritical = actions.some((a) => a.priority === "critical");
  const itemCountLabel =
    actions.length === 1
      ? t("action.itemCount_one")
      : t("action.itemCount_other", { count: actions.length });

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white border-2 border-[#00b4d8]/40 rounded-2xl shadow-md overflow-hidden"
      aria-label={t("action.title")}
      aria-live="polite"
    >
      {/* Header bar */}
      <div
        className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#caf0f8]"
        style={{ background: "linear-gradient(90deg, #caf0f8, #ade8f4)" }}
      >
        {hasCritical && (
          /* FIX: replaced repeat:Infinity Framer Motion animation with CSS
             animate-ping — GPU-composited, zero JS overhead */
          <span
            className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 animate-ping"
            aria-hidden="true"
          />
        )}
        <h2 className="text-sm font-extrabold text-gray-800 tracking-tight flex-1">
          {actions.length === 0 ? t("action.summary") : t("action.title")}
        </h2>
        {actions.length > 0 && (
          <span className="bg-[#0077b6] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            {itemCountLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <AnimatePresence mode="wait">
          {actions.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 py-2"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle
                  size={20}
                  className="text-green-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm font-extrabold text-green-700">
                  {t("action.allClear")}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t("action.allClearSub")}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.ul
              key="list"
              className="flex flex-col gap-2.5"
              role="list"
              aria-label={t("action.title")}
            >
              {actions.map((item, i) => (
                <ActionItem
                  key={item.id}
                  item={item}
                  index={i}
                  onNavigate={onNavigate ?? (() => {})}
                  t={t}
                />
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {actions.length > 0 && (
          <p className="text-[10px] text-gray-400 font-medium mt-3 text-center">
            {t("action.tapHint")}
          </p>
        )}
      </div>
    </motion.section>
  );
}
