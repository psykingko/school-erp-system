/**
 * persistence/storageKeys.js
 * Centralized storage key constants for the EduDash ERP.
 * All localStorage keys must be defined here to avoid typos and ensure consistency.
 */

export const STORAGE_KEYS = {
  // Authentication
  AUTH_STATE: "edudash_auth_state",

  // Core Entities
  STUDENTS: "erp_students",
  TEACHERS: "erp_teachers",
  PARENTS: "erp_parents",
  AUTH_USERS: "erp_authUsers",
  EMPLOYEES: "erp_employees",
  APPROVAL_SETTINGS: "erp_approvalSettings",
  CLASSES: "erp_classes",
  SUBJECTS: "erp_subjects",
  STREAMS: "erp_streams",

  // Academic
  TEACHER_SUBJECT_ASSIGNMENTS: "erp_teacherSubjectAssignments",
  DAILY_ATTENDANCE: "erp_dailyAttendance",
  ATTENDANCE_SESSIONS: "erp_attendanceSessions",
  EXAMS: "erp_exams",
  EXAM_PAPERS: "erp_exam_papers",
  QUESTION_PAPERS: "erp_question_papers_v2",
  RESULTS: "erp_results",
  ASSIGNMENTS: "erp_assignments",
  SUBMISSIONS: "erp_submissions",
  PERIODS: "erp_periods",
  ROOMS: "erp_rooms",
  ACADEMIC_CALENDAR: "erp_academicCalendar",
  TIMETABLES: "erp_timetables_v2",

  // Finance
  FEES: "erp_fees",
  INVOICES: "erp_invoices",
  RECEIPTS: "erp_receipts",
  FEE_STRUCTURES: "erp_fee_structures",

  // Transport
  TRANSPORT_ROUTES: "erp_transportRoutes",
  TRANSPORT_VEHICLES: "erp_transportVehicles",
  TRANSPORT_DRIVERS: "erp_transportDrivers",
  TRANSPORT_ASSIGNMENTS: "erp_transportAssignments",
  TRANSPORT_ALERTS: "erp_transportAlerts",
  TRANSPORT_STOPS: "erp_transportStops",
  TRANSPORT_ALLOCATIONS: "erp_transportAllocations",

  // Documents
  DOCUMENTS: "erp_documents",
  TEACHER_DOCUMENTS: "erp_teacher_documents",

  // Achievements
  ACHIEVEMENTS: "erp_achievements",

  // Notices & Events
  NOTICES: "erp_notices",
  EVENTS: "erp_events",

  // Clubs
  CLUBS: "erp_clubs",
  CLUB_ENROLLMENTS: "erp_clubEnrollments",
  CLUB_ACTIVITIES: "erp_clubActivities",
  CLUB_COORDINATORS: "erp_clubCoordinators",
  CLUB_UPDATES: "erp_clubUpdates",

  // Mentorship
  MENTOR_REMARKS: "erp_mentorRemarks",
  MENTOR_ASSIGNMENTS: "erp_mentorAssignments",
  MENTOR_SESSIONS: "erp_mentorSessions",

  // Class Updates
  CLASS_UPDATES: "erp_classUpdates",

  // Leave
  LEAVE_REQUESTS: "erp_leaveRequests",

  // Schema Versions (for migration safety)
  STUDENTS_SCHEMA_VERSION: "erp_students_schema_version",
  REMARKS_SCHEMA_VERSION: "erp_remarks_schema_version",
  LEAVE_SCHEMA_VERSION: "erp_leave_schema_version",
};

export default STORAGE_KEYS;
