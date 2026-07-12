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
  GraduationCap,
  Wallet,
  Bus,
  FileText,
  Calendar,
} from "lucide-react";
import {
  NOTICE_PRIORITIES,
  NOTICE_CATEGORIES,
} from "../../services/noticeService";
import { markNoticeRead } from "../../services/noticeService";
import { useAuth } from "../../context/AuthContext";
import { useStudent } from "../../context/StudentContext";
import { useLanguage } from "../../context/LanguageContext";

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
  { id: "fees", label: "Fee Alerts" },
  { id: "exams", label: "Exams" },
  { id: "attendance", label: "Attendance" },
];

// eslint-disable-next-line react/prop-types
function NoticeCard({ notice, onRead, isRead, index }) {
  const { t } = useLanguage();
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
    [NOTICE_CATEGORIES.EXAMINATION]: GraduationCap,
    [NOTICE_CATEGORIES.ADMINISTRATIVE]: Users,
    [NOTICE_CATEGORIES.ATTENDANCE]: Clock,
    [NOTICE_CATEGORIES.DISCIPLINE]: AlertTriangle,
    [NOTICE_CATEGORIES.FEES]: Wallet,
    [NOTICE_CATEGORIES.PTM]: Users,
    [NOTICE_CATEGORIES.TIMETABLE]: Calendar,
    [NOTICE_CATEGORIES.RESULTS]: FileText,
    [NOTICE_CATEGORIES.HOLIDAY]: CheckCircle,
    [NOTICE_CATEGORIES.EVENT]: CheckCircle,
    [NOTICE_CATEGORIES.EMERGENCY]: AlertTriangle,
    [NOTICE_CATEGORIES.SYSTEM]: Bell,
    [NOTICE_CATEGORIES.TRANSPORT]: Bus,
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
                {t("notices.actionRequired", { fallback: "Action Required" })}
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
                • {t("notices.expires", { fallback: "Expires:" })} {new Date(notice.expiresAt).toLocaleDateString()}
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

export default function ParentNoticeBoard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { activeStudentId } = useStudent();
  const parentId = user?.linkedEntityId || "parent-001";
  const studentId = activeStudentId || "stu-001";
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [readNoticeIds, setReadNoticeIds] = useState(new Set());
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const FILTER_OPTIONS = useMemo(() => [
    { id: "all", label: t("notices.filterAll", { fallback: "All Notices" }) },
    { id: "unread", label: t("notices.filterUnread", { fallback: "Unread" }) },
    { id: "urgent", label: t("notices.filterUrgent", { fallback: "Urgent" }) },
    { id: "fees", label: t("notices.filterFees", { fallback: "Fee Alerts" }) },
    { id: "exams", label: t("notices.filterExams", { fallback: "Exams" }) },
    { id: "attendance", label: t("notices.filterAttendance", { fallback: "Attendance" }) },
  ], [t]);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const { resolveNoticesForUser } =
        await import("../../services/noticeService");
      const userNotices = await resolveNoticesForUser({
        id: parentId,
        role: "parent",
        studentId,
      });
      setNotices(userNotices);

      const readIds = new Set(
        userNotices
          .filter((n) => n.readReceipts?.some((r) => r.userId === parentId))
          .map((n) => n.id),
      );
      setReadNoticeIds(readIds);
    } catch (error) {
      console.error("Failed to load notices:", error);
    } finally {
      setLoading(false);
    }
  }, [parentId, studentId]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const handleMarkAsRead = async (noticeId) => {
    try {
      await markNoticeRead(noticeId, parentId);
      setReadNoticeIds((prev) => new Set([...prev, noticeId]));
    } catch (error) {
      console.error("Failed to mark notice as read:", error);
    }
  };

  const {
    feeAlerts,
    examNotices,
    attendanceAlerts,
    ptm,
    transport,
    results,
    administrative,
  } = useMemo(() => {
    let filtered = [...notices];

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
      case "fees":
        filtered = filtered.filter((n) =>
          [NOTICE_CATEGORIES.FEES].includes(n.category),
        );
        break;
      case "exams":
        filtered = filtered.filter((n) =>
          [NOTICE_CATEGORIES.EXAMINATION, NOTICE_CATEGORIES.RESULTS].includes(
            n.category,
          ),
        );
        break;
      case "attendance":
        filtered = filtered.filter((n) =>
          [NOTICE_CATEGORIES.ATTENDANCE].includes(n.category),
        );
        break;
    }

    return {
      feeAlerts: filtered.filter((n) =>
        [NOTICE_CATEGORIES.FEES].includes(n.category),
      ),
      examNotices: filtered.filter((n) =>
        [NOTICE_CATEGORIES.EXAMINATION].includes(n.category),
      ),
      attendanceAlerts: filtered.filter((n) =>
        [NOTICE_CATEGORIES.ATTENDANCE].includes(n.category),
      ),
      ptm: filtered.filter((n) => [NOTICE_CATEGORIES.PTM].includes(n.category)),
      transport: filtered.filter((n) =>
        [NOTICE_CATEGORIES.TRANSPORT].includes(n.category),
      ),
      results: filtered.filter((n) =>
        [NOTICE_CATEGORIES.RESULTS].includes(n.category),
      ),
      administrative: filtered.filter((n) =>
        [
          NOTICE_CATEGORIES.ADMINISTRATIVE,
          NOTICE_CATEGORIES.HOLIDAY,
          NOTICE_CATEGORIES.EVENT,
        ].includes(n.category),
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
        <p className="text-xs text-gray-400">{t("notices.loading", { fallback: "Loading notices..." })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#03045e15]">
            <Bell size={24} style={{ color: "#03045e" }} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#03045e]">
              {t("notices.title", { fallback: "Parent Notice Board" })}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {t("notices.subtitle", { fallback: "Institutional Updates" })}
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-[#0077b6] text-white px-2 py-0.5 rounded-full">
                  {unreadCount} {t("notices.unreadSuffix", { fallback: "unread" })}
                </span>
              )}
              {actionRequiredCount > 0 && (
                <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full">
                  {actionRequiredCount} {t("notices.actionsSuffix", { fallback: "actions" })}
                </span>
              )}
            </div>
          </div>
        </div>

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

      {feeAlerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={18} className="text-rose-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              {t("notices.feeAlertsTitle", { fallback: "Fee Alerts" })}
            </h3>
            <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
              {feeAlerts.length}
            </span>
          </div>
          <NoticeSection
            notices={feeAlerts}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage={t("notices.noFeeAlerts", { fallback: "No fee alerts" })}
          />
        </div>
      )}

      {examNotices.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-[#0077b6]" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              {t("notices.examNoticesTitle", { fallback: "Examination Notices" })}
            </h3>
            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {examNotices.length}
            </span>
          </div>
          <NoticeSection
            notices={examNotices}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage={t("notices.noExamNotices", { fallback: "No exam notices" })}
          />
        </div>
      )}

      {attendanceAlerts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-amber-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              {t("notices.attendanceAlertsTitle", { fallback: "Attendance Alerts" })}
            </h3>
            <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
              {attendanceAlerts.length}
            </span>
          </div>
          <NoticeSection
            notices={attendanceAlerts}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage={t("notices.noAttendanceAlerts", { fallback: "No attendance alerts" })}
          />
        </div>
      )}

      {ptm.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={18} className="text-emerald-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              {t("notices.ptmTitle", { fallback: "Parent-Teacher Meetings" })}
            </h3>
            <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
              {ptm.length}
            </span>
          </div>
          <NoticeSection
            notices={ptm}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage={t("notices.noPtm", { fallback: "No PTM scheduled" })}
          />
        </div>
      )}

      {transport.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bus size={18} className="text-teal-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              {t("notices.transportTitle", { fallback: "Transport Updates" })}
            </h3>
            <span className="text-[10px] font-black bg-teal-100 text-teal-600 px-2 py-0.5 rounded-full">
              {transport.length}
            </span>
          </div>
          <NoticeSection
            notices={transport}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage={t("notices.noTransport", { fallback: "No transport updates" })}
          />
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-purple-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              {t("notices.resultsTitle", { fallback: "Results" })}
            </h3>
            <span className="text-[10px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
              {results.length}
            </span>
          </div>
          <NoticeSection
            notices={results}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage={t("notices.noResults", { fallback: "No result announcements" })}
          />
        </div>
      )}

      {administrative.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-gray-500" />
            <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">
              {t("notices.adminNoticesTitle", { fallback: "Administrative Notices" })}
            </h3>
            <span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {administrative.length}
            </span>
          </div>
          <NoticeSection
            notices={administrative}
            onRead={handleMarkAsRead}
            readNoticeIds={readNoticeIds}
            emptyMessage={t("notices.noAdminNotices", { fallback: "No administrative notices" })}
          />
        </div>
      )}

      {feeAlerts.length === 0 &&
        examNotices.length === 0 &&
        attendanceAlerts.length === 0 &&
        ptm.length === 0 &&
        transport.length === 0 &&
        results.length === 0 &&
        administrative.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
            <Bell size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400 font-bold">{t("notices.noNotices", { fallback: "No notices found" })}</p>
            <p className="text-xs text-gray-400 mt-1">
              {activeFilter === "all"
                ? t("notices.caughtUp", { fallback: "You're all caught up!" })
                : t("notices.tryFilter", { fallback: "Try a different filter" })}
            </p>
          </div>
        )}
    </div>
  );
}
