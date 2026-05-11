import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  BookOpen,
  Trophy,
  AlertCircle,
  Database,
  Brain,
  Network,
  Bell,
  ClipboardList,
} from "lucide-react";
import { getNoticePriorityStyle } from "../utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useViewMode } from "../context/ViewModeContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

const ICON_MAP = {
  FileText,
  BookOpen,
  Trophy,
  AlertCircle,
  Database,
  Brain,
  Network,
  Bell,
  ClipboardList,
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};
const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" } },
};

const HELPER_CONTENT_EN =
  "The notice board shows important announcements from the college — such as exam schedules, holidays, and general updates. High priority notices need immediate attention.";
const HELPER_CONTENT_HI =
  "सूचना पट्ट कॉलेज की महत्वपूर्ण घोषणाएं दिखाता है — जैसे परीक्षा कार्यक्रम, छुट्टियां और सामान्य अपडेट। उच्च प्राथमिकता वाली सूचनाओं पर तुरंत ध्यान देना जरूरी है।";

const NOTICE_LEGEND = [
  {
    color: "#EF4444",
    labelEn: "Red — High priority. Needs immediate attention.",
    labelHi: "लाल — उच्च प्राथमिकता। तुरंत ध्यान देना जरूरी है।",
  },
  {
    color: "#F59E0B",
    labelEn: "Yellow — Medium priority. Read when possible.",
    labelHi: "पीला — मध्यम प्राथमिकता। जल्द पढ़ें।",
  },
  {
    color: "#00b4d8",
    labelEn: "Green — Low priority. General information.",
    labelHi: "हरा — कम प्राथमिकता। सामान्य जानकारी।",
  },
];

function NoticeItem({ notice, index, isParentMode, t }) {
  const { title, date, priority, icon } = notice;
  const IconComponent = ICON_MAP[icon] ?? Bell;
  const { bgClass, textClass } = getNoticePriorityStyle(priority);

  const priorityLabel = t(`notice.priority.${priority}`) || priority;

  return (
    <motion.li
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.015, x: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      /* FIX: removed inline onMouseEnter/Leave style mutations — they bypass
         React's reconciler and cause layout thrashing on every hover.
         Using a Tailwind hover class is GPU-composited and zero-cost. */
      className="flex items-start gap-3 p-3 rounded-2xl transition-colors duration-150 cursor-default hover:bg-[#caf0f8]"
      role="listitem"
      aria-label={`${priorityLabel} priority notice: ${title}`}
    >
      <div
        className={`flex-shrink-0 p-2 rounded-xl ${bgClass}`}
        aria-hidden="true"
      >
        <IconComponent size={23} className={textClass} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span
            className={`inline-block font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${bgClass} ${textClass} ${isParentMode ? "text-xs" : "text-[10px]"}`}
          >
            {priorityLabel}
          </span>
        </div>
        <p
          className={`font-semibold leading-snug line-clamp-2 ${isParentMode ? "text-base" : "text-sm"}`}
          style={{ color: "#03045e" }}
        >
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">{date}</p>
      </div>
    </motion.li>
  );
}

function NoticeBoard({ notices = [], examNotices = [], index = 0 }) {
  const { t, lang } = useLanguage();
  const { isParentMode } = useViewMode();
  const [activeTab, setActiveTab] = useState("notices");
  const [showHelper, setShowHelper] = useState(false);

  const tabs = [
    { id: "notices", label: t("notice.tab.notices"), data: notices },
    { id: "exam", label: t("notice.tab.exam"), data: examNotices },
  ];
  const activeData = tabs.find((tab) => tab.id === activeTab)?.data ?? [];

  const TAB_ICONS = { notices: ClipboardList, exam: FileText };

  return (
    <>
      <motion.div
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col relative"
        style={{ outline: "1px solid #caf0f8" }}
        role="region"
        aria-label={t("notice.title")}
      >
        {/* Helper button */}
        <HelperButton onClick={() => setShowHelper(true)} />

        {/* Header */}
        <div className="px-6 pt-5 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-2xl"
              style={{ backgroundColor: "#03045e15" }}
            >
              <Bell size={26} style={{ color: "#03045e" }} aria-hidden="true" />
            </div>
            <div>
              <h2
                className="text-lg font-extrabold leading-tight"
                style={{ color: "#03045e" }}
              >
                {t("notice.title")}
              </h2>
              <span className="text-xs font-semibold text-gray-400">
                {t("notice.subtitle")}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 px-6 mt-4 border-b border-gray-100"
          role="tablist"
          aria-label="Notice categories"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = TAB_ICONS[tab.id];
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold rounded-t-xl transition-colors duration-150 focus:outline-none"
                style={
                  isActive
                    ? { color: "#03045e", backgroundColor: "#caf0f8" }
                    : { color: "#9ca3af" }
                }
              >
                <TabIcon size={18} aria-hidden="true" />
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="notice-tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: "#03045e" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 px-4 py-3 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {activeData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  {t("notice.empty")}
                </p>
              ) : (
                <ul className="space-y-1" aria-label="Notice list">
                  {activeData.map((notice, i) => (
                    <NoticeItem
                      key={notice.id}
                      notice={notice}
                      index={i}
                      isParentMode={isParentMode}
                      t={t}
                    />
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="notice.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={NOTICE_LEGEND}
      />
    </>
  );
}

export default NoticeBoard;
