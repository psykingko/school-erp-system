/**
 * Timetable Seed Data - Static Demo Population
 * 
 * Controlled Institutional Sandbox:
 * - Only populated for Class 10-A/B/C/D and 11-A/B/C/D
 * - 8 periods/day (Mon-Fri)
 * - Static assignments (no dynamic generation)
 */

// Period structure for secondary/senior secondary
const PERIODS = [
  { periodNumber: 1, startTime: "08:00", endTime: "08:50", periodType: "academic" },
  { periodNumber: 2, startTime: "08:50", endTime: "09:40", periodType: "academic" },
  { periodNumber: 3, startTime: "09:40", endTime: "10:30", periodType: "academic" },
  { periodNumber: 4, startTime: "10:30", endTime: "11:20", periodType: "academic" },
  { periodNumber: 5, startTime: "11:50", endTime: "12:40", periodType: "academic" },
  { periodNumber: 6, startTime: "12:40", endTime: "13:30", periodType: "academic" },
  { periodNumber: 7, startTime: "13:30", endTime: "14:20", periodType: "academic" },
  { periodNumber: 8, startTime: "14:20", endTime: "15:10", periodType: "academic" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Subject assignments by class level and section
const CLASS_10_SCHEDULE = {
  A: [
    { day: "Monday",    slots: [{p:1, s:"sub-math", t:"teach-001"}, {p:2, s:"sub-sci", t:"teach-002"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-sst", t:"teach-004"}, {p:5, s:"sub-math", t:"teach-001"}, {p:6, s:"sub-eng", t:"teach-003"}, {p:7, s:"act-games", t:"teach-017"}] },
    { day: "Tuesday",   slots: [{p:1, s:"sub-sci", t:"teach-002"}, {p:2, s:"sub-math", t:"teach-001"}, {p:3, s:"sub-sst", t:"teach-004"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-hin", t:"teach-009"}, {p:6, s:"sub-math", t:"teach-001"}, {p:7, s:"act-art", t:"teach-018"}] },
    { day: "Wednesday", slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-sst", t:"teach-004"}, {p:3, s:"sub-math", t:"teach-001"}, {p:4, s:"sub-sci", t:"teach-002"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-math", t:"teach-001"}] },
    { day: "Thursday",  slots: [{p:1, s:"sub-sst", t:"teach-004"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-sci", t:"teach-002"}, {p:4, s:"sub-math", t:"teach-001"}, {p:5, s:"sub-sci", t:"teach-002"}, {p:6, s:"sub-hin", t:"teach-009"}, {p:7, s:"act-library", t:"teach-018"}] },
    { day: "Friday",    slots: [{p:1, s:"sub-math", t:"teach-001"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-sst", t:"teach-004"}, {p:4, s:"sub-sci", t:"teach-002"}, {p:5, s:"act-games", t:"teach-017"}, {p:6, s:"sub-math", t:"teach-001"}, {p:7, s:"sub-eng", t:"teach-003"}] },
  ],
  B: [
    { day: "Monday",    slots: [{p:1, s:"sub-sci", t:"teach-002"}, {p:2, s:"sub-math", t:"teach-001"}, {p:3, s:"sub-sst", t:"teach-004"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-math", t:"teach-001"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-sci", t:"teach-002"}] },
    { day: "Tuesday",   slots: [{p:1, s:"sub-math", t:"teach-001"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-sci", t:"teach-002"}, {p:4, s:"sub-sst", t:"teach-004"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"sub-hin", t:"teach-009"}, {p:7, s:"act-art", t:"teach-018"}] },
    { day: "Wednesday", slots: [{p:1, s:"sub-sst", t:"teach-004"}, {p:2, s:"sub-sci", t:"teach-002"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-math", t:"teach-001"}, {p:5, s:"sub-math", t:"teach-001"}, {p:6, s:"sub-sci", t:"teach-002"}, {p:7, s:"act-games", t:"teach-017"}] },
    { day: "Thursday",  slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-math", t:"teach-001"}, {p:3, s:"sub-sst", t:"teach-004"}, {p:4, s:"sub-sci", t:"teach-002"}, {p:5, s:"act-library", t:"teach-018"}, {p:6, s:"sub-math", t:"teach-001"}, {p:7, s:"sub-hin", t:"teach-009"}] },
    { day: "Friday",    slots: [{p:1, s:"sub-sci", t:"teach-002"}, {p:2, s:"sub-sst", t:"teach-004"}, {p:3, s:"sub-math", t:"teach-001"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-sci", t:"teach-002"}] },
  ],
  C: [
    { day: "Monday",    slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-math", t:"teach-001"}, {p:3, s:"sub-sci", t:"teach-002"}, {p:4, s:"sub-sst", t:"teach-004"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-math", t:"teach-001"}] },
    { day: "Tuesday",   slots: [{p:1, s:"sub-sst", t:"teach-004"}, {p:2, s:"sub-sci", t:"teach-002"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-math", t:"teach-001"}, {p:5, s:"sub-math", t:"teach-001"}, {p:6, s:"sub-hin", t:"teach-009"}, {p:7, s:"act-art", t:"teach-018"}] },
    { day: "Wednesday", slots: [{p:1, s:"sub-math", t:"teach-001"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-sst", t:"teach-004"}, {p:4, s:"sub-sci", t:"teach-002"}, {p:5, s:"sub-sci", t:"teach-002"}, {p:6, s:"sub-math", t:"teach-001"}, {p:7, s:"act-games", t:"teach-017"}] },
    { day: "Thursday",  slots: [{p:1, s:"sub-sci", t:"teach-002"}, {p:2, s:"sub-sst", t:"teach-004"}, {p:3, s:"sub-math", t:"teach-001"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-hin", t:"teach-009"}, {p:6, s:"act-library", t:"teach-018"}, {p:7, s:"sub-eng", t:"teach-003"}] },
    { day: "Friday",    slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-math", t:"teach-001"}, {p:3, s:"sub-sci", t:"teach-002"}, {p:4, s:"sub-sst", t:"teach-004"}, {p:5, s:"act-games", t:"teach-017"}, {p:6, s:"sub-math", t:"teach-001"}, {p:7, s:"sub-sci", t:"teach-002"}] },
  ],
  D: [
    { day: "Monday",    slots: [{p:1, s:"sub-sst", t:"teach-004"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-math", t:"teach-001"}, {p:4, s:"sub-sci", t:"teach-002"}, {p:5, s:"sub-sci", t:"teach-002"}, {p:6, s:"sub-math", t:"teach-001"}, {p:7, s:"act-games", t:"teach-017"}] },
    { day: "Tuesday",   slots: [{p:1, s:"sub-math", t:"teach-001"}, {p:2, s:"sub-sst", t:"teach-004"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-sci", t:"teach-002"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"act-art", t:"teach-018"}, {p:7, s:"sub-hin", t:"teach-009"}] },
    { day: "Wednesday", slots: [{p:1, s:"sub-sci", t:"teach-002"}, {p:2, s:"sub-math", t:"teach-001"}, {p:3, s:"sub-sst", t:"teach-004"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-math", t:"teach-001"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-eng", t:"teach-003"}] },
    { day: "Thursday",  slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-sci", t:"teach-002"}, {p:3, s:"sub-math", t:"teach-001"}, {p:4, s:"sub-sst", t:"teach-004"}, {p:5, s:"act-library", t:"teach-018"}, {p:6, s:"sub-sci", t:"teach-002"}, {p:7, s:"sub-hin", t:"teach-009"}] },
    { day: "Friday",    slots: [{p:1, s:"sub-math", t:"teach-001"}, {p:2, s:"sub-sci", t:"teach-002"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-sst", t:"teach-004"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-math", t:"teach-001"}] },
  ],
};

// Class 11 - Science Non-Medical (A) & Science Medical (B)
const CLASS_11_SCIENCE_SCHEDULE = {
  A: [ // Science Non-Medical: English, Physics, Chemistry, Math
    { day: "Monday",    slots: [{p:1, s:"sub-phy", t:"teach-005"}, {p:2, s:"sub-math", t:"teach-005"}, {p:3, s:"sub-chem", t:"teach-006"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-phy", t:"teach-005"}, {p:6, s:"sub-math", t:"teach-005"}, {p:7, s:"act-games", t:"teach-017"}] },
    { day: "Tuesday",   slots: [{p:1, s:"sub-chem", t:"teach-006"}, {p:2, s:"sub-phy", t:"teach-005"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-math", t:"teach-005"}, {p:5, s:"sub-cs", t:"teach-012"}, {p:6, s:"sub-phy", t:"teach-005"}, {p:7, s:"act-art", t:"teach-018"}] },
    { day: "Wednesday", slots: [{p:1, s:"sub-math", t:"teach-005"}, {p:2, s:"sub-chem", t:"teach-006"}, {p:3, s:"sub-phy", t:"teach-005"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-chem", t:"teach-006"}] },
    { day: "Thursday",  slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-phy", t:"teach-005"}, {p:3, s:"sub-math", t:"teach-005"}, {p:4, s:"sub-chem", t:"teach-006"}, {p:5, s:"sub-math", t:"teach-005"}, {p:6, s:"sub-cs", t:"teach-012"}, {p:7, s:"act-library", t:"teach-018"}] },
    { day: "Friday",    slots: [{p:1, s:"sub-phy", t:"teach-005"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-chem", t:"teach-006"}, {p:4, s:"sub-math", t:"teach-005"}, {p:5, s:"act-games", t:"teach-017"}, {p:6, s:"sub-phy", t:"teach-005"}, {p:7, s:"sub-chem", t:"teach-006"}] },
  ],
  B: [ // Science Medical: English, Physics, Chemistry, Biology
    { day: "Monday",    slots: [{p:1, s:"sub-phy", t:"teach-005"}, {p:2, s:"sub-bio", t:"teach-010"}, {p:3, s:"sub-chem", t:"teach-006"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-chem", t:"teach-006"}, {p:6, s:"sub-phy", t:"teach-005"}, {p:7, s:"act-games", t:"teach-017"}] },
    { day: "Tuesday",   slots: [{p:1, s:"sub-bio", t:"teach-010"}, {p:2, s:"sub-phy", t:"teach-005"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-chem", t:"teach-006"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"sub-bio", t:"teach-010"}, {p:7, s:"act-art", t:"teach-018"}] },
    { day: "Wednesday", slots: [{p:1, s:"sub-chem", t:"teach-006"}, {p:2, s:"sub-bio", t:"teach-010"}, {p:3, s:"sub-phy", t:"teach-005"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-phy", t:"teach-005"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-chem", t:"teach-006"}] },
    { day: "Thursday",  slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-chem", t:"teach-006"}, {p:3, s:"sub-phy", t:"teach-005"}, {p:4, s:"sub-bio", t:"teach-010"}, {p:5, s:"sub-bio", t:"teach-010"}, {p:6, s:"act-library", t:"teach-018"}, {p:7, s:"sub-eng", t:"teach-003"}] },
    { day: "Friday",    slots: [{p:1, s:"sub-phy", t:"teach-005"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-bio", t:"teach-010"}, {p:4, s:"sub-chem", t:"teach-006"}, {p:5, s:"act-games", t:"teach-017"}, {p:6, s:"sub-chem", t:"teach-006"}, {p:7, s:"sub-bio", t:"teach-010"}] },
  ],
};

// Class 11 - Commerce (C) & Humanities (D)
const CLASS_11_COMM_HUM_SCHEDULE = {
  C: [ // Commerce: English, Accountancy, Business Studies, Economics
    { day: "Monday",    slots: [{p:1, s:"sub-acc", t:"teach-007"}, {p:2, s:"sub-bst", t:"teach-016"}, {p:3, s:"sub-eco", t:"teach-011"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-acc", t:"teach-007"}, {p:6, s:"sub-eco", t:"teach-011"}, {p:7, s:"act-games", t:"teach-017"}] },
    { day: "Tuesday",   slots: [{p:1, s:"sub-bst", t:"teach-016"}, {p:2, s:"sub-acc", t:"teach-007"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-eco", t:"teach-011"}, {p:5, s:"sub-ip", t:"teach-012"}, {p:6, s:"sub-bst", t:"teach-016"}, {p:7, s:"act-art", t:"teach-018"}] },
    { day: "Wednesday", slots: [{p:1, s:"sub-eco", t:"teach-011"}, {p:2, s:"sub-bst", t:"teach-016"}, {p:3, s:"sub-acc", t:"teach-007"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-acc", t:"teach-007"}] },
    { day: "Thursday",  slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-eco", t:"teach-011"}, {p:3, s:"sub-bst", t:"teach-016"}, {p:4, s:"sub-acc", t:"teach-007"}, {p:5, s:"sub-eco", t:"teach-011"}, {p:6, s:"sub-ip", t:"teach-012"}, {p:7, s:"act-library", t:"teach-018"}] },
    { day: "Friday",    slots: [{p:1, s:"sub-acc", t:"teach-007"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-eco", t:"teach-011"}, {p:4, s:"sub-bst", t:"teach-016"}, {p:5, s:"act-games", t:"teach-017"}, {p:6, s:"sub-bst", t:"teach-016"}, {p:7, s:"sub-eco", t:"teach-011"}] },
  ],
  D: [ // Humanities: English, History, Political Science, Geography
    { day: "Monday",    slots: [{p:1, s:"sub-his", t:"teach-013"}, {p:2, s:"sub-pol", t:"teach-014"}, {p:3, s:"sub-geo", t:"teach-015"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-his", t:"teach-013"}, {p:6, s:"sub-geo", t:"teach-015"}, {p:7, s:"act-games", t:"teach-017"}] },
    { day: "Tuesday",   slots: [{p:1, s:"sub-pol", t:"teach-014"}, {p:2, s:"sub-his", t:"teach-013"}, {p:3, s:"sub-eng", t:"teach-003"}, {p:4, s:"sub-geo", t:"teach-015"}, {p:5, s:"sub-eng", t:"teach-003"}, {p:6, s:"sub-his", t:"teach-013"}, {p:7, s:"act-art", t:"teach-018"}] },
    { day: "Wednesday", slots: [{p:1, s:"sub-geo", t:"teach-015"}, {p:2, s:"sub-pol", t:"teach-014"}, {p:3, s:"sub-his", t:"teach-013"}, {p:4, s:"sub-eng", t:"teach-003"}, {p:5, s:"sub-pol", t:"teach-014"}, {p:6, s:"act-games", t:"teach-017"}, {p:7, s:"sub-geo", t:"teach-015"}] },
    { day: "Thursday",  slots: [{p:1, s:"sub-eng", t:"teach-003"}, {p:2, s:"sub-geo", t:"teach-015"}, {p:3, s:"sub-pol", t:"teach-014"}, {p:4, s:"sub-his", t:"teach-013"}, {p:5, s:"sub-his", t:"teach-013"}, {p:6, s:"act-library", t:"teach-018"}, {p:7, s:"sub-eng", t:"teach-003"}] },
    { day: "Friday",    slots: [{p:1, s:"sub-his", t:"teach-013"}, {p:2, s:"sub-eng", t:"teach-003"}, {p:3, s:"sub-geo", t:"teach-015"}, {p:4, s:"sub-pol", t:"teach-014"}, {p:5, s:"act-games", t:"teach-017"}, {p:6, s:"sub-pol", t:"teach-014"}, {p:7, s:"sub-geo", t:"teach-015"}] },
  ],
};

// Build weekly schedule object
const buildWeeklySchedule = (scheduleData) => {
  const weeklySchedule = {};
  
  DAYS.forEach(day => {
    const dayData = scheduleData.find(d => d.day === day);
    const slots = PERIODS.map(period => {
      if (period.periodType === "break") {
        return {
          periodNumber: period.periodNumber,
          startTime: period.startTime,
          endTime: period.endTime,
          periodType: "break",
          subjectId: "break",
          subject: "Lunch Break",
          teacherId: null,
          teacher: null,
        };
      }
      
      const slotData = dayData?.slots.find(s => s.p === period.periodNumber);
      
      // Provide a fallback for period 8 since it's not explicitly defined in the static data for some cases
      const subjectFallback = period.periodNumber === 8 ? "act-library" : null;
      const teacherFallback = period.periodNumber === 8 ? "teach-018" : null;
      
      return {
        periodNumber: `P${period.periodNumber}`,
        startTime: period.startTime,
        endTime: period.endTime,
        periodType: "academic",
        subjectId: slotData?.s || subjectFallback,
        subject: slotData?.s || subjectFallback,
        teacherId: slotData?.t || teacherFallback,
        teacher: slotData?.t || teacherFallback,
      };
    });
    
    weeklySchedule[day] = slots;
  });
  
  return weeklySchedule;
};

// Generate timetable for a class
const createTimetable = (classId, level, section, scheduleData) => {
  return {
    id: `tt-${classId}`,
    classId: classId,
    classLevel: level,
    section: section,
    academicYear: "2025-2026",
    weeklySchedule: buildWeeklySchedule(scheduleData),
    effectiveFrom: "2025-04-01",
    effectiveUntil: "2026-03-31",
    status: "Active",
    createdAt: "2025-04-01T00:00:00Z",
    updatedAt: "2025-04-01T00:00:00Z",
  };
};

// Export static timetables
export const timetableSeed = [
  // Class 10
  createTimetable("class-10a", "10", "A", CLASS_10_SCHEDULE.A),
  createTimetable("class-10b", "10", "B", CLASS_10_SCHEDULE.B),
  createTimetable("class-10c", "10", "C", CLASS_10_SCHEDULE.C),
  createTimetable("class-10d", "10", "D", CLASS_10_SCHEDULE.D),
  
  // Class 11
  createTimetable("class-11a", "11", "A", CLASS_11_SCIENCE_SCHEDULE.A),
  createTimetable("class-11b", "11", "B", CLASS_11_SCIENCE_SCHEDULE.B),
  createTimetable("class-11c", "11", "C", CLASS_11_COMM_HUM_SCHEDULE.C),
  createTimetable("class-11d", "11", "D", CLASS_11_COMM_HUM_SCHEDULE.D),
];

export default {
  timetableSeed,
  PERIODS,
  DAYS,
};
