/**
 * services/timetable/index.js
 * Consolidated timetable service — all timetable logic in one file.
 */

import { getDataProvider } from "../../data";
import { getChildren } from "../parentService";
import { timetableSeed } from "../../mockDB/seed/timetable";

// ── Validation (always returns clean — no blocking conflicts) ─────────────────
const validateTimetables = () => [];
export const timetableValidationService = { validateTimetables };

// ── Lifecycle (stub — event bus removed) ────────────────────────────────────
const emitTimetablePublished = async () => {};
export const timetableLifecycleService = { emitTimetablePublished };

// ── Override Service ──────────────────────────────────────────────────────────
const OVERRIDES_KEY = "erp_timetable_overrides_v1";

export const OVERRIDE_PRIORITIES = {
  holiday: 100,
  exam_day: 80,
  special_event: 60,
  teacher_substitution: 40,
  half_day: 50,
  custom_override: 30,
};

const getOverrides = async () => {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveOverride = async (override) => {
  const overrides = await getOverrides();
  const idx = overrides.findIndex((o) => o.id === override.id);
  const now = new Date().toISOString();
  const updated = {
    ...override,
    priority: OVERRIDE_PRIORITIES[override.type] || 10,
    status: override.status || "active",
    createdAt: override.createdAt || now,
    createdBy: override.createdBy || "admin",
    updatedAt: now,
    updatedBy: "admin",
  };
  if (idx !== -1) overrides[idx] = updated;
  else overrides.push(updated);
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  return updated;
};

const deleteOverride = async (overrideId) => {
  const overrides = await getOverrides();
  localStorage.setItem(
    OVERRIDES_KEY,
    JSON.stringify(overrides.filter((o) => o.id !== overrideId)),
  );
  return { success: true };
};

const getActiveOverridesForClassAndDate = async (
  classId,
  dateString,
  grade,
) => {
  const overrides = await getOverrides();
  return overrides
    .filter((o) => {
      if (o.status !== "active") return false;
      const start = o.effectiveRange?.start;
      const end = o.effectiveRange?.end || start;
      if (!start || dateString < start || dateString > end) return false;
      if (o.targetScope === "institution") return true;
      if (o.targetScope === "grade" && grade && o.targetIds.includes(grade))
        return true;
      if (o.targetScope === "class" && o.targetIds.includes(classId))
        return true;
      return false;
    })
    .sort((a, b) => b.priority - a.priority);
};

export const timetableOverrideService = {
  getOverrides,
  saveOverride,
  deleteOverride,
  getActiveOverridesForClassAndDate,
  OVERRIDE_PRIORITIES,
};

// ── Admin Timetable Service ───────────────────────────────────────────────────
export const SUBJECT_DEFAULT_ROOMS = {
  "sub-phy": "Physics Lab 1",
  "sub-chem": "Chemistry Lab 2",
  "sub-bio": "Biology Lab 3",
  "sub-cs": "Computer Lab A",
  "sub-ip": "Computer Lab B",
  "sub-pe": "Sports Ground",
  "sub-art": "Art Room",
  "sub-music": "Music Room",
};

const ensureTimetableExists = async (classId) => {
  const provider = getDataProvider();
  const existing = await provider.getTimetableByClass(classId);
  if (!existing) {
    // Use static seed data if no timetable exists
    const staticTimetable = timetableSeed.find((tt) => tt.classId === classId);
    if (staticTimetable) {
      const all = (await provider.getTimetables()) || [];
      all.push(staticTimetable);
      await provider.setTimetables(all);
      return true;
    }
    return false;
  }
  return true;
};

export const initializeTimetables = async (forceRegenerate = false) => {
  const provider = getDataProvider();
  let existing = await provider.getTimetables();

  // Check if timetables need regeneration (missing subject/teacher fields from new template format)
  const needsRegeneration =
    forceRegenerate ||
    !existing ||
    existing.length === 0 ||
    existing.some((tt) => {
      const firstDay = Object.keys(tt.weeklySchedule || {})[0];
      const firstSlot = tt.weeklySchedule?.[firstDay]?.[0];
      return !firstSlot || !firstSlot.subject || !firstSlot.teacher;
    });

  if (needsRegeneration) {
    // Use static timetable seed data
    await provider.setTimetables(timetableSeed);
  } else {
    const periodCodeMap = {
      1: "P1",
      2: "P2",
      3: "P3",
      4: "P4",
      5: "P5",
      6: "P6",
      7: "P7",
      8: "P8",
      9: "P9",
    };
    let needsSave = false;
    const migrated = existing.map((tt) => {
      let changed = false;
      const newSchedule = {};
      Object.entries(tt.weeklySchedule || {}).forEach(([day, slots]) => {
        if (!Array.isArray(slots)) return;
        newSchedule[day] = slots.map((slot) => {
          if (
            typeof slot.periodNumber === "number" &&
            periodCodeMap[slot.periodNumber]
          ) {
            changed = true;
            return { ...slot, periodNumber: periodCodeMap[slot.periodNumber] };
          }
          return slot;
        });
      });
      if (changed) {
        needsSave = true;
        return { ...tt, weeklySchedule: newSchedule };
      }
      return tt;
    });
    if (needsSave) await provider.setTimetables(migrated);
  }
  return { success: true, message: "Timetables initialized" };
};

export const resetTimetables = async () => {
  const provider = getDataProvider();
  // Reset to static timetable seed data
  await provider.setTimetables(timetableSeed);
  await emitTimetablePublished({ reset: true });
  return { success: true, message: "Timetables regenerated" };
};

export const saveTimetableSlot = async (
  classId,
  day,
  period,
  slotData,
  classNamesMap = {},
  force = false,
) => {
  const provider = getDataProvider();
  const exists = await ensureTimetableExists(classId);
  if (!exists)
    throw new Error(`Failed to initialize timetable for class ${classId}`);
  let warning = null;
  const currentTimetable = await provider.getTimetableByClass(classId);
  if (currentTimetable && currentTimetable.status !== "draft") {
    await provider.updateTimetable(classId, { status: "draft" });
  }
  const success = await provider.setTimetableSlot(classId, day, period, {
    ...slotData,
    isLocked: period === "P1",
  });
  if (!success) throw new Error(`Failed to save slot`);
  return { warning };
};

export const clearTimetableSlot = async (classId, day, period) => {
  const provider = getDataProvider();
  return await provider.clearTimetableSlot(classId, day, period);
};

export const checkTeacherConflict = async () => null;

export const getClassTimetableFlat = async (classId) => {
  const provider = getDataProvider();
  const timetable = await provider.getTimetableByClass(classId);
  if (!timetable || !timetable.weeklySchedule) return [];
  const flatSchedule = [];
  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day) => {
    (timetable.weeklySchedule[day] || timetable.weeklySchedule[day.toLowerCase()] || []).forEach((slot) => {
      flatSchedule.push({ day, period: slot.periodNumber, ...slot });
    });
  });
  return flatSchedule;
};

export const publishClassTimetable = async (
  classId,
  options = { enforceCompleteness: false },
) => {
  const provider = getDataProvider();
  const timetables = await provider.getTimetables();
  const timetable = timetables.find((t) => t.classId === classId);
  if (timetable && timetable.status !== "published") {
    await provider.updateTimetable(classId, {
      status: "published",
      publishedAt: new Date().toISOString(),
      publishedBy: "admin",
    });
  }
  await emitTimetablePublished({ affectedClasses: [classId] });
  return { success: true };
};

export const publishTimetables = async () => {
  const provider = getDataProvider();
  const timetables = await provider.getTimetables();
  for (const t of timetables) {
    if (t.status !== "published") {
      await provider.updateTimetable(t.classId, {
        status: "published",
        publishedAt: new Date().toISOString(),
        publishedBy: "admin",
      });
    }
  }
  await emitTimetablePublished({
    affectedClasses: timetables.map((t) => t.classId),
  });
  return { success: true };
};

export const adminTimetableService = {
  initializeTimetables,
  resetTimetables,
  saveTimetableSlot,
  clearTimetableSlot,
  checkTeacherConflict,
  getClassTimetableFlat,
  publishTimetables,
  publishClassTimetable,
  SUBJECT_DEFAULT_ROOMS,
};

// ── Teacher Schedule Projection ───────────────────────────────────────────────
const rebuildTeacherScheduleProjection = async () => {
  const provider = getDataProvider();
  const timetables = await provider.getTimetables();
  const subjects = await provider.getSubjects();
  const classes = await provider.getClasses();
  const subjectsMap = new Map(subjects.map((s) => [s.id, s]));
  const classMap = new Map(classes.map((c) => [c.id, c]));
  const projection = {};
  const getContainer = (tid) => {
    if (!projection[tid])
      projection[tid] = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
      };
    return projection[tid];
  };
  const VALID_TT_STATUSES = ["published", "Active", "active", "scheduled"];
  timetables.forEach((tt) => {
    if (!VALID_TT_STATUSES.includes(tt.status) || !tt.weeklySchedule) return;
    const cls = classMap.get(tt.classId);
    ["monday", "tuesday", "wednesday", "thursday", "friday"].forEach((day) => {
      const dayKey = day.charAt(0).toUpperCase() + day.slice(1);
      (tt.weeklySchedule[dayKey] || tt.weeklySchedule[day] || []).forEach((slot) => {
        let tid = slot.teacherId;
        if (slot.periodNumber === "P1" && cls?.classTeacherId)
          tid = cls.classTeacherId;
        if (!tid) return;
        const subject = subjectsMap.get(slot.subjectId);
        getContainer(tid)[day].push({
          classId: tt.classId,
          subjectId: slot.subjectId,
          periodNumber: slot.periodNumber,
          startTime: slot.startTime,
          endTime: slot.endTime,
          teacherType:
            slot.periodNumber === "P1"
              ? "class_teacher"
              : subject?.type === "extracurricular"
                ? "activity_teacher"
                : "subject_teacher",
          room: slot.roomId || cls?.roomNumber || cls?.fixedRoomId || "TBA",
        });
      });
    });
  });
  return projection;
};

export const teacherScheduleProjectionService = {
  rebuildTeacherScheduleProjection,
  getProjection: rebuildTeacherScheduleProjection,
  invalidateProjection: () => {},
};

// ── Student Timetable Service ─────────────────────────────────────────────────
const getStudentTimetable = async (studentId) => {
  const provider = getDataProvider();
  const student = await provider.getStudentById(studentId);
  if (!student) return null;
  return await provider.getTimetableByClass(student.classId);
};

const getStudentTodaySchedule = async (studentId, date = new Date()) => {
  const timetable = await getStudentTimetable(studentId);
  if (!timetable?.weeklySchedule) return [];
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const day = days[date.getDay()];
  if (day === "sunday" || day === "saturday") return [];
  const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
  return timetable.weeklySchedule[capitalizedDay] || timetable.weeklySchedule[day] || [];
};

export const studentTimetableService = {
  getStudentTimetable,
  getStudentTodaySchedule,
};

// ── Teacher Timetable Service ─────────────────────────────────────────────────
const getTeacherSchedule = async (teacherId) => {
  const projection = await rebuildTeacherScheduleProjection();
  const schedule = projection[teacherId] || { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] };
  
  return {
    monday: schedule.monday || [],
    tuesday: schedule.tuesday || [],
    wednesday: schedule.wednesday || [],
    thursday: schedule.thursday || [],
    friday: schedule.friday || [],
  };
};

const getTeacherTodaySchedule = async (teacherId, date = new Date()) => {
  const full = await getTeacherSchedule(teacherId);
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const day = days[date.getDay()];
  if (day === "sunday" || day === "saturday") return [];
  return (full[day] || []).sort((a, b) => {
    const pA = String(a.periodNumber).startsWith("P") ? String(a.periodNumber) : `P${a.periodNumber}`;
    const pB = String(b.periodNumber).startsWith("P") ? String(b.periodNumber) : `P${b.periodNumber}`;
    return pA.localeCompare(pB);
  });
};

const getClassTeacherTimetable = async (teacherId) => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher?.isClassTeacher) return null;
  const classId = teacher.assignedClassId || teacher.metadata?.classId;
  if (!classId) return null;
  return await provider.getTimetableByClass(classId);
};

export const teacherTimetableService = {
  getTeacherSchedule,
  getTeacherTodaySchedule,
  getClassTeacherTimetable,
};

// ── Student Timetable Projection ──────────────────────────────────────────────
export const createEmptyTimetableProjection = () => ({
  isConfigured: false,
  status: null,
  today: [],
  weekly: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] },
});

// Valid statuses: seed uses "Active", admin publishes as "published"
const VALID_TIMETABLE_STATUSES = ["published", "Active", "active", "scheduled"];

export const buildStudentTimetableProjection = async (studentId) => {
  const timetable = await getStudentTimetable(studentId);
  if (!timetable || !VALID_TIMETABLE_STATUSES.includes(timetable.status))
    return createEmptyTimetableProjection();
  const provider = getDataProvider();
  const subjects = await provider.getSubjects();
  const teachers = await provider.getTeachers();
  const resolveNames = (slot) => {
    if (!slot) return slot;
    const sub = subjects.find((x) => x.id === slot.subjectId || x.subjectId === slot.subjectId);
    const teach = teachers.find((x) => x.id === slot.teacherId || x.teacherId === slot.teacherId);
    return {
      ...slot,
      subject:
        slot.subjectId === "sub-homeroom"
          ? "Homeroom / Class Teacher Period"
          : (sub?.subjectName || sub?.name || slot.subject || ""),
      teacher: teach?.metadata?.name || teach?.teacherName || teach?.name || slot.teacher || "",
      room: slot.roomId || SUBJECT_DEFAULT_ROOMS[slot.subjectId] || "Room 101",
    };
  };
  const raw = timetable.weeklySchedule || {};
  const weekly = {
    Monday: (raw.Monday || raw.monday || []).map(resolveNames),
    Tuesday: (raw.Tuesday || raw.tuesday || []).map(resolveNames),
    Wednesday: (raw.Wednesday || raw.wednesday || []).map(resolveNames),
    Thursday: (raw.Thursday || raw.thursday || []).map(resolveNames),
    Friday: (raw.Friday || raw.friday || []).map(resolveNames),
  };
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = days[new Date().getDay()];
  const today =
    dayName !== "sunday" && dayName !== "saturday"
      ? weekly[dayName.charAt(0).toUpperCase() + dayName.slice(1)] || []
      : [];
  return { isConfigured: true, status: timetable.status, today, weekly };
};

export const studentTimetableProjectionService = {
  createEmptyTimetableProjection,
  buildStudentTimetableProjection,
};

// ── Parent Timetable Service ──────────────────────────────────────────────────
const getParentChildTimetable = async (parentId, childId) => {
  const children = await getChildren(parentId);
  if (!children.some((c) => c.id === childId))
    return createEmptyTimetableProjection();
  return await buildStudentTimetableProjection(childId);
};

export const parentTimetableService = { getParentChildTimetable };

// ── Operational Timetable Service ─────────────────────────────────────────────
export const getWeekdayFromDate = (dateString) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return days[new Date(dateString).getDay()];
};

export const getOperationalScheduleForDate = async (classId, dateString) => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const classObj = classes.find(
    (c) => c.id === classId || c.classId === classId,
  );
  const grade = classObj?.grade || classObj?.level || "";
  const activeOverrides = await getActiveOverridesForClassAndDate(
    classId,
    dateString,
    grade,
  );
  const timetable = await provider.getTimetableByClass(classId);
  const weekday = getWeekdayFromDate(dateString);
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  let slots = (timetable?.weeklySchedule?.[capitalizedWeekday] || timetable?.weeklySchedule?.[weekday] || []).map((s) => ({
    ...s,
  }));
  let isHoliday = false,
    holidayName = null,
    isHalfDay = false,
    maxPeriod = null;

  for (const override of activeOverrides) {
    if (override.type === "holiday") {
      isHoliday = true;
      holidayName = override.payload?.name || "Holiday";
      slots = [];
      break;
    }
    if (override.type === "half_day") {
      isHalfDay = true;
      maxPeriod = override.payload?.maxPeriod || "P4";
      const maxNum = parseInt(maxPeriod.replace("P", ""), 10) || 4;
      slots = slots.filter(
        (s) => parseInt(s.periodNumber.replace("P", ""), 10) <= maxNum,
      );
    }
    if (override.type === "teacher_substitution") {
      const { targetPeriod, substitutedTeacherId, originalTeacherId } =
        override.payload;
      slots = slots.map((s) =>
        s.periodNumber === targetPeriod &&
        (!originalTeacherId || s.teacherId === originalTeacherId)
          ? {
              ...s,
              isSubstituted: true,
              substituteTeacherId: substitutedTeacherId,
            }
          : s,
      );
    }
    if (
      (override.type === "exam_day" || override.type === "custom_override") &&
      override.payload?.schedule
    ) {
      slots = override.payload.schedule.map((s) => ({ ...s }));
    }
  }

  return {
    date: dateString,
    weekday,
    classId,
    className: classObj?.name || classId,
    isHoliday,
    holidayName,
    isHalfDay,
    maxPeriod,
    slots,
  };
};

export const operationalTimetableService = {
  getOperationalScheduleForDate,
  getWeekdayFromDate,
};
