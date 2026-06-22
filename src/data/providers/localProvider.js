/**
 * localProvider.js
 *
 * Local Storage Data Provider Implementation
 *
 * This provider implements the DataProviderInterface using localStorage.
 * It wraps the existing persistence layer (storage.js) to provide a clean abstraction.
 *
 * This is the CURRENT runtime implementation.
 * In the future, apiProvider.js will replace this for backend integration.
 *
 * IMPORTANT: Services should call provider methods, NOT storage directly.
 */

import { getItem, setItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";

const localProvider = {
  // === STUDENT DATA ===
  getStudents: async () => {
    return getItem(STORAGE_KEYS.STUDENTS) || [];
  },

  getStudentById: async (studentId) => {
    const students = getItem(STORAGE_KEYS.STUDENTS) || [];
    return students.find((s) => s.id === studentId) || null;
  },

  updateStudent: async (studentId, updates) => {
    const students = getItem(STORAGE_KEYS.STUDENTS) || [];
    const idx = students.findIndex((s) => s.id === studentId);
    if (idx === -1) throw new Error("Student not found");
    students[idx] = { ...students[idx], ...updates };
    setItem(STORAGE_KEYS.STUDENTS, students);
    return students[idx];
  },

  getStudentsByClass: async (classId) => {
    const students = getItem(STORAGE_KEYS.STUDENTS) || [];
    return students.filter((s) => s.classId === classId);
  },

  // === TEACHER DATA ===
  getTeachers: async () => {
    const teachers = getItem(STORAGE_KEYS.TEACHERS) || [];
    return teachers.filter(Boolean);
  },

  getTeacherById: async (teacherId) => {
    const teachers = getItem(STORAGE_KEYS.TEACHERS) || [];
    return (
      teachers.find((t) => t.teacherId === teacherId || t.id === teacherId) ||
      null
    );
  },

  updateTeacher: async (teacherId, updates) => {
    const teachers = getItem(STORAGE_KEYS.TEACHERS) || [];
    const idx = teachers.findIndex(
      (t) => t.teacherId === teacherId || t.id === teacherId,
    );
    if (idx === -1) throw new Error("Teacher not found");
    teachers[idx] = { ...teachers[idx], ...updates };
    setItem(STORAGE_KEYS.TEACHERS, teachers);
    return teachers[idx];
  },

  // === CLASS DATA ===
  getClasses: async () => {
    return getItem(STORAGE_KEYS.CLASSES) || [];
  },

  getClassById: async (classId) => {
    const classes = getItem(STORAGE_KEYS.CLASSES) || [];
    return classes.find((c) => c.id === classId) || null;
  },

  updateClass: async (classId, updates) => {
    const classes = getItem(STORAGE_KEYS.CLASSES) || [];
    const idx = classes.findIndex((c) => c.id === classId);
    if (idx === -1) throw new Error("Class not found");
    classes[idx] = { ...classes[idx], ...updates };
    setItem(STORAGE_KEYS.CLASSES, classes);
    return classes[idx];
  },

  getRooms: async () => {
    return getItem(STORAGE_KEYS.ROOMS) || [];
  },

  // === SUBJECT DATA ===
  getSubjects: async () => {
    return getItem(STORAGE_KEYS.SUBJECTS) || [];
  },

  getSubjectById: async (subjectId) => {
    const subjects = getItem(STORAGE_KEYS.SUBJECTS) || [];
    return subjects.find((s) => s.id === subjectId) || null;
  },

  // === STREAM DATA ===
  getStreams: async () => {
    return getItem(STORAGE_KEYS.STREAMS) || [];
  },

  getStreamById: async (streamId) => {
    const streams = getItem(STORAGE_KEYS.STREAMS) || [];
    return streams.find((s) => s.id === streamId) || null;
  },

  // === ATTENDANCE DATA ===
  getDailyAttendance: async () => {
    return getItem(STORAGE_KEYS.DAILY_ATTENDANCE) || [];
  },

  getAttendanceByStudent: async (studentId) => {
    const list = getItem(STORAGE_KEYS.DAILY_ATTENDANCE) || [];
    return list.filter((a) => a.studentId === studentId);
  },

  getAttendanceByDate: async (studentId, date) => {
    const list = getItem(STORAGE_KEYS.DAILY_ATTENDANCE) || [];
    const records = list.filter(
      (a) => a.studentId === studentId && a.date === date,
    );
    return records.length > 0 ? records[0] : null;
  },

  getClassAttendance: async (classId, date) => {
    const list = getItem(STORAGE_KEYS.DAILY_ATTENDANCE) || [];
    return list.filter((a) => a.classId === classId && a.date === date);
  },

  markAttendance: async (record) => {
    const list = getItem(STORAGE_KEYS.DAILY_ATTENDANCE) || [];
    const existingIdx = list.findIndex(
      (a) =>
        a.studentId === record.studentId &&
        a.date === record.date &&
        a.classId === record.classId,
    );

    let returnedRecord;
    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...record };
      returnedRecord = list[existingIdx];
    } else {
      const newRecord = {
        ...record,
        id: `att_${record.studentId}_${record.date}`,
      };
      list.push(newRecord);
      returnedRecord = newRecord;
    }

    setItem(STORAGE_KEYS.DAILY_ATTENDANCE, list);
    return returnedRecord;
  },

  updateClassAttendance: async (records, classId, date, teacherId) => {
    const list = getItem(STORAGE_KEYS.DAILY_ATTENDANCE) || [];
    const results = [];
    const nowStr = new Date().toISOString();

    for (const r of records) {
      const record = {
        studentId: r.studentId,
        classId: r.classId,
        status: r.status,
        markedBy: r.markedBy,
        date: r.date,
        markedAt: r.status !== "UNMARKED" ? nowStr : null,
        attendanceSession: "MORNING",
      };

      const existingIdx = list.findIndex(
        (a) =>
          a.studentId === record.studentId &&
          a.date === record.date &&
          a.classId === record.classId,
      );

      if (existingIdx !== -1) {
        list[existingIdx] = { ...list[existingIdx], ...record };
        results.push(list[existingIdx]);
      } else {
        const newRecord = {
          ...record,
          id: `att_${record.studentId}_${record.date}`,
        };
        list.push(newRecord);
        results.push(newRecord);
      }
    }

    setItem(STORAGE_KEYS.DAILY_ATTENDANCE, list);

    // Submit the session
    const sessions = getItem(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
    const existingSessionIdx = sessions.findIndex(
      (s) => s.classId === classId && s.date === date,
    );
    const sessionRecord = {
      classId,
      date,
      submittedBy: teacherId,
      submittedAt: nowStr,
    };

    if (existingSessionIdx !== -1) {
      sessions[existingSessionIdx] = {
        ...sessions[existingSessionIdx],
        ...sessionRecord,
      };
    } else {
      sessions.push({
        ...sessionRecord,
        id: `sess_${classId}_${date}`,
      });
    }
    setItem(STORAGE_KEYS.ATTENDANCE_SESSIONS, sessions);

    return results;
  },

  getAttendanceSessions: async () => {
    return getItem(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
  },

  getAttendanceSession: async (classId, date) => {
    const list = getItem(STORAGE_KEYS.ATTENDANCE_SESSIONS) || [];
    const sessions = list.filter(
      (s) => s.classId === classId && s.date === date,
    );
    return sessions.length > 0 ? sessions[0] : null;
  },

  // === ASSIGNMENT DATA ===
  getAssignments: async () => {
    return getItem(STORAGE_KEYS.ASSIGNMENTS) || [];
  },

  getAssignmentsByClass: async (classId) => {
    const list = getItem(STORAGE_KEYS.ASSIGNMENTS) || [];
    return list.filter((a) => a.classId === classId);
  },

  getAssignmentsByStudent: async (studentId) => {
    const assignments = getItem(STORAGE_KEYS.ASSIGNMENTS) || [];
    const students = getItem(STORAGE_KEYS.STUDENTS) || [];
    const student = students.find(
      (s) => s.studentId === studentId || s.id === studentId,
    );
    if (!student) return [];

    // Filter by className match (flattened data uses className like "10-A")
    const classAssignments = assignments.filter(
      (a) =>
        a.className === student.className ||
        (a.classLevel === student.classLevel && a.section === student.section),
    );
    return classAssignments;
  },

  getAssignmentsByTeacher: async (teacherId) => {
    const assignments = getItem(STORAGE_KEYS.ASSIGNMENTS) || [];
    return assignments.filter((a) => a.teacherId === teacherId);
  },

  getAssignmentById: async (assignmentId) => {
    const assignments = getItem(STORAGE_KEYS.ASSIGNMENTS) || [];
    return (
      assignments.find(
        (a) => a.assignmentId === assignmentId || a.id === assignmentId,
      ) || null
    );
  },

  createAssignment: async (assignmentData) => {
    const newAssignment = {
      id: `asgn-${Date.now()}`,
      ...assignmentData,
      createdAt: new Date().toISOString(),
    };

    const list = getItem(STORAGE_KEYS.ASSIGNMENTS) || [];
    list.push(newAssignment);
    setItem(STORAGE_KEYS.ASSIGNMENTS, list);
    return newAssignment;
  },

  updateAssignment: async (assignmentId, updates) => {
    const list = getItem(STORAGE_KEYS.ASSIGNMENTS) || [];
    const idx = list.findIndex((a) => a.id === assignmentId);
    if (idx === -1) throw new Error("Assignment not found");

    list[idx] = { ...list[idx], ...updates };
    setItem(STORAGE_KEYS.ASSIGNMENTS, list);
    return list[idx];
  },

  deleteAssignment: async (assignmentId) => {
    const list = getItem(STORAGE_KEYS.ASSIGNMENTS) || [];
    const idx = list.findIndex((a) => a.id === assignmentId);
    if (idx === -1) return false;

    list.splice(idx, 1);

    const submissionsList = getItem(STORAGE_KEYS.SUBMISSIONS) || [];
    const remainingSubmissions = submissionsList.filter(
      (s) => s.assignmentId !== assignmentId,
    );

    setItem(STORAGE_KEYS.SUBMISSIONS, remainingSubmissions);
    setItem(STORAGE_KEYS.ASSIGNMENTS, list);
    return true;
  },

  // === SUBMISSION DATA ===
  getSubmissions: async () => {
    return getItem(STORAGE_KEYS.SUBMISSIONS) || [];
  },

  getSubmissionsByAssignment: async (assignmentId) => {
    const submissions = getItem(STORAGE_KEYS.SUBMISSIONS) || [];
    return submissions.filter((s) => s.assignmentId === assignmentId);
  },

  getSubmissionsByStudent: async (studentId) => {
    const submissions = getItem(STORAGE_KEYS.SUBMISSIONS) || [];
    return submissions.filter((s) => s.studentId === studentId);
  },

  getSubmissionById: async (submissionId) => {
    const submissions = getItem(STORAGE_KEYS.SUBMISSIONS) || [];
    return submissions.find((s) => s.id === submissionId) || null;
  },

  createSubmission: async (submissionData) => {
    const newSubmission = {
      id: `subm-${Date.now()}`,
      ...submissionData,
      submittedAt: new Date().toISOString().split("T")[0],
    };

    const list = getItem(STORAGE_KEYS.SUBMISSIONS) || [];
    const idx = list.findIndex(
      (s) =>
        s.assignmentId === newSubmission.assignmentId &&
        s.studentId === newSubmission.studentId,
    );

    if (idx !== -1) {
      list[idx] = { ...list[idx], ...newSubmission };
    } else {
      list.push(newSubmission);
    }

    setItem(STORAGE_KEYS.SUBMISSIONS, list);
    return newSubmission;
  },

  updateSubmission: async (submissionId, updates) => {
    const list = getItem(STORAGE_KEYS.SUBMISSIONS) || [];
    const idx = list.findIndex((s) => s.id === submissionId);
    if (idx === -1) throw new Error("Submission not found");

    list[idx] = { ...list[idx], ...updates };
    setItem(STORAGE_KEYS.SUBMISSIONS, list);
    return list[idx];
  },

  // === RESULTS/EXAMS DATA ===
  getExams: async () => {
    return getItem(STORAGE_KEYS.EXAMS) || [];
  },

  getExamById: async (examId) => {
    const exams = getItem(STORAGE_KEYS.EXAMS) || [];
    return exams.find((e) => e.examId === examId || e.id === examId) || null;
  },

  getResults: async () => {
    return getItem(STORAGE_KEYS.RESULTS) || [];
  },

  getResultsByStudent: async (studentId) => {
    const results = getItem(STORAGE_KEYS.RESULTS) || [];
    return results.filter((r) => r.studentId === studentId);
  },

  getResultsByClass: async (classId) => {
    const results = getItem(STORAGE_KEYS.RESULTS) || [];
    return results.filter((r) => r.classId === classId);
  },

  createResult: async (resultData) => {
    const newResult = {
      id: `res-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...resultData,
    };

    const results = getItem(STORAGE_KEYS.RESULTS) || [];
    results.push(newResult);
    setItem(STORAGE_KEYS.RESULTS, results);
    return newResult;
  },

  updateResult: async (resultId, updates) => {
    const results = getItem(STORAGE_KEYS.RESULTS) || [];
    const idx = results.findIndex((r) => r.id === resultId);
    if (idx === -1) throw new Error("Result not found");

    results[idx] = { ...results[idx], ...updates };
    setItem(STORAGE_KEYS.RESULTS, results);
    return results[idx];
  },

  // === LEAVE REQUEST DATA ===
  _initializeLeaveRequests: async () => {
    const version = getItem(STORAGE_KEYS.LEAVE_SCHEMA_VERSION);
    if (version === "2") return;
    
    let leaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS) || [];
    const students = getItem(STORAGE_KEYS.STUDENTS) || [];
    
    // 1. Migrate existing old format
    leaves = leaves.map(old => {
      if (old.applicantType) return old;
      
      const st = students.find(s => s.id === old.studentId || s.studentId === old.studentId);
      const studentName = st ? (st.name || `${st.firstName || ''} ${st.lastName || ''}`).trim() : "Unknown Student";
      
      const statusMap = { "PENDING": "Pending", "APPROVED": "Approved", "REJECTED": "Rejected" };
      
      return {
        id: old.id,
        applicantType: "Student",
        applicantId: old.studentId || "unknown",
        applicantName: studentName,
        department: null,
        leaveType: "General Leave",
        fromDate: old.startDate,
        toDate: old.endDate,
        reason: old.reason || "No reason provided",
        status: statusMap[old.status] || "Pending",
        source: "Legacy System",
        approvedBy: old.reviewedBy || null,
        approvedAt: old.reviewedAt || null,
        createdAt: old.appliedAt || new Date().toISOString(),
        updatedAt: old.reviewedAt || old.appliedAt || new Date().toISOString(),
        // Legacy compat fields
        appliedTo: old.appliedTo || null,
        classId: old.classId || null,
      };
    });

    // 2. Add realistic seed data
    const teachers = getItem(STORAGE_KEYS.TEACHERS) || [];
    if (teachers.length >= 3) {
      leaves.push({ id: `leave_seed_t1`, applicantType: "Teacher", applicantId: teachers[0].id || teachers[0].teacherId, applicantName: teachers[0].teacherName || teachers[0].name, department: "Academic Affairs", leaveType: "Paid Leave", fromDate: "2023-11-01", toDate: "2023-11-02", reason: "Personal work", status: "Approved", source: "Teacher Portal", approvedBy: "EMP-001", approvedAt: "2023-10-28T10:00:00Z", createdAt: "2023-10-27T09:00:00Z", updatedAt: "2023-10-28T10:00:00Z" });
      leaves.push({ id: `leave_seed_t2`, applicantType: "Teacher", applicantId: teachers[1].id || teachers[1].teacherId, applicantName: teachers[1].teacherName || teachers[1].name, department: "Academic Affairs", leaveType: "Other", fromDate: "2023-11-15", toDate: "2023-11-16", reason: "Fever", status: "Pending", source: "Teacher Portal", approvedBy: null, approvedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      leaves.push({ id: `leave_seed_t3`, applicantType: "Teacher", applicantId: teachers[2].id || teachers[2].teacherId, applicantName: teachers[2].teacherName || teachers[2].name, department: "Academic Affairs", leaveType: "Paid Leave", fromDate: "2023-12-01", toDate: "2023-12-05", reason: "Family trip", status: "Rejected", source: "Teacher Portal", approvedBy: "EMP-001", approvedAt: "2023-11-20T10:00:00Z", createdAt: "2023-11-19T09:00:00Z", updatedAt: "2023-11-20T10:00:00Z" });
    }

    const employees = getItem(STORAGE_KEYS.EMPLOYEES) || [];
    if (employees.length >= 3) {
      leaves.push({ id: `leave_seed_e1`, applicantType: "Employee", applicantId: employees[0].employeeId, applicantName: employees[0].employeeName, department: "Finance & Accounts", leaveType: "Personal Leave", fromDate: "2023-11-10", toDate: "2023-11-10", reason: "Bank work", status: "Approved", source: "Admin Portal", approvedBy: "EMP-001", approvedAt: "2023-11-05T10:00:00Z", createdAt: "2023-11-04T09:00:00Z", updatedAt: "2023-11-05T10:00:00Z" });
      leaves.push({ id: `leave_seed_e2`, applicantType: "Employee", applicantId: employees[1].employeeId, applicantName: employees[1].employeeName, department: "Administration", leaveType: "Other", fromDate: "2023-11-20", toDate: "2023-11-22", reason: "Medical emergency", status: "Pending", source: "Admin Portal", approvedBy: null, approvedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      leaves.push({ id: `leave_seed_e3`, applicantType: "Employee", applicantId: employees[2].employeeId, applicantName: employees[2].employeeName, department: "IT Infrastructure", leaveType: "Paid Leave", fromDate: "2023-12-10", toDate: "2023-12-11", reason: "Out of station", status: "Approved", source: "Admin Portal", approvedBy: "EMP-001", approvedAt: "2023-12-05T10:00:00Z", createdAt: "2023-12-04T09:00:00Z", updatedAt: "2023-12-05T10:00:00Z" });
    }

    const parents = getItem(STORAGE_KEYS.PARENTS) || [];
    if (parents.length >= 2) {
       leaves.push({ id: `leave_seed_p1`, applicantType: "Student", applicantId: parents[0].childIds?.[0] || "stud-001", applicantName: parents[0].name || "Student 1", department: null, leaveType: "Family Event", fromDate: "2023-11-05", toDate: "2023-11-06", reason: "Attending wedding", status: "Approved", source: "Parent Portal", approvedBy: "TCH-001", approvedAt: "2023-11-01T10:00:00Z", createdAt: "2023-10-31T09:00:00Z", updatedAt: "2023-11-01T10:00:00Z" });
       leaves.push({ id: `leave_seed_p2`, applicantType: "Student", applicantId: parents[1].childIds?.[0] || "stud-002", applicantName: parents[1].name || "Student 2", department: null, leaveType: "Medical", fromDate: "2023-11-25", toDate: "2023-11-26", reason: "Doctor appointment", status: "Pending", source: "Parent Portal", approvedBy: null, approvedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    setItem(STORAGE_KEYS.LEAVE_REQUESTS, leaves);
    setItem(STORAGE_KEYS.LEAVE_SCHEMA_VERSION, "2");
  },

  getLeaveRequests: async () => {
    await localProvider._initializeLeaveRequests();
    return getItem(STORAGE_KEYS.LEAVE_REQUESTS) || [];
  },

  getLeaveRequestsByStudent: async (studentId) => {
    await localProvider._initializeLeaveRequests();
    const leaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS) || [];
    return leaves.filter((l) => l.applicantId === studentId);
  },

  getLeaveRequestsForTeacher: async (teacherId) => {
    await localProvider._initializeLeaveRequests();
    const leaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS) || [];
    return leaves.filter((l) => l.appliedTo === teacherId);
  },

  getLeaveRequestById: async (leaveId) => {
    await localProvider._initializeLeaveRequests();
    const leaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS) || [];
    return leaves.find((l) => l.id === leaveId) || null;
  },

  createLeaveRequest: async (leaveData) => {
    await localProvider._initializeLeaveRequests();
    const newRequest = {
      id: `leave_${Date.now()}`,
      ...leaveData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: leaveData.status || "Pending",
    };

    const leaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS) || [];
    leaves.push(newRequest);
    setItem(STORAGE_KEYS.LEAVE_REQUESTS, leaves);
    return newRequest;
  },

  updateLeaveRequest: async (leaveId, updates) => {
    await localProvider._initializeLeaveRequests();
    const leaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS) || [];
    const idx = leaves.findIndex((l) => l.id === leaveId);
    if (idx === -1) throw new Error("Leave request not found");

    leaves[idx] = { ...leaves[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.LEAVE_REQUESTS, leaves);
    return leaves[idx];
  },

  deleteLeaveRequest: async (leaveId) => {
    await localProvider._initializeLeaveRequests();
    const leaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS) || [];
    const filtered = leaves.filter((l) => l.id !== leaveId);
    if (filtered.length === leaves.length) return false;
    setItem(STORAGE_KEYS.LEAVE_REQUESTS, filtered);
    return true;
  },

  // === FINANCE DATA ===
  getInvoices: async () => {
    return getItem(STORAGE_KEYS.INVOICES) || [];
  },

  getInvoicesByStudent: async (studentId) => {
    const invoices = getItem(STORAGE_KEYS.INVOICES) || [];
    return invoices.filter((inv) => inv.studentId === studentId);
  },

  getReceipts: async () => {
    return getItem(STORAGE_KEYS.RECEIPTS) || [];
  },

  getReceiptsByStudent: async (studentId) => {
    const receipts = getItem(STORAGE_KEYS.RECEIPTS) || [];
    return receipts.filter((rcp) => rcp.studentId === studentId);
  },

  // === TRANSPORT DATA ===
  getTransportAssignments: async () => {
    return getItem(STORAGE_KEYS.TRANSPORT_ASSIGNMENTS) || [];
  },

  getTransportAssignmentByStudent: async (studentId) => {
    const assignments = getItem(STORAGE_KEYS.TRANSPORT_ASSIGNMENTS) || [];
    return assignments.find((ta) => ta.studentId === studentId) || null;
  },

  getTransportRoutes: async () => {
    return getItem(STORAGE_KEYS.TRANSPORT_ROUTES) || [];
  },

  createTransportRoute: async (routeData) => {
    const routes = getItem(STORAGE_KEYS.TRANSPORT_ROUTES) || [];
    const newRoute = {
      ...routeData,
      id: routeData.id || `RT-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    routes.push(newRoute);
    setItem(STORAGE_KEYS.TRANSPORT_ROUTES, routes);
    return newRoute;
  },

  updateTransportRoute: async (id, updates) => {
    const routes = getItem(STORAGE_KEYS.TRANSPORT_ROUTES) || [];
    const idx = routes.findIndex(r => r.id === id);
    if (idx === -1) return null;
    routes[idx] = { ...routes[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.TRANSPORT_ROUTES, routes);
    return routes[idx];
  },

  deleteTransportRoute: async (id) => {
    const routes = getItem(STORAGE_KEYS.TRANSPORT_ROUTES) || [];
    const filtered = routes.filter(r => r.id !== id);
    if (filtered.length === routes.length) return false;
    setItem(STORAGE_KEYS.TRANSPORT_ROUTES, filtered);
    return true;
  },


  getTransportRouteById: async (routeId) => {
    const routes = getItem(STORAGE_KEYS.TRANSPORT_ROUTES) || [];
    return routes.find((r) => r.id === routeId) || null;
  },

  getTransportVehicles: async () => {
    return getItem(STORAGE_KEYS.TRANSPORT_VEHICLES) || [];
  },

  createTransportVehicle: async (vehicleData) => {
    const vehicles = getItem(STORAGE_KEYS.TRANSPORT_VEHICLES) || [];
    const newVehicle = {
      ...vehicleData,
      id: vehicleData.id || `VH-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    vehicles.push(newVehicle);
    setItem(STORAGE_KEYS.TRANSPORT_VEHICLES, vehicles);
    return newVehicle;
  },

  updateTransportVehicle: async (id, updates) => {
    const vehicles = getItem(STORAGE_KEYS.TRANSPORT_VEHICLES) || [];
    const idx = vehicles.findIndex(v => v.id === id || v.vehicleId === id);
    if (idx === -1) return null;
    vehicles[idx] = { ...vehicles[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.TRANSPORT_VEHICLES, vehicles);
    return vehicles[idx];
  },

  deleteTransportVehicle: async (id) => {
    const vehicles = getItem(STORAGE_KEYS.TRANSPORT_VEHICLES) || [];
    const filtered = vehicles.filter(v => v.id !== id && v.vehicleId !== id);
    if (filtered.length === vehicles.length) return false;
    setItem(STORAGE_KEYS.TRANSPORT_VEHICLES, filtered);
    return true;
  },

  getTransportVehicleById: async (vehicleId) => {
    const vehicles = getItem(STORAGE_KEYS.TRANSPORT_VEHICLES) || [];
    return vehicles.find((v) => v.vehicleId === vehicleId || v.id === vehicleId) || null;
  },

  getTransportDrivers: async () => {
    const employees = getItem(STORAGE_KEYS.EMPLOYEES) || [];
    return employees.filter(e => e.designation === "Driver");
  },

  getTransportAlerts: async () => {
    return getItem(STORAGE_KEYS.TRANSPORT_ALERTS) || [];
  },

  createTransportAlert: async (alertData) => {
    const alerts = getItem(STORAGE_KEYS.TRANSPORT_ALERTS) || [];
    const newAlert = {
      ...alertData,
      alertId: alertData.alertId || `al-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    alerts.unshift(newAlert); // newest first
    setItem(STORAGE_KEYS.TRANSPORT_ALERTS, alerts);
    return newAlert;
  },

  deleteTransportAlert: async (alertId) => {
    const alerts = getItem(STORAGE_KEYS.TRANSPORT_ALERTS) || [];
    const filtered = alerts.filter(a => a.alertId !== alertId);
    if (filtered.length === alerts.length) return false;
    setItem(STORAGE_KEYS.TRANSPORT_ALERTS, filtered);
    return true;
  },


  getTransportStops: async () => {
    return getItem(STORAGE_KEYS.TRANSPORT_STOPS) || [];
  },

  getTransportStopsByRoute: async (routeId) => {
    const stops = getItem(STORAGE_KEYS.TRANSPORT_STOPS) || [];
    return stops.filter(s => s.routeId === routeId).sort((a, b) => a.sequence - b.sequence);
  },

  createTransportStop: async (stopData) => {
    const stops = getItem(STORAGE_KEYS.TRANSPORT_STOPS) || [];
    const newStop = {
      ...stopData,
      stopId: stopData.stopId || `STOP-${stopData.routeId}-${Date.now()}`,
    };
    stops.push(newStop);
    setItem(STORAGE_KEYS.TRANSPORT_STOPS, stops);
    return newStop;
  },

  updateTransportStop: async (stopId, updates) => {
    const stops = getItem(STORAGE_KEYS.TRANSPORT_STOPS) || [];
    const idx = stops.findIndex(s => s.stopId === stopId);
    if (idx === -1) return null;
    stops[idx] = { ...stops[idx], ...updates };
    setItem(STORAGE_KEYS.TRANSPORT_STOPS, stops);
    return stops[idx];
  },

  deleteTransportStop: async (stopId) => {
    const stops = getItem(STORAGE_KEYS.TRANSPORT_STOPS) || [];
    const filtered = stops.filter(s => s.stopId !== stopId);
    if (filtered.length === stops.length) return false;
    setItem(STORAGE_KEYS.TRANSPORT_STOPS, filtered);
    return true;
  },

  // === TRANSPORT ALLOCATIONS ===
  getTransportAllocations: async () => {
    return getItem(STORAGE_KEYS.TRANSPORT_ALLOCATIONS) || [];
  },

  getTransportAllocationsByRoute: async (routeId) => {
    const allocations = getItem(STORAGE_KEYS.TRANSPORT_ALLOCATIONS) || [];
    return allocations.filter(a => a.routeId === routeId);
  },

  createTransportAllocation: async (data) => {
    const allocations = getItem(STORAGE_KEYS.TRANSPORT_ALLOCATIONS) || [];
    const newAlloc = {
      ...data,
      allocationId: data.allocationId || `ALLOC-${data.studentId}-${Date.now()}`,
      status: data.status || "ACTIVE"
    };
    allocations.push(newAlloc);
    setItem(STORAGE_KEYS.TRANSPORT_ALLOCATIONS, allocations);
    return newAlloc;
  },

  updateTransportAllocation: async (allocationId, updates) => {
    const allocations = getItem(STORAGE_KEYS.TRANSPORT_ALLOCATIONS) || [];
    const idx = allocations.findIndex(a => a.allocationId === allocationId);
    if (idx === -1) return null;
    allocations[idx] = { ...allocations[idx], ...updates };
    setItem(STORAGE_KEYS.TRANSPORT_ALLOCATIONS, allocations);
    return allocations[idx];
  },

  deleteTransportAllocation: async (allocationId) => {
    const allocations = getItem(STORAGE_KEYS.TRANSPORT_ALLOCATIONS) || [];
    const filtered = allocations.filter(a => a.allocationId !== allocationId);
    if (filtered.length === allocations.length) return false;
    setItem(STORAGE_KEYS.TRANSPORT_ALLOCATIONS, filtered);
    return true;
  },


  getParents: async () => {
    return getItem(STORAGE_KEYS.PARENTS) || [];
  },

  getParentById: async (parentId) => {
    const parents = getItem(STORAGE_KEYS.PARENTS) || [];
    return parents.find((p) => p.id === parentId) || null;
  },

  updateParent: async (parentId, updates) => {
    const parents = getItem(STORAGE_KEYS.PARENTS) || [];
    const idx = parents.findIndex((p) => p.id === parentId);
    if (idx === -1) throw new Error("Parent not found");

    parents[idx] = { ...parents[idx], ...updates };
    setItem(STORAGE_KEYS.PARENTS, parents);
    return parents[idx];
  },

  // === AUTH DATA ===
  getAuthUsers: async () => {
    return getItem(STORAGE_KEYS.AUTH_USERS) || [];
  },

  getAuthUserById: async (authUserId) => {
    const authUsers = getItem(STORAGE_KEYS.AUTH_USERS) || [];
    return authUsers.find((u) => u.id === authUserId) || null;
  },

  getAuthUserByUsername: async (username, role) => {
    const authUsers = getItem(STORAGE_KEYS.AUTH_USERS) || [];
    return (
      authUsers.find((u) => u.username === username && u.role === role) || null
    );
  },

  // === APPROVAL SETTINGS DATA ===
  getApprovalSettings: async () => {
    let settings = getItem(STORAGE_KEYS.APPROVAL_SETTINGS);
    const defaultModules = [
      "Leave Management", 
      "Resource Booking", 
      "Club Proposals",
      "Question Paper Approval",
      "Fee Concession Requests",
      "Transport Route Change",
      "Inventory Requisitions",
      "Disciplinary Actions",
      "Event Organization",
      "Staff Expense Claims",
      "Certificate Issuance",
      "Notice Broadcasts",
      "Achievement Validation",
      "Student Duty Swaps",
      "Attendance Corrections"
    ];
    
    if (!settings || !Array.isArray(settings)) {
      settings = [];
    }

    // Ensure all default modules exist with the correct key `moduleName`
    const normalizedSettings = defaultModules.map(moduleName => {
      // Find existing setting by moduleName or fallback to legacy `module` key if it existed
      const existing = settings.find(s => s.moduleName === moduleName || s.module === moduleName) || {};
      return {
        moduleName,
        approverEmployeeId: existing.approverEmployeeId || null
      };
    });

    setItem(STORAGE_KEYS.APPROVAL_SETTINGS, normalizedSettings);
    return normalizedSettings;
  },

  updateApprovalSetting: async (moduleName, data) => {
    let settings = getItem(STORAGE_KEYS.APPROVAL_SETTINGS) || [];
    const idx = settings.findIndex(s => s.moduleName === moduleName);
    if (idx !== -1) {
      settings[idx] = { ...settings[idx], ...data };
    } else {
      settings.push({ moduleName, ...data });
    }
    setItem(STORAGE_KEYS.APPROVAL_SETTINGS, settings);
    return settings.find(s => s.moduleName === moduleName);
  },

  // === TIMETABLE DATA ===
  getTimetables: async () => {
    const TIMETABLE_KEY = "erp_timetables_v2";
    try {
      let data = getItem(TIMETABLE_KEY) || [];
      let migrated = false;
      
      data = data.map(tt => {
         if (!tt.weeklySchedule) return tt;
         let needsMigration = false;
         Object.values(tt.weeklySchedule).forEach(slots => {
            if (slots.some(s => s.periodNumber === "P9" || s.periodNumber === 9 || s.periodType === "break" || s.subjectId === "break")) {
               needsMigration = true;
            }
         });
         
         if (needsMigration) {
            migrated = true;
            const newSchedule = {};
            Object.entries(tt.weeklySchedule).forEach(([day, slots]) => {
               newSchedule[day] = slots.filter(s => s.periodType !== "break" && s.subjectId !== "break").map(s => {
                  let p = s.periodNumber;
                  if (p === 6 || p === "P6") p = typeof p === "string" ? "P5" : 5;
                  else if (p === 7 || p === "P7") p = typeof p === "string" ? "P6" : 6;
                  else if (p === 8 || p === "P8") p = typeof p === "string" ? "P7" : 7;
                  else if (p === 9 || p === "P9") p = typeof p === "string" ? "P8" : 8;
                  
                  return { ...s, periodNumber: p };
               });
            });
            return { ...tt, weeklySchedule: newSchedule };
         }
         return tt;
      });
      
      if (migrated) {
         setItem(TIMETABLE_KEY, data);
      }
      
      return data;
    } catch {
      return [];
    }
  },

  getTimetableByClass: async (classId) => {
    const timetables = await localProvider.getTimetables();
    return timetables.find((t) => t.classId === classId) || null;
  },

  setTimetables: async (dataArray) => {
    const TIMETABLE_KEY = "erp_timetables_v2";
    try {
      setItem(TIMETABLE_KEY, dataArray);
      return true;
    } catch {
      return false;
    }
  },

  updateTimetable: async (classId, updates) => {
    const TIMETABLE_KEY = "erp_timetables_v2";
    const timetables = await localProvider.getTimetables();
    const idx = timetables.findIndex((t) => t.classId === classId);
    if (idx === -1) return null;

    timetables[idx] = {
      ...timetables[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(TIMETABLE_KEY, timetables);
    return timetables[idx];
  },

  getTimetableSlot: async (classId, day, period) => {
    const timetable = await localProvider.getTimetableByClass(classId);
    if (!timetable || !timetable.weeklySchedule) return null;
    const dayKey = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    const daySchedule = timetable.weeklySchedule[dayKey] || timetable.weeklySchedule[day.toLowerCase()] || [];
    return daySchedule.find((p) => p.periodNumber === period) || null;
  },

  setTimetableSlot: async (classId, day, period, slotData) => {
    const TIMETABLE_KEY = "erp_timetables_v2";
    const timetables = await localProvider.getTimetables();
    let idx = timetables.findIndex((t) => t.classId === classId);

    if (idx === -1) return false;

    const dayKey = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    const daySchedule = timetables[idx].weeklySchedule[dayKey] || [];
    const periodIdx = daySchedule.findIndex((p) => p.periodNumber === period);

    if (periodIdx !== -1) {
      daySchedule[periodIdx] = { ...daySchedule[periodIdx], ...slotData };
    } else {
      daySchedule.push({ periodNumber: period, ...slotData });
    }

    timetables[idx].weeklySchedule[dayKey] = daySchedule;
    timetables[idx].updatedAt = new Date().toISOString();

    setItem(TIMETABLE_KEY, timetables);
    return true;
  },

  clearTimetableSlot: async (classId, day, period) => {
    const TIMETABLE_KEY = "erp_timetables_v2";
    const timetables = await localProvider.getTimetables();
    const idx = timetables.findIndex((t) => t.classId === classId);

    if (idx === -1) return false;

    const dayKey = day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
    let daySchedule = timetables[idx].weeklySchedule[dayKey] || [];

    // Remove the slot entirely
    daySchedule = daySchedule.filter((p) => p.periodNumber !== period);
    timetables[idx].weeklySchedule[dayKey] = daySchedule;
    timetables[idx].updatedAt = new Date().toISOString();

    setItem(TIMETABLE_KEY, timetables);
    return true;
  },

  // === DOCUMENT DATA ===
  getDocuments: async () => {
    return getItem(STORAGE_KEYS.DOCUMENTS) || [];
  },

  updateDocument: async (docId, updates) => {
    const docs = getItem(STORAGE_KEYS.DOCUMENTS) || [];
    const idx = docs.findIndex((d) => d.id === docId);
    if (idx === -1) throw new Error("Document not found");
    docs[idx] = {
      ...docs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.DOCUMENTS, docs);
    return docs[idx];
  },

  getDocumentsByStudent: async (studentId) => {
    const docs = getItem(STORAGE_KEYS.DOCUMENTS) || [];
    return docs.filter((d) => d.studentId === studentId);
  },

  // === ACHIEVEMENT DATA ===
  getAchievements: async () => {
    return getItem(STORAGE_KEYS.ACHIEVEMENTS) || [];
  },

  getAchievementsByStudent: async (studentId) => {
    const achs = getItem(STORAGE_KEYS.ACHIEVEMENTS) || [];
    return achs.filter((a) => a.studentId === studentId);
  },

  createAchievement: async (achievementData) => {
    const newAch = {
      id: `ach-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...achievementData,
    };
    const achs = getItem(STORAGE_KEYS.ACHIEVEMENTS) || [];
    achs.push(newAch);
    setItem(STORAGE_KEYS.ACHIEVEMENTS, achs);
    return newAch;
  },

  // === TEACHER-SUBJECT ASSIGNMENTS ===
  getTeacherSubjectAssignments: async () => {
    return getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS) || [];
  },

  getTeacherSubjectAssignmentsByTeacher: async (teacherId) => {
    const assignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS) || [];
    return assignments.filter((a) => a.teacherId === teacherId);
  },

  getTeacherSubjectAssignmentsByClass: async (classId) => {
    const assignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS) || [];
    return assignments.filter((a) => a.classId === classId);
  },

  updateTeacherSubjectAssignment: async (assignmentId, updates) => {
    const assignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS) || [];
    const idx = assignments.findIndex((a) => a.id === assignmentId);
    if (idx === -1) throw new Error("Assignment not found");
    assignments[idx] = { ...assignments[idx], ...updates };
    setItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, assignments);
    return assignments[idx];
  },

  createTeacherSubjectAssignment: async (assignmentData) => {
    const assignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS) || [];
    const newAssignment = {
      ...assignmentData,
      id:
        assignmentData.id ||
        `tsa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    assignments.push(newAssignment);
    setItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, assignments);
    return newAssignment;
  },

  deleteTeacherSubjectAssignment: async (assignmentId) => {
    const assignments = getItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS) || [];
    const filtered = assignments.filter((a) => a.id !== assignmentId);
    if (filtered.length === assignments.length) return false;
    setItem(STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS, filtered);
    return true;
  },

  // === MENTOR ASSIGNMENTS ===
  getMentorAssignments: async () => {
    return getItem(STORAGE_KEYS.MENTOR_ASSIGNMENTS) || [];
  },
  getMentorAssignmentsByMentor: async (mentorId) => {
    const assignments = getItem(STORAGE_KEYS.MENTOR_ASSIGNMENTS) || [];
    return assignments.filter((ma) => ma.mentorTeacherId === mentorId);
  },
  getMentorAssignmentsByStudent: async (studentId) => {
    const assignments = getItem(STORAGE_KEYS.MENTOR_ASSIGNMENTS) || [];
    return assignments.filter((ma) => ma.studentId === studentId);
  },

  // === MENTOR SESSIONS ===
  getMentorSessions: async () => {
    return getItem(STORAGE_KEYS.MENTOR_SESSIONS) || [];
  },
  getMentorSessionsByStudent: async (studentId) => {
    const sessions = getItem(STORAGE_KEYS.MENTOR_SESSIONS) || [];
    return sessions.filter((ms) => ms.studentId === studentId);
  },
  getMentorSessionsByTeacher: async (teacherId) => {
    const sessions = getItem(STORAGE_KEYS.MENTOR_SESSIONS) || [];
    return sessions.filter((ms) => ms.mentorTeacherId === teacherId);
  },
  createMentorSession: async (sessionData) => {
    const sessions = getItem(STORAGE_KEYS.MENTOR_SESSIONS) || [];
    const newSession = {
      id: `sess-${Date.now()}`,
      ...sessionData,
      createdAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    setItem(STORAGE_KEYS.MENTOR_SESSIONS, sessions);
    return newSession;
  },
  updateMentorSession: async (sessionId, updates) => {
    const sessions = getItem(STORAGE_KEYS.MENTOR_SESSIONS) || [];
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx === -1) throw new Error("Mentor session not found");
    sessions[idx] = {
      ...sessions[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.MENTOR_SESSIONS, sessions);
    return sessions[idx];
  },

  // === CLUBS DATA ===
  getClubs: async () => {
    return getItem(STORAGE_KEYS.CLUBS) || [];
  },
  getClubById: async (clubId) => {
    const clubs = getItem(STORAGE_KEYS.CLUBS) || [];
    return clubs.find((c) => c.id === clubId) || null;
  },
  createClub: async (clubData) => {
    const clubs = getItem(STORAGE_KEYS.CLUBS) || [];
    const newClub = {
      id: clubData.id || `club-${Date.now()}`,
      ...clubData,
      status: clubData.status || "Active",
      createdAt: clubData.createdAt || new Date().toISOString(),
    };
    clubs.push(newClub);
    setItem(STORAGE_KEYS.CLUBS, clubs);
    return newClub;
  },
  updateClub: async (clubId, updates) => {
    const clubs = getItem(STORAGE_KEYS.CLUBS) || [];
    const idx = clubs.findIndex((c) => c.id === clubId);
    if (idx === -1) throw new Error("Club not found");
    clubs[idx] = { ...clubs[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.CLUBS, clubs);
    return clubs[idx];
  },
  _initializeClubEnrollments: async () => {
    let enrollments = getItem(STORAGE_KEYS.CLUB_ENROLLMENTS) || [];
    await localProvider._initializeClubMembershipRequests();
    const requests = getItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS) || [];
    let updated = false;
    requests.forEach(req => {
      if (req.status === "Approved") {
        const exists = enrollments.some(e => e.studentId === req.studentId && e.clubId === req.clubId);
        if (!exists) {
          enrollments.push({
            id: `enroll-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            studentId: req.studentId,
            clubId: req.clubId,
            role: "Member",
            joinedDate: req.decisionDate || req.requestDate || new Date().toISOString().split("T")[0],
            status: "Active"
          });
          updated = true;
        }
      }
    });
    if (updated || enrollments.length === 0) {
      setItem(STORAGE_KEYS.CLUB_ENROLLMENTS, enrollments);
    }
  },

  getClubEnrollments: async () => {
    await localProvider._initializeClubEnrollments();
    return getItem(STORAGE_KEYS.CLUB_ENROLLMENTS) || [];
  },
  getClubEnrollmentsByStudent: async (studentId) => {
    await localProvider._initializeClubEnrollments();
    const enrollments = getItem(STORAGE_KEYS.CLUB_ENROLLMENTS) || [];
    return enrollments.filter((ce) => ce.studentId === studentId);
  },
  getClubEnrollmentsByClub: async (clubId) => {
    await localProvider._initializeClubEnrollments();
    const enrollments = getItem(STORAGE_KEYS.CLUB_ENROLLMENTS) || [];
    return enrollments.filter((ce) => ce.clubId === clubId);
  },
  createClubEnrollment: async (enrollmentData) => {
    const enrollments = getItem(STORAGE_KEYS.CLUB_ENROLLMENTS) || [];
    const newEnrollment = {
      id: `enroll-${Date.now()}`,
      ...enrollmentData,
      joinedDate:
        enrollmentData.joinedDate || new Date().toISOString().split("T")[0],
      status: enrollmentData.status || "Active",
    };
    enrollments.push(newEnrollment);
    setItem(STORAGE_KEYS.CLUB_ENROLLMENTS, enrollments);
    return newEnrollment;
  },
  deleteClubEnrollment: async (studentId, clubId) => {
    const enrollments = getItem(STORAGE_KEYS.CLUB_ENROLLMENTS) || [];
    const idx = enrollments.findIndex(
      (e) => e.studentId === studentId && e.clubId === clubId,
    );
    if (idx === -1) return false;
    enrollments.splice(idx, 1);
    setItem(STORAGE_KEYS.CLUB_ENROLLMENTS, enrollments);
    
    const requests = getItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS) || [];
    let updatedRequests = false;
    requests.forEach(req => {
      if (req.studentId === studentId && req.clubId === clubId && req.status === "Approved") {
        req.status = "Left";
        updatedRequests = true;
      }
    });
    if (updatedRequests) {
      setItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS, requests);
    }
    
    return true;
  },
  getClubActivities: async () => {
    return getItem(STORAGE_KEYS.CLUB_ACTIVITIES) || [];
  },
  getClubActivitiesByClub: async (clubId) => {
    const activities = getItem(STORAGE_KEYS.CLUB_ACTIVITIES) || [];
    return activities.filter((ca) => ca.clubId === clubId);
  },
  createClubActivity: async (activityData) => {
    const activities = getItem(STORAGE_KEYS.CLUB_ACTIVITIES) || [];
    const newActivity = {
      id: `act-${Date.now()}`,
      ...activityData,
      createdAt: new Date().toISOString(),
    };
    activities.push(newActivity);
    setItem(STORAGE_KEYS.CLUB_ACTIVITIES, activities);
    return newActivity;
  },
  getClubUpdates: async () => {
    return getItem(STORAGE_KEYS.CLUB_UPDATES) || [];
  },
  getClubUpdatesByClub: async (clubId) => {
    const updates = getItem(STORAGE_KEYS.CLUB_UPDATES) || [];
    return updates.filter((cu) => cu.clubId === clubId);
  },
  createClubUpdate: async (updateData) => {
    const updates = getItem(STORAGE_KEYS.CLUB_UPDATES) || [];
    const newUpdate = {
      id: `clupd-${Date.now()}`,
      ...updateData,
      createdAt: new Date().toISOString(),
    };
    updates.push(newUpdate);
    setItem(STORAGE_KEYS.CLUB_UPDATES, updates);
    return newUpdate;
  },

  // === CLASS UPDATES ===
  getClassUpdates: async () => {
    return getItem(STORAGE_KEYS.CLASS_UPDATES) || [];
  },
  getClassUpdatesByTeacher: async (teacherId) => {
    const updates = getItem(STORAGE_KEYS.CLASS_UPDATES) || [];
    return updates.filter((u) => u.teacherId === teacherId);
  },
  getClassUpdatesByClass: async (classId) => {
    const updates = getItem(STORAGE_KEYS.CLASS_UPDATES) || [];
    return updates.filter((u) => u.classId === classId);
  },
  createClassUpdate: async (updateData) => {
    const updates = getItem(STORAGE_KEYS.CLASS_UPDATES) || [];
    const newUpdate = {
      id:
        updateData.id ||
        `upd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...updateData,
      createdAt: new Date().toISOString(),
    };
    updates.push(newUpdate);
    setItem(STORAGE_KEYS.CLASS_UPDATES, updates);
    return newUpdate;
  },
  deleteClassUpdate: async (updateId) => {
    const updates = getItem(STORAGE_KEYS.CLASS_UPDATES) || [];
    const idx = updates.findIndex((u) => u.id === updateId);
    if (idx === -1) return false;
    updates.splice(idx, 1);
    setItem(STORAGE_KEYS.CLASS_UPDATES, updates);
    return true;
  },

  // === NOTICES & EVENTS ===
  getNotices: async () => {
    return getItem(STORAGE_KEYS.NOTICES) || [];
  },
  getNoticeById: async (noticeId) => {
    const notices = getItem(STORAGE_KEYS.NOTICES) || [];
    return notices.find((n) => n.id === noticeId) || null;
  },
  getEvents: async () => {
    return getItem(STORAGE_KEYS.EVENTS) || [];
  },

  createNotice: async (noticeData) => {
    const newNotice = {
      id: `notice-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...noticeData,
    };
    const notices = getItem(STORAGE_KEYS.NOTICES) || [];
    notices.push(newNotice);
    setItem(STORAGE_KEYS.NOTICES, notices);
    return newNotice;
  },

  updateNotice: async (noticeId, updates) => {
    const notices = getItem(STORAGE_KEYS.NOTICES) || [];
    const idx = notices.findIndex((n) => n.id === noticeId);
    if (idx === -1) throw new Error("Notice not found");
    notices[idx] = { ...notices[idx], ...updates };
    setItem(STORAGE_KEYS.NOTICES, notices);
    return notices[idx];
  },

  deleteNotice: async (noticeId) => {
    const notices = getItem(STORAGE_KEYS.NOTICES) || [];
    const filtered = notices.filter((n) => n.id !== noticeId);
    if (filtered.length === notices.length) return false;
    setItem(STORAGE_KEYS.NOTICES, filtered);
    return true;
  },

  markNoticeRead: async (noticeId, userId) => {
    const notices = getItem(STORAGE_KEYS.NOTICES) || [];
    const idx = notices.findIndex((n) => n.id === noticeId);
    if (idx === -1) throw new Error("Notice not found");

    const notice = notices[idx];
    const existingReceipt = notice.readReceipts?.find(
      (r) => r.userId === userId,
    );
    if (existingReceipt) return notice; // Already read

    const updatedReceipts = [
      ...(notice.readReceipts || []),
      { userId, readAt: new Date().toISOString() },
    ];

    notices[idx] = { ...notice, readReceipts: updatedReceipts };
    setItem(STORAGE_KEYS.NOTICES, notices);
    return notices[idx];
  },

  createEvent: async (eventData) => {
    const newEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...eventData,
    };
    const events = getItem(STORAGE_KEYS.EVENTS) || [];
    events.push(newEvent);
    setItem(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  },

  // === EXAMS WRITE ===
  createExam: async (examData) => {
    const newExam = {
      id: `exam-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...examData,
    };
    const exams = getItem(STORAGE_KEYS.EXAMS) || [];
    exams.push(newExam);
    setItem(STORAGE_KEYS.EXAMS, exams);
    return newExam;
  },

  updateExam: async (examId, updates) => {
    const exams = getItem(STORAGE_KEYS.EXAMS) || [];
    const idx = exams.findIndex((e) => e.id === examId);
    if (idx === -1) throw new Error("Exam session not found");
    exams[idx] = { ...exams[idx], ...updates };
    setItem(STORAGE_KEYS.EXAMS, exams);
    return exams[idx];
  },

  deleteExam: async (examId) => {
    const exams = getItem(STORAGE_KEYS.EXAMS) || [];
    const filteredExams = exams.filter((e) => e.id !== examId);
    if (filteredExams.length === exams.length) return false;

    // Cascade delete papers
    const papers = getItem(STORAGE_KEYS.EXAM_PAPERS) || [];
    const remainingPapers = papers.filter((p) => p.examSessionId !== examId);

    setItem(STORAGE_KEYS.EXAMS, filteredExams);
    setItem(STORAGE_KEYS.EXAM_PAPERS, remainingPapers);
    return true;
  },

  getExamPapers: async () => {
    return getItem(STORAGE_KEYS.EXAM_PAPERS) || [];
  },

  getExamPapersBySession: async (sessionId) => {
    const papers = getItem(STORAGE_KEYS.EXAM_PAPERS) || [];
    return papers.filter((p) => p.examSessionId === sessionId);
  },

  getExamPaperById: async (paperId) => {
    const papers = getItem(STORAGE_KEYS.EXAM_PAPERS) || [];
    return papers.find((p) => p.id === paperId) || null;
  },

  createExamPaper: async (paperData) => {
    const newPaper = {
      id: `paper-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      ...paperData,
    };
    const papers = getItem(STORAGE_KEYS.EXAM_PAPERS) || [];
    papers.push(newPaper);
    setItem(STORAGE_KEYS.EXAM_PAPERS, papers);
    return newPaper;
  },

  updateExamPaper: async (paperId, updates) => {
    const papers = getItem(STORAGE_KEYS.EXAM_PAPERS) || [];
    const idx = papers.findIndex((p) => p.id === paperId);
    if (idx === -1) throw new Error("Exam paper not found");
    papers[idx] = { ...papers[idx], ...updates };
    setItem(STORAGE_KEYS.EXAM_PAPERS, papers);
    return papers[idx];
  },

  deleteExamPaper: async (paperId) => {
    const papers = getItem(STORAGE_KEYS.EXAM_PAPERS) || [];
    const filtered = papers.filter((p) => p.id !== paperId);
    if (filtered.length === papers.length) return false;
    setItem(STORAGE_KEYS.EXAM_PAPERS, filtered);
    return true;
  },

  // === FEE STRUCTURE ===
  getFeeStructures: async () => {
    return getItem(STORAGE_KEYS.FEE_STRUCTURES) || [];
  },

  getFeeStructureById: async (id) => {
    const structures = getItem(STORAGE_KEYS.FEE_STRUCTURES) || [];
    return structures.find((fs) => fs.id === id) || null;
  },

  updateFeeStructure: async (id, updates) => {
    const structures = getItem(STORAGE_KEYS.FEE_STRUCTURES) || [];
    const idx = structures.findIndex((fs) => fs.id === id);
    if (idx === -1) throw new Error("Fee structure not found");
    structures[idx] = {
      ...structures[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.FEE_STRUCTURES, structures);
    return structures[idx];
  },

  // === TEACHER/EMPLOYEE DOCUMENTS ===
  getTeacherDocuments: async () => {
    return getItem(STORAGE_KEYS.TEACHER_DOCUMENTS) || [];
  },

  getTeacherDocumentsByTeacher: async (teacherId) => {
    const docs = getItem(STORAGE_KEYS.TEACHER_DOCUMENTS) || [];
    return docs.filter((d) => d.teacherId === teacherId);
  },

  updateTeacherDocument: async (docId, updates) => {
    const docs = getItem(STORAGE_KEYS.TEACHER_DOCUMENTS) || [];
    const idx = docs.findIndex((d) => d.id === docId);
    if (idx === -1) throw new Error("Teacher document not found");
    docs[idx] = {
      ...docs[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.TEACHER_DOCUMENTS, docs);
    return docs[idx];
  },

  // === FINANCE WRITE ===
  getFees: async () => {
    return getItem(STORAGE_KEYS.FEES) || [];
  },

  getFeesByStudent: async (studentId) => {
    const fees = getItem(STORAGE_KEYS.FEES) || [];
    return fees.filter((f) => f.studentId === studentId);
  },

  updateFee: async (feeId, updates) => {
    const fees = getItem(STORAGE_KEYS.FEES) || [];
    const idx = fees.findIndex((f) => f.id === feeId);
    if (idx === -1) throw new Error("Fee record not found");
    fees[idx] = { ...fees[idx], ...updates };
    setItem(STORAGE_KEYS.FEES, fees);
    return fees[idx];
  },

  // === DEPARTMENTS ===
  getDepartments: async () => {
    let departments = getItem("school_erp_departments") || [];
    if (departments.length === 0) {
      departments = [
        { departmentId: "dept-academics", departmentName: "Academic Affairs", departmentHead: "EMP-002", status: "active", requiredStaff: 12 },
        { departmentId: "dept-examination", departmentName: "Examination & Evaluation", departmentHead: "EMP-003", status: "active", requiredStaff: 4 },
        { departmentId: "dept-student-affairs", departmentName: "Student Affairs", departmentHead: null, status: "active", requiredStaff: 3 },
        { departmentId: "dept-administration", departmentName: "Administration", departmentHead: "EMP-010", status: "active", requiredStaff: 8 },
        { departmentId: "dept-finance", departmentName: "Finance & Accounts", departmentHead: "EMP-001", status: "active", requiredStaff: 5 },
        { departmentId: "dept-transport", departmentName: "Transport Services", departmentHead: "EMP-004", status: "active", requiredStaff: 15 },
        { departmentId: "dept-it", departmentName: "IT Infrastructure", departmentHead: "EMP-009", status: "active", requiredStaff: 3 },
        { departmentId: "dept-facilities", departmentName: "Facilities Management", departmentHead: null, status: "active", requiredStaff: 10 },
        { departmentId: "dept-sports", departmentName: "Sports & Physical Education", departmentHead: null, status: "active", requiredStaff: 4 },
        { departmentId: "dept-library", departmentName: "Library & Information Services", departmentHead: "EMP-008", status: "active", requiredStaff: 2 }
      ];
      setItem("school_erp_departments", departments);
    }
    return departments;
  },

  updateDepartment: async (departmentId, updates) => {
    const departments = await localProvider.getDepartments();
    const idx = departments.findIndex((d) => d.departmentId === departmentId);
    if (idx === -1) throw new Error("Department not found");
    departments[idx] = { ...departments[idx], ...updates };
    setItem("school_erp_departments", departments);
    return departments[idx];
  },

  createDepartment: async (departmentData) => {
    const departments = await localProvider.getDepartments();
    const newDept = {
      ...departmentData,
      departmentId: departmentData.departmentId || `dept-${Date.now()}`
    };
    departments.push(newDept);
    setItem("school_erp_departments", departments);
    return newDept;
  },

  deleteDepartment: async (departmentId) => {
    const departments = await localProvider.getDepartments();
    const filtered = departments.filter((d) => d.departmentId !== departmentId);
    if (filtered.length === departments.length) return false;
    setItem("school_erp_departments", filtered);
    return true;
  },

  // === EMPLOYEES ===
  getEmployees: async () => {
    let employees = getItem(STORAGE_KEYS.EMPLOYEES) || [];
    if (employees.length === 0) {
      employees = [
        { employeeId: "EMP-001", employeeName: "Deepak Joshi", departmentId: "dept-finance", accessLevel: "Super Admin", designation: "HR Manager", phone: "+91-9876543210", email: "deepak.joshi@school.edu", joiningDate: "2023-01-15", status: "active" },
        { employeeId: "EMP-002", employeeName: "Amit Verma", departmentId: "dept-academics", accessLevel: "Administrator", designation: "Academic Coordinator", phone: "+91-9876543211", email: "amit.verma@school.edu", joiningDate: "2023-02-01", status: "active" },
        { employeeId: "EMP-003", employeeName: "Neha Sharma", departmentId: "dept-examination", accessLevel: "Administrator", designation: "Exam Officer", phone: "+91-9876543212", email: "neha.sharma@school.edu", joiningDate: "2023-03-10", status: "active" },
        { employeeId: "EMP-004", employeeName: "Vijay Patel", departmentId: "dept-transport", accessLevel: "Transport Admin", designation: "Transport Coordinator", phone: "+91-9876543213", email: "vijay.patel@school.edu", joiningDate: "2023-04-15", status: "active" },
        { employeeId: "EMP-005", employeeName: "Rajesh Kumar", departmentId: "dept-finance", accessLevel: "Finance Admin", designation: "Finance Executive", phone: "+91-9876543214", email: "rajesh.kumar@school.edu", joiningDate: "2023-05-20", status: "active" },
        { employeeId: "EMP-006", employeeName: "Sunita Singh", departmentId: "dept-finance", accessLevel: "Finance Admin", designation: "Accountant", phone: "+91-9876543215", email: "sunita.singh@school.edu", joiningDate: "2023-06-01", status: "active" },
        { employeeId: "EMP-007", employeeName: "Priya Gupta", departmentId: "dept-administration", accessLevel: "Standard Employee", designation: "Receptionist", phone: "+91-9876543216", email: "priya.gupta@school.edu", joiningDate: "2023-07-10", status: "active" },
        { employeeId: "EMP-008", employeeName: "Lakshmi Mehta", departmentId: "dept-library", accessLevel: "Standard Employee", designation: "Library Officer", phone: "+91-9876543217", email: "lakshmi.mehta@school.edu", joiningDate: "2023-08-05", status: "active" },
        { employeeId: "EMP-009", employeeName: "Krishna Reddy", departmentId: "dept-it", accessLevel: "Super Admin", designation: "IT Support", phone: "+91-9876543218", email: "krishna.reddy@school.edu", joiningDate: "2023-09-12", status: "active", systemAccess: true },
        { employeeId: "EMP-010", employeeName: "Suresh Kumar", departmentId: "dept-administration", accessLevel: "Administrator", designation: "Administrative Executive", phone: "+91-9876543219", email: "suresh.kumar@school.edu", joiningDate: "2023-10-01", status: "active", systemAccess: true, linkedAuthUserId: "auth-admin-001" },
        { employeeId: "EMP-011", employeeName: "Ramesh Chand", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543220", email: "ramesh.chand@school.edu", joiningDate: "2021-04-10", status: "active" },
        { employeeId: "EMP-012", employeeName: "Sunita Devi", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543221", email: "sunita.devi@school.edu", joiningDate: "2021-05-15", status: "active" },
        { employeeId: "EMP-013", employeeName: "Mohammad Ali", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543222", email: "mohammad.ali@school.edu", joiningDate: "2022-01-20", status: "active" },
        { employeeId: "EMP-014", employeeName: "Karan Singh", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543223", email: "karan.singh@school.edu", joiningDate: "2022-03-05", status: "active" },
        { employeeId: "EMP-015", employeeName: "Vikram Yadav", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543224", email: "vikram.yadav@school.edu", joiningDate: "2022-06-11", status: "active" },
        { employeeId: "EMP-016", employeeName: "Rajendra Prasad", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543225", email: "rajendra.prasad@school.edu", joiningDate: "2022-08-14", status: "active" },
        { employeeId: "EMP-017", employeeName: "Sanjay Gupta", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543226", email: "sanjay.gupta@school.edu", joiningDate: "2023-01-10", status: "active" },
        { employeeId: "EMP-018", employeeName: "Manoj Tiwari", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543227", email: "manoj.tiwari@school.edu", joiningDate: "2023-02-18", status: "active" },
        { employeeId: "EMP-019", employeeName: "Balram Jat", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543228", email: "balram.jat@school.edu", joiningDate: "2023-05-22", status: "active" },
        { employeeId: "EMP-020", employeeName: "Deepak Chaurasia", departmentId: "dept-transport", accessLevel: "Standard Employee", designation: "Driver", phone: "+91-9876543229", email: "deepak.c@school.edu", joiningDate: "2023-07-30", status: "active" },
      ];
      setItem(STORAGE_KEYS.EMPLOYEES, employees);
    }
    return employees;
  },

  getEmployeeById: async (employeeId) => {
    const employees = await localProvider.getEmployees();
    return employees.find((e) => e.employeeId === employeeId) || null;
  },

  createEmployee: async (employeeData) => {
    const employees = await localProvider.getEmployees();
    const newEmployee = {
      ...employeeData,
      employeeId: employeeData.employeeId || `EMP-${String(employees.length + 1).padStart(3, "0")}`,
    };
    employees.push(newEmployee);
    setItem(STORAGE_KEYS.EMPLOYEES, employees);
    return newEmployee;
  },

  updateEmployee: async (employeeId, updates) => {
    const employees = await localProvider.getEmployees();
    const idx = employees.findIndex((e) => e.employeeId === employeeId);
    if (idx === -1) throw new Error("Employee not found");
    employees[idx] = { ...employees[idx], ...updates };
    setItem(STORAGE_KEYS.EMPLOYEES, employees);
    return employees[idx];
  },

  deleteEmployee: async (employeeId) => {
    const employees = await localProvider.getEmployees();
    const filtered = employees.filter((e) => e.employeeId !== employeeId);
    if (filtered.length === employees.length) return false;
    setItem(STORAGE_KEYS.EMPLOYEES, filtered);
    return true;
  },


  // === SUPPORT SETTINGS ===
  getSupportSettings: async () => {
    let settings = getItem(STORAGE_KEYS.SUPPORT_SETTINGS) || [];
    if (settings.length === 0) {
      settings = [
        { module: "support_center", handlerEmployeeId: "EMP-001" }
      ];
      setItem(STORAGE_KEYS.SUPPORT_SETTINGS, settings);
    }
    return settings.find(s => s.module === "support_center") || { module: "support_center", handlerEmployeeId: "EMP-001" };
  },

  updateSupportSetting: async (moduleName, updates) => {
    let settings = getItem(STORAGE_KEYS.SUPPORT_SETTINGS) || [];
    const idx = settings.findIndex((s) => s.module === moduleName);
    if (idx === -1) {
      settings.push({ module: moduleName, ...updates });
    } else {
      settings[idx] = { ...settings[idx], ...updates };
    }
    setItem(STORAGE_KEYS.SUPPORT_SETTINGS, settings);
    return settings.find((s) => s.module === moduleName);
  },

  // === SUPPORT CENTER DATA ===
  _initializeSupportRequests: async () => {
    let requests = getItem(STORAGE_KEYS.SUPPORT_REQUESTS);
    // If requests exist and have remarks array (indicating Phase 2 schema), don't re-seed
    if (requests && requests.length > 0 && requests[0].remarks !== undefined) return;

    const students = getItem(STORAGE_KEYS.STUDENTS) || [];
    const teachers = getItem(STORAGE_KEYS.TEACHERS) || [];
    const parents = getItem(STORAGE_KEYS.PARENTS) || [];
    const employees = getItem(STORAGE_KEYS.EMPLOYEES) || [];

    const seedData = [
      {
        id: `req-${Date.now()}-1`,
        requesterType: "Student",
        requesterId: students[0]?.id || "stud-001",
        requesterName: students[0]?.name || "Student 1",
        category: "Help Request",
        title: "Unable to access assignments",
        description: "I am getting an error when I try to open the latest math assignment.",
        priority: "High",
        anonymous: false,
        status: "Open",
        remarks: [],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: `req-${Date.now()}-2`,
        requesterType: "Parent",
        requesterId: parents[0]?.id || "par-001",
        requesterName: parents[0]?.name || "Parent 1",
        category: "Transport Issue",
        title: "Bus consistently arriving late",
        description: "The morning bus has been 15 minutes late for the past week.",
        priority: "High",
        anonymous: false,
        status: "In Review",
        remarks: [
          {
            id: `rmk-${Date.now()}-1`,
            message: "Transport coordinator contacted. Waiting for reply.",
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            createdBy: employees[0]?.employeeId || "EMP-001"
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: `req-${Date.now()}-3`,
        requesterType: "Teacher",
        requesterId: teachers[0]?.id || "teach-001",
        requesterName: teachers[0]?.name || "Teacher 1",
        category: "Complaint",
        title: "Smartboard not working in Room 102",
        description: "The interactive display is not turning on. Needed for my afternoon classes.",
        priority: "High",
        anonymous: true,
        complaintAgainstType: "System",
        complaintAgainstId: "RM-102",
        status: "Resolved",
        remarks: [
          {
            id: `rmk-${Date.now()}-2`,
            message: "IT team dispatched to fix the display.",
            createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
            createdBy: employees[0]?.employeeId || "EMP-001"
          },
          {
            id: `rmk-${Date.now()}-3`,
            message: "Issue resolved. Loose cable reconnected.",
            createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
            createdBy: employees[1]?.employeeId || "EMP-002"
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 8).toISOString()
      },
      {
        id: `req-${Date.now()}-4`,
        requesterType: "Employee",
        requesterId: employees[0]?.employeeId || "emp-001",
        requesterName: employees[0]?.employeeName || "Employee 1",
        category: "Suggestion",
        title: "Improve cafeteria seating",
        description: "Adding more tables to the staff cafeteria would be great.",
        priority: "Low",
        anonymous: false,
        status: "Closed",
        remarks: [
          {
            id: `rmk-${Date.now()}-4`,
            message: "Suggestion noted. Will consider in next quarter budget.",
            createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
            createdBy: employees[0]?.employeeId || "EMP-001"
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 20).toISOString()
      },
      {
        id: `req-${Date.now()}-5`,
        requesterType: "Student",
        requesterId: students[1]?.id || "stud-002",
        requesterName: students[1]?.name || "Student 2",
        category: "Academic Issue",
        title: "Request for extra classes in Chemistry",
        description: "Many students in 10-A are struggling with Organic Chemistry.",
        priority: "Medium",
        anonymous: false,
        status: "Open",
        remarks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `req-${Date.now()}-6`,
        requesterType: "Parent",
        requesterId: parents[1]?.id || "par-002",
        requesterName: parents[1]?.name || "Parent 2",
        category: "Fee Issue",
        title: "Discrepancy in Q2 invoice",
        description: "I was charged for transport but my child uses private vehicle.",
        priority: "High",
        anonymous: false,
        status: "In Review",
        remarks: [
          {
            id: `rmk-${Date.now()}-5`,
            message: "Checking with the finance department.",
            createdAt: new Date().toISOString(),
            createdBy: employees[1]?.employeeId || "EMP-002"
          }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: `req-${Date.now()}-7`,
        requesterType: "Teacher",
        requesterId: teachers[1]?.id || "teach-002",
        requesterName: teachers[1]?.name || "Teacher 2",
        category: "Technical Support",
        title: "ERP Login Issue for some students",
        description: "A few students reported they cannot log into their portal.",
        priority: "High",
        anonymous: false,
        status: "Resolved",
        remarks: [
          {
            id: `rmk-${Date.now()}-6`,
            message: "System cache cleared. Login restored.",
            createdAt: new Date().toISOString(),
            createdBy: employees[0]?.employeeId || "EMP-001"
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: `req-${Date.now()}-8`,
        requesterType: "Student",
        requesterId: students[2]?.id || "stud-003",
        requesterName: students[2]?.name || "Student 3",
        category: "Complaint",
        title: "Noise in library during study hours",
        description: "Junior students are making noise during senior study hours.",
        priority: "Medium",
        anonymous: true,
        complaintAgainstType: "Student",
        complaintAgainstId: "Junior Students",
        status: "In Review",
        remarks: [],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: `req-${Date.now()}-9`,
        requesterType: "Parent",
        requesterId: parents[0]?.id || "par-001",
        requesterName: parents[0]?.name || "Parent 1",
        category: "Feedback",
        title: "Great annual function",
        description: "We really enjoyed the cultural events this year.",
        priority: "Low",
        anonymous: false,
        status: "Closed",
        remarks: [
          {
            id: `rmk-${Date.now()}-7`,
            message: "Thank you for the wonderful feedback!",
            createdAt: new Date(Date.now() - 86400000 * 59).toISOString(),
            createdBy: employees[0]?.employeeId || "EMP-001"
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 59).toISOString()
      },
      {
        id: `req-${Date.now()}-10`,
        requesterType: "Employee",
        requesterId: employees[1]?.employeeId || "emp-002",
        requesterName: employees[1]?.employeeName || "Employee 2",
        category: "Technical Support",
        title: "Printer not working in Admin Block",
        description: "The main printer is out of ink and shows a drum error.",
        priority: "Medium",
        anonymous: false,
        status: "Resolved",
        remarks: [
          {
            id: `rmk-${Date.now()}-8`,
            message: "Ink replaced and drum cleaned.",
            createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
            createdBy: employees[0]?.employeeId || "EMP-001"
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 14).toISOString()
      },
      {
        id: `req-${Date.now()}-11`,
        requesterType: "Student",
        requesterId: students[0]?.id || "stud-001",
        requesterName: students[0]?.name || "Student 1",
        category: "Bug Report",
        title: "Mobile app crashing",
        description: "The app crashes when I try to view my attendance history.",
        priority: "Medium",
        anonymous: false,
        status: "Closed",
        remarks: [
          {
            id: `rmk-${Date.now()}-9`,
            message: "Bug fixed in version 2.1.0.",
            createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
            createdBy: employees[1]?.employeeId || "EMP-002"
          }
        ],
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: `req-${Date.now()}-12`,
        requesterType: "Teacher",
        requesterId: teachers[2]?.id || "teach-003",
        requesterName: teachers[2]?.name || "Teacher 3",
        category: "Academic Issue",
        title: "Need updated syllabus copies",
        description: "Please provide the updated syllabus copies for term 2.",
        priority: "Medium",
        anonymous: false,
        status: "Open",
        remarks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    setItem(STORAGE_KEYS.SUPPORT_REQUESTS, seedData);
  },

  getAllSupportRequests: async () => {
    await localProvider._initializeSupportRequests();
    return getItem(STORAGE_KEYS.SUPPORT_REQUESTS) || [];
  },

  getSupportRequests: async () => {
    await localProvider._initializeSupportRequests();
    return getItem(STORAGE_KEYS.SUPPORT_REQUESTS) || [];
  },

  createSupportRequest: async (data) => {
    await localProvider._initializeSupportRequests();
    const requests = getItem(STORAGE_KEYS.SUPPORT_REQUESTS) || [];
    const newRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...data,
      status: data.status || "Open",
      priority: data.priority || "Medium",
      remarks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    requests.push(newRequest);
    setItem(STORAGE_KEYS.SUPPORT_REQUESTS, requests);
    return newRequest;
  },

  updateSupportRequest: async (id, updates) => {
    await localProvider._initializeSupportRequests();
    const requests = getItem(STORAGE_KEYS.SUPPORT_REQUESTS) || [];
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Support request not found");
    
    requests[idx] = { ...requests[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.SUPPORT_REQUESTS, requests);
    return requests[idx];
  },

  addSupportRemark: async (id, remark) => {
    await localProvider._initializeSupportRequests();
    const requests = getItem(STORAGE_KEYS.SUPPORT_REQUESTS) || [];
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Support request not found");
    
    const newRemark = {
      id: `rmk-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...remark,
      createdAt: new Date().toISOString()
    };

    if (!requests[idx].remarks) requests[idx].remarks = [];
    requests[idx].remarks.push(newRemark);
    requests[idx].updatedAt = new Date().toISOString();
    
    setItem(STORAGE_KEYS.SUPPORT_REQUESTS, requests);
    return requests[idx];
  },
  // === STUDENT DUTY REQUESTS ===
  _initializeStudentDutyRequests: async () => {
    let requests = getItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS);
    if (requests && requests.length > 0) return; // Already initialized

    requests = [];
    const students = getItem(STORAGE_KEYS.STUDENTS) || [];
    const teachers = getItem(STORAGE_KEYS.TEACHERS) || [];

    if (students.length > 0 && teachers.length > 0) {
      const demoTitles = [
        "Football Practice",
        "Assembly Preparation",
        "Science Exhibition Setup",
        "Inter-House Debate Preparation",
        "Library Volunteer Duty",
        "Annual Function Rehearsal",
        "Choir Practice",
        "Basketball Selection",
        "Art Competition Setup",
        "Discipline Committee Meeting",
      ];

      const demoCategories = ["Sports", "Assembly", "Academic", "Academic", "Administrative", "Competition", "Competition", "Sports", "Competition", "Administrative"];

      // Create 10 demo records
      const numRecords = 10;
      for (let i = 0; i < numRecords; i++) {
        const teacher = teachers[i % teachers.length];
        
        // Pick 2-4 random students
        const numStudents = Math.floor(Math.random() * 3) + 2;
        const targetStudents = [];
        for (let j = 0; j < numStudents; j++) {
          const student = students[(i * numStudents + j) % students.length];
          const studentName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student';
          targetStudents.push({
            studentId: student.id || student.studentId,
            studentName: studentName,
            className: student.className || "N/A",
            section: student.section || "N/A",
          });
        }

        const request = {
          id: `duty-${Date.now()}-${i}`,
          title: demoTitles[i % demoTitles.length],
          category: demoCategories[i % demoCategories.length],
          reason: `Official requirement for ${demoTitles[i % demoTitles.length].toLowerCase()}`,
          location: i % 2 === 0 ? "Main Ground" : "Auditorium",
          dutyDate: new Date(Date.now() + i * 86400000).toISOString().split('T')[0], // future dates
          startTime: "10:30",
          endTime: "11:15",
          requestedByTeacherId: teacher.id || teacher.teacherId,
          requestedByTeacherName: teacher.teacherName || teacher.name || "Unknown Teacher",
          targetStudents,
          status: i < 2 ? "Completed" : i === 2 ? "Cancelled" : "Active",
          createdAt: new Date(Date.now() - i * 3600000).toISOString(),
          updatedAt: new Date(Date.now() - i * 3600000).toISOString()
        };
        requests.push(request);
      }
    }
    
    setItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS, requests);
  },

  getStudentDutyRequests: async () => {
    await localProvider._initializeStudentDutyRequests();
    return getItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS) || [];
  },

  getStudentDutyRequestById: async (id) => {
    await localProvider._initializeStudentDutyRequests();
    const requests = getItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS) || [];
    return requests.find(r => r.id === id) || null;
  },

  createStudentDutyRequest: async (data) => {
    await localProvider._initializeStudentDutyRequests();
    const requests = getItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS) || [];
    const newRequest = {
      ...data,
      id: `duty-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: data.status || "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    requests.unshift(newRequest);
    setItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS, requests);
    return newRequest;
  },

  updateStudentDutyRequest: async (id, updates) => {
    await localProvider._initializeStudentDutyRequests();
    const requests = getItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS) || [];
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Duty request not found");
    
    // Status guard
    if (requests[idx].status !== "Active") {
      throw new Error("Only Active duty requests can be edited");
    }

    requests[idx] = { ...requests[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS, requests);
    return requests[idx];
  },

  cancelStudentDutyRequest: async (id) => {
    await localProvider._initializeStudentDutyRequests();
    const requests = getItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS) || [];
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Duty request not found");

    if (requests[idx].status !== "Active") {
      throw new Error("Only Active duty requests can be cancelled");
    }
    
    requests[idx].status = "Cancelled";
    requests[idx].updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS, requests);
    return requests[idx];
  },

  completeStudentDutyRequest: async (id) => {
    await localProvider._initializeStudentDutyRequests();
    const requests = getItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS) || [];
    const idx = requests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Duty request not found");

    if (requests[idx].status !== "Active") {
      throw new Error("Only Active duty requests can be completed");
    }
    
    requests[idx].status = "Completed";
    requests[idx].updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.STUDENT_DUTY_REQUESTS, requests);
    return requests[idx];
  },

  // ==========================================
  // CLUB MEMBERSHIP REQUESTS
  // ==========================================
  _initializeClubMembershipRequests: async () => {
    let requests = getItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS);
    if (!requests || requests.length === 0) {
      const students = getItem(STORAGE_KEYS.STUDENTS) || [];
      const clubs = getItem(STORAGE_KEYS.CLUBS) || [];
      const teachers = getItem(STORAGE_KEYS.TEACHERS) || [];

      if (students.length > 0 && clubs.length > 0 && teachers.length > 0) {
        requests = [
          {
            requestId: "req-001",
            studentId: students[0].id,
            studentName: students[0].name,
            className: "10-A",
            section: "A",
            clubId: clubs[0].id,
            clubName: clubs[0].name,
            coordinatorTeacherId: clubs[0].clubHeadTeacherId,
            coordinatorTeacherName: teachers.find(t => t.id === clubs[0].clubHeadTeacherId)?.teacherName || "Coordinator",
            requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Pending",
            remarks: "I have always been passionate about science.",
            decisionDate: null
          },
          {
            requestId: "req-002",
            studentId: students[1].id,
            studentName: students[1].name,
            className: "10-B",
            section: "B",
            clubId: clubs[1].id,
            clubName: clubs[1].name,
            coordinatorTeacherId: clubs[1].clubHeadTeacherId,
            coordinatorTeacherName: teachers.find(t => t.id === clubs[1].clubHeadTeacherId)?.teacherName || "Coordinator",
            requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Approved",
            remarks: "I want to participate in the upcoming debate.",
            decisionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            requestId: "req-003",
            studentId: students[2].id,
            studentName: students[2].name,
            className: "11-A",
            section: "A",
            clubId: clubs[2].id,
            clubName: clubs[2].name,
            coordinatorTeacherId: clubs[2].clubHeadTeacherId,
            coordinatorTeacherName: teachers.find(t => t.id === clubs[2].clubHeadTeacherId)?.teacherName || "Coordinator",
            requestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Rejected",
            remarks: "I'd like to join.",
            decisionDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            requestId: "req-004",
            studentId: students[3].id,
            studentName: students[3].name,
            className: "11-B",
            section: "B",
            clubId: clubs[0].id,
            clubName: clubs[0].name,
            coordinatorTeacherId: clubs[0].clubHeadTeacherId,
            coordinatorTeacherName: teachers.find(t => t.id === clubs[0].clubHeadTeacherId)?.teacherName || "Coordinator",
            requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: "Withdrawn",
            remarks: "Will apply next semester.",
            decisionDate: new Date().toISOString()
          },
          {
            requestId: "req-005",
            studentId: students[4].id,
            studentName: students[4].name,
            className: "10-C",
            section: "C",
            clubId: clubs[1].id,
            clubName: clubs[1].name,
            coordinatorTeacherId: clubs[1].clubHeadTeacherId,
            coordinatorTeacherName: teachers.find(t => t.id === clubs[1].clubHeadTeacherId)?.teacherName || "Coordinator",
            requestDate: new Date().toISOString(),
            status: "Pending",
            remarks: "Very interested in public speaking.",
            decisionDate: null
          }
        ];
        setItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS, requests);
      }
    }
  },

  getClubMembershipRequests: async () => {
    await localProvider._initializeClubMembershipRequests();
    return getItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS) || [];
  },

  getClubMembershipRequestById: async (id) => {
    await localProvider._initializeClubMembershipRequests();
    const requests = getItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS) || [];
    return requests.find((r) => r.requestId === id) || null;
  },

  createClubMembershipRequest: async (data) => {
    await localProvider._initializeClubMembershipRequests();
    const requests = getItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS) || [];
    const newRequest = {
      requestId: `req-${Date.now()}`,
      requestDate: new Date().toISOString(),
      status: "Pending",
      decisionDate: null,
      ...data
    };
    requests.push(newRequest);
    setItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS, requests);
    return newRequest;
  },

  updateClubMembershipRequest: async (id, updates) => {
    await localProvider._initializeClubMembershipRequests();
    const requests = getItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS) || [];
    const idx = requests.findIndex((r) => r.requestId === id);
    if (idx === -1) throw new Error("Club membership request not found");

    requests[idx] = { ...requests[idx], ...updates };
    setItem(STORAGE_KEYS.CLUB_MEMBERSHIP_REQUESTS, requests);
    return requests[idx];
  },

  // ==========================================
  // CLUB LEADERSHIP ASSIGNMENTS
  // ==========================================
  _initializeClubLeadershipAssignments: async () => {
    let assignments = getItem(STORAGE_KEYS.CLUB_LEADERSHIP_ASSIGNMENTS);
    if (!assignments) {
      assignments = [
        {
          id: "CLA-001",
          clubId: "club-1",
          studentId: "STU001",
          role: "President",
          assignedByTeacherId: "T001",
          assignedAt: new Date().toISOString()
        },
        {
          id: "CLA-002",
          clubId: "club-2",
          studentId: "STU002",
          role: "Secretary",
          assignedByTeacherId: "T002",
          assignedAt: new Date().toISOString()
        }
      ];
      setItem(STORAGE_KEYS.CLUB_LEADERSHIP_ASSIGNMENTS, assignments);
    }
  },

  getClubLeadershipAssignments: async () => {
    await localProvider._initializeClubLeadershipAssignments();
    return getItem(STORAGE_KEYS.CLUB_LEADERSHIP_ASSIGNMENTS) || [];
  },

  assignClubRole: async (data) => {
    await localProvider._initializeClubLeadershipAssignments();
    const assignments = getItem(STORAGE_KEYS.CLUB_LEADERSHIP_ASSIGNMENTS) || [];
    
    // Check if the student already has a leadership role in this club
    const existingIndex = assignments.findIndex(
      (a) => a.clubId === data.clubId && a.studentId === data.studentId
    );
    
    if (existingIndex !== -1) {
      // Update existing role
      assignments[existingIndex] = {
        ...assignments[existingIndex],
        role: data.role,
        assignedByTeacherId: data.assignedByTeacherId,
        assignedAt: new Date().toISOString()
      };
    } else {
      // Create new role assignment
      const newAssignment = {
        id: `cla-${Date.now()}`,
        assignedAt: new Date().toISOString(),
        ...data
      };
      assignments.push(newAssignment);
    }
    
    setItem(STORAGE_KEYS.CLUB_LEADERSHIP_ASSIGNMENTS, assignments);
    return true;
  },

  demoteToMember: async (clubId, studentId) => {
    await localProvider._initializeClubLeadershipAssignments();
    let assignments = getItem(STORAGE_KEYS.CLUB_LEADERSHIP_ASSIGNMENTS) || [];
    
    // Filter out the assignment (which drops them back to their default "Member" status)
    assignments = assignments.filter(
      (a) => !(a.clubId === clubId && a.studentId === studentId)
    );
    
    setItem(STORAGE_KEYS.CLUB_LEADERSHIP_ASSIGNMENTS, assignments);
    return true;
  },

  // ==========================================
  // CLUB ANNOUNCEMENTS (Phase 3)
  // ==========================================
  _initializeClubAnnouncements: async () => {
    const existingAnnouncements = getItem(STORAGE_KEYS.CLUB_ANNOUNCEMENTS);
    if (existingAnnouncements) return; // Already initialized/migrated

    const newAnnouncements = [];
    const legacyUpdates = getItem(STORAGE_KEYS.CLUB_UPDATES);

    if (legacyUpdates && legacyUpdates.length > 0) {
      // Migrate legacy updates
      legacyUpdates.forEach(upd => {
        // Find club name if possible (not strictly required if we just fallback)
        newAnnouncements.push({
          announcementId: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          clubId: upd.clubId,
          clubName: "Migrated Club", 
          title: upd.title || "Club Update",
          content: upd.content || upd.message || "",
          category: "General", // Default for legacy
          isPinned: false,
          createdByTeacherId: upd.teacherId || upd.createdByTeacherId || "T001",
          createdByTeacherName: "Coordinator",
          createdAt: upd.date || new Date().toISOString(),
          status: "Published"
        });
      });
    } else {
      // Seed fresh data if no legacy updates exist
      newAnnouncements.push(
        {
          announcementId: `ann-${Date.now()}-1`,
          clubId: "club-1",
          clubName: "Science & Innovation Club",
          title: "Meeting Tomorrow",
          content: "We will be discussing our upcoming projects. Please be on time.",
          category: "Meeting",
          isPinned: true,
          createdByTeacherId: "T001",
          createdByTeacherName: "Anjali Verma",
          createdAt: new Date().toISOString(),
          status: "Published"
        },
        {
          announcementId: `ann-${Date.now()}-2`,
          clubId: "club-1",
          clubName: "Science & Innovation Club",
          title: "Science Exhibition Preparation",
          content: "Please gather in the main lab after school to start building our exhibition models.",
          category: "Practice Session",
          isPinned: false,
          createdByTeacherId: "T001",
          createdByTeacherName: "Anjali Verma",
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: "Published"
        },
        {
          announcementId: `ann-${Date.now()}-3`,
          clubId: "club-2",
          clubName: "Debate Society",
          title: "Debate Competition Registration Open",
          content: "Registration for the inter-school debate is now open. Submit your names to the coordinator.",
          category: "Registration",
          isPinned: true,
          createdByTeacherId: "T002",
          createdByTeacherName: "Rahul Sharma",
          createdAt: new Date().toISOString(),
          status: "Published"
        }
      );
    }
    
    setItem(STORAGE_KEYS.CLUB_ANNOUNCEMENTS, newAnnouncements);
  },

  getClubAnnouncements: async () => {
    await localProvider._initializeClubAnnouncements();
    return getItem(STORAGE_KEYS.CLUB_ANNOUNCEMENTS) || [];
  },

  getClubAnnouncementById: async (announcementId) => {
    const announcements = await localProvider.getClubAnnouncements();
    return announcements.find((a) => a.announcementId === announcementId);
  },

  createClubAnnouncement: async (data) => {
    const announcements = await localProvider.getClubAnnouncements();
    const newAnnouncement = {
      announcementId: `ann-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "Published",
      isPinned: false,
      ...data
    };
    announcements.push(newAnnouncement);
    setItem(STORAGE_KEYS.CLUB_ANNOUNCEMENTS, announcements);
    return newAnnouncement;
  },

  updateClubAnnouncement: async (announcementId, updates) => {
    const announcements = await localProvider.getClubAnnouncements();
    const index = announcements.findIndex(a => a.announcementId === announcementId);
    if (index === -1) throw new Error("Announcement not found");
    
    announcements[index] = { ...announcements[index], ...updates };
    setItem(STORAGE_KEYS.CLUB_ANNOUNCEMENTS, announcements);
    return announcements[index];
  },

  archiveClubAnnouncement: async (announcementId) => {
    return await localProvider.updateClubAnnouncement(announcementId, { status: "Archived" });
  },

  // ==========================================
  // CLUB CREATION PROPOSALS (Phase 4)
  // ==========================================
  _initializeClubCreationProposals: async () => {
    if (getItem(STORAGE_KEYS.CLUB_CREATION_PROPOSALS)) return;

    const proposals = [
      {
        proposalId: `prop-${Date.now()}-1`,
        proposedByStudentId: "stud-001",
        proposedByStudentName: "Amit Kumar",
        clubName: "AI Club",
        category: "Technology",
        purpose: "Machine Learning workshops and AI awareness sessions.",
        status: "Pending",
        remarks: "",
        interestCount: 1,
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      },
      {
        proposalId: `prop-${Date.now()}-2`,
        proposedByStudentId: "stud-002",
        proposedByStudentName: "Priya Sharma",
        clubName: "Photography Club",
        category: "Arts",
        purpose: "Creative photography and exhibitions.",
        status: "Approved",
        remarks: "Approved. Strong student interest.",
        interestCount: 5,
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        reviewedBy: "Admin"
      },
      {
        proposalId: `prop-${Date.now()}-3`,
        proposedByStudentId: "stud-003",
        proposedByStudentName: "Rahul Verma",
        clubName: "Astronomy Club",
        category: "Science & Tech",
        purpose: "Night sky observation and science activities.",
        status: "Rejected",
        remarks: "Rejected. Overlaps with existing Science & Technology club.",
        interestCount: 2,
        submittedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        reviewedBy: "Admin"
      },
      {
        proposalId: `prop-${Date.now()}-4`,
        proposedByStudentId: "stud-004",
        proposedByStudentName: "Sneha Patel",
        clubName: "Creative Writing Society",
        category: "Literary & Debate",
        purpose: "Workshops on fiction, poetry, and storytelling.",
        status: "Pending",
        remarks: "",
        interestCount: 1,
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        proposalId: `prop-${Date.now()}-5`,
        proposedByStudentId: "stud-005",
        proposedByStudentName: "Vikram Singh",
        clubName: "E-Sports Club",
        category: "Sports",
        purpose: "Competitive gaming and strategy analysis.",
        status: "Pending",
        remarks: "",
        interestCount: 12,
        submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        proposalId: `prop-${Date.now()}-6`,
        proposedByStudentId: "stud-001",
        proposedByStudentName: "Amit Kumar",
        clubName: "Robotics Society",
        category: "Technology",
        purpose: "Building robots for national competitions.",
        status: "Rejected",
        remarks: "Rejected. Existing Robotics Club already serves this exact purpose.",
        interestCount: 4,
        submittedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        reviewedBy: "Admin"
      },
      {
        proposalId: `prop-${Date.now()}-7`,
        proposedByStudentId: "stud-006",
        proposedByStudentName: "Kavya Menon",
        clubName: "Culinary Arts Club",
        category: "Cultural & Arts",
        purpose: "Exploring international cuisines and cooking techniques.",
        status: "Approved",
        remarks: "Approved. Great initiative.",
        interestCount: 8,
        submittedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        reviewedBy: "Admin"
      },
      {
        proposalId: `prop-${Date.now()}-8`,
        proposedByStudentId: "stud-007",
        proposedByStudentName: "Arjun Reddy",
        clubName: "Blockchain & Web3",
        category: "Technology",
        purpose: "Learning about decentralized systems and smart contracts.",
        status: "Pending",
        remarks: "",
        interestCount: 3,
        submittedAt: new Date().toISOString(),
      }
    ];
    setItem(STORAGE_KEYS.CLUB_CREATION_PROPOSALS, proposals);
  },

  getClubCreationProposals: async () => {
    await localProvider._initializeClubCreationProposals();
    return getItem(STORAGE_KEYS.CLUB_CREATION_PROPOSALS) || [];
  },

  getClubCreationProposalById: async (proposalId) => {
    const proposals = await localProvider.getClubCreationProposals();
    return proposals.find((p) => p.proposalId === proposalId);
  },

  createClubCreationProposal: async (data) => {
    const proposals = await localProvider.getClubCreationProposals();
    const newProposal = {
      proposalId: `prop-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      submittedAt: new Date().toISOString(),
      status: "Pending",
      remarks: "",
      interestCount: 1,
      ...data
    };
    proposals.push(newProposal);
    setItem(STORAGE_KEYS.CLUB_CREATION_PROPOSALS, proposals);
    return newProposal;
  },

  updateClubCreationProposal: async (proposalId, updates) => {
    const proposals = await localProvider.getClubCreationProposals();
    const index = proposals.findIndex(p => p.proposalId === proposalId);
    if (index === -1) throw new Error("Proposal not found");
    
    proposals[index] = { ...proposals[index], ...updates };
    setItem(STORAGE_KEYS.CLUB_CREATION_PROPOSALS, proposals);
    return proposals[index];
  },

  // === ACTIVITY PARTICIPATIONS ===
  getActivityParticipations: async () => {
    return getItem(STORAGE_KEYS.CLUB_ACTIVITY_PARTICIPATIONS) || [];
  },

  getParticipationsByActivity: async (activityId) => {
    const list = getItem(STORAGE_KEYS.CLUB_ACTIVITY_PARTICIPATIONS) || [];
    return list.filter((p) => p.activityId === activityId);
  },

  getParticipationsByStudent: async (studentId) => {
    const list = getItem(STORAGE_KEYS.CLUB_ACTIVITY_PARTICIPATIONS) || [];
    return list.filter((p) => p.studentId === studentId);
  },

  createParticipation: async (data) => {
    const list = getItem(STORAGE_KEYS.CLUB_ACTIVITY_PARTICIPATIONS) || [];
    const newRecord = {
      participationId: `part-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...data
    };
    list.push(newRecord);
    setItem(STORAGE_KEYS.CLUB_ACTIVITY_PARTICIPATIONS, list);
    return newRecord;
  },

  updateParticipation: async (participationId, updates) => {
    const list = getItem(STORAGE_KEYS.CLUB_ACTIVITY_PARTICIPATIONS) || [];
    const index = list.findIndex(p => p.participationId === participationId);
    if (index === -1) throw new Error("Participation record not found");
    
    list[index] = { ...list[index], ...updates };
    setItem(STORAGE_KEYS.CLUB_ACTIVITY_PARTICIPATIONS, list);
    return list[index];
  },

  // === INSTITUTION SETTINGS ===
  getInstitutionSettings: async () => {
    return getItem(STORAGE_KEYS.INSTITUTION_SETTINGS) || {};
  },

  updateInstitutionSettings: async (updates) => {
    const current = getItem(STORAGE_KEYS.INSTITUTION_SETTINGS) || {};
    const updated = { ...current, ...updates };
    setItem(STORAGE_KEYS.INSTITUTION_SETTINGS, updated);
    return updated;
  },

};

export default localProvider;
