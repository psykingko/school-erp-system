import React, { useState, useEffect, useCallback } from "react";
import MainCard from "./MainCard";
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
  Filter,
  ChevronDown,
} from "lucide-react";
import { getNoticePriorityStyle } from "../utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";
import ParentInsight from "./ParentInsight";
import { markNoticeRead } from "../services/noticeService";

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

const FILTER_OPTIONS = [
  { id: "all", label: "All Notices" },
  { id: "unread", label: "Unread" },
  { id: "urgent", label: "Urgent" },
  { id: "examination", label: "Examinations" },
  { id: "general", label: "General" },
];

function NoticeItem({ notice, index, isParentMode, isRead, onRead }) {
  const { t } = useLanguage();
  const title = notice.title || notice.titleEn || "Circular Notice";
  const content = notice.content || notice.contentEn || "";
  const priority = notice.priority || "low";
  const { date, icon } = notice;
  const IconComponent = ICON_MAP[icon] ?? Bell;
  const { bgClass, textClass } = getNoticePriorityStyle(priority);

  const priorityLabel = t(`priority.${priority}`) || priority;

  // Show content preview (first 100 chars) if available
  const contentPreview = content
    ? content.substring(0, 100) + (content.length > 100 ? "..." : "")
    : null;

  const handleCardClick = () => {
    if (!isRead && onRead) {
      onRead(notice.id || notice.noticeId);
    }
  };

  return (
    <motion.li
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.015, x: 4 }}
      onClick={handleCardClick}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`flex items-start gap-3 p-3 rounded-2xl transition-colors duration-150 cursor-pointer ${
        isRead ? "bg-gray-50" : "bg-white hover:bg-[#caf0f8]"
      }`}
      role="listitem"
      aria-label={`${priorityLabel} priority notice: ${t(title)} on ${date}`}
    >
      <div
        className={`flex-shrink-0 p-2 rounded-xl ${bgClass}`}
        aria-hidden="true"
      >
        <IconComponent size={23} className={textClass} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          {!isRead && <span className="w-2 h-2 rounded-full bg-[#0077b6]" />}
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
          {t(title)}
        </p>
        {contentPreview && (
          <p
            className={`text-gray-600 mt-1 line-clamp-2 ${isParentMode ? "text-xs" : "text-[11px]"}`}
          >
            {contentPreview}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-0.5 font-medium">{date}</p>
      </div>
    </motion.li>
  );
}

function NoticeBoard({
  notices = [],
  examNotices = [],
  classUpdates = [],
  index = 0,
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isParent: isParentMode } = useAuth();
  const [showHelper, setShowHelper] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [readNoticeIds, setReadNoticeIds] = useState(new Set());
  const [activeBoard, setActiveBoard] = useState(
    classUpdates.length > 0 ? "class" : "school",
  );

  const combinedData = React.useMemo(() => {
    const combined = [...notices, ...examNotices];
    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [notices, examNotices]);

  // Load read status from notices
  useEffect(() => {
    const readIds = new Set(
      combinedData
        .filter((n) => n.readReceipts?.some((r) => r.userId === user?.id))
        .map((n) => n.id),
    );
    setReadNoticeIds(readIds);
  }, [combinedData, user?.id]);

  const handleMarkAsRead = useCallback(
    async (noticeId) => {
      try {
        await markNoticeRead(noticeId, user?.id);
        setReadNoticeIds((prev) => new Set([...prev, noticeId]));
      } catch (error) {
        console.error("Failed to mark notice as read:", error);
      }
    },
    [user?.id],
  );

  const filteredNotices = React.useMemo(() => {
    let filtered = combinedData;

    switch (activeFilter) {
      case "unread":
        filtered = filtered.filter((n) => !readNoticeIds.has(n.id));
        break;
      case "urgent":
        filtered = filtered.filter(
          (n) => n.priority === "critical" || n.priority === "high",
        );
        break;
      case "examination":
        filtered = filtered.filter((n) => n.category === "examination");
        break;
      case "general":
        filtered = filtered.filter((n) => n.category === "general");
        break;
      default:
        break;
    }

    return filtered;
  }, [combinedData, activeFilter, readNoticeIds]);

  return (
    <>
      <MainCard
        custom={index}
        variants={cardVariants}
        className="h-full flex flex-col relative"
        aria-label={t("notice.title")}
      >
        <HelperButton
          onClick={() => setShowHelper(true)}
          className="absolute top-4 right-4"
        />

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

        {/* Tab switchers */}
        <div className="px-6 mt-4 flex gap-3 border-b border-gray-100 pb-1">
          <button
            onClick={() => setActiveBoard("school")}
            className={`pb-2 text-[10px] font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeBoard === "school"
                ? "border-[#03045e] text-[#03045e]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            School Board
          </button>
          <button
            onClick={() => setActiveBoard("class")}
            className={`pb-2 text-[10px] font-black uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
              activeBoard === "class"
                ? "border-[#03045e] text-[#03045e]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Class Updates ({classUpdates.length})
          </button>
        </div>

        {/* Filter dropdown */}
        {activeBoard === "school" && (
          <div className="px-6 mt-3 relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-[#03045e] transition-colors"
            >
              <Filter size={14} />
              {activeFilter === "all"
                ? "All Notices"
                : FILTER_OPTIONS.find((f) => f.id === activeFilter)?.label}
              <ChevronDown
                size={12}
                className={`transition-transform ${showFilterDropdown ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-6 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 min-w-[140px]"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setActiveFilter(option.id);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-[10px] font-bold transition-colors ${
                        activeFilter === option.id
                          ? "bg-[#0077b6]/10 text-[#0077b6]"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {isParentMode &&
          activeBoard === "school" &&
          combinedData.length > 0 && (
            <div className="px-6 mt-4">
              <ParentInsight
                text={t("insight.notices", { count: combinedData.length })}
              />
            </div>
          )}

        {isParentMode && activeBoard === "class" && classUpdates.length > 0 && (
          <div className="px-6 mt-4">
            <ParentInsight
              text={`You have ${classUpdates.length} teacher updates concerning your child.`}
            />
          </div>
        )}

        <div className="flex-1 px-4 py-3 min-h-[220px] mt-2 overflow-y-auto">
          {activeBoard === "school" ? (
            filteredNotices.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                {t("notice.empty")}
              </p>
            ) : (
              <ul className="space-y-1" aria-label={t("notice.list")}>
                {filteredNotices.map((notice, i) => (
                  <NoticeItem
                    key={notice.id || notice.noticeId || i}
                    notice={notice}
                    index={i}
                    isParentMode={isParentMode}
                    isRead={readNoticeIds.has(notice.id || notice.noticeId)}
                    onRead={handleMarkAsRead}
                  />
                ))}
              </ul>
            )
          ) : classUpdates.length === 0 ? (
            <p className="text-xs font-bold text-gray-400 text-center py-8 italic">
              No class-scoped announcements yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {classUpdates.map((update, i) => {
                const categoryStyles = {
                  HOMEWORK: "bg-emerald-50 text-emerald-600 border-emerald-100",
                  EXAM: "bg-indigo-50 text-indigo-600 border-indigo-100",
                  REMINDER: "bg-sky-50 text-sky-600 border-sky-100",
                  MENTOR: "bg-purple-50 text-purple-600 border-purple-100",
                  CLASS_NOTICE: "bg-slate-50 text-slate-600 border-slate-100",
                  PARENT_MEETING: "bg-amber-50 text-amber-600 border-amber-100",
                };
                const priorityStyles = {
                  LOW: "bg-gray-50 text-gray-400 border-gray-100",
                  NORMAL: "bg-blue-50 text-blue-500 border-blue-100",
                  IMPORTANT:
                    "bg-rose-50 text-rose-600 border-rose-100 shadow-sm shadow-rose-50",
                };
                return (
                  <React.Fragment key={update.id || i}>
                  <motion.li
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="p-4 bg-gray-50/40 rounded-[1.5rem] border border-gray-100 flex flex-col gap-2 shadow-sm transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1.5">
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            categoryStyles[update.category] ||
                            categoryStyles.CLASS_NOTICE
                          }`}
                        >
                          {update.category}
                        </span>
                        <span
                          className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            priorityStyles[update.priority] ||
                            priorityStyles.NORMAL
                          }`}
                        >
                          {update.priority}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-gray-400">
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#03045e]">
                        {update.title}
                      </h4>
                      <p className="text-[11px] font-bold text-gray-500 mt-1 leading-relaxed">
                        {update.message}
                      </p>
                    </div>
                    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1 border-t border-gray-50/50 pt-1.5 flex justify-between">
                      <span>{user?.role === "teacher" ? `Class ${update.className}` : `By ${update.teacherName}`}</span>
                      <span>{update.subjectName}</span>
                    </div>
                  </motion.li>
                  </React.Fragment>
                );
              })}
            </ul>
          )}
        </div>
      </MainCard>

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

export default React.memo(NoticeBoard);
