/**
 * services/teacherMappingService.js
 *
 * SERVICE LAYER — Teacher–Subject Mapping & Class Teacher Workflow
 *
 * All validation and mapping logic for teacher assignments lives here.
 * Pages and components MUST use these functions — never query storage directly.
 *
 * Architecture: Component → Service → Data Provider → Persistence Layer
 */

import { getDataProvider } from "../data";
import { getItem, setItem } from "../persistence/storage";
import {
  deriveTeacherType,
  validateSpecializationIntegrity,
  validateClassTeacherAssignment,
  canBeClassTeacher,
  auditAllClassTeacherAssignments,
  TEACHER_TYPES,
} from "./teacherClassification";
import {
  deriveEligibleStages,
  getStageFromClassId,
} from "../data/academicStages.js";
import { extractLevel, isFoundationClass } from "../utils/classIdentity";
import { CLASS_TEACHER_PRIORITY } from "../mockDB/seed/teacherSubjectAssignments";

// ─── READ QUERIES ─────────────────────────────────────────────────────────────

/**
 * Returns all teacher-subject assignments for a given class.
 * @param {string} classId
 * @returns {Promise<Array<Object>>}
 */
export const getTeacherSubjectAssignments = async (classId) => {
  const provider = getDataProvider();
  if (classId) {
    return provider.getTeacherSubjectAssignmentsByClass(classId);
  }
  return provider.getTeacherSubjectAssignments();
};

/**
 * Returns the resolved teacher type for a given teacher.
 * @param {string} teacherId
 * @returns {Promise<"FOUNDATION" | "SPECIALIZED" | "ACTIVITY" | null>}
 */
export const getTeacherType = async (teacherId) => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return null;
  return deriveTeacherType(teacher);
};

/**
 * Returns the specialization subject for a teacher.
 * Foundation teachers return "multi-subject".
 * Activity teachers return their activity subject.
 * @param {string} teacherId
 * @returns {Promise<string | null>}
 */
export const getTeacherSpecialization = async (teacherId) => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return null;

  const type = deriveTeacherType(teacher);
  if (type === TEACHER_TYPES.FOUNDATION) return "multi-subject";
  return teacher.specializationSubjectId || teacher.subjectId || null;
};

/**
 * Returns the class teacher for a given classId.
 * Resolves both the classTeacherId from the class record and the full teacher object.
 *
 * @param {string} classId
 * @returns {Promise<{ teacher: Object, classId: string, teacherType: string } | null>}
 */
export const getClassTeacher = async (classId) => {
  const provider = getDataProvider();
  const [classes, teachers] = await Promise.all([
    provider.getClasses(),
    provider.getTeachers(),
  ]);

  const cls = classes.find((c) => c.id === classId);
  if (!cls || !cls.classTeacherId) return null;

  const teacher = teachers.find((t) => t.id === cls.classTeacherId);
  if (!teacher) return null;

  return {
    teacher,
    classId,
    teacherType: deriveTeacherType(teacher),
  };
};

/**
 * Returns all subjects taught in a given class with their assigned teachers.
 * This is the canonical view of what subjects exist in a class.
 *
 * For foundation classes: returns all subjects pointing to the single homeroom teacher.
 * For specialized classes: returns distinct subject→teacher pairs from TSA records.
 *
 * @param {string} classId
 * @returns {Promise<Array<{ subjectId: string, subjectName: string, teacherId: string, teacherName: string, teacherType: string }>>}
 */
export const getSubjectTeachersForClass = async (classId) => {
  const provider = getDataProvider();
  const [teachers, subjects, assignments, classes] = await Promise.all([
    provider.getTeachers(),
    provider.getSubjects(),
    provider.getTeacherSubjectAssignments(),
    provider.getClasses(),
  ]);

  const cls = classes.find((c) => c.id === classId);
  if (!cls) return [];

  const level = extractLevel(classId);

  if (isFoundationClass(level)) {
    // Foundation: class teacher teaches everything — find that teacher
    const classTeacher = cls.classTeacherId
      ? teachers.find((t) => t.id === cls.classTeacherId)
      : teachers.find((t) => (t.assignedClasses || []).includes(classId));

    if (!classTeacher) return [];

    // Return all subjects applicable to this class level, mapped to this one teacher
    const applicableSubjects = subjects.filter(
      (s) => s.applicableClasses && s.applicableClasses.includes(level),
    );

    return applicableSubjects.map((sub) => ({
      subjectId: sub.id,
      subjectName: sub.name,
      teacherId: classTeacher.id,
      teacherName: classTeacher.name,
      teacherType: TEACHER_TYPES.FOUNDATION,
    }));
  }

  // Specialized / Senior: derive from teacher-subject-assignments
  const classAssignments = assignments.filter((a) => a.classId === classId);
  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  // Deduplicate by subjectId (take first occurrence — all should be same teacher per subject)
  const seen = new Set();
  const result = [];

  for (const assignment of classAssignments) {
    if (seen.has(assignment.subjectId)) continue;
    seen.add(assignment.subjectId);

    const teacher = teacherMap.get(assignment.teacherId);
    const subject = subjectMap.get(assignment.subjectId);
    if (!teacher || !subject) continue;

    result.push({
      subjectId: assignment.subjectId,
      subjectName: subject.name,
      teacherId: assignment.teacherId,
      teacherName: teacher.name,
      teacherType: deriveTeacherType(teacher),
    });
  }

  return result;
};

/**
 * Returns all classes and subjects assigned to a teacher — their full teaching workload.
 * Structured for use in teacher dashboard identity cards.
 *
 * @param {string} teacherId
 * @returns {Promise<{
 *   teacher: Object,
 *   teacherType: string,
 *   specialization: string | null,
 *   classTeacherOf: Object | null,
 *   teachingAssignments: Array<{ classId, className, subjectId, subjectName }>
 * }>}
 */
export const getTeacherAssignments = async (teacherId) => {
  const provider = getDataProvider();
  const [teachers, subjects, assignments, classes] = await Promise.all([
    provider.getTeachers(),
    provider.getSubjects(),
    provider.getTeacherSubjectAssignments(),
    provider.getClasses(),
  ]);

  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher) return null;

  const teacherType = deriveTeacherType(teacher);
  const specialization =
    teacherType === TEACHER_TYPES.FOUNDATION
      ? "multi-subject"
      : teacher.specializationSubjectId || teacher.subjectId || null;

  // Class teacher ownership
  const classTeacherOf =
    classes.find((c) => c.classTeacherId === teacherId) || null;

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const classMap = new Map(classes.map((c) => [c.id, c]));

  let teachingAssignments = [];

  if (teacherType === TEACHER_TYPES.FOUNDATION) {
    // Foundation: teaching assignments are all subjects in their owned classes
    const ownedClasses = teacher.assignedClasses || [];
    for (const cId of ownedClasses) {
      const cls = classMap.get(cId);
      if (!cls) continue;
      const level = extractLevel(cId);
      const classSubs = subjects.filter(
        (s) => s.applicableClasses && s.applicableClasses.includes(level),
      );
      for (const sub of classSubs) {
        teachingAssignments.push({
          classId: cId,
          className: cls.name || cls.className || cId,
          subjectId: sub.id,
          subjectName: sub.name,
        });
      }
    }
  } else {
    // Specialized / Activity: derive from TSA
    const teacherTSA = assignments.filter((a) => a.teacherId === teacherId);
    const seen = new Set();

    for (const a of teacherTSA) {
      const key = `${a.classId}::${a.subjectId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const cls = classMap.get(a.classId);
      const sub = subjectMap.get(a.subjectId);
      if (!cls || !sub) continue;

      teachingAssignments.push({
        classId: a.classId,
        className: cls.name || cls.className || a.classId,
        subjectId: a.subjectId,
        subjectName: sub.name,
      });
    }
  }

  return {
    teacher,
    teacherType,
    specialization,
    classTeacherOf,
    teachingAssignments,
  };
};

/**
 * Returns all teachers who are eligible to be class teacher of a given class.
 * Used by Admin portal assignment forms.
 *
 * @param {string} classId
 * @returns {Promise<Array<Object>>} - Array of eligible teacher records
 */
export const getEligibleClassTeachers = async (classId) => {
  const provider = getDataProvider();
  const [teachers, assignments] = await Promise.all([
    provider.getTeachers(),
    provider.getTeacherSubjectAssignments(),
  ]);

  return teachers.filter((t) => canBeClassTeacher(t, classId, assignments));
};

// ─── VALIDATION ───────────────────────────────────────────────────────────────

/**
 * Validates a proposed teacher-subject assignment before persisting.
 * Enforces:
 *   - Foundation teachers can only be assigned to foundation classes
 *   - Specialized teachers can only be assigned their declared specialization subject
 *   - No teacher assigned two different subjects in a specialized class
 *
 * @param {string} teacherId
 * @param {string} classId
 * @param {string} subjectId
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export const validateTeacherAssignment = async (
  teacherId,
  classId,
  subjectId,
) => {
  const provider = getDataProvider();
  const [teachers, assignments] = await Promise.all([
    provider.getTeachers(),
    provider.getTeacherSubjectAssignments(),
  ]);

  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher)
    return { valid: false, error: `Teacher "${teacherId}" not found.` };

  const teacherType = deriveTeacherType(teacher);
  const level = extractLevel(classId);

  // Foundation teacher trying to teach in a specialized class
  if (teacherType === TEACHER_TYPES.FOUNDATION && !isFoundationClass(level)) {
    return {
      valid: false,
      error: `Foundation teacher "${teacher.name}" cannot be assigned to Class ${level}. Foundation teachers are restricted to Nursery–Class 4.`,
    };
  }

  // Specialized teacher trying to teach in a foundation class
  if (teacherType === TEACHER_TYPES.SPECIALIZED && isFoundationClass(level)) {
    return {
      valid: false,
      error: `Specialized teacher "${teacher.name}" cannot be assigned to foundation class "${classId}". Foundation classes use homeroom teachers only.`,
    };
  }

  // Specialized teacher: validate subject matches their declared specialization
  if (teacherType === TEACHER_TYPES.SPECIALIZED) {
    const declared = teacher.specializationSubjectId || teacher.subjectId;
    if (declared && declared !== "multi-subject" && declared !== subjectId) {
      return {
        valid: false,
        error: `Teacher "${teacher.name}" specializes in "${declared}" but is being assigned to teach "${subjectId}". A specialized teacher may only teach their declared subject.`,
      };
    }

    // Check if another teacher already teaches this subject in this class
    const conflictingAssignment = assignments.find(
      (a) =>
        a.classId === classId &&
        a.subjectId === subjectId &&
        a.teacherId !== teacherId,
    );
    if (conflictingAssignment) {
      return {
        valid: false,
        error: `Subject "${subjectId}" in class "${classId}" is already assigned to teacher "${conflictingAssignment.teacherId}". Each subject may only have one teacher per class.`,
      };
    }

    // Check that this teacher isn't already assigned a DIFFERENT subject in this class
    const teacherOtherSubject = assignments.find(
      (a) =>
        a.classId === classId &&
        a.teacherId === teacherId &&
        a.subjectId !== subjectId,
    );
    if (teacherOtherSubject) {
      return {
        valid: false,
        error: `Teacher "${teacher.name}" is already assigned to subject "${teacherOtherSubject.subjectId}" in class "${classId}". A specialized teacher may only teach one subject per class.`,
      };
    }
  }

  // Check for period conflict (same teacher, same day, same period in different class)
  // Note: period-level conflict checking is intentionally lightweight here.
  // Full timetable conflict validation lives in timetableService.

  return { valid: true };
};

/**
 * Validates a proposed class teacher assignment.
 * @param {string} teacherId
 * @param {string} classId
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export const validateClassTeacherChange = async (teacherId, classId) => {
  const provider = getDataProvider();
  const [teachers, assignments] = await Promise.all([
    provider.getTeachers(),
    provider.getTeacherSubjectAssignments(),
  ]);

  const teacher = teachers.find((t) => t.id === teacherId);
  if (!teacher)
    return { valid: false, error: `Teacher "${teacherId}" not found.` };

  return validateClassTeacherAssignment(teacher, classId, assignments);
};

/**
 * Changes the class teacher of a given class.
 * Validates eligibility, updates class record, and optionally swaps
 * the P1 timetable slot so the new CT's subject appears first period.
 *
 * DOES NOT touch teacherSubjectAssignments — this is administrative ownership only.
 *
 * @param {string} classId
 * @param {string} newTeacherId
 * @param {Object} options
 * @param {boolean} options.swapP1 - whether to perform deterministic P1 swap (default: true)
 * @returns {Promise<{ success: boolean, error?: string, timetableSwapped?: boolean, swapCount?: number }>}
 */
export const changeClassTeacher = async (
  classId,
  newTeacherId,
  options = {},
) => {
  const provider = getDataProvider();
  const [classes, teachers, assignments, timetableArray] = await Promise.all([
    provider.getClasses(),
    provider.getTeachers(),
    provider.getTeacherSubjectAssignments(),
    provider.getTimetables(),
  ]);

  const cls = classes.find((c) => c.id === classId);
  if (!cls) return { success: false, error: `Class "${classId}" not found.` };

  const teacher = teachers.find((t) => t.id === newTeacherId);
  if (!teacher)
    return { success: false, error: `Teacher "${newTeacherId}" not found.` };

  // Validation: must already teach in this class
  const validation = validateClassTeacherAssignment(
    teacher,
    classId,
    assignments,
  );
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // STEP 1: Update class ownership record
  await provider.updateClass(classId, { classTeacherId: newTeacherId });

  // STEP 2: Update P1 across all weekdays to reflect the new class teacher.
  //
  // Industrial rationale:
  //   P1 is definitionally the class teacher's period — it is always derived
  //   from who the CT is, not from what happened to be stored in a slot.
  //   We write P1 directly rather than trying to "swap" with an existing slot,
  //   which is fragile (requires other slots to exist) and produces wrong results
  //   when the timetable has only P1 data (the normal fresh state).
  //
  // Algorithm:
  //   1. Find the new CT's primary subject for this class using CLASS_TEACHER_PRIORITY
  //   2. Write that subject into P1 for every weekday (create or overwrite)
  //   3. Ensure timetable document exists for this class first

  if (options.swapP1 === false) {
    // Caller explicitly opted out of the timetable update
    return { success: true, timetableUpdated: false };
  }

  // Resolve the new CT's primary subject for this class using priority ordering
  const ctAssignments = assignments.filter(
    (a) => a.teacherId === newTeacherId && a.classId === classId,
  );

  let primarySubjectId = null;
  if (ctAssignments.length > 0) {
    // Walk CLASS_TEACHER_PRIORITY to find the highest-priority subject this CT teaches
    for (const prioritySubjectId of CLASS_TEACHER_PRIORITY) {
      const match = ctAssignments.find((a) => a.subjectId === prioritySubjectId);
      if (match) {
        primarySubjectId = match.subjectId;
        break;
      }
    }
    // Fallback: take their first assignment if no priority match
    if (!primarySubjectId) {
      primarySubjectId = ctAssignments[0].subjectId;
    }
  }

  // Ensure a timetable document exists for this class before writing slots
  const existingTimetable = timetableArray.find((t) => t.classId === classId);
  if (!existingTimetable) {
    const newTT = {
      id: `tt-${classId}`,
      schemaVersion: 1,
      classId,
      academicYear: "2026-2027",
      status: "draft",
      weeklySchedule: {
        monday: [], tuesday: [], wednesday: [],
        thursday: [], friday: [],
      },
      publishedAt: null,
      publishedBy: null,
      updatedAt: new Date().toISOString(),
      updatedBy: "system",
    };
    await provider.setTimetables([...timetableArray, newTT]);
  }

  // Write P1 for all 5 weekdays (creates or overwrites — idempotent)
  const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
  const p1Slot = {
    periodNumber: "P1",
    subjectId: primarySubjectId || "sub-homeroom",
    teacherId: newTeacherId,
    isLocked: true,
  };

  await Promise.all(
    WEEKDAYS.map((day) => provider.setTimetableSlot(classId, day, "P1", p1Slot)),
  );

  return {
    success: true,
    timetableUpdated: true,
    primarySubjectId,
  };
};

/**
 * Runs a full specialization integrity audit across all teachers.
 * Returns violations for admin diagnostics.
 *
 * @returns {Promise<Array<{ teacherId: string, teacherName: string, valid: boolean, error?: string }>>}
 */
export const auditTeacherSpecializations = async () => {
  const provider = getDataProvider();
  const [teachers, assignments] = await Promise.all([
    provider.getTeachers(),
    provider.getTeacherSubjectAssignments(),
  ]);

  return teachers.map((teacher) => {
    const result = validateSpecializationIntegrity(teacher, assignments);
    return {
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherType: deriveTeacherType(teacher),
      valid: result.valid,
      error: result.error,
    };
  });
};

/**
 * Runs a full class teacher assignment audit across all classes.
 * Returns per-class validity status for admin diagnostics.
 *
 * @returns {Promise<Array<{ classId: string, valid: boolean, error?: string }>>}
 */
export const auditClassTeacherAssignments = async () => {
  const provider = getDataProvider();
  const [classes, teachers, assignments] = await Promise.all([
    provider.getClasses(),
    provider.getTeachers(),
    provider.getTeacherSubjectAssignments(),
  ]);

  return auditAllClassTeacherAssignments(classes, teachers, assignments);
};

// ─── SUMMARY QUERIES ──────────────────────────────────────────────────────────

/**
 * Returns a summary of all teacher types for admin overview.
 * @returns {Promise<{ foundation: number, specialized: number, activity: number, total: number }>}
 */
export const getTeacherTypeSummary = async () => {
  const provider = getDataProvider();
  const teachers = await provider.getTeachers();

  const counts = {
    foundation: 0,
    specialized: 0,
    activity: 0,
    total: teachers.length,
  };
  for (const t of teachers) {
    const type = deriveTeacherType(t);
    if (type === TEACHER_TYPES.FOUNDATION) counts.foundation++;
    else if (type === TEACHER_TYPES.ACTIVITY) counts.activity++;
    else counts.specialized++;
  }

  return counts;
};

// ─── ACADEMIC STRUCTURE WORKFLOWS ────────────────────────────────────────────

/**
 * Gets all teachers eligible to teach a specific subject in a specific class.
 * Filters by BOTH subject specialization AND academic stage eligibility.
 *
 * @param {string} subjectId
 * @param {string} [classId] - When provided, filters by stage compatibility
 * @returns {Promise<Array<Teacher & { taughtSubjects: string[], eligibleStages: string[] }>>}
 */
export const getEligibleTeachersForSubject = async (subjectId, classId) => {
  const provider = getDataProvider();
  const [teachers, assignments, subjects] = await Promise.all([
    provider.getTeachers(),
    provider.getTeacherSubjectAssignments(),
    provider.getSubjects(),
  ]);

  // Derive required stage from classId if provided
  const requiredStage = classId ? getStageFromClassId(classId) : null;

  // Find teachers who already teach this subject anywhere
  // OR have it in their specializations
  const eligibleTeacherIds = new Set();

  for (const assign of assignments) {
    if (assign.subjectId === subjectId) {
      eligibleTeacherIds.add(assign.teacherId);
    }
  }

  // Also check teacher specializationSubjectId
  for (const t of teachers) {
    if (t.specializationSubjectId === subjectId) {
      eligibleTeacherIds.add(t.id);
    }
    const specs = t.metadata?.specializations || t.specializations || [];
    if (specs.includes(subjectId)) {
      eligibleTeacherIds.add(t.id);
    }
  }

  // Build a subject name lookup
  const subjectNameMap = Object.fromEntries(
    subjects.map((s) => [s.id, s.name || s.subjectName]),
  );

  return teachers
    .filter((t) => {
      if (!eligibleTeacherIds.has(t.id)) return false;
      // Stage eligibility filter
      if (requiredStage) {
        const stages = t.eligibleStages?.length
          ? t.eligibleStages
          : deriveEligibleStages(t);
        if (!stages.includes(requiredStage)) return false;
      }
      return true;
    })
    .map((t) => {
      const stages = t.eligibleStages?.length
        ? t.eligibleStages
        : deriveEligibleStages(t);
      const taughtSubjectIds = [
        ...new Set(
          assignments
            .filter((a) => a.teacherId === t.id)
            .map((a) => a.subjectId),
        ),
      ];
      return {
        ...t,
        eligibleStages: stages,
        taughtSubjects: taughtSubjectIds
          .map((sid) => subjectNameMap[sid])
          .filter(Boolean),
      };
    });
};

// Default periods per week by subject type (configurable later)
const DEFAULT_PERIODS_BY_TYPE = {
  academic: 6,
  core: 7,
  lab: 5,
  optional: 3,
  activity: 2,
  language: 6,
};

const MAX_PERIODS_PER_WEEK = 42; // Institutional rule

/**
 * Calculates teacher workload in periods per week.
 * @param {string} teacherId
 * @param {Array} assignments
 * @param {Array} subjects
 * @returns {number}
 */
const calculateTeacherWorkload = (teacherId, assignments, subjects) => {
  const teacherAssignments = assignments.filter(
    (a) => a.teacherId === teacherId,
  );
  return teacherAssignments.reduce((total, assignment) => {
    const subject = subjects.find((s) => s.id === assignment.subjectId);
    const subjectType = subject?.subjectType || subject?.category || "academic";
    const periods =
      assignment.periodsPerWeek || DEFAULT_PERIODS_BY_TYPE[subjectType] || 6;
    return total + periods;
  }, 0);
};

/**
 * Logs teacher replacement history to localStorage.
 * @param {Object} entry
 */
const logTeacherReplacement = async (entry) => {
  const HISTORY_KEY = "erp_teacher_replacement_history_v1";
  try {
    const history = getItem(HISTORY_KEY) || [];
    history.push({
      ...entry,
      timestamp: new Date().toISOString(),
      id: `repl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
    // Keep last 1000 entries
    if (history.length > 1000) history.shift();
    setItem(HISTORY_KEY, history);
  } catch (e) {
    console.error("Failed to log teacher replacement:", e);
  }
};

/**
 * Changes the teacher for a specific subject assignment.
 * Updates teacherSubjectAssignments to point to new teacher.
 *
 * Includes:
 * - Eligibility validation
 * - Workload checking (warns if new teacher exceeds 42 periods/week)
 * - Replacement history logging
 *
 * @param {string} assignmentId
 * @param {string} newTeacherId
 * @param {Object} options
 * @param {boolean} options.allowOverload - Allow assignment even if workload exceeds max
 * @returns {Promise<{ success: boolean, error?: string, assignment?: Object, workloadImpact?: Object }>}
 */
export const changeSubjectTeacher = async (
  assignmentId,
  newTeacherId,
  options = {},
) => {
  const provider = getDataProvider();
  const [assignments, teachers, subjects, classes] = await Promise.all([
    provider.getTeacherSubjectAssignments(),
    provider.getTeachers(),
    provider.getSubjects(),
    provider.getClasses(),
  ]);

  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) {
    return { success: false, error: `Assignment "${assignmentId}" not found.` };
  }

  const newTeacher = teachers.find((t) => t.id === newTeacherId);
  if (!newTeacher) {
    return { success: false, error: `Teacher "${newTeacherId}" not found.` };
  }

  const oldTeacher = teachers.find((t) => t.id === assignment.teacherId);
  const subject = subjects.find((s) => s.id === assignment.subjectId);
  const cls = classes.find((c) => c.id === assignment.classId);
  const subjectName = subject?.name || subject?.subjectName || "Unknown";
  const className = cls?.displayName || cls?.name || assignment.classId;

  // Validation: Check if new teacher is eligible (teaches this subject elsewhere
  // OR has it in specializations)
  const isEligible =
    assignments.some(
      (a) =>
        a.teacherId === newTeacherId && a.subjectId === assignment.subjectId,
    ) ||
    (newTeacher.metadata?.specializations || []).includes(assignment.subjectId);

  if (!isEligible) {
    return {
      success: false,
      error: `${newTeacher.metadata?.name || newTeacher.name} is not qualified to teach ${subjectName}.`,
    };
  }

  // Workload Calculation
  const subjectType = subject?.subjectType || subject?.category || "academic";
  const periodsForThisSubject =
    assignment.periodsPerWeek || DEFAULT_PERIODS_BY_TYPE[subjectType] || 6;

  const currentNewTeacherWorkload = calculateTeacherWorkload(
    newTeacherId,
    assignments,
    subjects,
  );
  const projectedNewTeacherWorkload =
    currentNewTeacherWorkload + periodsForThisSubject;

  const currentOldTeacherWorkload = oldTeacher
    ? calculateTeacherWorkload(oldTeacher.id, assignments, subjects)
    : 0;
  const projectedOldTeacherWorkload = oldTeacher
    ? currentOldTeacherWorkload - periodsForThisSubject
    : 0;

  // Check overload (unless explicitly allowed)
  if (
    !options.allowOverload &&
    projectedNewTeacherWorkload > MAX_PERIODS_PER_WEEK
  ) {
    return {
      success: false,
      error: `${newTeacher.metadata?.name || newTeacher.name} would be overloaded (${projectedNewTeacherWorkload}/${MAX_PERIODS_PER_WEEK} periods). Enable 'allowOverload' to proceed anyway.`,
      workloadImpact: {
        teacherName: newTeacher.metadata?.name || newTeacher.name,
        currentLoad: currentNewTeacherWorkload,
        projectedLoad: projectedNewTeacherWorkload,
        maxAllowed: MAX_PERIODS_PER_WEEK,
        isOverloaded: true,
      },
    };
  }

  // Update the assignment
  const updatedAssignment = { ...assignment, teacherId: newTeacherId };
  await provider.updateTeacherSubjectAssignment(
    assignmentId,
    updatedAssignment,
  );

  // Log replacement history
  await logTeacherReplacement({
    assignmentId,
    classId: assignment.classId,
    className,
    subjectId: assignment.subjectId,
    subjectName,
    oldTeacherId: assignment.teacherId,
    oldTeacherName: oldTeacher?.metadata?.name || oldTeacher?.name || "Unknown",
    newTeacherId,
    newTeacherName: newTeacher.metadata?.name || newTeacher.name,
    periodsPerWeek: periodsForThisSubject,
    reason: options.reason || "Administrative change",
  });

  return {
    success: true,
    assignment: updatedAssignment,
    workloadImpact: {
      oldTeacher: oldTeacher
        ? {
            name: oldTeacher.metadata?.name || oldTeacher.name,
            previousLoad: currentOldTeacherWorkload,
            newLoad: projectedOldTeacherWorkload,
          }
        : null,
      newTeacher: {
        name: newTeacher.metadata?.name || newTeacher.name,
        previousLoad: currentNewTeacherWorkload,
        newLoad: projectedNewTeacherWorkload,
        isOverloaded: projectedNewTeacherWorkload > MAX_PERIODS_PER_WEEK,
      },
    },
  };
};

/**
 * Creates a new teacher-subject assignment for a class.
 * Validates that the subject isn't already assigned to this class.
 *
 * @param {Object} data
 * @param {string} data.classId
 * @param {string} data.subjectId
 * @param {string} data.teacherId
 * @param {number} data.periodsPerWeek
 * @param {string} data.room
 * @returns {Promise<{ success: boolean, error?: string, assignment?: Object }>}
 */
export const createTeacherSubjectAssignment = async (data) => {
  const provider = getDataProvider();
  const [assignments, subjects, teachers, classes] = await Promise.all([
    provider.getTeacherSubjectAssignments(),
    provider.getSubjects(),
    provider.getTeachers(),
    provider.getClasses(),
  ]);

  // Validation: Check for duplicate subject in class
  const existingAssignment = assignments.find(
    (a) => a.classId === data.classId && a.subjectId === data.subjectId,
  );
  if (existingAssignment) {
    const subject = subjects.find((s) => s.id === data.subjectId);
    const cls = classes.find((c) => c.id === data.classId);
    return {
      success: false,
      error: `${subject?.name || data.subjectId} is already assigned to ${cls?.displayName || data.classId}.`,
    };
  }

  // Validation: Check teacher eligibility
  const teacher = teachers.find((t) => t.id === data.teacherId);
  if (!teacher) {
    return { success: false, error: `Teacher "${data.teacherId}" not found.` };
  }

  const isEligible =
    teacher.specializationSubjectId === data.subjectId ||
    assignments.some(
      (a) => a.teacherId === data.teacherId && a.subjectId === data.subjectId,
    ) ||
    (teacher.metadata?.specializations || []).includes(data.subjectId);

  if (!isEligible) {
    const subject = subjects.find((s) => s.id === data.subjectId);
    return {
      success: false,
      error: `${teacher.metadata?.name || teacher.name} is not qualified to teach ${subject?.name || data.subjectId}.`,
    };
  }

  // Validation: Stage eligibility
  const cls = classes.find((c) => c.id === data.classId);
  if (cls?.stage) {
    const teacherStages = teacher.eligibleStages?.length
      ? teacher.eligibleStages
      : deriveEligibleStages(teacher);
    if (!teacherStages.includes(cls.stage)) {
      const teacherName = teacher.metadata?.name || teacher.name;
      return {
        success: false,
        error: `${teacherName} is not eligible to teach at the ${cls.stage.replace(/_/g, " ")} stage. Their eligible stages: ${teacherStages.map((s) => s.replace(/_/g, " ")).join(", ")}.`,
      };
    }
  }

  // Create assignment
  const assignmentData = {
    classId: data.classId,
    subjectId: data.subjectId,
    teacherId: data.teacherId,
    periodsPerWeek: data.periodsPerWeek || 6,
    room: data.room || null,
    createdAt: new Date().toISOString(),
  };

  const assignment =
    await provider.createTeacherSubjectAssignment(assignmentData);

  return {
    success: true,
    assignment,
  };
};

/**
 * Deletes a teacher-subject assignment after validation checks.
 * Prevents deletion if exams or timetable slots exist for this subject-class.
 *
 * @param {string} assignmentId
 * @returns {Promise<{ success: boolean, error?: string, blockedBy?: string[] }>}
 */
export const deleteTeacherSubjectAssignment = async (assignmentId) => {
  const provider = getDataProvider();
  const [assignments, exams, timetableArray] = await Promise.all([
    provider.getTeacherSubjectAssignments(),
    provider.getExams(),
    provider.getTimetables(),
  ]);

  // Convert v2 array format to legacy { classId: weeklySchedule } map
  const timetable = {};
  (timetableArray || []).forEach((tt) => {
    if (tt.classId && tt.weeklySchedule) {
      timetable[tt.classId] = tt.weeklySchedule;
    }
  });

  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) {
    return { success: false, error: "Assignment not found." };
  }

  const blockedBy = [];

  // Check for exams tied to this subject-class
  const hasExams = exams.some(
    (e) =>
      e.classId === assignment.classId && e.subjectId === assignment.subjectId,
  );
  if (hasExams) {
    blockedBy.push("exams");
  }

  // Check for timetable slots
  const classSchedule = timetable[assignment.classId];
  if (classSchedule) {
    const hasTimetableSlots = Object.values(classSchedule).some((daySchedule) =>
      Object.values(daySchedule).some(
        (slot) =>
          slot &&
          slot.subjectId === assignment.subjectId &&
          slot.teacherId === assignment.teacherId,
      ),
    );
    if (hasTimetableSlots) {
      blockedBy.push("timetable");
    }
  }

  if (blockedBy.length > 0) {
    return {
      success: false,
      error: `Cannot remove: ${blockedBy.join(" and ")} exist for this subject. Remove them first.`,
      blockedBy,
    };
  }

  // Delete the assignment
  const deleted = await provider.deleteTeacherSubjectAssignment(assignmentId);

  if (!deleted) {
    return { success: false, error: "Failed to delete assignment." };
  }

  return {
    success: true,
  };
};

/**
 * Updates periods per week and room for a teacher-subject assignment.
 * This is timetable configuration data stored within the assignment.
 *
 * @param {string} assignmentId
 * @param {Object} updates
 * @param {number} updates.periodsPerWeek
 * @param {string} updates.room
 * @param {boolean} updates.isLab
 * @returns {Promise<{ success: boolean, error?: string, assignment?: Object }>}
 */
export const updateAssignmentPeriodsAndRoom = async (assignmentId, updates) => {
  const provider = getDataProvider();

  // Validate periodsPerWeek
  if (updates.periodsPerWeek !== undefined) {
    const periods = parseInt(updates.periodsPerWeek);
    if (isNaN(periods) || periods < 1 || periods > 10) {
      return {
        success: false,
        error: "Periods per week must be between 1 and 10.",
      };
    }
  }

  try {
    const updatedAssignment = await provider.updateTeacherSubjectAssignment(
      assignmentId,
      updates,
    );

    return {
      success: true,
      assignment: updatedAssignment,
    };
  } catch (e) {
    return {
      success: false,
      error: e.message || "Failed to update configuration.",
    };
  }
};

/**
 * Gets comprehensive workload information for a teacher.
 * Includes current load, projected load with new assignment, and section count.
 *
 * @param {string} teacherId
 * @param {Object} options
 * @param {string} options.prospectiveAssignmentId - Assignment to exclude (for edits)
 * @param {number} options.additionalPeriods - Periods to add for preview
 * @returns {Promise<{ sections: number, periodsPerWeek: number, maxAllowed: number, isOverloaded: boolean, utilization: number }>}
 */
export const getTeacherWorkload = async (teacherId, options = {}) => {
  const provider = getDataProvider();
  const [assignments, subjects] = await Promise.all([
    provider.getTeacherSubjectAssignments(),
    provider.getSubjects(),
  ]);

  const teacherAssignments = assignments.filter(
    (a) =>
      a.teacherId === teacherId && a.id !== options.prospectiveAssignmentId, // Exclude if editing existing
  );

  let totalPeriods = 0;
  for (const assignment of teacherAssignments) {
    const subject = subjects.find((s) => s.id === assignment.subjectId);
    const subjectType = subject?.subjectType || subject?.category || "academic";
    const periods =
      assignment.periodsPerWeek || DEFAULT_PERIODS_BY_TYPE[subjectType] || 6;
    totalPeriods += periods;
  }

  // Add prospective periods for preview
  const projectedPeriods = totalPeriods + (options.additionalPeriods || 0);

  return {
    sections: teacherAssignments.length,
    periodsPerWeek: totalPeriods,
    projectedPeriods,
    maxAllowed: MAX_PERIODS_PER_WEEK,
    isOverloaded: projectedPeriods > MAX_PERIODS_PER_WEEK,
    utilization: Math.round((projectedPeriods / MAX_PERIODS_PER_WEEK) * 100),
    assignments: teacherAssignments.map((a) => ({
      classId: a.classId,
      subjectId: a.subjectId,
      periodsPerWeek: a.periodsPerWeek || 6,
    })),
  };
};
