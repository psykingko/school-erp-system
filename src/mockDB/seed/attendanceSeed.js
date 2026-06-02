/**
 * Attendance Seed Data - FLATTENED Structure
 * 
 * Phase 7: Static Attendance Records
 * - 16 students (Class 10 & 11 only)
 * - STATIC data only
 * - NO engines, NO generators
 * - Flattened presentation-friendly format
 */

// ============================================================================
// STATIC ATTENDANCE RECORDS - 16 STUDENTS
// ============================================================================

export const attendanceSeed = [
  // Class 10-A
  {
    studentId: "stud-001",
    studentName: "Arjun Sharma",
    className: "10-A",
    attendancePercentage: 91,
    presentDays: 46,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
  {
    studentId: "stud-002",
    studentName: "Aarohi Verma",
    className: "10-A",
    attendancePercentage: 88,
    presentDays: 44,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
  
  // Class 10-B
  {
    studentId: "stud-003",
    studentName: "Aryan Gupta",
    className: "10-B",
    attendancePercentage: 85,
    presentDays: 42,
    totalDays: 50,
    status: "Average",
    lastUpdated: "2025-05-28",
  },
  {
    studentId: "stud-004",
    studentName: "Ananya Singh",
    className: "10-B",
    attendancePercentage: 94,
    presentDays: 47,
    totalDays: 50,
    status: "Excellent",
    lastUpdated: "2025-05-28",
  },
  
  // Class 10-C
  {
    studentId: "stud-005",
    studentName: "Rohan Kumar",
    className: "10-C",
    attendancePercentage: 78,
    presentDays: 39,
    totalDays: 50,
    status: "Average",
    lastUpdated: "2025-05-28",
  },
  {
    studentId: "stud-006",
    studentName: "Diya Patel",
    className: "10-C",
    attendancePercentage: 92,
    presentDays: 46,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
  
  // Class 10-D
  {
    studentId: "stud-007",
    studentName: "Aditya Reddy",
    className: "10-D",
    attendancePercentage: 89,
    presentDays: 44,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
  {
    studentId: "stud-008",
    studentName: "Ishita Nair",
    className: "10-D",
    attendancePercentage: 86,
    presentDays: 43,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
  
  // Class 11-A (Science Non-Medical)
  {
    studentId: "stud-009",
    studentName: "Vihaan Sharma",
    className: "11-A",
    attendancePercentage: 93,
    presentDays: 46,
    totalDays: 50,
    status: "Excellent",
    lastUpdated: "2025-05-28",
  },
  {
    studentId: "stud-010",
    studentName: "Kavya Verma",
    className: "11-A",
    attendancePercentage: 90,
    presentDays: 45,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
  
  // Class 11-B (Science Medical)
  {
    studentId: "stud-011",
    studentName: "Kabir Gupta",
    className: "11-B",
    attendancePercentage: 87,
    presentDays: 43,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
  {
    studentId: "stud-012",
    studentName: "Myra Singh",
    className: "11-B",
    attendancePercentage: 95,
    presentDays: 47,
    totalDays: 50,
    status: "Excellent",
    lastUpdated: "2025-05-28",
  },
  
  // Class 11-C (Commerce)
  {
    studentId: "stud-013",
    studentName: "Aarav Kumar",
    className: "11-C",
    attendancePercentage: 84,
    presentDays: 42,
    totalDays: 50,
    status: "Average",
    lastUpdated: "2025-05-28",
  },
  {
    studentId: "stud-014",
    studentName: "Navya Patel",
    className: "11-C",
    attendancePercentage: 91,
    presentDays: 45,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
  
  // Class 11-D (Humanities)
  {
    studentId: "stud-015",
    studentName: "Reyansh Reddy",
    className: "11-D",
    attendancePercentage: 82,
    presentDays: 41,
    totalDays: 50,
    status: "Average",
    lastUpdated: "2025-05-28",
  },
  {
    studentId: "stud-016",
    studentName: "Prisha Nair",
    className: "11-D",
    attendancePercentage: 89,
    presentDays: 44,
    totalDays: 50,
    status: "Good",
    lastUpdated: "2025-05-28",
  },
];

// ============================================================================
// QUICK LOOKUP HELPERS
// ============================================================================

export const getAttendanceByStudentId = (studentId) => 
  attendanceSeed.find(a => a.studentId === studentId);

export const getAttendanceByClass = (className) => 
  attendanceSeed.filter(a => a.className === className);

export const getClassAttendanceStats = (className) => {
  const classAttendance = getAttendanceByClass(className);
  if (classAttendance.length === 0) return null;
  
  const avgPercentage = (classAttendance.reduce((sum, a) => sum + a.attendancePercentage, 0) / classAttendance.length).toFixed(1);
  return {
    className,
    studentCount: classAttendance.length,
    averageAttendance: parseFloat(avgPercentage),
    below75: classAttendance.filter(a => a.attendancePercentage < 75).length,
  };
};

export default {
  attendanceSeed,
  getAttendanceByStudentId,
  getAttendanceByClass,
  getClassAttendanceStats,
};
