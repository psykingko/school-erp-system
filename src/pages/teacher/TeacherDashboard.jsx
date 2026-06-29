import { useMediaQuery } from "../../hooks/useMediaQuery";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import TeacherIdentityCard from "../../components/teacher/TeacherIdentityCard";
import MyClassPanel from "../../components/teacher/MyClassPanel";
import MyTeachingSchedule from "../../components/teacher/MyTeachingSchedule";
import MyClassSchedule from "../../components/teacher/MyClassSchedule";
import TeacherActionCenter from "../../components/teacher/TeacherActionCenter";
import QuickActionsPanel from "../../components/teacher/QuickActionsPanel";
import NoticeBoard from "../../components/NoticeBoard";
import { teacherDashboardService } from "../../services/teacherDashboardService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

// Progressive Loading Skeletons
import DashboardCardSkeleton from "../../shared/components/skeletons/DashboardCardSkeleton";
import ScheduleSkeleton from "../../shared/components/skeletons/ScheduleSkeleton";
import ActionCenterSkeleton from "../../shared/components/skeletons/ActionCenterSkeleton";

// Isolate Widget Render Trees to prevent full-page rerender cascades
const MemoizedTeacherIdentityCard = React.memo(TeacherIdentityCard);
const MemoizedMyClassPanel = React.memo(MyClassPanel);
const MemoizedMyTeachingSchedule = React.memo(MyTeachingSchedule);
const MemoizedMyClassSchedule = React.memo(MyClassSchedule);
const MemoizedTeacherActionCenter = React.memo(TeacherActionCenter);
const MemoizedQuickActionsPanel = React.memo(QuickActionsPanel);

/**
 * TeacherDashboard
 *
 * Deeply optimized Daily Operational Workspace.
 * Custom built for Class Teacher vs Subject Teacher workflows.
 */
const TeacherDashboard = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { user } = useAuth();
  const teacherId = user?.linkedEntityId || "teach-001";

  // ── Isolated Local States ──
  const [identity, setIdentity] = useState(null);
  const [teachingSchedule, setTeachingSchedule] = useState({
    today: [],
    currentClass: null,
    nextClass: null,
  });
  const [classInfo, setClassInfo] = useState(null);
  const [classSchedule, setClassSchedule] = useState({ today: [], weekly: [] });
  const [actionItems, setActionItems] = useState([]);
  const [notices, setNotices] = useState({ general: [], exam: [], classUpdates: [] });

  // Loading States
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [loadingDeferred, setLoadingDeferred] = useState(true);

  // Error indicators
  const [errorCritical, setErrorCritical] = useState("");
  const [errorDeferred, setErrorDeferred] = useState("");
  const { t } = useLanguage();

  const [toastMessage, setToastMessage] = useState(null);

  const fetchCriticalData = useCallback(
    async (force = false) => {
      setLoadingSchedule(true);
      try {
        const data =
          await teacherDashboardService.getCriticalTeacherDashboardData(
            teacherId,
            force,
          );
        setIdentity(data.teacherIdentity);
        setTeachingSchedule(
          data.teachingSchedule || {
            today: [],
            currentClass: null,
            nextClass: null,
          },
        );
        setErrorCritical("");
      } catch (e) {
        console.error("Failed to load critical schedule timeline:", e);
        setErrorCritical(t("dashboard.errorCritical"));
      } finally {
        setLoadingSchedule(false);
      }
    },
    [teacherId],
  );

  const fetchDeferredData = useCallback(
    async (force = false) => {
      setLoadingDeferred(true);
      try {
        const data =
          await teacherDashboardService.getDeferredTeacherDashboardData(
            teacherId,
            force,
          );
        setClassInfo(data.classInfo);
        setClassSchedule(data.classSchedule || { today: [], weekly: [] });
        setActionItems(data.actionItems || []);
        setNotices(data.notices || { general: [], exam: [], classUpdates: [] });
        setErrorDeferred("");
      } catch (e) {
        console.error("Failed to load deferred action lists:", e);
        setErrorDeferred(t("dashboard.errorDeferred"));
      } finally {
        setLoadingDeferred(false);
      }
    },
    [teacherId],
  );

  useEffect(() => {
    // 1. Fetch critical timeline schedule immediately
    fetchCriticalData();

    // 2. Defer heavy secondary aggregations to allow instantaneous layout paint
    const timer = setTimeout(() => {
      fetchDeferredData();
    }, 50);

    return () => clearTimeout(timer);
  }, [fetchCriticalData, fetchDeferredData]);

  // Memoize homeroom/class teacher check to avoid recalcs
  const isClassTeacher = useMemo(() => {
    return !!identity?.isClassTeacher;
  }, [identity]);

  // Limit initial items count to 5 to reduce initial DOM footprint
  const slicedActionItems = useMemo(() => {
    return actionItems.slice(0, 5);
  }, [actionItems]);

  return (
    <div className="space-y-6 pb-12 relative">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle2 size={16} />
            <span className="text-xs font-black">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6 animate-fade-in"
      >
        {/* SECTION 1 — IDENTITY PANEL */}
        {loadingSchedule ? (
          <DashboardCardSkeleton />
        ) : errorCritical ? (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl">
            {errorCritical}
          </div>
        ) : (
          identity && <MemoizedTeacherIdentityCard identity={identity} />
        )}

        {/* 2. Primary Workspace Layout (Schedule & Tasks Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Middle: Schedules & Class Operations */}
          <div className="lg:col-span-2 space-y-6">
            {/* SECTION 2 — MY TEACHING SCHEDULE */}
            {loadingSchedule ? (
              <ScheduleSkeleton />
            ) : errorCritical ? (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl">
                {errorCritical}
              </div>
            ) : (
              <MemoizedMyTeachingSchedule
                schedule={teachingSchedule}
                currentClass={teachingSchedule.currentClass}
                nextClass={teachingSchedule.nextClass}
              />
            )}

            {/* SECTION 3 — MY CLASS PANEL (Only for Class Teachers) */}
            {loadingDeferred
              ? isClassTeacher && <DashboardCardSkeleton />
              : errorDeferred
                ? isClassTeacher && (
                    <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl">
                      {errorDeferred}
                    </div>
                  )
                : isClassTeacher &&
                  classInfo && <MemoizedMyClassPanel classInfo={classInfo} />}

            {/* SECTION 4 — MY CLASS SCHEDULE (Only for Class Teachers) */}
            {loadingDeferred
              ? isClassTeacher && <ScheduleSkeleton />
              : isClassTeacher &&
                classInfo && (
                  <MemoizedMyClassSchedule
                    classSchedule={classSchedule}
                    className={identity?.className}
                  />
                )}

            <MemoizedQuickActionsPanel />
          </div>

          {/* SECTION 5 — ACTION CENTER */}
          <div className="lg:col-span-1 h-full space-y-6">
            {loadingDeferred ? (
              <ActionCenterSkeleton />
            ) : (
              <MemoizedTeacherActionCenter actionItems={slicedActionItems} />
            )}
          </div>
        </div>

        {/* SECTION 6 — NOTICE BOARD */}
        {loadingDeferred ? (
          <ActionCenterSkeleton />
        ) : (
          <NoticeBoard
            notices={notices.general || []}
            examNotices={notices.exam || []}
            classUpdates={notices.classUpdates || []}
            index={0}
          />
        )}
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;
