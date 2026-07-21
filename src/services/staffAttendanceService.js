import { getDataProvider } from "../data";
import { getDayClassification } from "./academicCalendarService";

/**
 * Service layer for Staff Attendance Management.
 * Exclusively handles Employee-based attendance logic.
 */

/**
 * Retrieve all staff attendance records
 */
export const getAllStaffAttendance = async () => {
  const provider = getDataProvider();
  return await provider.getStaffDailyAttendance();
};

/**
 * Retrieve attendance history for a specific employee
 */
export const getStaffAttendanceHistory = async (employeeId) => {
  if (!employeeId) throw new Error("Employee ID is required");
  const provider = getDataProvider();
  return await provider.getStaffAttendanceByEmployee(employeeId);
};

/**
 * Retrieve attendance status for a specific employee on a given date
 */
export const getStaffAttendanceByDate = async (employeeId, date) => {
  if (!employeeId) throw new Error("Employee ID is required");
  if (!date) throw new Error("Date is required");
  
  // Reuse generic calendar logic to check if it's a holiday/weekend
  const classification = getDayClassification(date);
  if (classification.isHoliday && !classification.isWorkingDayOverride) {
    return { status: "HOLIDAY", title: classification.event?.title || "Weekend" };
  }

  const provider = getDataProvider();
  const record = await provider.getStaffAttendanceByDate(employeeId, date);
  if (record) {
    return { status: record.attendanceStatus, title: "" };
  }

  return { status: "UNMARKED", title: "" };
};

/**
 * Retrieve attendance for all staff in a specific department on a given date
 */
export const getDepartmentAttendance = async (departmentId, date) => {
  if (!departmentId) throw new Error("Department ID is required");
  if (!date) throw new Error("Date is required");
  
  const provider = getDataProvider();
  return await provider.getStaffAttendanceByDepartment(departmentId, date);
};

/**
 * Mark attendance for a single staff member
 */
export const markStaffAttendance = async ({
  employeeId,
  employeeType,
  department,
  attendanceDate,
  attendanceStatus,
  markedBy,
  attendanceSource = "MANUAL",
}) => {
  // Basic Validation
  if (!employeeId) throw new Error("Employee ID is required");
  if (!attendanceDate) throw new Error("Attendance Date is required");
  if (!attendanceStatus) throw new Error("Attendance Status is required");

  const provider = getDataProvider();
  const record = {
    employeeId,
    employeeType: employeeType || "STAFF",
    department: department || "GENERAL",
    attendanceDate,
    attendanceStatus, // e.g., "PRESENT", "ABSENT", "LATE", "HALF_DAY", "ON_LEAVE"
    markedBy: markedBy || "SYSTEM",
    markedAt: new Date().toISOString(),
    attendanceSource,
  };

  return await provider.markStaffAttendance(record);
};

/**
 * Bulk update staff attendance
 */
export const submitDepartmentAttendance = async (records) => {
  if (!records || !Array.isArray(records)) {
    throw new Error("Records array is required");
  }

  const provider = getDataProvider();
  
  // Normalize records
  const normalizedRecords = records.map(record => {
    if (!record.employeeId || !record.attendanceDate || !record.attendanceStatus) {
      throw new Error("Invalid record format. Missing required fields.");
    }
    return {
      ...record,
      markedAt: new Date().toISOString(),
      attendanceSource: record.attendanceSource || "MANUAL_BULK"
    };
  });

  return await provider.updateStaffAttendanceBulk(normalizedRecords);
};

/**
 * Retrieve personalized attendance dashboard for an employee
 */
export const getEmployeeAttendanceDashboard = async (employeeId, targetMonth, targetYear) => {
  if (!employeeId) throw new Error("Employee ID is required");
  
  const history = await getStaffAttendanceHistory(employeeId);
  const now = new Date();
  const currentMonth = targetMonth !== undefined ? targetMonth : now.getMonth();
  const currentYear = targetYear !== undefined ? targetYear : now.getFullYear();
  const todayDate = now.toISOString().split('T')[0];

  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
    totalWorkingDays: 0,
    percentage: 100,
    todayStatus: "UNMARKED"
  };

  const currentMonthHistory = [];
  const calendarData = {};

  history.forEach(record => {
    const rDate = new Date(record.attendanceDate);
    const rMonth = rDate.getMonth();
    const rYear = rDate.getFullYear();

    if (record.attendanceDate === todayDate) {
      summary.todayStatus = record.attendanceStatus;
    }

    if (rMonth === currentMonth && rYear === currentYear) {
      currentMonthHistory.push(record);
      calendarData[record.attendanceDate] = record.attendanceStatus;

      if (record.attendanceStatus !== "ON_LEAVE" && record.attendanceStatus !== "HOLIDAY") {
        summary.totalWorkingDays += 1;
      }

      if (record.attendanceStatus === "PRESENT") summary.present += 1;
      else if (record.attendanceStatus === "ABSENT") summary.absent += 1;
      else if (record.attendanceStatus === "LATE") { summary.late += 1; summary.present += 1; }
      else if (record.attendanceStatus === "HALF_DAY") { summary.halfDay += 1; summary.present += 1; }
      else if (record.attendanceStatus === "ON_LEAVE") summary.leave += 1;
    }
  });

  if (summary.totalWorkingDays > 0) {
    summary.percentage = Math.round((summary.present / summary.totalWorkingDays) * 100);
  }

  // Sort history newest first
  currentMonthHistory.sort((a, b) => new Date(b.attendanceDate) - new Date(a.attendanceDate));

  return {
    summary,
    calendarData,
    history: currentMonthHistory
  };
};

export default {
  getAllStaffAttendance,
  getStaffAttendanceHistory,
  getStaffAttendanceByDate,
  getDepartmentAttendance,
  markStaffAttendance,
  submitDepartmentAttendance,
  getEmployeeAttendanceDashboard
};
