/**
 * providerInterface.js
 *
 * Data Provider Interface Contract
 *
 * This defines the stable interface that all data providers must implement.
 * Services consume this interface, NOT storage directly.
 *
 * Providers can be swapped (localStorage vs API) without service changes.
 *
 * IMPLEMENTATION RULES:
 * - All methods must be async (future API compatibility)
 * - Return types must match exactly between localProvider and apiProvider
 * - Error handling must be consistent
 * - No storage-specific assumptions in signatures
 */

/* eslint-disable no-unused-vars */
export const DataProviderInterface = {
  // === STUDENT DATA ===
  getStudents: async () => [],
  getStudentById: async (_studentId) => null,
  addStudent: async (_studentData) => null,
  updateStudent: async (_studentId, _updates) => null,
  getStudentsByClass: async (_classId) => [],

  // === TEACHER DATA ===
  getTeachers: async () => [],
  getTeacherById: async (_teacherId) => null,
  updateTeacher: async (_teacherId, _updates) => null,

  // === CLASS DATA ===
  getClasses: async () => [],
  getClassById: async (_classId) => null,
  updateClass: async (_classId, _updates) => null,
  getRooms: async () => [],

  // === SUBJECT DATA ===
  getSubjects: async () => [],
  getSubjectById: async (_subjectId) => null,

  // === STREAM DATA ===
  getStreams: async () => [],
  getStreamById: async (_streamId) => null,

  // === ATTENDANCE DATA ===
  getDailyAttendance: async () => [],
  getAttendanceByStudent: async (_studentId) => [],
  getAttendanceByDate: async (_studentId, _date) => null,
  getClassAttendance: async (_classId, _date) => [],
  markAttendance: async (_record) => null,
  updateClassAttendance: async (_records, _classId, _date, _teacherId) => [],
  getAttendanceSessions: async () => [],
  getAttendanceSession: async (_classId, _date) => null,

  // === STAFF ATTENDANCE DATA ===
  getStaffDailyAttendance: async () => [],
  getStaffAttendanceByEmployee: async (_employeeId) => [],
  getStaffAttendanceByDate: async (_employeeId, _date) => null,
  getStaffAttendanceByDepartment: async (_departmentId, _date) => [],
  markStaffAttendance: async (_record) => null,
  updateStaffAttendanceBulk: async (_records) => [],


  // === ASSIGNMENT DATA ===
  getAssignments: async () => [],
  getAssignmentsByClass: async (_classId) => [],
  getAssignmentsByStudent: async (_studentId) => [],
  getAssignmentsByTeacher: async (_teacherId) => [],
  getAssignmentById: async (_assignmentId) => null,
  createAssignment: async (_assignmentData) => null,
  updateAssignment: async (_assignmentId, _updates) => null,
  deleteAssignment: async (_assignmentId) => false,

  // === SUBMISSION DATA ===
  getSubmissions: async () => [],
  getSubmissionsByAssignment: async (_assignmentId) => [],
  getSubmissionsByStudent: async (_studentId) => [],
  getSubmissionById: async (_submissionId) => null,
  createSubmission: async (_submissionData) => null,
  updateSubmission: async (_submissionId, _updates) => null,

  // === RESULTS/EXAMS DATA ===
  getExams: async () => [],
  getExamById: async (_examId) => null,
  createExam: async (_examData) => null,
  updateExam: async (_examId, _updates) => null,
  deleteExam: async (_examId) => false,
  getExamPapers: async () => [],
  getExamPapersBySession: async (_sessionId) => [],
  getExamPaperById: async (_paperId) => null,
  createExamPaper: async (_paperData) => null,
  updateExamPaper: async (_paperId, _updates) => null,
  deleteExamPaper: async (_paperId) => false,
  getResults: async () => [],
  getResultsByStudent: async (_studentId) => [],
  getResultsByClass: async (_classId) => [],
  createResult: async (_resultData) => null,
  updateResult: async (_resultId, _updates) => null,

  // === LEAVE REQUEST DATA ===
  getLeaveRequests: async () => [],
  getLeaveRequestsByStudent: async (_studentId) => [],
  getLeaveRequestsForTeacher: async (_teacherId) => [],
  getLeaveRequestById: async (_leaveId) => null,
  createLeaveRequest: async (_leaveData) => null,
  updateLeaveRequest: async (_leaveId, _updates) => null,

  // === AUTH USERS ===
  getAuthUsers: async () => [],
  getAuthUserById: async (_authUserId) => null,
  getAuthUserByUsername: async (_username, _role) => null,
  getAuthUserByEmployeeId: async (_employeeId) => null,
  createAuthUser: async (_authUserData) => null,
  updateAuthUser: async (_authUserId, _updates) => null,
  deleteAuthUser: async (_authUserId) => false,

  // === PARENT DATA ===
  getParents: async () => [],
  getParentById: async (_parentId) => null,
  createParent: async (_parentData) => null,
  updateParent: async (_parentId, _updates) => null,

  // === FINANCE DATA ===
  getFees: async () => [],
  getFeesByStudent: async (_studentId) => [],
  updateFee: async (_feeId, _updates) => null,
  addFee: async (_feeData) => null,
  getInvoices: async () => [],
  getReceipts: async () => [],
  getInvoicesByStudent: async (_studentId) => [],
  getReceiptsByStudent: async (_studentId) => [],
  getFeeStructures: async () => [],
  getFeeStructureById: async (_id) => null,
  updateFeeStructure: async (_id, _updates) => null,

  // === TRANSPORT DATA ===
  getTransportAssignments: async () => [],
  getTransportAssignmentByStudent: async (_studentId) => null,
  getTransportRoutes: async () => [],
  getTransportRouteById: async (_routeId) => null,
  getTransportVehicles: async () => [],
  getTransportVehicleById: async (_vehicleId) => null,
  getTransportDrivers: async () => [],
  getTransportAlerts: async () => [],



  // === TIMETABLE DATA ===
  getTimetables: async () => [],
  getTimetableByClass: async (_classId) => null,
  setTimetables: async (_dataArray) => null,
  updateTimetable: async (_classId, _updates) => null,
  getTimetableSlot: async (_classId, _day, _period) => null,
  setTimetableSlot: async (_classId, _day, _period, _slotData) => null,
  clearTimetableSlot: async (_classId, _day, _period) => null,

  // === DOCUMENT DATA ===
  getDocuments: async () => [],
  getDocumentsByStudent: async (_studentId) => [],

  // === TEACHER/EMPLOYEE DOCUMENT DATA ===
  getTeacherDocuments: async () => [],
  getTeacherDocumentsByTeacher: async (_teacherId) => [],
  updateTeacherDocument: async (_docId, _updates) => null,

  // === ACHIEVEMENT DATA ===
  getAchievements: async () => [],
  getAchievementsByStudent: async (_studentId) => [],
  createAchievement: async (_achievementData) => null,
  updateAchievement: async (_id, _data) => null,
  deleteAchievement: async (_id) => false,

  // === TEACHER-SUBJECT ASSIGNMENTS ===
  getTeacherSubjectAssignments: async () => [],
  getTeacherSubjectAssignmentsByTeacher: async (_teacherId) => [],
  getTeacherSubjectAssignmentsByClass: async (_classId) => [],
  createTeacherSubjectAssignment: async (_assignmentData) => null,
  updateTeacherSubjectAssignment: async (_assignmentId, _updates) => null,
  deleteTeacherSubjectAssignment: async (_assignmentId) => false,

  // === MENTOR ASSIGNMENTS ===
  getMentorAssignments: async () => [],
  getMentorAssignmentsByMentor: async (_mentorId) => [],
  getMentorAssignmentsByStudent: async (_studentId) => [],

  // === MENTOR SESSIONS ===
  getMentorSessions: async () => [],
  getMentorSessionsByStudent: async (_studentId) => [],
  getMentorSessionsByTeacher: async (_teacherId) => [],
  createMentorSession: async (_sessionData) => ({}),
  updateMentorSession: async (_sessionId, _updates) => ({}),

  // === CLUBS DATA ===
  getClubs: async () => [],
  getClubById: async (_clubId) => ({}),
  getClubEnrollments: async () => [],
  getClubEnrollmentsByStudent: async (_studentId) => [],
  getClubEnrollmentsByClub: async (_clubId) => [],
  createClubEnrollment: async (_enrollmentData) => ({}),
  deleteClubEnrollment: async (_studentId, _clubId) => false,
  getClubActivities: async () => [],
  getClubActivitiesByClub: async (_clubId) => [],
  createClubActivity: async (_activityData) => ({}),
  getClubUpdates: async () => [],
  getClubUpdatesByClub: async (_clubId) => [],
  createClubUpdate: async (_updateData) => ({}),

  // === CLASS UPDATES ===
  getClassUpdates: async () => [],
  getClassUpdatesByTeacher: async (_teacherId) => [],
  getClassUpdatesByClass: async (_classId) => [],
  createClassUpdate: async (_updateData) => ({}),
  deleteClassUpdate: async (_updateId) => false,

  // === NOTICES & EVENTS ===
  getNotices: async () => [],
  getNoticeById: async (_noticeId) => null,
  getEvents: async () => [],
  createNotice: async (_noticeData) => null,
  updateNotice: async (_noticeId, _updates) => null,
  deleteNotice: async (_noticeId) => false,
  markNoticeRead: async (_noticeId, _userId) => null,
  createEvent: async (_eventData) => null,

  // === STUDENT DUTY DATA ===
  getStudentDutyRequests: async () => [],
  getStudentDutyRequestById: async (_id) => null,
  createStudentDutyRequest: async (_data) => null,
  updateStudentDutyRequest: async (_id, _data) => null,
  cancelStudentDutyRequest: async (_id) => false,
  completeStudentDutyRequest: async (_id) => false,

  // === REPORT CARDS ===
  getReportCards: async () => [],
  getReportCardsByClass: async (_classId, _sessionId) => [],
  getReportCardsByStudent: async (_studentId) => [],
  saveReportCards: async (_cards) => [],
  updateReportCard: async (_id, _updates) => null,

  // === ADMIN / SYSTEM ===
  resetSeedData: async () => false,
};
/* eslint-enable no-unused-vars */

/**
 * Validates that a provider implements the required interface
 */
export function validateProvider(provider) {
  const requiredMethods = Object.keys(DataProviderInterface);
  const missing = requiredMethods.filter(
    (method) => typeof provider[method] !== "function",
  );

  if (missing.length > 0) {
    throw new Error(`Provider missing required methods: ${missing.join(", ")}`);
  }

  return true;
}
