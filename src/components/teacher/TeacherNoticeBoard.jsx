import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  NOTICE_PRIORITIES,
  NOTICE_CATEGORIES,
} from "../../services/noticeService";
import { markNoticeRead } from "../../services/noticeService";
import { useAuth } from "../../context/AuthContext";

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

const FILTER_OPTIONS = [
  { id: "all", label: "All Notices" },
  { id: "unread", label: "Unread" },
  { id: "urgent", label: "Urgent" },
  { id: "action", label: "Requires Action" },
  { id: "academic", label: "Academic" },
  { id: "administrative", label: "Administrative" },
];

// eslint-disable-next-line react/prop-types
function NoticeCard({ notice, onRead, isRead, index }) {
  const priorityColors = {
    [NOTICE_PRIORITIES.INFO]: "bg-blue-50 text-blue-600 border-blue-200",
    [NOTICE_PRIORITIES.IMPORTANT]:
      "bg-amber-50 text-amber-600 border-amber-200",
    [NOTICE_PRIORITIES.URGENT]:
      "bg-orange-50 text-orange-600 border-orange-200",
    [NOTICE_PRIORITIES.CRITICAL]: "bg-red-50 text-red-600 border-red-200",
  };

  const categoryIcons = {
    [NOTICE_CATEGORIES.ACADEMIC]: BookOpen,
    [NOTICE_CATEGORIES.EXAMINATION]: BookOpen,
    [NOTICE_CATEGORIES.ADMINISTRATIVE]: Users,
    [NOTICE_CATEGORIES.ATTENDANCE]: Clock,
    [NOTICE_CATEGORIES.DISCIPLINE]: AlertTriangle,
    [NOTICE_CATEGORIES.FEES]: AlertTriangle,
    [NOTICE_CATEGORIES.PTM]: Users,
    [NOTICE_CATEGORIES.TIMETABLE]: BookOpen,
    [NOTICE_CATEGORIES.RESULTS]: BookOpen,
    [NOTICE_CATEGORIES.HOLIDAY]: CheckCircle,
    [NOTICE_CATEGORIES.EVENT]: CheckCircle,
    [NOTICE_CATEGORIES.EMERGENCY]: AlertTriangle,
    [NOTICE_CATEGORIES.SYSTEM]: Bell,
    [NOTICE_CATEGORIES.TRANSPORT]: Bell,
  };

  const IconComponent = categoryIcons[notice.category] || Bell;
  const priorityClass =
    priorityColors[notice.priority] || priorityColors[NOTICE_PRIORITIES.INFO];

  const handleCardClick = () => {
    if (!isRead) {
      onRead(notice.id);
    }
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01, x: 2 }}
      onClick={handleCardClick}
      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
        isRead
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-gray-200 shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${priorityClass}`}>
          <IconComponent size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!isRead && <span className="w-2 h-2 rounded-full bg-[#0077b6]" />}
            {notice.requiresAction && (
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 border border-rose-200">
                Action Required
              </span>
            )}
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${priorityClass}`}
            >
              {notice.priority}
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#03045e] line-clamp-2 mb-1">
            {notice.title || notice.titleEn}
          </h4>
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {notice.content || notice.contentEn || notice.message}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
            {notice.expiresAt && (
              <span>
                • Expires: {new Date(notice.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// eslint-disable-next-line react/prop-types
function NoticeSection({ notices, onRead, readNoticeIds, emptyMessage }) {
  if (notices.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-xs text-gray-400 italic">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notices.map((notice, index) => (
        <NoticeCard
          key={notice.id}
          notice={notice}
          onRead={onRead}
          isRead={readNoticeIds.includes(notice.id)}
          index={index}
        />
      ))}
    </div>
  );
}

export default function TeacherNoticeBoard() {
  const { user } = useAuth();
  const teacherId = user?.linkedEntityId || "teach-001";
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [readNoticeIds, setReadNoticeIds] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const { resolveNoticesForUser } =
        await import("../../services/noticeService");
      const userNotices = await resolveNoticesForUser({
        id: teacherId,
        role: "teacher",
      });
      setNotices(userNotices);

      // Track already read notices
      const readIds = new Set(
        userNotices
          .filter((n) => n.readReceipts?.some((r) => r.userId === teacherId))
          .map((n) => n.id),
      );
      setReadNoticeIds(readIds);
    } catch (error) {
      console.error("Failed to load notices:", error);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  // Load notices on mount
  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const handleMarkAsRead = async (noticeId) => {
    try {
      await markNoticeRead(noticeId, teacherId);
      setReadNoticeIds((prev) => new Set([...prev, noticeId]));
    } catch (error) {
      console.error("Failed to mark notice as read:", error);
    }
  };

  // Filter and categorize notices
  const { operational, academic, administrative, classTeacher } =
    useMemo(() => {
      let filtered = [...notices];

      // Apply filter
      switch (activeFilter) {
        case "unread":
          filtered = filtered.filter((n) => !readNoticeIds.has(n.id));
          break;
        case "urgent":
          filtered = filtered.filter(
            (n) =>
              n.priority === NOTICE_PRIORITIES.URGENT ||
              n.priority === NOTICE_PRIORITIES.CRITICAL,
          );
          break;
        case "action":
          filtered = filtered.filter((n) => n.requiresAction);
          break;
        case "academic":
          filtered = filtered.filter((n) =>
            [
              NOTICE_CATEGORIES.ACADEMIC,
              NOTICE_CATEGORIES.EXAMINATION,
              NOTICE_CATEGORIES.RESULTS,
              NOTICE_CATEGORIES.TIMETABLE,
            ].includes(n.category),
          );
          break;
        case "administrative":
          filtered = filtered.filter((n) =>
            [
              NOTICE_CATEGORIES.ADMINISTRATIVE,
              NOTICE_CATEGORIES.HOLIDAY,
              NOTICE_CATEGORIES.EVENT,
              NOTICE_CATEGORIES.SYSTEM,
            ].includes(n.category),
          );
          break;
      }

      // Categorize
      return {
        operational: filtered.filter((n) => n.requiresAction),
        academic: filtered.filter(
          (n) =>
            [
              NOTICE_CATEGORIES.ACADEMIC,
              NOTICE_CATEGORIES.EXAMINATION,
              NOTICE_CATEGORIES.RESULTS,
              NOTICE_CATEGORIES.TIMETABLE,
            ].includes(n.category) && !n.requiresAction,
        ),
        administrative: filtered.filter(
          (n) =>
            [
              NOTICE_CATEGORIES.ADMINISTRATIVE,
              NOTICE_CATEGORIES.HOLIDAY,
              NOTICE_CATEGORIES.EVENT,
              NOTICE_CATEGORIES.SYSTEM,
            ].includes(n.category) && !n.requiresAction,
        ),
        classTeacher: filtered.filter(
          (n) => n.targetAudience?.type === "CLASS" && !n.requiresAction,
        ),
      };
    }, [notices, activeFilter, readNoticeIds]);

  const unreadCount = notices.filter((n) => !readNoticeIds.has(n.id)).length;
  const actionRequiredCount = notices.filter(
    (n) => n.requiresAction && !readNoticeIds.has(n.id),
  ).length;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b6] mx-auto mb-2" />
        <p className="text-xs text-gray-400">Loading notices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#03045e15]">
            <Bell size={24} style={{ color: "#03045e" }} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#03045e]">
              Teacher Notice Board
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Operational Inbox</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-[#0077b6] text-white px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
              {actionRequiredCount > 0 && (
                <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  {actionRequiredCount} actions
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-xs font-bold text-gray-600"
          >
            <Filter size={14} />
            <span>
              {FILTER_OPTIONS.find((f) => f.id === activeFilter)?.label}
            </span>
            <ChevronDown size={14} />
          </button>

          <AnimatePresence>
            {showFilterDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilterDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden"
                >
                  {FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => {
                        setActiveFilter(option.id);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-xs font-bold transition hover:bg-gray-50 ${
                        activeFilter === option.id
                          ? "bg-[#0077b6] text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Operational Inbox */}
      {operational.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-rose-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              Operational Inbox
            </h3>
            <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
              {operational.length}
            </span>
          </div>
          <NoticeSection
            notices={operational}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage="No action-required notices"
          />
        </div>
      )}

      {/* Academic Notices */}
      {academic.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-[#0077b6]" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              Academic Notices
            </h3>
            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {academic.length}
            </span>
          </div>
          <NoticeSection
            notices={academic}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage="No academic notices"
          />
        </div>
      )}

      {/* Administrative Notices */}
      {administrative.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-amber-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              Administrative Notices
            </h3>
            <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
              {administrative.length}
            </span>
          </div>
          <NoticeSection
            notices={administrative}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage="No administrative notices"
          />
        </div>
      )}

      {/* Class Teacher Notices */}
      {classTeacher.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-emerald-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              Class Teacher Notices
            </h3>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
              {classTeacher.length}
            </span>
          </div>
          <NoticeSection
            notices={classTeacher}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage="No class teacher notices"
          />
        </div>
      )}

      {/* Empty state */}
      {operational.length === 0 &&
        academic.length === 0 &&
        administrative.length === 0 &&
        classTeacher.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <Bell size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-bold">No notices found</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeFilter === "all"
                ? "You're all caught up!"
                : "Try a different filter"}
            </p>
          </div>
        )}
    </div>
  );
}
