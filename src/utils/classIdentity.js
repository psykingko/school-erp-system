/**
 * Class Identity Authority Layer
 *
 * This is the ONLY source of truth for all class identity operations.
 * No other file should manually convert XI ↔ 11 or parse class names.
 *
 * STORAGE FORMAT (Canonical):
 * - Foundation: Nursery, LKG, UKG
 * - Primary → Senior Secondary: 1, 2, 3, ..., 10, 11, 12
 *
 * SECTION FORMAT:
 * - Always: A, B, C, D
 *
 * DISPLAY FORMAT:
 * - UI displays: XI, XII for aesthetics
 * - Internally: 11, 12 everywhere
 */

// ============================================================================
// CANONICAL INSTITUTIONAL STRUCTURE
// ============================================================================

/**
 * Complete institutional class levels.
 * Hardcoded institution structure - NOT derived from data.
 * Used for filters, dropdowns, selectors across all portals.
 * Levels: Nursery, LKG, UKG, 1-10, 11, 12
 */
export const CLASS_LEVELS = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

/**
 * Institutional sections.
 * Hardcoded institution structure - NOT derived from data.
 * Used for filters, dropdowns, selectors across all portals.
 */
export const SECTIONS = ["A", "B", "C", "D"];

/**
 * Stage groupings by institutional structure.
 * Used for organized filter displays and bulk operations.
 */
export const STAGE_GROUPS = {
  foundation: ["Nursery", "LKG", "UKG"],
  primary: ["1", "2", "3", "4", "5"],
  middle: ["6", "7", "8"],
  secondary: ["9", "10"],
  senior_secondary: ["11", "12"],
};

/**
 * Human-readable stage labels.
 */
export const STAGE_LABELS = {
  foundation: "Pre-Primary (Nursery–UKG)",
  primary: "Primary (Class 1–5)",
  middle: "Middle School (Class 6–8)",
  secondary: "Secondary (Class 9–10)",
  senior_secondary: "Senior Secondary (Class 11–12)",
};

// ============================================================================
// CANONICALIZATION UTILITIES
// ============================================================================

/**
 * Normalizes class level to canonical storage format.
 * Converts display formats (XI, XII) to storage format (11, 12).
 *
 * @param {string} level - The class level (e.g., "XI", "12", "Nursery", "5")
 * @returns {string} Canonical level (e.g., "11", "12", "Nursery", "5")
 */
export function normalizeClassLevel(level) {
  if (!level) return level;

  const normalized = level.toString().trim().toUpperCase();

  // Convert Roman numerals to numbers for senior secondary
  if (normalized === "XI") return "11";
  if (normalized === "XII") return "12";

  // Already numeric or foundation - return as-is
  return level.toString();
}

// ============================================================================
// DISPLAY UTILITIES
// ============================================================================

/**
 * Formats class level for display.
 * Converts storage format (11, 12) to display format (XI, XII).
 *
 * @param {string} level - Canonical level (e.g., "11", "12", "Nursery", "5")
 * @returns {string} Display level (e.g., "XI", "XII", "Nursery", "5")
 */
export function formatClassLevel(level) {
  if (!level) return level;

  const normalized = normalizeClassLevel(level);

  // Foundation and primary/middle/secondary display as-is
  return normalized;
}

/**
 * Formats full class name for display.
 * Combines level and section with proper formatting.
 *
 * @param {string} level - Canonical level (e.g., "11", "12", "Nursery", "5")
 * @param {string} section - Section letter (e.g., "A", "B", "C", "D")
 * @returns {string} Display class name (e.g., "11-A", "12-B", "Nursery-A", "5-C")
 */
export function formatClassName(level, section) {
  const displayLevel = formatClassLevel(level);
  const displaySection = section ? section.toUpperCase() : "";

  if (["Nursery", "LKG", "UKG"].includes(displayLevel)) {
    return displaySection ? `${displayLevel}-${displaySection}` : displayLevel;
  }

  return displaySection ? `${displayLevel}-${displaySection}` : displayLevel;
}

// ============================================================================
// PARSING UTILITIES
// ============================================================================

/**
 * Extracts the level from a class name or ID.
 *
 * @param {string} className - Class name or ID (e.g., "11-A", "class-11a", "Nursery-B")
 * @returns {string} Canonical level (e.g., "11", "Nursery", "5")
 */
export function extractLevel(className) {
  if (!className) return "";

  const str = className.toString().trim();

  // Handle "class-11a" format
  const classIdMatch = str.match(/class-(\d+|[a-z]+)/i);
  if (classIdMatch) {
    return normalizeClassLevel(classIdMatch[1]);
  }

  // Handle "11-A" or "11-A" format
  const parts = str.split(/[-\s]/);
  if (parts.length >= 1) {
    return normalizeClassLevel(parts[0]);
  }

  return normalizeClassLevel(str);
}

/**
 * Extracts the section from a class name or ID.
 *
 * @param {string} className - Class name or ID (e.g., "11-A", "class-11a", "Nursery-B")
 * @returns {string} Section letter (e.g., "A", "B", "C", "D") or empty string
 */
export function extractSection(className) {
  if (!className) return "";

  const str = className.toString().trim();

  // Handle "class-11a" format
  const classIdMatch = str.match(/class-(?:\d+|[a-z]+)([a-d])/i);
  if (classIdMatch) {
    return classIdMatch[1].toUpperCase();
  }

  // Handle "11-A" or "11-A" format
  const parts = str.split(/[-\s]/);
  if (parts.length >= 2) {
    const section = parts[parts.length - 1].toUpperCase();
    // Validate it's a section letter
    if (/^[A-D]$/.test(section)) {
      return section;
    }
  }

  return "";
}

/**
 * Builds a class ID from level and section.
 *
 * @param {string} level - Canonical level (e.g., "11", "Nursery", "5")
 * @param {string} section - Section letter (e.g., "A", "B", "C", "D")
 * @returns {string} Class ID (e.g., "class-11a", "class-nurserya")
 */
export function buildClassId(level, section) {
  const normalizedLevel = normalizeClassLevel(level).toLowerCase();
  const normalizedSection = section ? section.toLowerCase() : "";

  return `class-${normalizedLevel}${normalizedSection}`;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Checks if a class level is in the foundation stage.
 *
 * @param {string} level - Canonical level (e.g., "Nursery", "LKG", "UKG", "5")
 * @returns {boolean} True if foundation (Nursery, LKG, UKG)
 */
export function isFoundationClass(level) {
  const normalized = normalizeClassLevel(level).toLowerCase();
  return ["nursery", "lkg", "ukg"].includes(normalized);
}

/**
 * Checks if a class level is in the senior secondary stage.
 *
 * @param {string} level - Canonical level (e.g., "11", "12", "XI", "XII")
 * @returns {boolean} True if senior secondary (11, 12)
 */
export function isSeniorSecondary(level) {
  const normalized = normalizeClassLevel(level);
  return normalized === "11" || normalized === "12";
}

/**
 * Checks if a class level is in the primary stage.
 *
 * @param {string} level - Canonical level (e.g., "1", "2", "3", "4", "5")
 * @returns {boolean} True if primary (1-5)
 */
export function isPrimaryClass(level) {
  const normalized = normalizeClassLevel(level);
  const num = parseInt(normalized, 10);
  return num >= 1 && num <= 5;
}

/**
 * Checks if a class level is in the middle stage.
 *
 * @param {string} level - Canonical level (e.g., "6", "7", "8")
 * @returns {boolean} True if middle (6-8)
 */
export function isMiddleClass(level) {
  const normalized = normalizeClassLevel(level);
  const num = parseInt(normalized, 10);
  return num >= 6 && num <= 8;
}

/**
 * Checks if a class level is in the secondary stage.
 *
 * @param {string} level - Canonical level (e.g., "9", "10")
 * @returns {boolean} True if secondary (9-10)
 */
export function isSecondaryClass(level) {
  const normalized = normalizeClassLevel(level);
  const num = parseInt(normalized, 10);
  return num >= 9 && num <= 10;
}

/**
 * Gets the academic stage from a class level.
 *
 * @param {string} level - Canonical level (e.g., "Nursery", "5", "11")
 * @returns {string} Stage: "foundation", "primary", "middle", "secondary", "senior_secondary"
 */
export function getStageFromLevel(level) {
  if (isFoundationClass(level)) return "foundation";
  if (isPrimaryClass(level)) return "primary";
  if (isMiddleClass(level)) return "middle";
  if (isSecondaryClass(level)) return "secondary";
  if (isSeniorSecondary(level)) return "senior_secondary";
  return "unknown";
}

// ============================================================================
// INTEGRITY VALIDATION LAYER
// ============================================================================

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Overall validation status
 * @property {Array<string>} errors - List of validation errors
 * @property {Array<string>} warnings - List of validation warnings
 * @property {Object} details - Detailed validation results by category
 */

/**
 * Validates class identity integrity across all persisted data.
 * Detects mixed identities, misalignments, and corruption.
 *
 * @returns {ValidationResult} Validation result with errors and warnings
 */
export function validateClassIdentityIntegrity() {
  const errors = [];
  const warnings = [];
  const details = {};

  // Check 1: No XI/XII persisted in localStorage
  const legacyCheck = checkNoLegacyNaming();
  if (!legacyCheck.valid) {
    errors.push(...legacyCheck.errors);
    warnings.push(...legacyCheck.warnings);
  }
  details.legacyNaming = legacyCheck;

  // Check 2: Filter alignment
  const filterCheck = checkFilterAlignment();
  if (!filterCheck.valid) {
    errors.push(...filterCheck.errors);
    warnings.push(...filterCheck.warnings);
  }
  details.filterAlignment = filterCheck;

  // Check 3: Mapping alignment (student-class, teacher-class)
  const mappingCheck = checkMappingAlignment();
  if (!mappingCheck.valid) {
    errors.push(...mappingCheck.errors);
    warnings.push(...mappingCheck.warnings);
  }
  details.mappingAlignment = mappingCheck;

  // Check 4: Notice alignment
  const noticeCheck = checkNoticeAlignment();
  if (!noticeCheck.valid) {
    errors.push(...noticeCheck.errors);
    warnings.push(...noticeCheck.warnings);
  }
  details.noticeAlignment = noticeCheck;

  // Check 5: Exam targeting alignment
  const examCheck = checkExamAlignment();
  if (!examCheck.valid) {
    errors.push(...examCheck.errors);
    warnings.push(...examCheck.warnings);
  }
  details.examAlignment = examCheck;

  // Check 6: Timetable alignment
  const timetableCheck = checkTimetableAlignment();
  if (!timetableCheck.valid) {
    errors.push(...timetableCheck.errors);
    warnings.push(...timetableCheck.warnings);
  }
  details.timetableAlignment = timetableCheck;

  // Check 7: Portal projection alignment
  const portalCheck = checkPortalProjectionAlignment();
  if (!portalCheck.valid) {
    errors.push(...portalCheck.errors);
    warnings.push(...portalCheck.warnings);
  }
  details.portalProjection = portalCheck;

  const valid = errors.length === 0;

  if (!valid) {
    console.error("[ClassIdentityIntegrity] Validation failed:", errors);
  }
  if (warnings.length > 0) {
    console.warn("[ClassIdentityIntegrity] Validation warnings:", warnings);
  }

  return { valid, errors, warnings, details };
}

/**
 * Check 1: No XI/XII persisted in localStorage
 */
function checkNoLegacyNaming() {
  const errors = [];
  const warnings = [];
  const issues = [];

  const storageKeys = [
    "erp_students",
    "erp_classes",
    "erp_exams",
    "erp_exam_papers",
    "erp_notices",
    "erp_attendance",
    "erp_results",
    "erp_analytics",
    "erp_fee_structures",
    "erp_teacher_subject_assignments",
  ];

  storageKeys.forEach((key) => {
    try {
      const data = localStorage.getItem(key);
      if (!data) return;

      const parsed = JSON.stringify(data);

      // Check for XI or XII (case-insensitive, word boundaries)
      const romanPattern = /\b(XI|XII)\b/gi;
      const matches = parsed.match(romanPattern);

      if (matches) {
        issues.push({
          key,
          count: matches.length,
          samples: matches.slice(0, 3),
        });
        errors.push(
          `Legacy Roman numerals (XI/XII) found in ${key}: ${matches.length} occurrences`,
        );
      }
    } catch (e) {
      warnings.push(`Could not validate ${key}: ${e.message}`);
    }
  });

  return {
    valid: issues.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Check 2: Filter alignment
 */
function checkFilterAlignment() {
  const errors = [];
  const warnings = [];
  const issues = [];

  try {
    const filters = localStorage.getItem("erp_filters");
    if (!filters) {
      return { valid: true, errors: [], warnings: [], issues: [] };
    }

    const parsed = JSON.parse(filters);

    // Check class filter
    if (parsed.class) {
      const level = extractLevel(parsed.class);
      if (level && (level === "XI" || level === "XII")) {
        errors.push(
          `Filter class contains legacy Roman numeral: ${parsed.class}`,
        );
        issues.push({ type: "classFilter", value: parsed.class });
      }
    }

    // Check classLevel filter
    if (parsed.classLevel) {
      if (parsed.classLevel === "XI" || parsed.classLevel === "XII") {
        errors.push(
          `Filter classLevel contains legacy Roman numeral: ${parsed.classLevel}`,
        );
        issues.push({ type: "classLevelFilter", value: parsed.classLevel });
      }
    }

    // Check selectedClasses array
    if (parsed.selectedClasses && Array.isArray(parsed.selectedClasses)) {
      parsed.selectedClasses.forEach((cls) => {
        const level = extractLevel(cls);
        if (level && (level === "XI" || level === "XII")) {
          errors.push(
            `Filter selectedClasses contains legacy Roman numeral: ${cls}`,
          );
          issues.push({ type: "selectedClass", value: cls });
        }
      });
    }
  } catch (e) {
    warnings.push(`Could not validate filter alignment: ${e.message}`);
  }

  return {
    valid: issues.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Check 3: Mapping alignment (student-class, teacher-class)
 */
function checkMappingAlignment() {
  const errors = [];
  const warnings = [];
  const issues = [];

  try {
    // Check students
    const students = localStorage.getItem("erp_students");
    if (students) {
      const parsed = JSON.parse(students);
      parsed.forEach((student, index) => {
        if (
          student.classLevel &&
          (student.classLevel === "XI" || student.classLevel === "XII")
        ) {
          errors.push(
            `Student ${student.id || index} has legacy classLevel: ${student.classLevel}`,
          );
          issues.push({
            type: "studentClassLevel",
            id: student.id,
            value: student.classLevel,
          });
        }
        if (student.classId) {
          const level = extractLevel(student.classId);
          if (level && (level === "XI" || level === "XII")) {
            errors.push(
              `Student ${student.id || index} has legacy classId: ${student.classId}`,
            );
            issues.push({
              type: "studentClassId",
              id: student.id,
              value: student.classId,
            });
          }
        }
      });
    }

    // Check teachers
    const teachers = localStorage.getItem("erp_teachers");
    if (teachers) {
      const parsed = JSON.parse(teachers);
      parsed.forEach((teacher, index) => {
        if (teacher.assignedLevels && Array.isArray(teacher.assignedLevels)) {
          teacher.assignedLevels.forEach((level) => {
            if (level === "XI" || level === "XII") {
              errors.push(
                `Teacher ${teacher.id || index} has legacy assignedLevel: ${level}`,
              );
              issues.push({
                type: "teacherAssignedLevel",
                id: teacher.id,
                value: level,
              });
            }
          });
        }
        if (teacher.homeroom) {
          const level = extractLevel(teacher.homeroom);
          if (level && (level === "XI" || level === "XII")) {
            errors.push(
              `Teacher ${teacher.id || index} has legacy homeroom: ${teacher.homeroom}`,
            );
            issues.push({
              type: "teacherHomeroom",
              id: teacher.id,
              value: teacher.homeroom,
            });
          }
        }
      });
    }
  } catch (e) {
    warnings.push(`Could not validate mapping alignment: ${e.message}`);
  }

  return {
    valid: issues.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Check 4: Notice alignment
 */
function checkNoticeAlignment() {
  const errors = [];
  const warnings = [];
  const issues = [];

  try {
    const notices = localStorage.getItem("erp_notices");
    if (!notices) {
      return { valid: true, errors: [], warnings: [], issues: [] };
    }

    const parsed = JSON.parse(notices);
    parsed.forEach((notice, index) => {
      if (notice.targetClass) {
        const level = extractLevel(notice.targetClass);
        if (level && (level === "XI" || level === "XII")) {
          errors.push(
            `Notice ${notice.id || index} has legacy targetClass: ${notice.targetClass}`,
          );
          issues.push({
            type: "noticeTargetClass",
            id: notice.id,
            value: notice.targetClass,
          });
        }
      }
      if (notice.applicableClasses && Array.isArray(notice.applicableClasses)) {
        notice.applicableClasses.forEach((cls) => {
          const level = extractLevel(cls);
          if (level && (level === "XI" || level === "XII")) {
            errors.push(
              `Notice ${notice.id || index} has legacy applicableClass: ${cls}`,
            );
            issues.push({
              type: "noticeApplicableClass",
              id: notice.id,
              value: cls,
            });
          }
        });
      }
    });
  } catch (e) {
    warnings.push(`Could not validate notice alignment: ${e.message}`);
  }

  return {
    valid: issues.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Check 5: Exam targeting alignment
 */
function checkExamAlignment() {
  const errors = [];
  const warnings = [];
  const issues = [];

  try {
    const exams = localStorage.getItem("erp_exams");
    if (exams) {
      const parsed = JSON.parse(exams);
      parsed.forEach((exam, index) => {
        if (
          exam.classLevel &&
          (exam.classLevel === "XI" || exam.classLevel === "XII")
        ) {
          errors.push(
            `Exam ${exam.id || index} has legacy classLevel: ${exam.classLevel}`,
          );
          issues.push({
            type: "examClassLevel",
            id: exam.id,
            value: exam.classLevel,
          });
        }
        if (exam.applicableClasses && Array.isArray(exam.applicableClasses)) {
          exam.applicableClasses.forEach((cls) => {
            const level = extractLevel(cls);
            if (level && (level === "XI" || level === "XII")) {
              errors.push(
                `Exam ${exam.id || index} has legacy applicableClass: ${cls}`,
              );
              issues.push({
                type: "examApplicableClass",
                id: exam.id,
                value: cls,
              });
            }
          });
        }
      });
    }

    const examPapers = localStorage.getItem("erp_exam_papers");
    if (examPapers) {
      const parsed = JSON.parse(examPapers);
      parsed.forEach((paper, index) => {
        if (paper.classId) {
          const level = extractLevel(paper.classId);
          if (level && (level === "XI" || level === "XII")) {
            errors.push(
              `Exam paper ${paper.id || index} has legacy classId: ${paper.classId}`,
            );
            issues.push({
              type: "examPaperClassId",
              id: paper.id,
              value: paper.classId,
            });
          }
        }
        if (
          paper.classLevel &&
          (paper.classLevel === "XI" || paper.classLevel === "XII")
        ) {
          errors.push(
            `Exam paper ${paper.id || index} has legacy classLevel: ${paper.classLevel}`,
          );
          issues.push({
            type: "examPaperClassLevel",
            id: paper.id,
            value: paper.classLevel,
          });
        }
      });
    }
  } catch (e) {
    warnings.push(`Could not validate exam alignment: ${e.message}`);
  }

  return {
    valid: issues.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Check 6: Timetable alignment
 */
function checkTimetableAlignment() {
  const errors = [];
  const warnings = [];
  const issues = [];

  try {
    const timetable = localStorage.getItem("erp_timetable");
    if (!timetable) {
      return { valid: true, errors: [], warnings: [], issues: [] };
    }

    const parsed = JSON.parse(timetable);

    // Check if timetable is an array or object
    const entries = Array.isArray(parsed) ? parsed : Object.values(parsed);

    entries.forEach((entry, index) => {
      if (entry.classId) {
        const level = extractLevel(entry.classId);
        if (level && (level === "XI" || level === "XII")) {
          errors.push(
            `Timetable entry ${entry.id || index} has legacy classId: ${entry.classId}`,
          );
          issues.push({
            type: "timetableClassId",
            id: entry.id,
            value: entry.classId,
          });
        }
      }
      if (
        entry.classLevel &&
        (entry.classLevel === "XI" || entry.classLevel === "XII")
      ) {
        errors.push(
          `Timetable entry ${entry.id || index} has legacy classLevel: ${entry.classLevel}`,
        );
        issues.push({
          type: "timetableClassLevel",
          id: entry.id,
          value: entry.classLevel,
        });
      }
    });
  } catch (e) {
    warnings.push(`Could not validate timetable alignment: ${e.message}`);
  }

  return {
    valid: issues.length === 0,
    errors,
    warnings,
    issues,
  };
}

/**
 * Check 7: Portal projection alignment
 */
function checkPortalProjectionAlignment() {
  const errors = [];
  const warnings = [];
  const issues = [];

  try {
    // Check attendance records
    const attendance = localStorage.getItem("erp_attendance");
    if (attendance) {
      const parsed = JSON.parse(attendance);
      parsed.forEach((record, index) => {
        if (record.classId) {
          const level = extractLevel(record.classId);
          if (level && (level === "XI" || level === "XII")) {
            errors.push(
              `Attendance record ${record.id || index} has legacy classId: ${record.classId}`,
            );
            issues.push({
              type: "attendanceClassId",
              id: record.id,
              value: record.classId,
            });
          }
        }
      });
    }

    // Check results records
    const results = localStorage.getItem("erp_results");
    if (results) {
      const parsed = JSON.parse(results);
      parsed.forEach((result, index) => {
        if (result.classId) {
          const level = extractLevel(result.classId);
          if (level && (level === "XI" || level === "XII")) {
            errors.push(
              `Result record ${result.id || index} has legacy classId: ${result.classId}`,
            );
            issues.push({
              type: "resultClassId",
              id: result.id,
              value: result.classId,
            });
          }
        }
        if (
          result.classLevel &&
          (result.classLevel === "XI" || result.classLevel === "XII")
        ) {
          errors.push(
            `Result record ${result.id || index} has legacy classLevel: ${result.classLevel}`,
          );
          issues.push({
            type: "resultClassLevel",
            id: result.id,
            value: result.classLevel,
          });
        }
      });
    }

    // Check analytics records
    const analytics = localStorage.getItem("erp_analytics");
    if (analytics) {
      const parsed = JSON.parse(analytics);
      parsed.forEach((record, index) => {
        if (record.classId) {
          const level = extractLevel(record.classId);
          if (level && (level === "XI" || level === "XII")) {
            errors.push(
              `Analytics record ${record.id || index} has legacy classId: ${record.classId}`,
            );
            issues.push({
              type: "analyticsClassId",
              id: record.id,
              value: record.classId,
            });
          }
        }
        if (
          record.classLevel &&
          (record.classLevel === "XI" || record.classLevel === "XII")
        ) {
          errors.push(
            `Analytics record ${record.id || index} has legacy classLevel: ${record.classLevel}`,
          );
          issues.push({
            type: "analyticsClassLevel",
            id: record.id,
            value: record.classLevel,
          });
        }
      });
    }
  } catch (e) {
    warnings.push(
      `Could not validate portal projection alignment: ${e.message}`,
    );
  }

  return {
    valid: issues.length === 0,
    errors,
    warnings,
    issues,
  };
}
