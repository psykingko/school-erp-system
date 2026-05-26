import { getDataProvider } from "../../data";
import { buildCanonicalTimetables } from "../../mockDB/seed/timetable";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";
import { timetableValidationService } from "./timetableValidationService";
import { timetableLifecycleService } from "./timetableLifecycleService";

/**
 * Suggested default rooms per subject ID
 */
export const SUBJECT_DEFAULT_ROOMS = {
  "sub-phy": "Physics Lab 1",
  "sub-chem": "Chemistry Lab 2",
  "sub-bio": "Biology Lab 3",
  "sub-cs": "Computer Lab A",
  "sub-ip": "Computer Lab B",
  "sub-pe": "Sports Ground",
  "sub-art": "Art Room",
  "sub-music": "Music Room"
};

/**
 * Ensures the timetables collection is initialized dynamically.
 * Also migrates legacy periodNumber strings (e.g. "P1") to integers (e.g. 1).
 */
export const initializeTimetables = async () => {
  const provider = getDataProvider();
  let existing = await provider.getTimetables();
  if (!existing || existing.length === 0) {
    const classes = await provider.getClasses();
    const assignments = await provider.getTeacherSubjectAssignments();
    const teachers = await provider.getTeachers();
    const timetables = buildCanonicalTimetables(classes, assignments, teachers);
    await provider.setTimetables(timetables);
  } else {
    // Migration: normalize periodNumber integers (1-8) → string codes ("P1"–"P8")
    // This fixes data that was incorrectly migrated to integers in a prior version.
    const periodCodeMap = { 1: "P1", 2: "P2", 3: "P3", 4: "P4", 5: "P5", 6: "P6", 7: "P7", 8: "P8" };
    let needsSave = false;
    const migrated = existing.map((tt) => {
      const newSchedule = {};
      let changed = false;
      Object.entries(tt.weeklySchedule || {}).forEach(([day, slots]) => {
        if (!Array.isArray(slots)) return;
        newSchedule[day] = slots.map((slot) => {
          if (typeof slot.periodNumber === "number" && periodCodeMap[slot.periodNumber]) {
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
    if (needsSave) {
      await provider.setTimetables(migrated);
    }
  }
  return { success: true, message: "Timetables initialized" };
};

/**
 * Ensures a single timetable document exists for the given class
 */
const ensureTimetableExists = async (classId) => {
  const provider = getDataProvider();
  const existing = await provider.getTimetableByClass(classId);
  if (!existing) {
    const classes = await provider.getClasses();
    const assignments = await provider.getTeacherSubjectAssignments();
    const teachers = await provider.getTeachers();
    // Only generate for this class, but use the same engine
    const classObj = classes.find(c => c.id === classId || c.classId === classId);
    if (!classObj) return false;
    const timetables = buildCanonicalTimetables([classObj], assignments, teachers);
    if (timetables.length > 0) {
      const allTimetables = await provider.getTimetables() || [];
      allTimetables.push(timetables[0]);
      await provider.setTimetables(allTimetables);
      return true;
    }
  }
  return true;
};

/**
 * Reset to defaults, wipe projections, and clear caches.
 */
export const resetTimetables = async () => {
  const provider = getDataProvider();
  const classes = await provider.getClasses();
  const assignments = await provider.getTeacherSubjectAssignments();
  const teachers = await provider.getTeachers();
  const timetables = buildCanonicalTimetables(classes, assignments, teachers);
  await provider.setTimetables(timetables);
  
  // Wipe projections and caches
  await timetableLifecycleService.emitTimetablePublished({ reset: true });
  
  return { success: true, message: "Timetables regenerated dynamically from canonical engine" };
};

/**
 * Save a period slot
 */
export const saveTimetableSlot = async (
  classId,
  day,
  period,
  slotData,
  classNamesMap = {},
  force = false
) => {
  const provider = getDataProvider();
  
  // Ensure the timetable exists before trying to update it
  const exists = await ensureTimetableExists(classId);
  if (!exists) {
    throw new Error(`Failed to initialize timetable for class ${classId}`);
  }

  let warning = null;
  if (!force && slotData.teacherId) {
    const conflictClassId = await checkTeacherConflict(
      slotData.teacherId,
      day,
      period,
      classId
    );
    if (conflictClassId) {
      warning = {
        classId: conflictClassId,
        className: classNamesMap[conflictClassId] || conflictClassId,
      };
    }
  }

  // Preserve isLocked for P1
  const isLocked = period === "P1";
  
  // Set to draft since it's modified
  const currentTimetable = await provider.getTimetableByClass(classId);
  const status = "draft";
  if (currentTimetable && currentTimetable.status !== "draft") {
    await provider.updateTimetable(classId, { status: "draft" });
  }

  const success = await provider.setTimetableSlot(classId, day, period, { ...slotData, isLocked });
  if (!success) {
    throw new Error(`Failed to save slot to timetable for class ${classId}`);
  }
  
  return { warning };
};

/**
 * Remove a period slot
 */
export const clearTimetableSlot = async (classId, day, period) => {
  if (period === "P1") {
    // P1 is structurally locked for CT, ideally shouldn't clear, but we allow admin override
    // Could enforce rule here if strict
  }
  const provider = getDataProvider();
  return await provider.clearTimetableSlot(classId, day, period);
};

/**
 * Check teacher conflict across all classes
 */
export const checkTeacherConflict = async (teacherId, day, period, excludeClassId) => {
  const provider = getDataProvider();
  const timetables = await provider.getTimetables();
  
  for (const timetable of timetables) {
    if (timetable.classId === excludeClassId) continue;
    
    const daySchedule = timetable.weeklySchedule[day.toLowerCase()] || [];
    const slot = daySchedule.find(p => p.periodNumber === period);
    
    if (slot && slot.teacherId === teacherId) {
      return timetable.classId;
    }
  }
  return null;
};

/**
 * Get a flat schedule array for a class (used by Admin Grid)
 */
export const getClassTimetableFlat = async (classId) => {
  const provider = getDataProvider();
  const timetable = await provider.getTimetableByClass(classId);
  if (!timetable || !timetable.weeklySchedule) return [];

  const flatSchedule = [];
  const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  DAY_ORDER.forEach(day => {
    const daySchedule = timetable.weeklySchedule[day.toLowerCase()] || [];
    daySchedule.forEach(slot => {
      flatSchedule.push({ day, period: slot.periodNumber, ...slot });
    });
  });

  return flatSchedule;
};

/**
 * Publish a single class timetable, validating only that class.
 */
export const publishClassTimetable = async (classId, options = { enforceCompleteness: false }) => {
  const provider = getDataProvider();
  
  const timetables = await provider.getTimetables();
  const classes = await provider.getClasses();
  const teachers = await provider.getTeachers();
  const subjects = await provider.getSubjects();
  const assignments = await provider.getTeacherSubjectAssignments();
  const rooms = await provider.getRooms();

  const errors = timetableValidationService.validateTimetables(
    timetables,
    classes,
    teachers,
    subjects,
    assignments,
    rooms,
    { classIdToValidate: classId, enforceCompleteness: options.enforceCompleteness }
  );

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Find and update the specific timetable document
  const timetable = timetables.find((t) => t.classId === classId);
  if (timetable && timetable.status !== "published") {
    // Also record who and when it was published, as requested by the user for auditing
    const updates = { 
      status: "published",
      publishedAt: new Date().toISOString(),
      publishedBy: "admin" // Hardcoded for now, normally would pull from auth context
    };
    await provider.updateTimetable(classId, updates);
  }

  // Orchestrate system-wide updates
  await timetableLifecycleService.emitTimetablePublished({ affectedClasses: [classId] });

  return { success: true };
};

/**
 * Publish all timetables, validating them first.
 */
export const publishTimetables = async (options = { enforceCompleteness: true }) => {
  const provider = getDataProvider();
  
  const timetables = await provider.getTimetables();
  const classes = await provider.getClasses();
  const teachers = await provider.getTeachers();
  const subjects = await provider.getSubjects();
  const assignments = await provider.getTeacherSubjectAssignments();
  const rooms = await provider.getRooms();

  const errors = timetableValidationService.validateTimetables(
    timetables,
    classes,
    teachers,
    subjects,
    assignments,
    rooms,
    { classIdToValidate: null, enforceCompleteness: options.enforceCompleteness }
  );

  if (errors.length > 0) {
    return { success: false, errors };
  }

  // Update status to published
  const affectedClasses = [];
  const publishedAt = new Date().toISOString();
  for (const t of timetables) {
    if (t.status !== "published") {
      await provider.updateTimetable(t.classId, { 
        status: "published",
        publishedAt: publishedAt,
        publishedBy: "admin"
      });
      affectedClasses.push(t.classId);
    }
  }

  // Orchestrate system-wide updates
  await timetableLifecycleService.emitTimetablePublished({ affectedClasses });

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
  SUBJECT_DEFAULT_ROOMS
};
