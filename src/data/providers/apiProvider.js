/**
 * apiProvider.js
 *
 * API Data Provider Implementation (Stub for Future Backend)
 *
 * This provider implements the DataProviderInterface using a REST API.
 * This is a STUB implementation for future backend integration.
 *
 * CURRENT STATUS: Placeholder structure only
 * FUTURE: Replace placeholder implementations with actual API calls
 *
 * Example future implementation:
 *   getStudents: async () => {
 *     const response = await apiClient.get("/students");
 *     return response.data;
 *   }
 *
 * IMPORTANT: This provider is NOT currently used.
 * The localProvider is the active runtime.
 * Switch to this provider when backend is ready via providerFactory.
 */

/* eslint-disable no-unused-vars -- Stub implementation with placeholder parameters */
const apiProvider = {
  // === STUDENT DATA ===
  getStudents: async () => {
    // FUTURE: const response = await apiClient.get("/students");
    console.warn("[apiProvider] getStudents: Backend not implemented yet");
    return [];
  },

  getStudentById: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/students/${studentId}`);
    console.warn("[apiProvider] getStudentById: Backend not implemented yet");
    return null;
  },

  updateStudent: async (studentId, updates) => {
    // FUTURE: const response = await apiClient.put(`/students/${studentId}`, updates);
    console.warn("[apiProvider] updateStudent: Backend not implemented yet");
    return null;
  },

  getStudentsByClass: async (classId) => {
    // FUTURE: const response = await apiClient.get(`/students?classId=${classId}`);
    console.warn(
      "[apiProvider] getStudentsByClass: Backend not implemented yet",
    );
    return [];
  },

  // === TEACHER DATA ===
  getTeachers: async () => {
    // FUTURE: const response = await apiClient.get("/teachers");
    console.warn("[apiProvider] getTeachers: Backend not implemented yet");
    return [];
  },

  getTeacherById: async (teacherId) => {
    // FUTURE: const response = await apiClient.get(`/teachers/${teacherId}`);
    console.warn("[apiProvider] getTeacherById: Backend not implemented yet");
    return null;
  },

  updateTeacher: async (teacherId, updates) => {
    // FUTURE: const response = await apiClient.put(`/teachers/${teacherId}`, updates);
    console.warn("[apiProvider] updateTeacher: Backend not implemented yet");
    return null;
  },

  // === CLASS DATA ===
  getClasses: async () => {
    // FUTURE: const response = await apiClient.get("/classes");
    console.warn("[apiProvider] getClasses: Backend not implemented yet");
    return [];
  },

  getClassById: async (classId) => {
    // FUTURE: const response = await apiClient.get(`/classes/${classId}`);
    console.warn("[apiProvider] getClassById: Backend not implemented yet");
    return null;
  },

  updateClass: async (classId, updates) => {
    // FUTURE: const response = await apiClient.put(`/classes/${classId}`, updates);
    console.warn("[apiProvider] updateClass: Backend not implemented yet");
    return null;
  },

  getRooms: async () => {
    console.warn("[apiProvider] getRooms: Backend not implemented yet");
    return [];
  },

  // === SUBJECT DATA ===
  getSubjects: async () => {
    // FUTURE: const response = await apiClient.get("/subjects");
    console.warn("[apiProvider] getSubjects: Backend not implemented yet");
    return [];
  },

  getSubjectById: async (subjectId) => {
    // FUTURE: const response = await apiClient.get(`/subjects/${subjectId}`);
    console.warn("[apiProvider] getSubjectById: Backend not implemented yet");
    return null;
  },

  // === STREAM DATA ===
  getStreams: async () => {
    // FUTURE: const response = await apiClient.get("/streams");
    console.warn("[apiProvider] getStreams: Backend not implemented yet");
    return [];
  },

  getStreamById: async (streamId) => {
    // FUTURE: const response = await apiClient.get(`/streams/${streamId}`);
    console.warn("[apiProvider] getStreamById: Backend not implemented yet");
    return null;
  },

  // === ATTENDANCE DATA ===
  getDailyAttendance: async () => {
    // FUTURE: const response = await apiClient.get("/attendance");
    console.warn(
      "[apiProvider] getDailyAttendance: Backend not implemented yet",
    );
    return [];
  },

  getAttendanceByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/attendance?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getAttendanceByStudent: Backend not implemented yet",
    );
    return [];
  },

  getAttendanceByDate: async (studentId, date) => {
    // FUTURE: const response = await apiClient.get(`/attendance?studentId=${studentId}&date=${date}`);
    console.warn(
      "[apiProvider] getAttendanceByDate: Backend not implemented yet",
    );
    return null;
  },

  getClassAttendance: async (classId, date) => {
    // FUTURE: const response = await apiClient.get(`/attendance?classId=${classId}&date=${date}`);
    console.warn(
      "[apiProvider] getClassAttendance: Backend not implemented yet",
    );
    return [];
  },

  markAttendance: async (record) => {
    // FUTURE: const response = await apiClient.post("/attendance", record);
    console.warn("[apiProvider] markAttendance: Backend not implemented yet");
    return null;
  },

  updateClassAttendance: async (records, classId, date, teacherId) => {
    // FUTURE: const response = await apiClient.put("/attendance/batch", { records, classId, date, teacherId });
    console.warn(
      "[apiProvider] updateClassAttendance: Backend not implemented yet",
    );
    return [];
  },

  getAttendanceSessions: async () => {
    // FUTURE: const response = await apiClient.get("/attendance/sessions");
    console.warn(
      "[apiProvider] getAttendanceSessions: Backend not implemented yet",
    );
    return [];
  },

  getAttendanceSession: async (classId, date) => {
    // FUTURE: const response = await apiClient.get(`/attendance/sessions?classId=${classId}&date=${date}`);
    console.warn(
      "[apiProvider] getAttendanceSession: Backend not implemented yet",
    );
    return null;
  },

  // === ASSIGNMENT DATA ===
  getAssignments: async () => {
    // FUTURE: const response = await apiClient.get("/assignments");
    console.warn("[apiProvider] getAssignments: Backend not implemented yet");
    return [];
  },

  getAssignmentsByClass: async (classId) => {
    // FUTURE: const response = await apiClient.get(`/assignments?classId=${classId}`);
    console.warn(
      "[apiProvider] getAssignmentsByClass: Backend not implemented yet",
    );
    return [];
  },

  getAssignmentsByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/assignments?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getAssignmentsByStudent: Backend not implemented yet",
    );
    return [];
  },

  getAssignmentsByTeacher: async (teacherId) => {
    // FUTURE: const response = await apiClient.get(`/assignments?teacherId=${teacherId}`);
    console.warn(
      "[apiProvider] getAssignmentsByTeacher: Backend not implemented yet",
    );
    return [];
  },

  getAssignmentById: async (assignmentId) => {
    // FUTURE: const response = await apiClient.get(`/assignments/${assignmentId}`);
    console.warn(
      "[apiProvider] getAssignmentById: Backend not implemented yet",
    );
    return null;
  },

  createAssignment: async (assignmentData) => {
    // FUTURE: const response = await apiClient.post("/assignments", assignmentData);
    console.warn("[apiProvider] createAssignment: Backend not implemented yet");
    return null;
  },

  updateAssignment: async (assignmentId, updates) => {
    // FUTURE: const response = await apiClient.put(`/assignments/${assignmentId}`, updates);
    console.warn("[apiProvider] updateAssignment: Backend not implemented yet");
    return null;
  },

  deleteAssignment: async (assignmentId) => {
    // FUTURE: const response = await apiClient.delete(`/assignments/${assignmentId}`);
    console.warn("[apiProvider] deleteAssignment: Backend not implemented yet");
    return false;
  },

  // === SUBMISSION DATA ===
  getSubmissions: async () => {
    // FUTURE: const response = await apiClient.get("/submissions");
    console.warn("[apiProvider] getSubmissions: Backend not implemented yet");
    return [];
  },

  getSubmissionsByAssignment: async (assignmentId) => {
    // FUTURE: const response = await apiClient.get(`/submissions?assignmentId=${assignmentId}`);
    console.warn(
      "[apiProvider] getSubmissionsByAssignment: Backend not implemented yet",
    );
    return [];
  },

  getSubmissionsByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/submissions?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getSubmissionsByStudent: Backend not implemented yet",
    );
    return [];
  },

  getSubmissionById: async (submissionId) => {
    // FUTURE: const response = await apiClient.get(`/submissions/${submissionId}`);
    console.warn(
      "[apiProvider] getSubmissionById: Backend not implemented yet",
    );
    return null;
  },

  createSubmission: async (submissionData) => {
    // FUTURE: const response = await apiClient.post("/submissions", submissionData);
    console.warn("[apiProvider] createSubmission: Backend not implemented yet");
    return null;
  },

  updateSubmission: async (submissionId, updates) => {
    // FUTURE: const response = await apiClient.put(`/submissions/${submissionId}`, updates);
    console.warn("[apiProvider] updateSubmission: Backend not implemented yet");
    return null;
  },

  // === RESULTS/EXAMS DATA ===
  getExams: async () => {
    // FUTURE: const response = await apiClient.get("/exams");
    console.warn("[apiProvider] getExams: Backend not implemented yet");
    return [];
  },

  getExamById: async (examId) => {
    // FUTURE: const response = await apiClient.get(`/exams/${examId}`);
    console.warn("[apiProvider] getExamById: Backend not implemented yet");
    return null;
  },

  getResults: async () => {
    // FUTURE: const response = await apiClient.get("/results");
    console.warn("[apiProvider] getResults: Backend not implemented yet");
    return [];
  },

  getResultsByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/results?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getResultsByStudent: Backend not implemented yet",
    );
    return [];
  },

  getResultsByClass: async (classId) => {
    // FUTURE: const response = await apiClient.get(`/results?classId=${classId}`);
    console.warn(
      "[apiProvider] getResultsByClass: Backend not implemented yet",
    );
    return [];
  },

  createResult: async (resultData) => {
    // FUTURE: const response = await apiClient.post("/results", resultData);
    console.warn("[apiProvider] createResult: Backend not implemented yet");
    return null;
  },

  updateResult: async (resultId, updates) => {
    // FUTURE: const response = await apiClient.put(`/results/${resultId}`, updates);
    console.warn("[apiProvider] updateResult: Backend not implemented yet");
    return null;
  },

  // === LEAVE REQUEST DATA ===
  getLeaveRequests: async () => {
    // FUTURE: const response = await apiClient.get("/leave-requests");
    console.warn("[apiProvider] getLeaveRequests: Backend not implemented yet");
    return [];
  },

  getLeaveRequestsByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/leave-requests?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getLeaveRequestsByStudent: Backend not implemented yet",
    );
    return [];
  },

  getLeaveRequestsForTeacher: async (teacherId) => {
    // FUTURE: const response = await apiClient.get(`/leave-requests?teacherId=${teacherId}`);
    console.warn(
      "[apiProvider] getLeaveRequestsForTeacher: Backend not implemented yet",
    );
    return [];
  },

  getLeaveRequestById: async (leaveId) => {
    // FUTURE: const response = await apiClient.get(`/leave-requests/${leaveId}`);
    console.warn(
      "[apiProvider] getLeaveRequestById: Backend not implemented yet",
    );
    return null;
  },

  createLeaveRequest: async (leaveData) => {
    // FUTURE: const response = await apiClient.post("/leave-requests", leaveData);
    console.warn(
      "[apiProvider] createLeaveRequest: Backend not implemented yet",
    );
    return null;
  },

  updateLeaveRequest: async (leaveId, updates) => {
    // FUTURE: const response = await apiClient.put(`/leave-requests/${leaveId}`, updates);
    console.warn(
      "[apiProvider] updateLeaveRequest: Backend not implemented yet",
    );
    return null;
  },

  // === FINANCE DATA ===
  getInvoices: async () => {
    // FUTURE: const response = await apiClient.get("/invoices");
    console.warn("[apiProvider] getInvoices: Backend not implemented yet");
    return [];
  },

  getInvoicesByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/invoices?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getInvoicesByStudent: Backend not implemented yet",
    );
    return [];
  },

  getReceipts: async () => {
    // FUTURE: const response = await apiClient.get("/receipts");
    console.warn("[apiProvider] getReceipts: Backend not implemented yet");
    return [];
  },

  getReceiptsByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/receipts?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getReceiptsByStudent: Backend not implemented yet",
    );
    return [];
  },

  // === TRANSPORT DATA ===
  getTransportAssignments: async () => {
    // FUTURE: const response = await apiClient.get("/transport/assignments");
    console.warn(
      "[apiProvider] getTransportAssignments: Backend not implemented yet",
    );
    return [];
  },

  getTransportAssignmentByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/transport/assignments?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getTransportAssignmentByStudent: Backend not implemented yet",
    );
    return null;
  },

  getTransportRoutes: async () => {
    // FUTURE: const response = await apiClient.get("/transport/routes");
    console.warn(
      "[apiProvider] getTransportRoutes: Backend not implemented yet",
    );
    return [];
  },

  getTransportRouteById: async (routeId) => {
    // FUTURE: const response = await apiClient.get(`/transport/routes/${routeId}`);
    console.warn(
      "[apiProvider] getTransportRouteById: Backend not implemented yet",
    );
    return null;
  },

  getTransportVehicles: async () => {
    // FUTURE: const response = await apiClient.get("/transport/vehicles");
    console.warn(
      "[apiProvider] getTransportVehicles: Backend not implemented yet",
    );
    return [];
  },

  getTransportVehicleById: async (vehicleId) => {
    // FUTURE: const response = await apiClient.get(`/transport/vehicles/${vehicleId}`);
    console.warn(
      "[apiProvider] getTransportVehicleById: Backend not implemented yet",
    );
    return null;
  },

  getTransportDrivers: async () => {
    // FUTURE: const response = await apiClient.get("/transport/drivers");
    console.warn(
      "[apiProvider] getTransportDrivers: Backend not implemented yet",
    );
    return [];
  },

  getTransportAlerts: async () => {
    // FUTURE: const response = await apiClient.get("/transport/alerts");
    console.warn(
      "[apiProvider] getTransportAlerts: Backend not implemented yet",
    );
    return [];
  },

  // === PARENT DATA ===
  getParents: async () => {
    // FUTURE: const response = await apiClient.get("/parents");
    console.warn("[apiProvider] getParents: Backend not implemented yet");
    return [];
  },

  getParentById: async (parentId) => {
    // FUTURE: const response = await apiClient.get(`/parents/${parentId}`);
    console.warn("[apiProvider] getParentById: Backend not implemented yet");
    return null;
  },

  updateParent: async (parentId, updates) => {
    // FUTURE: const response = await apiClient.put(`/parents/${parentId}`, updates);
    console.warn("[apiProvider] updateParent: Backend not implemented yet");
    return null;
  },

  // === AUTH DATA ===
  getAuthUsers: async () => {
    // FUTURE: const response = await apiClient.get("/auth/users");
    console.warn("[apiProvider] getAuthUsers: Backend not implemented yet");
    return [];
  },

  getAuthUserById: async (authUserId) => {
    // FUTURE: const response = await apiClient.get(`/auth/users/${authUserId}`);
    console.warn("[apiProvider] getAuthUserById: Backend not implemented yet");
    return null;
  },

  getAuthUserByUsername: async (username, role) => {
    // FUTURE: const response = await apiClient.get(`/auth/users?username=${username}&role=${role}`);
    console.warn(
      "[apiProvider] getAuthUserByUsername: Backend not implemented yet",
    );
    return null;
  },

  // === TIMETABLE DATA ===
  getTimetable: async () => {
    // FUTURE: const response = await apiClient.get("/timetable");
    console.warn("[apiProvider] getTimetable: Backend not implemented yet");
    return {};
  },

  setTimetable: async (data) => {
    // FUTURE: const response = await apiClient.put("/timetable", data);
    console.warn("[apiProvider] setTimetable: Backend not implemented yet");
    return null;
  },

  getTimetableSlot: async (classId, day, period) => {
    // FUTURE: const response = await apiClient.get(`/timetable/slots?classId=${classId}&day=${day}&period=${period}`);
    console.warn("[apiProvider] getTimetableSlot: Backend not implemented yet");
    return null;
  },

  setTimetableSlot: async (classId, day, period, slotData) => {
    // FUTURE: const response = await apiClient.put(`/timetable/slots`, { classId, day, period, slotData });
    console.warn("[apiProvider] setTimetableSlot: Backend not implemented yet");
    return null;
  },

  clearTimetableSlot: async (classId, day, period) => {
    // FUTURE: const response = await apiClient.delete(`/timetable/slots?classId=${classId}&day=${day}&period=${period}`);
    console.warn(
      "[apiProvider] clearTimetableSlot: Backend not implemented yet",
    );
    return null;
  },

  // === DOCUMENT DATA ===
  getDocuments: async () => {
    // FUTURE: const response = await apiClient.get("/documents");
    console.warn("[apiProvider] getDocuments: Backend not implemented yet");
    return [];
  },

  getDocumentsByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/documents?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getDocumentsByStudent: Backend not implemented yet",
    );
    return [];
  },

  // === TEACHER/EMPLOYEE DOCUMENTS ===
  getTeacherDocuments: async () => {
    console.warn(
      "[apiProvider] getTeacherDocuments: Backend not implemented yet",
    );
    return [];
  },
  getTeacherDocumentsByTeacher: async (_teacherId) => {
    console.warn(
      "[apiProvider] getTeacherDocumentsByTeacher: Backend not implemented yet",
    );
    return [];
  },
  updateTeacherDocument: async (_docId, _updates) => {
    console.warn(
      "[apiProvider] updateTeacherDocument: Backend not implemented yet",
    );
    return null;
  },

  // === ACHIEVEMENT DATA ===
  getAchievements: async () => {
    // FUTURE: const response = await apiClient.get("/achievements");
    console.warn("[apiProvider] getAchievements: Backend not implemented yet");
    return [];
  },

  getAchievementsByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/achievements?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getAchievementsByStudent: Backend not implemented yet",
    );
    return [];
  },

  // === TEACHER-SUBJECT ASSIGNMENTS ===
  getTeacherSubjectAssignments: async () => {
    // FUTURE: const response = await apiClient.get("/teacher-subject-assignments");
    console.warn(
      "[apiProvider] getTeacherSubjectAssignments: Backend not implemented yet",
    );
    return [];
  },

  getTeacherSubjectAssignmentsByTeacher: async (teacherId) => {
    // FUTURE: const response = await apiClient.get(`/teacher-subject-assignments?teacherId=${teacherId}`);
    console.warn(
      "[apiProvider] getTeacherSubjectAssignmentsByTeacher: Backend not implemented yet",
    );
    return [];
  },

  getTeacherSubjectAssignmentsByClass: async (classId) => {
    // FUTURE: const response = await apiClient.get(`/teacher-subject-assignments?classId=${classId}`);
    console.warn(
      "[apiProvider] getTeacherSubjectAssignmentsByClass: Backend not implemented yet",
    );
    return [];
  },

  updateTeacherSubjectAssignment: async (assignmentId, updates) => {
    // FUTURE: const response = await apiClient.patch(`/teacher-subject-assignments/${assignmentId}`, updates);
    console.warn(
      "[apiProvider] updateTeacherSubjectAssignment: Backend not implemented yet",
    );
    return null;
  },

  createTeacherSubjectAssignment: async (assignmentData) => {
    // FUTURE: const response = await apiClient.post("/teacher-subject-assignments", assignmentData);
    console.warn(
      "[apiProvider] createTeacherSubjectAssignment: Backend not implemented yet",
    );
    return null;
  },

  deleteTeacherSubjectAssignment: async (assignmentId) => {
    // FUTURE: const response = await apiClient.delete(`/teacher-subject-assignments/${assignmentId}`);
    console.warn(
      "[apiProvider] deleteTeacherSubjectAssignment: Backend not implemented yet",
    );
    return false;
  },

  // === MENTOR ASSIGNMENTS ===
  getMentorAssignments: async () => {
    // FUTURE: const response = await apiClient.get("/mentor-assignments");
    console.warn(
      "[apiProvider] getMentorAssignments: Backend not implemented yet",
    );
    return [];
  },

  getMentorAssignmentsByMentor: async (mentorId) => {
    // FUTURE: const response = await apiClient.get(`/mentor-assignments?mentorId=${mentorId}`);
    console.warn(
      "[apiProvider] getMentorAssignmentsByMentor: Backend not implemented yet",
    );
    return [];
  },

  getMentorAssignmentsByStudent: async (studentId) => {
    // FUTURE: const response = await apiClient.get(`/mentor-assignments?studentId=${studentId}`);
    console.warn(
      "[apiProvider] getMentorAssignmentsByStudent: Backend not implemented yet",
    );
    return [];
  },

  // === FEE STRUCTURE ===
  getFeeStructures: async () => {
    console.warn("[apiProvider] getFeeStructures: Backend not implemented yet");
    return [];
  },
  getFeeStructureById: async (_id) => {
    console.warn(
      "[apiProvider] getFeeStructureById: Backend not implemented yet",
    );
    return null;
  },
  updateFeeStructure: async (_id, _updates) => {
    console.warn(
      "[apiProvider] updateFeeStructure: Backend not implemented yet",
    );
    return null;
  },

  // === FINANCE WRITE ===
  getFees: async () => {
    console.warn("[apiProvider] getFees: Backend not implemented yet");
    return [];
  },
  getFeesByStudent: async (_studentId) => {
    console.warn("[apiProvider] getFeesByStudent: Backend not implemented yet");
    return [];
  },
  updateFee: async (_feeId, _updates) => {
    console.warn("[apiProvider] updateFee: Backend not implemented yet");
    return null;
  },

  // === EXAMS WRITE ===
  createExam: async (_examData) => {
    console.warn("[apiProvider] createExam: Backend not implemented yet");
    return null;
  },

  updateExam: async (_examId, _updates) => {
    console.warn("[apiProvider] updateExam: Backend not implemented yet");
    return null;
  },

  deleteExam: async (_examId) => {
    console.warn("[apiProvider] deleteExam: Backend not implemented yet");
    return false;
  },

  getExamPapers: async () => {
    console.warn("[apiProvider] getExamPapers: Backend not implemented yet");
    return [];
  },

  getExamPapersBySession: async (_sessionId) => {
    console.warn(
      "[apiProvider] getExamPapersBySession: Backend not implemented yet",
    );
    return [];
  },

  getExamPaperById: async (_paperId) => {
    console.warn("[apiProvider] getExamPaperById: Backend not implemented yet");
    return null;
  },

  createExamPaper: async (_paperData) => {
    console.warn("[apiProvider] createExamPaper: Backend not implemented yet");
    return null;
  },

  updateExamPaper: async (_paperId, _updates) => {
    console.warn("[apiProvider] updateExamPaper: Backend not implemented yet");
    return null;
  },

  deleteExamPaper: async (_paperId) => {
    console.warn("[apiProvider] deleteExamPaper: Backend not implemented yet");
    return false;
  },

  // === ACHIEVEMENT WRITE ===
  createAchievement: async (_achievementData) => {
    return Promise.reject(
      new Error(
        "[apiProvider] createAchievement: Backend not implemented yet",
      ),
    );
  },

  updateAchievement: async (_id, _data) => {
    return Promise.reject(
      new Error(
        "[apiProvider] updateAchievement: Backend not implemented yet",
      ),
    );
  },

  deleteAchievement: async (_id) => {
    return Promise.reject(
      new Error(
        "[apiProvider] deleteAchievement: Backend not implemented yet",
      ),
    );
  },

  // === NOTICES & EVENTS WRITE ===
  createNotice: async (_noticeData) => {
    console.warn("[apiProvider] createNotice: Backend not implemented yet");
    return null;
  },
  createEvent: async (_eventData) => {
    console.warn("[apiProvider] createEvent: Backend not implemented yet");
    return null;
  },

  // === STUDENT DUTY DATA ===
  getStudentDutyRequests: async () => {
    console.warn("[apiProvider] getStudentDutyRequests: Backend not implemented yet");
    return [];
  },
  getStudentDutyRequestById: async (_id) => {
    console.warn("[apiProvider] getStudentDutyRequestById: Backend not implemented yet");
    return null;
  },
  createStudentDutyRequest: async (_data) => {
    console.warn("[apiProvider] createStudentDutyRequest: Backend not implemented yet");
    return null;
  },
  updateStudentDutyRequest: async (_id, _data) => {
    console.warn("[apiProvider] updateStudentDutyRequest: Backend not implemented yet");
    return null;
  },
  cancelStudentDutyRequest: async (_id) => {
    console.warn("[apiProvider] cancelStudentDutyRequest: Backend not implemented yet");
    return false;
  },
  completeStudentDutyRequest: async (_id) => {
    console.warn("[apiProvider] completeStudentDutyRequest: Backend not implemented yet");
    return false;
  },

  // === ADMIN / SYSTEM ===
  resetSeedData: async () => {
    console.warn("[apiProvider] resetSeedData: Backend not implemented yet");
    return false;
  },
};
/* eslint-enable no-unused-vars */

export default apiProvider;
