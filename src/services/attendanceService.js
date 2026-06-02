import { getDataProvider } from "../data";
import { schoolCalendar } from "../data/shared/calendar";

/**
 * Centralized service layer for the Institutional Daily Attendance Workflow System.
 */

export const getAttendanceByStudent = async (studentId) => {
  const provider = getDataProvider();
  return await provider.getAttendanceByStudent(studentId);
};

export const getAttendanceByDate = async (studentId, date) => {
  const provider = getDataProvider();
  return await provider.getAttendanceByDate(studentId, date);
};

export const getClassAttendance = async (classId, date) => {
  const provider = getDataProvider();
  return await provider.getClassAttendance(classId, date);
};

export const getAttendanceSession = async (classId, date) => {
  const provider = getDataProvider();
  return await provider.getAttendanceSession(classId, date);
};

export const markAttendance = async ({
  studentId,
  classId,
  status,
  markedBy,
  date,
}) => {
  // Basic Form Validation (Correction #2)
  if (!studentId) throw new Error("Student ID is required");
  if (!classId) throw new Error("Class ID is required");
  if (!status) throw new Error("Attendance status is required");
  if (!date) throw new Error("Date is required");

  const provider = getDataProvider();
  const record = {
    studentId,
    classId,
    status, // "PRESENT", "ABSENT", "UNMARKED"
    markedBy,
    date,
    markedAt: status !== "UNMARKED" ? new Date().toISOString() : null,
    attendanceSession: "MORNING",
  };

  return await provider.markAttendance(record);
};

export const updateClassAttendance = async (
  records,
  classId,
  date,
  teacherId,
) => {
  // Basic Form Validation
  if (!classId) throw new Error("Class ID is required");
  if (!date) throw new Error("Date is required");
  if (!records || !Array.isArray(records)) throw new Error("Records array is required");

  const provider = getDataProvider();
  return await provider.updateClassAttendance(
    records,
    classId,
    date,
    teacherId,
  );
};

// ── Centralized Attendance Intelligence & Analytics Service ────────────────────

export const isHolidayOrWeekend = (dateStr) => {
  const parts = dateStr.split("-");
  if (parts.length < 3) return { isHoliday: false };

  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const dateObj = new Date(year, monthIndex, day);

  const dayOfWeek = dateObj.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return { isHoliday: true, title: "Weekend" };
  }

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[dateObj.getMonth()];

  const holidays = schoolCalendar.events.filter((e) => e.type === "holiday");
  const matchedHoliday = holidays.find((h) => {
    const hParts = h.date.split(" ");
    if (hParts.length >= 2) {
      const hDay = parseInt(hParts[0], 10);
      const hMonth = hParts[1];
      return (
        hDay === day &&
        hMonth.toLowerCase().startsWith(month.toLowerCase().substring(0, 3))
      );
    }
    return false;
  });

  if (matchedHoliday) {
    return { isHoliday: true, title: matchedHoliday.title };
  }

  return { isHoliday: false };
};

export const getAttendancePercentage = async (studentId) => {
  const summary = await getAttendanceSummary(studentId);
  return summary.percentage;
};

export const getAttendanceSummary = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const list = await provider.getAttendanceByStudent(id);
  const records = list;

  const presentDays = records.filter((r) => r.status === "PRESENT").length;
  const absentDays = records.filter((r) => r.status === "ABSENT").length;
  const total = presentDays + absentDays;

  const percentage = total > 0 ? Math.round((presentDays / total) * 100) : 100;

  return {
    percentage,
    totalClasses: total,
    attended: presentDays,
  };
};

export const getAttendanceStatusByDate = async (studentId, date) => {
  const holidayCheck = isHolidayOrWeekend(date);
  if (holidayCheck.isHoliday) {
    return { status: "HOLIDAY", title: holidayCheck.title };
  }

  const record = await getAttendanceByDate(studentId, date);
  if (record) {
    return { status: record.status, title: "" };
  }

  try {
    const { isStudentOnApprovedLeave } = await import("./leaveService");
    const leave = await isStudentOnApprovedLeave(studentId, date);
    if (leave) {
      return { status: "ON_LEAVE", title: "" };
    }
  } catch (err) {
    console.error("Failed to check leave status in attendance:", err);
  }

  return { status: "UNMARKED", title: "" };
};

export const getAttendanceTrend = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();
  const list = await provider.getAttendanceByStudent(id);
  const records = list;

  return records
    .filter((r) => r.status === "PRESENT" || r.status === "ABSENT")
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map((r) => ({
      date: r.date,
      status: r.status,
    }));
};
