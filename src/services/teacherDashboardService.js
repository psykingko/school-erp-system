import { getDataProvider } from "../data";
import { teacherTimetableService } from "./timetable";
import {
  teacherScheduleService,
  getClassTeacherResponsibilities,
} from "./teacherService";
import { getAssignmentsByTeacher } from "./assignmentService";
import { getUpdatesForTeacher } from "./classUpdatesService";

// ── Inlined from teacherActionCenterService ─────────────────────────────────
const actionItemsCache = new Map();
const ACTION_CACHE_TTL = 4000;

const getAttendanceAlerts = async (teacherId) => {
  const responsibilities = await getClassTeacherResponsibilities(teacherId);
  if (!responsibilities || responsibilities.attendanceMarked) return null;
  return {
    id: "action-attendance-pending",
    type: "ATTENDANCE",
    severity: "HIGH",
    message: `Attendance for your Class ${responsibilities.className} is pending for today!`,
    actionLabel: "Take Attendance",
    link: "/teacher/attendance",
  };
};

const getPendingLeaves = async (teacherId) => {
  const responsibilities = await getClassTeacherResponsibilities(teacherId);
  if (!responsibilities || responsibilities.pendingLeavesCount === 0)
    return null;
  return {
    id: "action-leaves-pending",
    type: "LEAVE",
    severity: "HIGH",
    message: `You have ${responsibilities.pendingLeavesCount} student leave request(s) awaiting approval.`,
    actionLabel: "Review Leaves",
    link: "/teacher/leave-management",
  };
};

const getMentorRequests = async (teacherId) => {
  const provider = getDataProvider();
  const sessions = await provider.getMentorSessionsByTeacher(
    teacherId || "teach-001",
  );
  const pending = sessions.filter((s) => s.status === "PENDING");
  if (pending.length === 0) return null;
  return {
    id: "action-mentors-pending",
    type: "MENTORSHIP",
    severity: "MEDIUM",
    message: `You have ${pending.length} student mentorship session request(s) awaiting review.`,
    actionLabel: "Open Requests",
    link: "/teacher/mentorship",
  };
};

const getPendingGrading = async (teacherId) => {
  const teacherAssignments = await getAssignmentsByTeacher(
    teacherId || "teach-001",
  );
  const total = teacherAssignments.reduce(
    (sum, a) =>
      sum + Math.max(0, (a.submissionsCount || 0) - (a.gradedCount || 0)),
    0,
  );
  if (total === 0) return null;
  return {
    id: "action-grading-pending",
    type: "GRADING",
    severity: "LOW",
    message: `You have ${total} submission(s) across your classes pending evaluation.`,
    actionLabel: "Grade Homework",
    link: "/teacher/assignments",
  };
};

const getTeacherActionItems = async (teacherId) => {
  const tId = teacherId || "teach-001";
  if (actionItemsCache.has(tId)) {
    const entry = actionItemsCache.get(tId);
    if (Date.now() - entry.timestamp < ACTION_CACHE_TTL) return entry.actions;
  }
  const [attAlert, leaveAlert, mentorAlert, gradeAlert] = await Promise.all([
    getAttendanceAlerts(tId),
    getPendingLeaves(tId),
    getMentorRequests(tId),
    getPendingGrading(tId),
  ]);
  const actions = [
    attAlert,
    leaveAlert,
    mentorAlert,
    gradeAlert,
    {
      id: "action-policy-update",
      type: "ADMIN",
      severity: "MEDIUM",
      message:
        "Quarterly report card entry guidelines have been updated by Administration.",
      actionLabel: "View Notice",
      link: "/teacher/dashboard",
    },
  ].filter(Boolean);
  actionItemsCache.set(tId, { actions, timestamp: Date.now() });
  return actions;
};
// ─────────────────────────────────────────────────────────────────────────────

// In-memory lightweight cache registry
const cache = new Map();
const CACHE_TTL = 8000; // 8 seconds cache validity

/**
 * getCriticalTeacherDashboardData
 *
 * Instantly resolves high-priority critical view data: teacher profile, subjects, and teaching schedules.
 */
export const getCriticalTeacherDashboardData = async (
  teacherId,
  forceRefresh = false,
) => {
  const tId = teacherId || "teach-001";
  const cacheKey = `teacher-dashboard-critical-${tId}`;

  // Serve from cache if valid
  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  console.time(`[PERF AUDIT] getCriticalTeacherDashboardData for ${tId}`);
  const provider = getDataProvider();

  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === tId);

  const assignments = await provider.getTeacherSubjectAssignments();
  const teacherAssignments = assignments.filter((a) => a.teacherId === tId);
  const subjectIds = [...new Set(teacherAssignments.map((a) => a.subjectId))];
  const classIds = [...new Set(teacherAssignments.map((a) => a.classId))];

  const subjects = await provider.getSubjects();
  const classesList = await provider.getClasses();

  const resolvedSubjects = subjectIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter(Boolean);
  const resolvedClasses = classIds
    .map((id) => classesList.find((c) => c.id === id))
    .filter(Boolean);

  const subjectsTaught = resolvedSubjects.map((s) => s.name);
  const classesAssigned = resolvedClasses.map((c) => c.name);

  const rawWeeklySchedule =
    await teacherTimetableService.getTeacherSchedule(tId);
  const rawTodaySchedule =
    await teacherTimetableService.getTeacherTodaySchedule(tId);
  const resolveSlot = (slot) => {
    const cls =
      resolvedClasses.find((c) => c.id === slot.classId) ||
      classesList.find((c) => c.id === slot.classId);
    const sub =
      resolvedSubjects.find((s) => s.id === slot.subjectId) ||
      subjects.find((s) => s.id === slot.subjectId);
    const pNum = String(slot.periodNumber);
    const normalizedPeriod = pNum.startsWith("P") ? pNum : `P${pNum}`;
    return {
      ...slot,
      period: normalizedPeriod,
      subject: sub ? sub.name : slot.subjectId,
      class: cls ? cls.name.replace("Class ", "") : slot.classId,
      time: `${slot.startTime} - ${slot.endTime}`,
    };
  };

  const todaySchedule = rawTodaySchedule.map(resolveSlot);
  const weeklySchedule = {};
  for (const [day, slots] of Object.entries(rawWeeklySchedule)) {
    weeklySchedule[day] = slots.map(resolveSlot);
  }
  
  const currentClass =
    todaySchedule.length > 0
      ? { ...todaySchedule[0], status: "Ongoing" }
      : null;
  const nextClass =
    todaySchedule.length > 1
      ? { ...todaySchedule[1], status: "Upcoming" }
      : null;

  const classTeacherData =
    await teacherScheduleService.getClassTeacherResponsibilities(tId);

  const teacherIdentity = {
    id: tId,
    name: teacher ? teacher.name : "Faculty",
    designation: teacher ? teacher.designation : "Instructor",
    department: teacher ? teacher.department : "Academic",
    isClassTeacher: !!classTeacherData,
    className: classTeacherData ? classTeacherData.className : null,
    classId: classTeacherData ? classTeacherData.classId : null,
    totalStudents: classTeacherData ? classTeacherData.totalStudents : 0,
    attendanceMarked: classTeacherData
      ? classTeacherData.attendanceMarked
      : false,
    presentStudents: classTeacherData ? classTeacherData.presentStudents : 0,
    pendingLeavesCount: classTeacherData
      ? classTeacherData.pendingLeavesCount
      : 0,
    subjectsTaught,
    classesAssigned,
    lecturesTodayCount: todaySchedule.length,
  };

  const payload = {
    teacherIdentity,
    teachingSchedule: {
      weekly: weeklySchedule,
      today: todaySchedule,
      currentClass,
      nextClass,
      scheduleCount: todaySchedule.length,
    },
  };

  console.timeEnd(`[PERF AUDIT] getCriticalTeacherDashboardData for ${tId}`);

  cache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });

  return payload;
};

/**
 * getDeferredTeacherDashboardData
 *
 * Asynchronously gathers deferred dashboard metadata: Action Center Tasks, class operations, and class timetable.
 */
export const getDeferredTeacherDashboardData = async (
  teacherId,
  forceRefresh = false,
) => {
  const tId = teacherId || "teach-001";
  const cacheKey = `teacher-dashboard-deferred-${tId}`;

  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  console.time(`[PERF AUDIT] getDeferredTeacherDashboardData for ${tId}`);

  const provider = getDataProvider();

  // Fetch heavier collections in parallel to eliminate sequentially awaiting loops
  const [classTeacherData, actionItems, generalNotices, examNotices, classUpdates] =
    await Promise.all([
      teacherScheduleService.getClassTeacherResponsibilities(tId),
      getTeacherActionItems(tId),
      import("./noticeService").then((m) =>
        m.resolveNoticesForUser({ id: tId, role: "teacher" }).then((notices) =>
          notices.filter((n) => n.category !== "examination")
        )
      ),
      import("./noticeService").then((m) =>
        m.resolveNoticesForUser({ id: tId, role: "teacher" }).then((notices) =>
          notices.filter((n) => n.category === "examination")
        )
      ),
      getUpdatesForTeacher(tId),
    ]);

  const fullClassSchedule = classTeacherData
    ? await teacherScheduleService.getClassSchedule(classTeacherData.classId)
    : [];
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClassSchedule = fullClassSchedule.filter(
    (s) => s.day.toLowerCase() === todayName.toLowerCase(),
  );

  const payload = {
    classInfo: classTeacherData,
    classSchedule: {
      weekly: fullClassSchedule,
      today: todayClassSchedule,
    },
    actionItems,
    notices: {
      general: generalNotices,
      exam: examNotices,
      classUpdates: classUpdates,
    },
  };

  console.timeEnd(`[PERF AUDIT] getDeferredTeacherDashboardData for ${tId}`);

  cache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });

  return payload;
};

/**
 * Legacy support for full aggregation layer.
 */
export const getTeacherDashboardData = async (
  teacherId,
  forceRefresh = false,
) => {
  const tId = teacherId || "teach-001";
  const cacheKey = `teacher-dashboard-${tId}`;

  if (!forceRefresh && cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (Date.now() - entry.timestamp < CACHE_TTL) {
      return entry.payload;
    }
  }

  const [critical, deferred] = await Promise.all([
    getCriticalTeacherDashboardData(tId, forceRefresh),
    getDeferredTeacherDashboardData(tId, forceRefresh),
  ]);

  const payload = {
    teacherIdentity: critical.teacherIdentity,
    teachingSchedule: critical.teachingSchedule,
    classInfo: deferred.classInfo,
    classSchedule: deferred.classSchedule,
    actionItems: deferred.actionItems,
  };

  cache.set(cacheKey, {
    payload,
    timestamp: Date.now(),
  });

  return payload;
};

/**
 * Invalidates the dashboard cache.
 */
export const clearTeacherDashboardCache = (teacherId) => {
  if (teacherId) {
    cache.delete(`teacher-dashboard-critical-${teacherId}`);
    cache.delete(`teacher-dashboard-deferred-${teacherId}`);
    cache.delete(`teacher-dashboard-${teacherId}`);
  } else {
    cache.clear();
  }
};

export const teacherDashboardService = {
  getCriticalTeacherDashboardData,
  getDeferredTeacherDashboardData,
  getTeacherDashboardData,
  clearTeacherDashboardCache,
};
