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
      leaves.push({ id: `leave_seed_t1`, applicantType: "Teacher", applicantId: teachers[0].id || teachers[0].teacherId, applicantName: teachers[0].teacherName || teachers[0].name, department: "Academic Affairs", leaveType: "Casual Leave", fromDate: "2023-11-01", toDate: "2023-11-02", reason: "Personal work", status: "Approved", source: "Teacher Portal", approvedBy: "EMP-001", approvedAt: "2023-10-28T10:00:00Z", createdAt: "2023-10-27T09:00:00Z", updatedAt: "2023-10-28T10:00:00Z" });
      leaves.push({ id: `leave_seed_t2`, applicantType: "Teacher", applicantId: teachers[1].id || teachers[1].teacherId, applicantName: teachers[1].teacherName || teachers[1].name, department: "Academic Affairs", leaveType: "Sick Leave", fromDate: "2023-11-15", toDate: "2023-11-16", reason: "Fever", status: "Pending", source: "Teacher Portal", approvedBy: null, approvedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      leaves.push({ id: `leave_seed_t3`, applicantType: "Teacher", applicantId: teachers[2].id || teachers[2].teacherId, applicantName: teachers[2].teacherName || teachers[2].name, department: "Academic Affairs", leaveType: "Earned Leave", fromDate: "2023-12-01", toDate: "2023-12-05", reason: "Family trip", status: "Rejected", source: "Teacher Portal", approvedBy: "EMP-001", approvedAt: "2023-11-20T10:00:00Z", createdAt: "2023-11-19T09:00:00Z", updatedAt: "2023-11-20T10:00:00Z" });
    }

    const employees = getItem(STORAGE_KEYS.EMPLOYEES) || [];
    if (employees.length >= 3) {
      leaves.push({ id: `leave_seed_e1`, applicantType: "Employee", applicantId: employees[0].employeeId, applicantName: employees[0].employeeName, department: "Finance & Accounts", leaveType: "Personal Leave", fromDate: "2023-11-10", toDate: "2023-11-10", reason: "Bank work", status: "Approved", source: "Admin Portal", approvedBy: "EMP-001", approvedAt: "2023-11-05T10:00:00Z", createdAt: "2023-11-04T09:00:00Z", updatedAt: "2023-11-05T10:00:00Z" });
      leaves.push({ id: `leave_seed_e2`, applicantType: "Employee", applicantId: employees[1].employeeId, applicantName: employees[1].employeeName, department: "Administration", leaveType: "Sick Leave", fromDate: "2023-11-20", toDate: "2023-11-22", reason: "Medical emergency", status: "Pending", source: "Admin Portal", approvedBy: null, approvedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      leaves.push({ id: `leave_seed_e3`, applicantType: "Employee", applicantId: employees[2].employeeId, applicantName: employees[2].employeeName, department: "IT Infrastructure", leaveType: "Casual Leave", fromDate: "2023-12-10", toDate: "2023-12-11", reason: "Out of station", status: "Approved", source: "Admin Portal", approvedBy: "EMP-001", approvedAt: "2023-12-05T10:00:00Z", createdAt: "2023-12-04T09:00:00Z", updatedAt: "2023-12-05T10:00:00Z" });
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
  getClubEnrollments: async () => {
    return getItem(STORAGE_KEYS.CLUB_ENROLLMENTS) || [];
  },
  getClubEnrollmentsByStudent: async (studentId) => {
    const enrollments = getItem(STORAGE_KEYS.CLUB_ENROLLMENTS) || [];
    return enrollments.filter((ce) => ce.studentId === studentId);
  },
  getClubEnrollmentsByClub: async (clubId) => {
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
        { departmentId: "dept-academics", departmentName: "Academic Affairs", departmentHead: "EMP-002", status: "active" },
        { departmentId: "dept-examination", departmentName: "Examination & Evaluation", departmentHead: "EMP-003", status: "active" },
        { departmentId: "dept-student-affairs", departmentName: "Student Affairs", departmentHead: null, status: "active" },
        { departmentId: "dept-administration", departmentName: "Administration", departmentHead: "EMP-010", status: "active" },
        { departmentId: "dept-finance", departmentName: "Finance & Accounts", departmentHead: "EMP-001", status: "active" },
        { departmentId: "dept-transport", departmentName: "Transport Services", departmentHead: "EMP-004", status: "active" },
        { departmentId: "dept-it", departmentName: "IT Infrastructure", departmentHead: "EMP-009", status: "active" },
        { departmentId: "dept-facilities", departmentName: "Facilities Management", departmentHead: null, status: "active" },
        { departmentId: "dept-sports", departmentName: "Sports & Physical Education", departmentHead: null, status: "active" },
        { departmentId: "dept-library", departmentName: "Library & Information Services", departmentHead: "EMP-008", status: "active" }
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
        { employeeId: "EMP-001", employeeName: "Deepak Joshi", departmentId: "dept-finance", roleId: "role-hr-manager", designation: "HR Manager", phone: "+91-9876543210", email: "deepak.joshi@school.edu", joiningDate: "2023-01-15", status: "active" },
        { employeeId: "EMP-002", employeeName: "Amit Verma", departmentId: "dept-academics", roleId: "role-academic-coordinator", designation: "Academic Coordinator", phone: "+91-9876543211", email: "amit.verma@school.edu", joiningDate: "2023-02-01", status: "active" },
        { employeeId: "EMP-003", employeeName: "Neha Sharma", departmentId: "dept-examination", roleId: "role-exam-controller", designation: "Exam Officer", phone: "+91-9876543212", email: "neha.sharma@school.edu", joiningDate: "2023-03-10", status: "active" },
        { employeeId: "EMP-004", employeeName: "Vijay Patel", departmentId: "dept-transport", roleId: "role-transport-manager", designation: "Transport Coordinator", phone: "+91-9876543213", email: "vijay.patel@school.edu", joiningDate: "2023-04-15", status: "active" },
        { employeeId: "EMP-005", employeeName: "Rajesh Kumar", departmentId: "dept-finance", roleId: "role-accountant", designation: "Finance Executive", phone: "+91-9876543214", email: "rajesh.kumar@school.edu", joiningDate: "2023-05-20", status: "active" },
        { employeeId: "EMP-006", employeeName: "Sunita Singh", departmentId: "dept-finance", roleId: "role-accountant", designation: "Accountant", phone: "+91-9876543215", email: "sunita.singh@school.edu", joiningDate: "2023-06-01", status: "active" },
        { employeeId: "EMP-007", employeeName: "Priya Gupta", departmentId: "dept-administration", roleId: "role-receptionist", designation: "Receptionist", phone: "+91-9876543216", email: "priya.gupta@school.edu", joiningDate: "2023-07-10", status: "active" },
        { employeeId: "EMP-008", employeeName: "Lakshmi Mehta", departmentId: "dept-library", roleId: "role-librarian", designation: "Library Officer", phone: "+91-9876543217", email: "lakshmi.mehta@school.edu", joiningDate: "2023-08-05", status: "active" },
        { employeeId: "EMP-009", employeeName: "Krishna Reddy", departmentId: "dept-it", roleId: "role-super-admin", designation: "IT Support", phone: "+91-9876543218", email: "krishna.reddy@school.edu", joiningDate: "2023-09-12", status: "active" },
        { employeeId: "EMP-010", employeeName: "Suresh Kumar", departmentId: "dept-administration", roleId: "role-super-admin", designation: "Administrative Executive", phone: "+91-9876543219", email: "suresh.kumar@school.edu", joiningDate: "2023-10-01", status: "active" },
        { employeeId: "EMP-011", employeeName: "Ramesh Chand", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543220", email: "ramesh.chand@school.edu", joiningDate: "2021-04-10", status: "active" },
        { employeeId: "EMP-012", employeeName: "Sunita Devi", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543221", email: "sunita.devi@school.edu", joiningDate: "2021-05-15", status: "active" },
        { employeeId: "EMP-013", employeeName: "Mohammad Ali", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543222", email: "mohammad.ali@school.edu", joiningDate: "2022-01-20", status: "active" },
        { employeeId: "EMP-014", employeeName: "Karan Singh", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543223", email: "karan.singh@school.edu", joiningDate: "2022-03-05", status: "active" },
        { employeeId: "EMP-015", employeeName: "Vikram Yadav", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543224", email: "vikram.yadav@school.edu", joiningDate: "2022-06-11", status: "active" },
        { employeeId: "EMP-016", employeeName: "Rajendra Prasad", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543225", email: "rajendra.prasad@school.edu", joiningDate: "2022-08-14", status: "active" },
        { employeeId: "EMP-017", employeeName: "Sanjay Gupta", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543226", email: "sanjay.gupta@school.edu", joiningDate: "2023-01-10", status: "active" },
        { employeeId: "EMP-018", employeeName: "Manoj Tiwari", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543227", email: "manoj.tiwari@school.edu", joiningDate: "2023-02-18", status: "active" },
        { employeeId: "EMP-019", employeeName: "Balram Jat", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543228", email: "balram.jat@school.edu", joiningDate: "2023-05-22", status: "active" },
        { employeeId: "EMP-020", employeeName: "Deepak Chaurasia", departmentId: "dept-transport", roleId: "role-driver", designation: "Driver", phone: "+91-9876543229", email: "deepak.c@school.edu", joiningDate: "2023-07-30", status: "active" },
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

  // === APPROVAL SETTINGS ===
  getApprovalSettings: async () => {
    let settings = getItem(STORAGE_KEYS.APPROVAL_SETTINGS) || [];
    if (settings.length === 0) {
      settings = [
        { module: "leave_management", approverEmployeeId: "EMP-001" }
      ];
      setItem(STORAGE_KEYS.APPROVAL_SETTINGS, settings);
    }
    return settings;
  },

  updateApprovalSetting: async (moduleName, updates) => {
    const settings = await localProvider.getApprovalSettings();
    const idx = settings.findIndex((s) => s.module === moduleName);
    if (idx === -1) {
      settings.push({ module: moduleName, ...updates });
    } else {
      settings[idx] = { ...settings[idx], ...updates };
    }
    setItem(STORAGE_KEYS.APPROVAL_SETTINGS, settings);
    return settings.find((s) => s.module === moduleName);
  },
};

export default localProvider;
