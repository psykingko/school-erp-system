import { getDataProvider } from "../data";

// Compatibility Layer - Temporary - Remove after Leave Module Migration
const mapToLegacy = (l) => {
  if (!l) return l;
  return {
    ...l,
    studentId: l.applicantId,
    startDate: l.fromDate,
    endDate: l.toDate,
    appliedAt: l.createdAt,
    reviewedAt: l.approvedAt,
    reviewedBy: l.approvedBy,
    status: l.status ? l.status.toUpperCase() : "PENDING",
  };
};

/**
 * applyLeave
 * Submits a new leave request.
 */
export const applyLeave = async ({
  studentId,
  classId,
  reason,
  fromDate,
  toDate,
}) => {
  // Validate empty reason
  if (!reason || reason.trim() === "") {
    throw new Error("Reason for leave cannot be empty.");
  }

  // Validate date range
  if (!fromDate || !toDate) {
    throw new Error("Please specify both From and To dates.");
  }
  if (new Date(toDate) < new Date(fromDate)) {
    throw new Error("To Date cannot be before From Date.");
  }

  // Validate past leave beyond reasonable range (e.g. 7 days in the past)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const inputFromDate = new Date(fromDate);

  // Set time elements to midnight to perform calendar day comparisons accurately
  sevenDaysAgo.setHours(0, 0, 0, 0);
  inputFromDate.setHours(0, 0, 0, 0);

  if (inputFromDate < sevenDaysAgo) {
    throw new Error(
      "Cannot apply for retroactive leave beyond 7 days in the past.",
    );
  }

  // Get student's class and teacher
  const provider = getDataProvider();
  const students = await provider.getStudents();
  const student = students.find((s) => s.id === studentId);
  if (!student) throw new Error("Student not found.");

  const classes = await provider.getClasses();
  const cls = classes.find((c) => c.id === (classId || student.classId));
  if (!cls) throw new Error("Class not found.");

  const classTeacherId = cls.classTeacherId;

  const newRequest = {
    // Unified Schema
    applicantType: "Student",
    applicantId: studentId,
    applicantName: `${student.firstName} ${student.lastName}`,
    department: null,
    leaveType: "General Leave",
    fromDate: fromDate,
    toDate: toDate,
    reason: reason,
    source: "Student Portal",
    status: "Pending",
    // Compatibility fields
    classId: classId || student.classId,
    appliedTo: classTeacherId,
  };

  const created = await provider.createLeaveRequest(newRequest);
  return mapToLegacy(created);
};

/**
 * getLeaveRequestsByStudent
 */
export const getLeaveRequestsByStudent = async (studentId) => {
  const provider = getDataProvider();
  const leaves = await provider.getLeaveRequestsByStudent(studentId);
  return leaves.map(mapToLegacy);
};

/**
 * getLeaveRequestsForTeacher
 * Only returns requests where the teacher is classTeacher of the class
 */
export const getLeaveRequestsForTeacher = async (teacherId) => {
  const provider = getDataProvider();
  const leaves = await provider.getLeaveRequestsForTeacher(teacherId);
  return leaves.map(mapToLegacy);
};

/**
 * approveLeave
 */
export const approveLeave = async (leaveId) => {
  const provider = getDataProvider();
  const updated = await provider.updateLeaveRequest(leaveId, {
    status: "Approved",
    approvedAt: new Date().toISOString(),
    // Legacy compat
    reviewedAt: new Date().toISOString(),
  });
  return mapToLegacy(updated);
};

/**
 * rejectLeave
 */
export const rejectLeave = async (leaveId, teacherId, comment = "") => {
  const provider = getDataProvider();
  const leave = await provider.getLeaveRequestById(leaveId);
  if (!leave) throw new Error("Leave request not found.");
  if (leave.appliedTo !== teacherId) {
    throw new Error(
      "Unauthorized: Only the assigned class teacher can reject this request.",
    );
  }
  const updated = await provider.updateLeaveRequest(leaveId, {
    status: "Rejected",
    approvedBy: teacherId,
    approvedAt: new Date().toISOString(),
    // Legacy compat
    reviewedAt: new Date().toISOString(),
    reviewedBy: teacherId,
    teacherComment: comment,
  });
  return mapToLegacy(updated);
};

/**
 * getLeaveRequests
 */
export const getLeaveRequests = async () => {
  const provider = getDataProvider();
  const leaves = await provider.getLeaveRequests();
  return leaves.map(mapToLegacy);
};

/**
 * getLeaveStatus
 */
export const getLeaveStatus = async (leaveId) => {
  const provider = getDataProvider();
  const leave = await provider.getLeaveRequestById(leaveId);
  return mapToLegacy(leave);
};

/**
 * getApprovedLeavesByDate
 */
export const getApprovedLeavesByDate = async (date) => {
  const provider = getDataProvider();
  const leaves = await provider.getLeaveRequests();
  return leaves
    .map(mapToLegacy)
    .filter(
      (leave) =>
        leave.status === "APPROVED" &&
        leave.startDate <= date &&
        leave.endDate >= date,
    );
};

/**
 * isStudentOnApprovedLeave
 */
export const isStudentOnApprovedLeave = async (studentId, date) => {
  const provider = getDataProvider();
  const leaves = await provider.getLeaveRequestsByStudent(studentId);
  const mappedLeaves = leaves.map(mapToLegacy);
  const leave = mappedLeaves.find(
    (l) => l.status === "APPROVED" && l.startDate <= date && l.endDate >= date,
  );
  return leave ? leave : null;
};

/**
 * syncApprovedLeaveToAttendance
 */
export const syncApprovedLeaveToAttendance = async (
  studentId,
  startDate,
  endDate,
) => {
  const provider = getDataProvider();
  const leaves = await provider.getLeaveRequestsByStudent(studentId);
  const mappedLeaves = leaves.map(mapToLegacy);
  const leave = mappedLeaves.find(
    (l) =>
      l.status === "APPROVED" &&
      l.startDate === startDate &&
      l.endDate === endDate,
  );
  if (!leave) return;

  const attendance = await provider.getDailyAttendance();
  const dates = getDateRange(startDate, endDate);

  dates.forEach(async (date) => {
    const existingIdx = attendance.findIndex(
      (a) => a.studentId === studentId && a.date === date,
    );
    if (existingIdx !== -1) {
      await provider.markAttendance({
        studentId,
        classId: attendance[existingIdx].classId,
        status: "LEAVE",
        markedBy: leave.appliedTo,
        date,
      });
    } else {
      await provider.markAttendance({
        studentId,
        classId: leave.classId || "",
        status: "LEAVE",
        markedBy: leave.appliedTo,
        date,
      });
    }
  });
};

/**
 * revertLeaveFromAttendance
 */
export const revertLeaveFromAttendance = async (
  studentId,
  startDate,
  endDate,
) => {
  const provider = getDataProvider();
  const leaves = await provider.getLeaveRequestsByStudent(studentId);
  const mappedLeaves = leaves.map(mapToLegacy);
  const leave = mappedLeaves.find(
    (l) =>
      l.status === "REJECTED" &&
      l.startDate === startDate &&
      l.endDate === endDate,
  );
  if (!leave) return;

  const attendance = await provider.getDailyAttendance();
  const dates = getDateRange(startDate, endDate);

  dates.forEach(async (date) => {
    const existingIdx = attendance.findIndex(
      (a) => a.studentId === studentId && a.date === date,
    );
    if (existingIdx !== -1 && attendance[existingIdx].status === "LEAVE") {
      await provider.markAttendance({
        studentId,
        classId: attendance[existingIdx].classId,
        status: "UNMARKED",
        markedBy: null,
        date,
      });
    }
  });
};

/**
 * Get all dates between two dates (inclusive) in YYYY-MM-DD format
 */
const getDateRange = (startDate, endDate) => {
  const dates = [];
  let curr = new Date(startDate);
  const end = new Date(endDate);
  while (curr <= end) {
    dates.push(curr.toISOString().split("T")[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

// Backward compatibility alias for LeavePage
export const getLeavesByStudent = getLeaveRequestsByStudent;

// Backward compatibility alias for LeaveMgmtPage
export const getLeavesForTeacherApproval = getLeaveRequestsForTeacher;

// Unified Data Model CRUD Access for Phase 2/3 compatibility without legacy wrapping
export const createLeaveRequest = async (leaveData) => {
  const provider = getDataProvider();
  return await provider.createLeaveRequest(leaveData);
};

export const updateLeaveRequest = async (id, updates) => {
  const provider = getDataProvider();
  return await provider.updateLeaveRequest(id, updates);
};

export const deleteLeaveRequest = async (id) => {
  const provider = getDataProvider();
  return await provider.deleteLeaveRequest(id);
};

// ==========================================
// Phase 3: Teacher Leave Application Methods
// ==========================================

export const getTeacherLeaveRequests = async (teacherId) => {
  const provider = getDataProvider();
  const allLeaves = await provider.getLeaveRequests();
  // Scope tightly to unified model properties
  return allLeaves.filter(
    (l) => l.applicantType === "Teacher" && l.applicantId === teacherId
  );
};

export const createTeacherLeaveRequest = async ({
  teacherId,
  fromDate,
  toDate,
  reason,
  leaveType,
}) => {
  if (!reason || reason.trim() === "") throw new Error("Reason cannot be empty.");
  if (!fromDate || !toDate) throw new Error("Dates are required.");
  if (new Date(toDate) < new Date(fromDate)) throw new Error("Invalid date range.");

  const provider = getDataProvider();
  const teachers = await provider.getTeachers();
  const teacher = teachers.find((t) => t.id === teacherId || t.teacherId === teacherId);
  if (!teacher) throw new Error("Teacher not found.");

  const name = teacher.teacherName || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim() || "Unknown Teacher";

  const newRequest = {
    applicantType: "Teacher",
    applicantId: teacherId,
    applicantName: name,
    department: teacher.department || "Academic Affairs", // dynamic resolution
    source: "Teacher Portal",
    status: "Pending",
    leaveType: leaveType || "Casual Leave",
    fromDate,
    toDate,
    reason,
  };

  return await provider.createLeaveRequest(newRequest);
};

export const cancelTeacherLeaveRequest = async (leaveId, teacherId) => {
  const provider = getDataProvider();
  const allLeaves = await provider.getLeaveRequests();
  const leave = allLeaves.find((l) => l.id === leaveId);

  if (!leave) throw new Error("Leave request not found.");
  if (leave.applicantId !== teacherId || leave.applicantType !== "Teacher") {
    throw new Error("Unauthorized.");
  }
  if (leave.status !== "Pending") {
    throw new Error("Only Pending leaves can be cancelled.");
  }

  // Treat cancel as a status transition, not physical deletion
  return await provider.updateLeaveRequest(leaveId, {
    status: "Cancelled",
  });
};

// ============================================================================
// PHASE 4: EMPLOYEE LEAVES (Admin Portal)
// ============================================================================

export const getEmployeeLeaveRequests = async (employeeId) => {
  const provider = getDataProvider();
  const allLeaves = await provider.getLeaveRequests();
  return allLeaves.filter(
    (l) => l.applicantType === "Employee" && l.applicantId === employeeId
  );
};

export const createEmployeeLeaveRequest = async ({
  employeeId,
  fromDate,
  toDate,
  reason,
  leaveType,
}) => {
  if (!reason || reason.trim() === "") throw new Error("Reason cannot be empty.");
  if (!fromDate || !toDate) throw new Error("Dates are required.");
  if (new Date(toDate) < new Date(fromDate)) throw new Error("Invalid date range.");

  const provider = getDataProvider();
  const employees = await provider.getEmployees();
  const employee = employees.find((e) => e.employeeId === employeeId);
  if (!employee) throw new Error("Employee not found.");

  const departments = await provider.getDepartments();
  const dept = departments.find((d) => d.departmentId === employee.departmentId);
  const departmentName = dept ? dept.departmentName : "General Administration";

  const newRequest = {
    applicantType: "Employee",
    applicantId: employeeId,
    applicantName: employee.employeeName || "Unknown Employee",
    department: departmentName,
    source: "Employee Portal",
    status: "Pending",
    leaveType: leaveType || "Casual Leave",
    fromDate,
    toDate,
    reason,
  };

  return await provider.createLeaveRequest(newRequest);
};

export const cancelEmployeeLeaveRequest = async (leaveId, employeeId) => {
  const provider = getDataProvider();
  const allLeaves = await provider.getLeaveRequests();
  const leave = allLeaves.find((l) => l.id === leaveId);

  if (!leave) throw new Error("Leave request not found.");
  if (leave.applicantId !== employeeId || leave.applicantType !== "Employee") {
    throw new Error("Unauthorized.");
  }
  if (leave.status !== "Pending") {
    throw new Error("Only Pending leaves can be cancelled.");
  }

  return await provider.updateLeaveRequest(leaveId, {
    status: "Cancelled",
  });
};

// ============================================================================
// PHASE 5: LEAVE APPROVAL CENTER
// ============================================================================

export const getAllLeaveRequests = async () => {
  const provider = getDataProvider();
  return await provider.getLeaveRequests();
};

export const updateLeaveStatus = async (leaveId, newStatus, approverEmployeeId) => {
  const provider = getDataProvider();
  const allLeaves = await provider.getLeaveRequests();
  const leave = allLeaves.find((l) => l.id === leaveId);

  if (!leave) throw new Error("Leave request not found.");
  if (leave.status !== "Pending") {
    throw new Error("Only Pending leaves can be updated.");
  }

  return await provider.updateLeaveRequest(leaveId, {
    status: newStatus,
    approvedBy: approverEmployeeId,
    approvedAt: new Date().toISOString(),
  });
};


