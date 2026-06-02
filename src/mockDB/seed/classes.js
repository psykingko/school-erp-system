/**
 * Classes Seed Data - Simplified Demo Structure
 * 
 * Controlled Institutional Sandbox:
 * - Full structure: Nursery → 12, Sections A/B/C/D
 * - Populated data: ONLY Class 10 & 11
 * - 8 classes total: 10-A/B/C/D, 11-A/B/C/D
 * 
 * All classes use canonical level format ("10", "11" not "X", "XI")
 */

import { formatClassName, formatClassLevel } from "../../utils/classIdentity.js";

// Streams for 11th sections
const STREAMS_11 = {
  A: { id: "SCIENCE_NON_MEDICAL", name: "Science Non-Medical" },
  B: { id: "SCIENCE_MEDICAL", name: "Science Medical" },
  C: { id: "COMMERCE", name: "Commerce" },
  D: { id: "HUMANITIES", name: "Humanities" },
};

// Class teachers mapping (will match teacher IDs from teachersSeed)
const CLASS_TEACHERS = {
  "class-10a": "teach-001",
  "class-10b": "teach-002", 
  "class-10c": "teach-003",
  "class-10d": "teach-004",
  "class-11a": "teach-005",
  "class-11b": "teach-006",
  "class-11c": "teach-007",
  "class-11d": "teach-013",
};

/**
 * Generate a class record
 */
const createClass = (level, section) => {
  const classId = `class-${level}${section.toLowerCase()}`;
  const className = formatClassName(level, section);
  const stream = level === "11" ? STREAMS_11[section] : null;
  
  return {
    id: classId,
    classId: classId,
    name: className,
    className: className,
    displayName: stream 
      ? `Class ${formatClassLevel(level)}-${section} (${stream.name})`
      : `Class ${formatClassLevel(level)}-${section}`,
    level: level,
    classLevel: level,
    section: section,
    stage: level === "10" ? "secondary" : "senior_secondary",
    streamId: stream?.id || null,
    streamName: stream?.name || null,
    classTeacherId: CLASS_TEACHERS[classId] || null,
    capacity: 40,
    roomNumber: level === "10" ? `${level}${section}` : `11${section}`,
    floor: level === "10" ? "Second" : "Third",
    hasProjector: true,
    hasSmartBoard: true,
    academicYear: "2025-2026",
    status: "Active",
  };
};

/**
 * Static class records - ONLY populated classes
 */
export const classesSeed = [
  // Class 10 - All sections (Secondary)
  createClass("10", "A"),
  createClass("10", "B"),
  createClass("10", "C"),
  createClass("10", "D"),
  
  // Class 11 - All sections with streams (Senior Secondary)
  createClass("11", "A"),
  createClass("11", "B"),
  createClass("11", "C"),
  createClass("11", "D"),
];

/**
 * Get all available class levels (for filters/dropdowns)
 * Returns full institutional structure even if not all populated
 */
export const getAllClassLevels = () => [
  "Nursery", "LKG", "UKG",
  "1", "2", "3", "4", "5",
  "6", "7", "8", "9", "10",
  "11", "12"
];

/**
 * Get all available sections (for filters/dropdowns)
 */
export const getAllSections = () => ["A", "B", "C", "D"];

export default {
  classesSeed,
  getAllClassLevels,
  getAllSections,
};
